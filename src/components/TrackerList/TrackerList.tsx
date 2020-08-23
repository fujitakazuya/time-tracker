import React from 'react'
import * as styles from './TrackerList.scss'
import { Actions } from '../../reducer'
import { useModal } from '../../utils/useModal'
import { useTrackerCalc } from '../../utils/useTrackerCalc'
import { TrackerItem } from './TrackerItem'
import { TrackerBreakdown } from '../TrackerBreakdown/TrackerBreakdown'
import { TrackerCopy } from './TrackerCopy'
import { DecimalText } from '../Text/Number'

type Props = {
  openBreakdown: (tracker: Tracker) => void
  closeBreakdown: () => void
  isOpen: boolean
  breakdownTracker?: Tracker
  totalTime: number
} & ContainerProps

const Component: React.FC<Props> = ({
  isOpen,
  openBreakdown,
  breakdownTracker,
  closeBreakdown,
  trackers,
  inProgressId,
  currentCount,
  dispatch,
  calculateCurrentCount,
  pauseTimer,
  today,
  totalTime,
}) => (
  <div className={styles.listGroup}>
    {breakdownTracker && (
      <TrackerBreakdown
        isBreakdownOpen={isOpen}
        tracker={breakdownTracker}
        closeBreakdown={closeBreakdown}
        dispatch={dispatch}
      />
    )}
    <div className={styles.listHeader}>
      <h2>{today} の作業内容</h2>
      <DecimalText value={totalTime / 60} digits={1} unit="h" />
      <TrackerCopy trackers={trackers} />
    </div>
    <div>
      {trackers.map((tracker) => (
        <TrackerItem
          key={tracker.id}
          tracker={tracker}
          inProgressId={inProgressId}
          currentCount={currentCount}
          dispatch={dispatch}
          calculateCurrentCount={calculateCurrentCount}
          pauseTimer={pauseTimer}
          openBreakdown={openBreakdown}
        />
      ))}
    </div>
  </div>
)

type ContainerProps = {
  trackers: Tracker[]
  inProgressId: string | undefined
  currentCount?: number
  dispatch: React.Dispatch<Actions>
  calculateCurrentCount: (currentDate: Date) => void
  pauseTimer: () => void
  today: string
}

export const TrackerList: React.FC<ContainerProps> = (props) => {
  const [breakdownTracker, setBreakdownTracker] = React.useState<Tracker | undefined>(undefined)
  const [isOpen, openModal, closeModal] = useModal()
  const [calcSum] = useTrackerCalc()

  const totalTime = React.useMemo(
    () => props.trackers.reduce((previous, current) => previous + calcSum(current.timers), 0),
    [props.trackers, calcSum]
  )

  const openBreakdown = (tracker: Tracker) => {
    openModal()
    setBreakdownTracker(tracker)
  }

  const closeBreakdown = () => {
    closeModal()
    setBreakdownTracker(undefined)
  }

  return (
    <Component
      {...props}
      openBreakdown={openBreakdown}
      closeBreakdown={closeBreakdown}
      breakdownTracker={breakdownTracker}
      isOpen={isOpen}
      totalTime={totalTime}
    />
  )
}
