import { ContractsBlob } from '../types';

const nodeFetch = require('node-fetch');

interface StringMap {
  [key: string]: string;
}

const CONTRACTS_STORE: StringMap = {
  '5': 'https://raw.githubusercontent.com/pooltogether/v5-testnet/main/deployments/ethGoerli/contracts.json',
  '80001': 'https://github.com/pooltogether/v5-testnet/blob/main/deployments/mumbai/contracts.json',
  '11155111':
    'https://raw.githubusercontent.com/pooltogether/v5-testnet/main/deployments/ethSepolia/contracts.json',
};

/**
 * Downloads the latest contracts blob from the raw data source on GitHub
 * @param {number} chainId
 * @returns {ContractsBlob} contracts
 */
export const downloadContractsBlob = async (
  chainId: number,
  fetch?: any,
): Promise<ContractsBlob> => {
  let contracts;

  if (!fetch) {
    fetch = nodeFetch;
  }

  try {
    const response = await fetch(CONTRACTS_STORE[chainId.toString()]);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const body = await response.json();
    contracts = body;
  } catch (err) {
    console.log(err);
  }

  return contracts;
};
