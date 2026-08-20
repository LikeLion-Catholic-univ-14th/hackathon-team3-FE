import { useContext } from 'react'
import CreationFlowContext from '../context/CreationFlowContext.js'

function useCreationFlow() {
  const context = useContext(CreationFlowContext)

  if (!context) {
    throw new Error('useCreationFlow must be used within CreationFlowProvider')
  }

  return context
}

export default useCreationFlow
