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
      inputResult: null,
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
    shapeControls: {
      silhouetteValue: 50,
      proportionValue: 50,
      attitudeValue: 50,
      colorId: 'tan',
      hasChosenColor: false,
      visetosChoice: null,
      monogramChoice: null,
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
      reservation: null,
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
    case 'updateShapeSelection':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.preferences,
        },
        shapeControls: {
          ...state.shapeControls,
          ...action.controls,
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
