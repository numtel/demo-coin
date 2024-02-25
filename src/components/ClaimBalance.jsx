import {useEffect} from 'react';
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import toast from 'react-hot-toast';

import { chainContracts } from '../contracts.js';

export default function ClaimBalance({ tokenId, balance }) {
  const {address: account, chainId} = useAccount();
  const contracts = chainContracts(chainId);
  const {
    writeContract,
    data: writeData,
    isPending: writeLoading,
    isError: writeError,
    isSuccess: writeSuccess,
  } = useWriteContract();
  const {
    isPending: txLoading,
    isError: txError,
    isSuccess: txSuccess,
    status: txStatus,
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if(writeLoading) toast('Waiting for wallet...');
    if(writeError) toast('Transaction error!');
    if(writeSuccess) {
      if(txError) toast('Transaction error!');
      else if(txLoading) toast('Waiting for transaction...');
      else if(txSuccess) toast('Success!');
      else toast('Transaction sent...');
    }
  }, [ txError, txSuccess, txLoading, writeLoading, writeError, writeSuccess ]);


  function submit(event) {
    event.preventDefault();
    writeContract({
      ...contracts.DemoERC721,
      functionName: 'claimBalanceMany',
      args: [ [tokenId], 9999999999999999, account ],
    });
  }

  return (
    <div className="controls">
      <button disabled={balance===0n} onClick={submit}>Collect</button><br />
    </div>
  );
}
