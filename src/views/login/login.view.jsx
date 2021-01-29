import React from 'react'
import { connect } from 'react-redux'
import { useTheme } from 'react-jss'

import useLoginStyles from './login.styles'
import * as globalActions from '../../store/global/global.actions'
import * as loginActions from '../../store/login/login.actions'
import * as loginThunks from '../../store/login/login.thunks'
import { ReactComponent as HermezLogoAlternative } from '../../images/hermez-logo-alternative.svg'
import { ReactComponent as CloseIcon } from '../../images/icons/close.svg'
import Container from '../shared/container/container.view'
import { STEP_NAME } from '../../store/login/login.reducer'
import WalletButtonList from './components/wallet-button-list/wallet-button-list.view'
import AccountSelectorForm from './components/account-selector/account-selector-form.view'
import WalletLoader from './components/wallet-loader/wallet-loader.view'
import CreateAccountAuth from './components/create-account-auth/create-account-auth.view'

export const WalletName = {
  METAMASK: 'metaMask',
  LEDGER: 'ledger',
  TREZOR: 'trezor'
}

function Login ({
  currentStep,
  steps,
  accountAuthTask,
  addAccountAuthTask,
  onChangeHeader,
  onGoToAccountSelectorStep,
  onGoToWalletLoaderStep,
  onGoToPreviousStep,
  onLoadWallet,
  onLoadCreateAccountAuthorization,
  onCreateAccountAuthorization,
  onCleanup
}) {
  const theme = useTheme()
  const classes = useLoginStyles()

  React.useEffect(() => {
    onChangeHeader()
  }, [onChangeHeader])

  React.useEffect(() => onCleanup, [onCleanup])

  /**
   * Handles the click on the MetaMask button
   * @returns {void}
   */
  function handleWalletClick (walletName) {
    switch (walletName) {
      case WalletName.METAMASK: {
        return onGoToWalletLoaderStep(walletName)
      }
      case WalletName.LEDGER:
      case WalletName.TREZOR: {
        return onGoToAccountSelectorStep(walletName)
      }
      default: {}
    }
  }

  function getWalletLabel (walletName) {
    return walletName[0].toUpperCase() + walletName.slice(1)
  }

  function handleSelectAccount (walletName, accountData) {
    onGoToWalletLoaderStep(walletName, accountData)
  }

  return (
    <Container backgroundColor={theme.palette.primary.main} fullHeight disableTopGutter>
      <div className={classes.root}>
        {currentStep !== STEP_NAME.WALLET_SELECTOR && (
          <button className={classes.goBackButton} onClick={onGoToPreviousStep}>
            <CloseIcon className={classes.goBackButtonIcon} />
          </button>
        )}
        <HermezLogoAlternative className={classes.logo} />
        {
          (() => {
            switch (currentStep) {
              case STEP_NAME.WALLET_SELECTOR: {
                return (
                  <>
                    <h1 className={classes.connectText}>Connect with</h1>
                    <WalletButtonList onClick={handleWalletClick} />
                  </>
                )
              }
              case STEP_NAME.ACCOUNT_SELECTOR: {
                const stepData = steps[STEP_NAME.ACCOUNT_SELECTOR]
                const walletLabel = getWalletLabel(stepData.walletName)

                return (
                  <>
                    <h1 className={classes.addAccountText}>
                      Add account through {walletLabel}
                    </h1>
                    <AccountSelectorForm
                      walletName={stepData.walletName}
                      walletLabel={walletLabel}
                      onSelectAccount={handleSelectAccount}
                    />
                  </>
                )
              }
              case STEP_NAME.WALLET_LOADER: {
                const stepData = steps[STEP_NAME.WALLET_LOADER]
                const walletLabel = getWalletLabel(stepData.walletName)

                return (
                  <>
                    <h1 className={classes.connectedText}>
                      Connected to {walletLabel}
                    </h1>
                    <WalletLoader
                      walletName={stepData.walletName}
                      accountData={stepData.accountData}
                      walletTask={stepData.walletTask}
                      onLoadWallet={onLoadWallet}
                    />
                  </>
                )
              }
              case STEP_NAME.CREATE_ACCOUNT_AUTH: {
                return (
                  <CreateAccountAuth
                    accountAuthTask={accountAuthTask}
                    addAccountAuthTask={addAccountAuthTask}
                    steps={steps}
                    onLoadCreateAccountAuthorization={onLoadCreateAccountAuthorization}
                    onCreateAccountAuthorization={onCreateAccountAuthorization}
                  />
                )
              }
              default: {
                return <></>
              }
            }
          })()
        }
      </div>
    </Container>
  )
}

const mapStateToProps = (state) => ({
  currentStep: state.login.currentStep,
  steps: state.login.steps,
  accountAuthTask: state.login.accountAuthTask,
  addAccountAuthTask: state.login.addAccountAuthTask
})

const mapDispatchToProps = (dispatch) => ({
  onChangeHeader: () =>
    dispatch(globalActions.changeHeader({ type: undefined })),
  onGoToAccountSelectorStep: (walletName) =>
    dispatch(loginActions.goToAccountSelectorStep(walletName)),
  onGoToWalletLoaderStep: (walletName, accountData) =>
    dispatch(loginActions.goToWalletLoaderStep(walletName, accountData)),
  onGoToPreviousStep: () => dispatch(loginActions.goToPreviousStep()),
  onLoadWallet: (walletName, accountData) =>
    dispatch(loginThunks.fetchWallet(walletName, accountData)),
  onLoadCreateAccountAuthorization: (hermezEthereumAddress) =>
    dispatch(loginThunks.loadCreateAccountAuthorization(hermezEthereumAddress)),
  onCreateAccountAuthorization: (wallet) =>
    dispatch(loginThunks.postCreateAccountAuthorization(wallet)),
  onCleanup: () =>
    dispatch(loginActions.resetState())
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)
