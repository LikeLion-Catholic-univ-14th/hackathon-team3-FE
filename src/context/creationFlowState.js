export function createInitialCreationFlowState() {
  return {
    sessionId: null,
    registration: {
      demoCustomerId: '',
      name: '',
      phone: '',
      email: '',
      gender: '',
      dataConsent: false,
    },
    creationMethod: null,
    freeform: {
      mode: 'text',
      text: '',
      voiceTranscript: '',
    },
    preferences: {
      purpose: null,
      silhouette: null,
      structure: null,
      proportion: null,
      color: null,
      attitude: null,
      contexts: [],
      visetosPattern: null,
      monogram: null,
      lockedAttribute: null,
    },
    intent: null,
    unseen: {
      id: null,
      status: 'idle',
      imageUrl: null,
      error: null,
    },
    appointment: {
      store: null,
      date: null,
      time: null,
      reservationId: null,
      passCode: null,
    },
  }
}

export function creationFlowReducer(state, action) {
  switch (action.type) {
    case 'setSessionId':
      return {
        ...state,
        sessionId: action.sessionId,
      }
    case 'updateRegistration':
      return {
        ...state,
        registration: {
          ...state.registration,
          ...action.values,
        },
      }
    case 'setCreationMethod':
      return {
        ...state,
        creationMethod: action.method,
      }
    case 'updateFreeform':
      return {
        ...state,
        freeform: {
          ...state.freeform,
          ...action.values,
        },
      }
    case 'updatePreferences':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.values,
        },
      }
    case 'setIntent':
      return {
        ...state,
        intent: action.intent,
      }
    case 'updateUnseen':
      return {
        ...state,
        unseen: {
          ...state.unseen,
          ...action.values,
        },
      }
    case 'updateAppointment':
      return {
        ...state,
        appointment: {
          ...state.appointment,
          ...action.values,
        },
      }
    case 'resetFlow':
      return createInitialCreationFlowState()
    default:
      return state
  }
}
