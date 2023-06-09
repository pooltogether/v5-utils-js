import { MulticallProvider } from 'ethers-multicall-provider';
import { ContractCallContext, Multicall } from 'ethereum-multicall';
import { ContractCallResults } from 'ethereum-multicall/dist/esm/models';
import { Provider } from '@ethersproject/providers';
import { utils } from 'ethers';

/**
 * Returns the results of a multicall where each call is made to every contract address provided
 * @param readProvider a read-capable provider to query through
 * @param contractAddresses contract addresses to make calls to
 * @param abi the ABI of the contracts provided
 * @param calls the calls to make to each contract
 * @returns
 */
export const getMulticallResults = async (
  readProvider: Provider,
  contractAddresses: string[],
  abi: ContractCallContext['abi'],
  calls: ContractCallContext['calls'],
): Promise<{
  [contractAddress: string]: {
    [reference: string]: any[];
  };
}> => {
  const validAddresses = contractAddresses.every((address) => utils.isAddress(address));
  if (contractAddresses.length === 0 || !validAddresses || calls.length === 0) {
    throw new Error('Multicall Error: Invalid parameters');
  }

  const chainId = (await readProvider.getNetwork())?.chainId;
  if (!chainId) {
    throw new Error('Multicall Error: Could not get chainId from provider');
  }

  const queries: ContractCallContext[] = [];
  contractAddresses.forEach((contractAddress) => {
    queries.push({ reference: contractAddress, contractAddress, abi, calls });
  });

  const multicall = new Multicall({ ethersProvider: readProvider, tryAggregate: true });
  const response: ContractCallResults = await multicall.call(queries);

  const formattedResults: { [contractAddress: string]: { [reference: string]: any[] } } = {};
  contractAddresses.forEach((contractAddress) => {
    formattedResults[contractAddress] = {};
    response.results[contractAddress].callsReturnContext.forEach((result) => {
      formattedResults[contractAddress][result.reference] = result.returnValues;
    });
  });

  return formattedResults;
};

/**
 * Returns the results of a complex multicall where contract queries are provided instead of calls
 * @param readProvider a read-capable provider to query through
 * @param queries the contract queries to make
 * @returns
 */
export const getComplexMulticallResults = async (
  readProvider: Provider,
  queries: ContractCallContext[],
): Promise<{
  [contractAddress: string]: {
    [reference: string]: any[];
  };
}> => {
  const validAddresses = queries.every((query) => utils.isAddress(query.contractAddress));
  if (queries.length === 0 || !validAddresses) {
    throw new Error('Multicall Error: Invalid parameters');
  }

  const chainId = (await readProvider.getNetwork())?.chainId;
  if (!chainId) {
    throw new Error('Multicall Error: Could not get chainId from provider');
  }

  const multicall = new Multicall({ ethersProvider: readProvider, tryAggregate: true });
  const response: ContractCallResults = await multicall.call(queries);

  const formattedResults: { [contractAddress: string]: { [reference: string]: any[] } } = {};
  queries.forEach((query) => {
    if (formattedResults[query.contractAddress] === undefined) {
      formattedResults[query.contractAddress] = {};
    }
    response.results[query.reference].callsReturnContext.forEach((result) => {
      formattedResults[query.contractAddress][result.reference] = result.returnValues;
    });
  });

  return formattedResults;
};

/**
 * Returns the results of a complex multicall where contract queries are provided instead of calls
 * @param multicallProvider a read-capable provider to query through
 * @param queries the contract queries to make
 * @returns
 */
export const getEthersMulticallProviderResults = async (
  multicallProvider: MulticallProvider,
  queries: Record<string, any>,
) => {
  const chainId = (await multicallProvider.getNetwork())?.chainId;
  if (!chainId) {
    throw new Error('Multicall Error: Could not get chainId from provider');
  }

  const calls = Object.values(queries).map((query) => query);

  const multicallResponse = await Promise.all(calls);

  Object.keys(queries).forEach((key, index) => {
    queries[key] = multicallResponse[index];
  });

  return queries;
};
