
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';

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
