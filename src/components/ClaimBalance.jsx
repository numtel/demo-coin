
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';

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

  function submit(event) {
    event.preventDefault();
    writeContract({
      ...contracts.DemoERC721,
      functionName: 'claimBalance',
      args: [ tokenId, 9999999999999999, balance, account ],
    });
  }

  return (
    <div className="controls">
      <button onClick={submit}>Collect Balance</button>
      {writeLoading && <p className="form-status">Waiting for user...</p>}
      {writeError && <p className="form-status error">Transaction error!</p>}
      {writeSuccess && (
        txError ? (<p className="form-status error">Transaction error!</p>)
        : txLoading ? (<p className="form-status">Waiting for transaction...</p>)
        : txSuccess ? (<p className="form-status">Success!</p>)
        : (<p className="form-status">Transaction sent...</p>))}
    </div>
  );
}
