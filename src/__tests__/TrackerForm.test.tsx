import React, { VFC } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FetchMock } from 'jest-fetch-mock'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { StateContext, DispatchContext } from '../utils/contexts/StoreContext'
import { TrackerForm } from '../components/TrackerForm'

type WrapperProps = {
  calculateCurrentCount: jest.Mock
  inProgressId?: string
}

let dispatch: jest.Mock
const Wrapper: VFC<WrapperProps> = (props) => {
  const state = {
    trackers: [],
    inProgressId: props.inProgressId,
  }
  dispatch = jest.fn()
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <TrackerForm calculateCurrentCount={props.calculateCurrentCount} today="2020-09-17" />
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

describe('TrackerForm', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  describe('初期状態', () => {
    let calculateCurrentCount: jest.Mock
    beforeEach(() => {
      calculateCurrentCount = jest.fn()
      render(<Wrapper calculateCurrentCount={calculateCurrentCount} />)
    })

    test('フォームは空であること', () => {
      expect(screen.getByRole('combobox')).toHaveValue('')
    })

    test('アイコンが非活性であること', () => {
      expect(screen.getByRole('img')).toHaveClass('cursor-not-allowed opacity-50')
    })
  })

  describe('イベント', () => {
    let calculateCurrentCount: jest.Mock
    beforeEach(() => {
      calculateCurrentCount = jest.fn()
      act(() => {
        render(<Wrapper calculateCurrentCount={calculateCurrentCount} />)
      })
    })

    test('Enter キーで計測が開始すること', () => {
      userEvent.type(screen.getByRole('combobox'), 'Test')
      expect(screen.getByRole('combobox')).toHaveValue('Test')

      userEvent.type(screen.getByRole('combobox'), '{enter}')
      expect(screen.getByRole('combobox')).toHaveValue('')
      expect(calculateCurrentCount).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    test('フォームに何も入力されていない場合、計測は開始しないこと', () => {
      userEvent.type(screen.getByRole('combobox'), '{enter}')
      expect(calculateCurrentCount).toHaveBeenCalledTimes(0)
      expect(screen.getByRole('combobox')).toBeEnabled()
    })

    test('アイコンをクリックすると計測が開始すること', () => {
      userEvent.type(screen.getByRole('combobox'), 'Test')
      userEvent.click(screen.getByRole('img'))

      expect(screen.getByRole('combobox')).toHaveValue('')
      expect(calculateCurrentCount).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('img')).toHaveClass('cursor-not-allowed opacity-50')
      expect(dispatch).toHaveBeenCalledTimes(1)
    })

    test('フォームに何も入力されていない場合、アイコンをクリックしても計測は開始しないこと', () => {
      userEvent.click(screen.getByRole('img'))
      expect(calculateCurrentCount).toHaveBeenCalledTimes(0)
    })
  })

  describe('バリデーション', () => {
    describe('停止中', () => {
      let calculateCurrentCount: jest.Mock
      beforeEach(() => {
        calculateCurrentCount = jest.fn()
        render(<Wrapper calculateCurrentCount={calculateCurrentCount} />)
      })

      test('31文字目以降は入力できないこと', () => {
        userEvent.type(screen.getByRole('combobox'), 'aaaaaaaaaabbbbbbbbbbccccccccccd')
        expect(screen.getByRole('combobox')).toHaveValue('aaaaaaaaaabbbbbbbbbbcccccccccc')
      })

      test('フォームに何も入力されていない場合、アイコンは非活性であること', () => {
        expect(screen.getByRole('img')).toHaveClass('cursor-not-allowed opacity-50')
      })
    })

    describe('計測中', () => {
      let calculateCurrentCount: jest.Mock
      beforeEach(() => {
        calculateCurrentCount = jest.fn()
        render(<Wrapper calculateCurrentCount={calculateCurrentCount} inProgressId="xxx" />)
      })

      test('計測中はフォームが非活性であること', () => {
        expect(screen.getByRole('combobox')).toBeDisabled()
      })
    })
  })
})
