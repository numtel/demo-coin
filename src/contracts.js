import DemoERC721ABI from './abi/DemoERC721.json';

export const defaultChain = 17000;

export const byChain = {
  17000: {
    chain: 17000,
    name: 'Holesky',
    explorer: 'https://holesky.etherscan.io/',
    nativeCurrency: 'hETH',
    startBlock: 1015177n,
    DemoERC721: {
      address: '0x10c05Fe61d4CA86a29f9Afe5607Bbde533F04a1e',
      abi: DemoERC721ABI,
      chainId: 17000,
    },
  },
};

export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  return byChain[defaultChain];
}
