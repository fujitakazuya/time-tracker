import { FC } from 'react'
import { useTrackerCalc } from '../utils/hooks/useTrackerCalc'
import { DecimalText } from './Number'

type Props = {
  pastTrackers: { key: string; value: PastTracker[] }[]
  calcSum: (timers: Timer[]) => number
}

const Component: FC<Props> = ({ pastTrackers, calcSum }) => (
  <div>
    {pastTrackers.map((obj) => (
      <div key={obj.key}>
        <h4 className="p-4 mt-4 text-2xl bg-green-100">{obj.key}</h4>
        <ul className="pl-6 mt-3">
          {obj.value.map((tracker) => (
            <li key={tracker.id} className="grid grid-cols-2">
              <span>{tracker.name}</span>
              <DecimalText value={calcSum(tracker.timers) / 60} digits={1} unit="h" />
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
)

export const TrackerHistory: FC<{ trackers: PastTracker[] }> = ({ trackers }) => {
  const calcSum = useTrackerCalc()

  const pastTrackers: { key: string; value: PastTracker[] }[] = []
  trackers.forEach((tracker) => {
    const trackerGroup = pastTrackers.find((element) => element.key === tracker.day)
    if (trackerGroup) {
      trackerGroup.value.push(tracker)
    } else {
      pastTrackers.push({ key: tracker.day, value: [tracker] })
    }
  })

  return <Component pastTrackers={pastTrackers} calcSum={calcSum} />
}
