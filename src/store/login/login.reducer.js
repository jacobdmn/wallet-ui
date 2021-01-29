import { loginActionTypes } from './login.actions'
import { ACCOUNT_AUTH_SIGNATURE_KEY } from '../../constants'

function getAccountAuthSignature () {
  if (!localStorage.getItem(ACCOUNT_AUTH_SIGNATURE_KEY)) {
    const emptyAccountAuthSignature = {}

    localStorage.setItem(ACCOUNT_AUTH_SIGNATURE_KEY, JSON.stringify(emptyAccountAuthSignature))

    return emptyAccountAuthSignature
  } else {
    return JSON.parse(localStorage.getItem(ACCOUNT_AUTH_SIGNATURE_KEY))
  }
}

export const STEP_NAME = {
  WALLET_SELECTOR: 'wallet-selector',
  ACCOUNT_SELECTOR: 'account-selector',
  WALLET_LOADER: 'wallet-loader',
  CREATE_ACCOUNT_AUTH: 'create-account-auth'
}

const initialLoginState = {
  currentStep: STEP_NAME.WALLET_SELECTOR,
  steps: {
    [STEP_NAME.ACCOUNT_SELECTOR]: {
      walletName: undefined
    },
    [STEP_NAME.WALLET_LOADER]: {
      walletName: undefined,
      accountData: undefined,
      walletTask: {
        status: 'pending'
      }
    },
    [STEP_NAME.CREATE_ACCOUNT_AUTH]: {
      wallet: undefined
    }
  },
  accountAuthTask: {
    status: 'pending'
  },
  addAccountAuthTask: {
    status: 'pending'
  },
  accountAuthSignature: getAccountAuthSignature()
}

function loginReducer (state = initialLoginState, action) {
  switch (action.type) {
    case loginActionTypes.GO_TO_WALLET_SELECTOR_STEP: {
      return {
        ...state,
        currentStep: STEP_NAME.WALLET_SELECTOR
      }
    }
    case loginActionTypes.GO_TO_ACCOUNT_SELECTOR_STEP: {
      return {
        ...state,
        currentStep: STEP_NAME.ACCOUNT_SELECTOR,
        steps: {
          ...state.steps,
          [STEP_NAME.ACCOUNT_SELECTOR]: {
            walletName: action.walletName
          }
        }
      }
    }
    case loginActionTypes.GO_TO_WALLET_LOADER_STEP: {
      return {
        ...state,
        currentStep: STEP_NAME.WALLET_LOADER,
        steps: {
          ...state.steps,
          [STEP_NAME.WALLET_LOADER]: {
            ...state.steps[STEP_NAME.WALLET_LOADER],
            walletName: action.walletName,
            accountData: action.accountData
          }
        }
      }
    }
    case loginActionTypes.GO_TO_CREATE_ACCOUNT_AUTH_STEP: {
      return {
        ...state,
        currentStep: STEP_NAME.CREATE_ACCOUNT_AUTH,
        steps: {
          ...state.steps,
          [STEP_NAME.CREATE_ACCOUNT_AUTH]: {
            wallet: action.wallet
          }
        }
      }
    }
    case loginActionTypes.GO_TO_PREVIOUS_STEP: {
      switch (state.currentStep) {
        case STEP_NAME.ACCOUNT_SELECTOR: {
          return {
            ...state,
            currentStep: STEP_NAME.WALLET_SELECTOR,
            steps: {
              ...state.steps,
              [STEP_NAME.ACCOUNT_SELECTOR]: initialLoginState.steps[STEP_NAME.ACCOUNT_SELECTOR]
            }
          }
        }
        case STEP_NAME.WALLET_LOADER: {
          return {
            ...state,
            currentStep: state.steps[STEP_NAME.WALLET_LOADER].walletName === 'metaMask'
              ? STEP_NAME.WALLET_SELECTOR
              : STEP_NAME.ACCOUNT_SELECTOR,
            steps: {
              ...state.steps,
              [STEP_NAME.WALLET_LOADER]:
                initialLoginState.steps[STEP_NAME.WALLET_LOADER]
            }
          }
        }
        default: {
          return state
        }
      }
    }
    case loginActionTypes.LOAD_WALLET: {
      return {
        ...state,
        steps: {
          ...state.steps,
          [STEP_NAME.WALLET_LOADER]: {
            ...state.steps[STEP_NAME.WALLET_LOADER],
            walletTask: {
              status: 'loading'
            }
          }
        }
      }
    }
    case loginActionTypes.LOAD_WALLET_FAILURE: {
      return {
        ...state,
        steps: {
          ...state.steps,
          [STEP_NAME.WALLET_LOADER]: {
            ...state.steps[STEP_NAME.WALLET_LOADER],
            walletTask: {
              status: 'failure',
              error: action.error
            }
          }
        }
      }
    }
    case loginActionTypes.LOAD_ACCOUNT_AUTH: {
      return {
        ...state,
        accountAuthTask: {
          status: 'loading'
        }
      }
    }
    case loginActionTypes.LOAD_ACCOUNT_AUTH_SUCCESS: {
      return {
        ...state,
        accountAuthTask: {
          status: 'successful'
        }
      }
    }
    case loginActionTypes.LOAD_ACCOUNT_AUTH_FAILURE: {
      return {
        ...state,
        accountAuthTask: {
          status: 'error',
          error: action.error
        }
      }
    }
    case loginActionTypes.ADD_ACCOUNT_AUTH: {
      return {
        ...state,
        addAccountAuthTask: {
          status: 'loading'
        }
      }
    }
    case loginActionTypes.ADD_ACCOUNT_AUTH_SUCCESS: {
      return {
        ...state,
        addAccountAuthTask: {
          status: 'successful'
        }
      }
    }
    case loginActionTypes.ADD_ACCOUNT_AUTH_FAILURE: {
      return {
        ...state,
        addAccountAuthTask: {
          status: 'error',
          error: action.error
        }
      }
    }
    case loginActionTypes.SET_ACCOUNT_AUTH_SIGNATURE: {
      return {
        ...state,
        accountAuthSignature: {
          ...state.accountAuthSignature,
          [action.hermezEthereumAddress]: action.signature
        }
      }
    }
    case loginActionTypes.RESET_STATE: {
      return initialLoginState
    }
    default: {
      return state
    }
  }
}

export default loginReducer
