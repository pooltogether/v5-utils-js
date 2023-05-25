import axios from 'axios';

import { ContractsBlob } from '../types';

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
export const downloadContractsBlob = async (chainId: number): Promise<ContractsBlob> => {
  let contracts;

  try {
    const { data } = await axios.get(CONTRACTS_STORE[chainId.toString()]);
    contracts = data;
  } catch (error) {
    console.error(error);
  }

  return contracts;
};
