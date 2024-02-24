import {useState} from 'react';
import {
  useAccount,
  useBalance,
  useReadContracts,
} from 'wagmi';
import { formatEther } from 'viem';

import { chainContracts } from '../contracts.js';

import TokenForm from './TokenForm.jsx';
import Dialog from './Dialog.jsx';

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
  const [show, setShow] = useState(0);

  if(isLoading) return (<div className="loading">
    Loading...
  </div>);

  if(isError || !data) return (<div className="error">
    Error loading!
  </div>);

  const insufficientBalance = balance && data[0].result > balance.value;
  return (<>
    <h2>
      Current Price:&nbsp;
      <span className="value">{formatEther(data[0].result)} {contracts.nativeCurrency}</span>
    </h2>
    <p className="price">
      {insufficientBalance && <span className="help">Insufficient Balance!</span>}
    </p>
    <button onClick={() => setShow(show + 1)} className="leader">Mint One Now!</button>
    <Dialog {...{show, setShow}} button="Close">
      <h2>Mint New Token for {formatEther(data[0].result)} {contracts.nativeCurrency}</h2>
      <p className="help">
        Tokens can be reconfigured by their owner at any time.
      </p>
      <TokenForm mintPrice={data[0].result} {...{setShow}} />
    </Dialog>
  </>);
}
