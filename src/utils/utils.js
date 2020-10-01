/* global BigInt */
import { Scalar, utils as ffUtils } from 'ffjavascript'
import ethers from 'ethers'
import { babyJub, poseidon } from 'circomlib'

import { fix2Float } from './float16'

const hash = poseidon([6, 8, 57])
const F = poseidon.F

/**
 * Converts a buffer to a hexadecimal representation
 *
 * @param {ArrayBuffer} buf
 *
 * @returns {String}
 */
export function bufToHex (buf) {
  return Array.prototype.map.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2)).join('')
}

/**
 * Chunks inputs in five elements and hash with Poseidon all them togheter
 * @param {Array} arr - inputs hash
 * @returns {BigInt} - final hash
 */
function multiHash (arr) {
  let r = Scalar.e(0)
  for (let i = 0; i < arr.length; i += 5) {
    const fiveElems = []
    for (let j = 0; j < 5; j++) {
      if (i + j < arr.length) {
        fiveElems.push(arr[i + j])
      } else {
        fiveElems.push(Scalar.e(0))
      }
    }
    const ph = hash(fiveElems)
    r = F.add(r, ph)
  }
  return F.normalize(r)
}

/**
 * Poseidon hash of a generic buffer
 * @param {Buffer} msgBuff
 * @returns {BigInt} - final hash
 */
export function hashBuffer (msgBuff) {
  const n = 31
  const msgArray = []
  const fullParts = Math.floor(msgBuff.length / n)
  for (let i = 0; i < fullParts; i++) {
    const v = ffUtils.leBuff2int(msgBuff.slice(n * i, n * (i + 1)))
    msgArray.push(v)
  }
  if (msgBuff.length % n !== 0) {
    const v = ffUtils.leBuff2int(msgBuff.slice(fullParts * n))
    msgArray.push(v)
  }
  return multiHash(msgArray)
}

export const readFile = (file) => {
  return new Promise((resolve) => {
    const reader = new window.FileReader()
    reader.readAsText(file)
    reader.onload = function (event) {
      resolve(JSON.parse(event.target.result))
    }
  })
}

export const pointHexToCompress = (pointHex) => {
  if (!pointHex[0].startsWith('0x')) {
    pointHex[0] = `0x${pointHex[0]}`
  }
  if (!pointHex[1].startsWith('0x')) {
    pointHex[1] = `0x${pointHex[1]}`
  }
  const point = [BigInt(pointHex[0]), BigInt(pointHex[1])]
  const buf = babyJub.packPoint(point)
  return buf.toString('hex')
}

export const pointToCompress = (point) => {
  const pointBigInt = [BigInt(point[0]), BigInt(point[1])]
  const buf = babyJub.packPoint(pointBigInt)
  const compress = `0x${buf.toString('hex')}`
  return compress
}

export const hexToPoint = (compress) => {
  let compressHex
  if (compress.startsWith('0x')) compressHex = compress.slice(2)
  else compressHex = compress
  const buf = Buffer.from(compressHex, 'hex')
  const point = babyJub.unpackPoint(buf)
  const pointHexAx = point[0].toString(16)
  const pointHexAy = point[1].toString(16)
  const pointHex = [pointHexAx, pointHexAy]
  return pointHex
}

export const state2array = (amount, token, ax, ay, ethAddress, nonce) => {
  let data = Scalar.e(0)

  data = Scalar.add(data, token)
  data = Scalar.add(data, Scalar.shl(nonce, 32))

  return [
    data,
    Scalar.e(amount),
    Scalar.fromString(ax, 16),
    Scalar.fromString(ay, 16),
    Scalar.fromString(ethAddress, 16)
  ]
}

export const hashState = (st) => {
  const hash = poseidon.createHash(6, 8, 57)
  return hash(st)
}

export const getNullifier = async (wallet, info, contractRollup, batch) => {
  const [ax, ay] = wallet.publicKey
  const exitEntry = state2array(
    info.data.state.amount,
    info.data.state.coin,
    ax.toString(16),
    ay.toString(16),
    wallet.hermezEthereumAddress,
    0
  )
  const valueExitTree = hashState(exitEntry)
  const exitRoot = await contractRollup.getExitRoot(batch)
  const nullifier = []
  nullifier[0] = valueExitTree
  nullifier[1] = batch
  nullifier[2] = BigInt(exitRoot)
  const hashNullifier = hashState(nullifier)
  const boolNullifier = await contractRollup.exitNullifier(
    hashNullifier.toString()
  )
  return boolNullifier
}

export const getWei = (ether) => {
  let wei
  try {
    wei = ethers.utils.parseUnits(ether, 'ether').toString()
  } catch (err) {
    wei = '0'
  }
  return wei
}

export const hexToBuffer = (hexString) => {
  return Buffer.from(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
}

/**
 * Encode tx Data
 * @param {String} tx - Transaction object
 * @returns {Scalar} Encoded TxData
 */
export function buildTxData (tx) {
  const IDEN3_ROLLUP_TX = Scalar.fromString('4839017969649077913')
  let res = Scalar.e(0)

  res = Scalar.add(res, IDEN3_ROLLUP_TX)
  res = Scalar.add(res, Scalar.shl(fix2Float(tx.amount || 0), 64))
  res = Scalar.add(res, Scalar.shl(tx.coin || 0, 80))
  res = Scalar.add(res, Scalar.shl(tx.nonce || 0, 112))
  res = Scalar.add(res, Scalar.shl(tx.fee || 0, 160))
  res = Scalar.add(res, Scalar.shl(tx.rqOffset || 0, 164))
  res = Scalar.add(res, Scalar.shl(tx.onChain ? 1 : 0, 167))
  res = Scalar.add(res, Scalar.shl(tx.newAccount ? 1 : 0, 168))

  return res
}

export const exitAx =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
export const exitAy =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
