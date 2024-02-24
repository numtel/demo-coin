import DemoERC721ABI from './abi/DemoERC721.json';

export const defaultChain = 17000;

export const byChain = {
  17000: {
    chain: 17000,
    name: 'Holesky',
    explorer: 'https://holesky.etherscan.io/',
    nativeCurrency: 'hETH',
    DemoERC721: {
      address: '0xBFaDdD34Bc509beBB2c26C1b2E7F77e3E97da3fB',
      abi: DemoERC721ABI,
      chainId: 17000,
    },
  },
};

export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  return byChain[defaultChain];
}
