import {useEffect} from 'react';
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import toast from 'react-hot-toast';

import { chainContracts } from '../contracts.js';

export default function ClaimBalance({ tokenIds, totalBalance }) {
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
    toast.dismiss();
    if(writeLoading) toast.loading('Waiting for wallet...');
    if(writeError) toast.error('Transaction error!');
    if(writeSuccess) {
      if(txError) toast.error('Transaction error!');
      else if(txLoading) toast.loading('Waiting for transaction...');
      else if(txSuccess) toast.success('Success!');
      else toast.loading('Transaction sent...');
    }
  }, [ txError, txSuccess, txLoading, writeLoading, writeError, writeSuccess ]);

  function submit(event) {
    event.preventDefault();
    writeContract({
      ...contracts.DemoERC721,
      functionName: 'claimBalanceMany',
      args: [ tokenIds, 9999999999999999, account ],
    });
  }

  return (
    <div className="controls move-up">
      <button disabled={!totalBalance} onClick={submit}>Collect All</button><br />
    </div>
  );
}
