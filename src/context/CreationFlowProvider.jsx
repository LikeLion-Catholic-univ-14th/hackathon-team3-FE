import { useReducer } from 'react'
import CreationFlowContext from './CreationFlowContext.js'
import {
  createInitialCreationFlowState,
  creationFlowReducer,
} from './creationFlowState.js'

function CreationFlowProvider({ children }) {
  const [state, dispatch] = useReducer(
    creationFlowReducer,
    undefined,
    createInitialCreationFlowState,
  )

  const value = {
    state,
    setSessionId(sessionId) {
      dispatch({ type: 'setSessionId', sessionId })
    },
    updateRegistration(values) {
      dispatch({ type: 'updateRegistration', values })
    },
    setCreationMethod(method) {
      dispatch({ type: 'setCreationMethod', method })
    },
    updateFreeform(values) {
      dispatch({ type: 'updateFreeform', values })
    },
    updatePreferences(values) {
      dispatch({ type: 'updatePreferences', values })
    },
    updateShapeSelection({ controls = {}, preferences = {} }) {
      dispatch({ type: 'updateShapeSelection', controls, preferences })
    },
    setIntent(intent) {
      dispatch({ type: 'setIntent', intent })
    },
    updateUnseen(values) {
      dispatch({ type: 'updateUnseen', values })
    },
    updateAppointment(values) {
      dispatch({ type: 'updateAppointment', values })
    },
    resetFlow() {
      dispatch({ type: 'resetFlow' })
    },
  }

  return (
    <CreationFlowContext.Provider value={value}>
      {children}
    </CreationFlowContext.Provider>
  )
}

export default CreationFlowProvider
