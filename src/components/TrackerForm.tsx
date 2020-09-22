import React, { useContext } from 'react'
import { StateContext, DispatchContext } from '../utils/contexts/StoreContext'
import { start } from '../actionCreators'
import { useTrackerForm } from '../utils/hooks/useTrackerForm'
import { keycode } from '../utils/Constants'
import * as DateUtil from '../utils/DateUtil'
import { StartIcon } from './Icon'
import { Input } from './Input'

type Props = {
  calculateCurrentCount: (currentDate: Date) => void
  today: string
} & JSX.IntrinsicElements['input']

export const TrackerForm: React.FC<Props> = ({ calculateCurrentCount, today, ...props }) => {
  const [trackerName, isValid, changeTrackerName] = useTrackerForm('')
  const state = useContext(StateContext)
  const dispatch = useContext(DispatchContext)

  const startMeasure = () => {
    if (state.inProgressId || !isValid) {
      return
    }
    changeTrackerName('')

    const currentDate = DateUtil.getCurrentDate()
    dispatch(start(trackerName, today, currentDate))
    calculateCurrentCount(currentDate)
  }

  const keyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === keycode.enter) {
      startMeasure()
    }
  }

  return (
    <div className="flex items-start">
      <Input
        value={trackerName}
        type="text"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          changeTrackerName(event.target.value)
        }
        onKeyDown={keyDown}
        className="w-3/4 mr-4 lg:w-1/2 xl:w-1/2"
        disabled={!!state.inProgressId}
        maxLength={30}
        {...props}
      />
      <StartIcon
        width={42}
        height={42}
        onClick={startMeasure}
        disabled={!!(state.inProgressId || !isValid)}
      />
    </div>
  )
}
