import { v4 as uuidv4 } from 'uuid'
import * as types from './actionTypes'
import * as creators from './actionCreators'
import { CreatorsToActions } from './creatorsToActions'
import * as DateUtil from './utils/DateUtil'

export type State = {
  trackers: Tracker[]
  inProgressId: string | undefined
}

export type Actions = CreatorsToActions<typeof creators>

const getNextTimerId = (timers: Timer[]) =>
  (
    timers.reduce((previous, current) => Math.max(previous, parseInt(current.id, 10)), 0) + 1
  ).toString()

function initialState(injects?: Partial<State>): State {
  return {
    trackers: [] as Tracker[],
    inProgressId: undefined,
    ...injects,
  }
}

function reducer(state: State, action: Actions): State {
  switch (action.type) {
    case types.START: {
      if (state.inProgressId) {
        return state
      }

      const id = uuidv4()
      const newTracker: Tracker = {
        id,
        name: action.payload.name,
        inProgress: true,
        day: action.payload.day,
        timers: [
          {
            id: '0',
            start: action.payload.startTime,
          },
        ],
        isActive: true,
      }

      const trackers = [...state.trackers, newTracker]

      return {
        ...state,
        trackers,
        inProgressId: id,
      }
    }

    case types.RESTART: {
      if (state.inProgressId) {
        return state
      }

      const trackers = state.trackers.map((tracker) =>
        tracker.id === action.payload.id
          ? {
              ...tracker,
              inProgress: true,
              timers: [
                ...tracker.timers,
                { id: getNextTimerId(tracker.timers), start: action.payload.startTime },
              ],
            }
          : tracker
      )

      return {
        ...state,
        trackers,
        inProgressId: action.payload.id,
      }
    }

    case types.PAUSE: {
      if (!state.inProgressId) {
        return state
      }

      const { id, endTime } = action.payload
      const trackers = state.trackers.map((tracker) =>
        tracker.id === id && tracker.inProgress
          ? {
              ...tracker,
              inProgress: false,
              timers: tracker.timers.map((timer) =>
                !timer.end
                  ? {
                      ...timer,
                      end: endTime,
                      minute: DateUtil.getDiff(timer.start, endTime, 'minute', true),
                    }
                  : timer
              ),
            }
          : tracker
      )

      return {
        ...state,
        trackers,
        inProgressId: undefined,
      }
    }

    case types.UPDATE_NAME: {
      const trackers = state.trackers.map((tracker) =>
        tracker.id === action.payload.id ? { ...tracker, name: action.payload.name } : tracker
      )

      return {
        ...state,
        trackers,
      }
    }

    case types.UPDATE_TIMER: {
      const trackers = state.trackers.map((tracker) =>
        tracker.id === action.payload.trackerId
          ? {
              ...tracker,
              timers: tracker.timers.map((timer) =>
                timer.id === action.payload.timerId
                  ? {
                      ...timer,
                      start: action.payload.startTimer,
                      end: action.payload.endTimer,
                      minute: DateUtil.getDiff(
                        action.payload.startTimer,
                        action.payload.endTimer,
                        'minute',
                        true
                      ),
                    }
                  : timer
              ),
            }
          : tracker
      )

      return {
        ...state,
        trackers,
      }
    }

    case types.DELETE_TIMER: {
      const trackers = state.trackers.map((tracker) =>
        tracker.id === action.payload.trackerId
          ? {
              ...tracker,
              timers: tracker.timers.filter((timer) => timer.id !== action.payload.timerId),
            }
          : tracker
      )

      return {
        ...state,
        trackers,
      }
    }

    case types.REMOVE_TRACKER: {
      const trackers = state.trackers.map((tracker) =>
        tracker.id === action.payload.trackerId
          ? {
              ...tracker,
              isActive: false,
            }
          : tracker
      )

      return {
        ...state,
        trackers,
      }
    }

    case types.RESTORE_TRACKER: {
      const trackers = state.trackers.map((tracker) =>
        tracker.id === action.payload.trackerId
          ? {
              ...tracker,
              isActive: true,
            }
          : tracker
      )

      return {
        ...state,
        trackers,
      }
    }

    default:
      return state
  }
}

export { reducer, initialState }
