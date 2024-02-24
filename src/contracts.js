import DemoERC721ABI from './abi/DemoERC721.json';

export const defaultChain = 17000;

export const byChain = {
  17000: {
    chain: 17000,
    name: 'Holesky',
    explorer: 'https://holesky.etherscan.io/',
    nativeCurrency: 'hETH',
    DemoERC721: {
      address: '0xD1B96D2A696Dc3A76B455F332307137Bbb28BdB7',
      abi: DemoERC721ABI,
      chainId: 17000,
    },
  },
};

export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  return byChain[defaultChain];
}
