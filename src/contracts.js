import DemoERC721ABI from './abi/DemoERC721.json';

export const defaultChain = 17000;

export const byChain = {
  17000: {
    chain: 17000,
    name: 'Holesky',
    explorer: 'https://holesky.etherscan.io/',
    nativeCurrency: 'hETH',
    startBlock: 1007667,
    DemoERC721: {
      address: '0x52B408c47F6D7c266C213aAB6C1558F400bE0DD5',
      abi: DemoERC721ABI,
      chainId: 17000,
    },
  },
};

export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  return byChain[defaultChain];
}
