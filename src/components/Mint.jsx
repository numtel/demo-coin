import {useState} from 'react';
import {
  useAccount,
  useBalance,
  useReadContracts,
} from 'wagmi';
import { formatEther } from 'viem';

import { chainContracts } from '../contracts.js';

import TokenForm from './TokenForm.jsx';

export default function Mint() {
  const {address: account, chainId} = useAccount();
  const {data: balance} = useBalance({address: account});
  const contracts = chainContracts(chainId);
  const {data, isLoading, isError} = useReadContracts({
    contracts: [
      {
        ...contracts.DemoERC721,
        functionName: 'currentMintPrice',
      },
    ],
  });

  if(isLoading) return (<div className="loading">
    Loading...
  </div>);

  if(isError || !data) return (<div className="error">
    Error loading!
  </div>);

  const insufficientBalance = data[0].result > balance.value;
  return (<>
    <p className="price">
      Current Price:
      <span className="value">{formatEther(data[0].result)} {contracts.nativeCurrency}</span>
      {insufficientBalance && <span className="help">Insufficient Balance!</span>}
    </p>
    <TokenForm mintPrice={data[0].result} />
  </>);
}
