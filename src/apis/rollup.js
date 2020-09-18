import axios from 'axios'
import { extractJSON } from '../utils/http'

const baseApiUrl = process.env.REACT_APP_ROLLUP_API_URL

async function getAccounts (hermezEthereumAddress) {
  const params = { hermezEthereumAddress }

  return extractJSON(axios.get(`${baseApiUrl}/accounts`, { params }))
}

async function getAccount (accountIndex) {
  return extractJSON(axios.get(`${baseApiUrl}/accounts/${accountIndex}`))
}

async function getTransactions (hermezEthereumAddress, tokenId) {
  const params = {
    ...(hermezEthereumAddress ? { hermezEthereumAddress } : {}),
    ...(tokenId ? { tokenId } : {})
  }

  return extractJSON(axios.get(`${baseApiUrl}/transactions-history`, { params }))
}

async function getHistoryTransaction (transactionId) {
  return extractJSON(axios.get(`${baseApiUrl}/tx/history/${transactionId}`))
}

async function getPoolTransaction (transactionId) {
  return extractJSON(axios.get(`${baseApiUrl}/tx/pool/${transactionId}`))
}

async function getTokens (tokenIds) {
  const params = {
    ...(tokenIds ? { ids: tokenIds.join(',') } : {})
  }

  return extractJSON(axios.get(`${baseApiUrl}/tokens`, { params }))
}

async function getToken (tokenId) {
  return extractJSON(axios.get(`${baseApiUrl}/tokens/${tokenId}`))
}

async function getFees () {
  return extractJSON(axios.get(`${baseApiUrl}/recommendedFee`))
}

export {
  getAccounts,
  getAccount,
  getTransactions,
  getHistoryTransaction,
  getPoolTransaction,
  getTokens,
  getToken,
  getFees
}
