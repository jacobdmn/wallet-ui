import React from 'react'
import Home from '../views/home/home.view'
import Transaction from '../views/transaction/transaction.view'
import Transfer from '../views/transfer/transfer.view'
import Settings from '../views/settings/settings.view'
import AccountDetails from '../views/account-details/account-details.view'
import TransactionDetails from '../views/transaction-details/transaction-details.view'
import Login from '../views/login/login.view'

const routes = [
  {
    path: '/',
    component: Home,
    renderLayout: true
  },
  {
    path: '/login',
    component: Login,
    renderLayout: false
  },
  {
    path: '/deposit',
    render: () => <Transaction type='deposit' />,
    renderLayout: false
  },
  {
    path: '/transfer',
    component: Transfer,
    renderLayout: false
  },
  {
    path: '/settings',
    component: Settings,
    renderLayout: true
  },
  {
    path: '/accounts/:tokenId',
    component: AccountDetails,
    renderLayout: true
  },
  {
    path: '/accounts/:tokenId/transactions/:transactionId',
    component: TransactionDetails,
    renderLayout: true
  }
]

export default routes