import React from 'react'
import * as DateUtil from '../DateUtil'
import { Input } from '../../components/Input'

type UseTimerPickerResult = [
  { updatedValue: { start: string; end: string }; isValid: boolean },
  () => JSX.Element
]

export const useTimePicker = (startTime?: Date, endTime?: Date): UseTimerPickerResult => {
  const [start, setStart] = React.useState(startTime ? DateUtil.format(startTime, 'HH:mm') : '')
  const [end, setEnd] = React.useState(endTime ? DateUtil.format(endTime, 'HH:mm') : '')

  const changeStart = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStart(event.target.value)
  }, [])

  const changeEnd = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEnd(event.target.value)
  }, [])

  const isValid = React.useMemo(() => !!(start && end && start <= end), [start, end])

  const renderTimePicker = () => (
    <>
      <Input type="time" value={start} onChange={changeStart} isError={!isValid} />
      <Input type="time" value={end} onChange={changeEnd} isError={!isValid} />
    </>
  )

  const result = {
    updatedValue: {
      start,
      end,
    },
    isValid,
  }

  return [result, renderTimePicker]
}
