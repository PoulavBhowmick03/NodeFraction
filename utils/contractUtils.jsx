import { ethers } from 'ethers'

export const formatEther = (wei) => {
  return ethers.utils.formatEther(wei)
}

export const parseEther = (ether) => {
  return ethers.utils.parseEther(ether)
}

export const shortenAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const getErrorMessage = (error) => {
  if (error.data) {
    return error.data.message
  } else if (error.message) {
    return error.message
  } else {
    return 'An unknown error occurred'
  }
}