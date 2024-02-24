import DemoERC721ABI from './abi/DemoERC721.json';

export const defaultChain = 17000;

export const byChain = {
  17000: {
    chain: 17000,
    name: 'Holesky',
    explorer: 'https://holesky.etherscan.io/',
    nativeCurrency: 'hETH',
    startBlock: 1009077n,
    DemoERC721: {
      address: '0xcE6dadCC3F3206aBd32F07346f8155A4Ce9477f0',
      abi: DemoERC721ABI,
      chainId: 17000,
    },
  },
};

export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  return byChain[defaultChain];
}
