import {useState} from 'react';
import {
  useAccount,
  useBalance,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { formatEther, parseEther } from 'viem';

import { chainContracts } from '../contracts.js';

import Flag from './Flag.jsx';

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

  const [mintBallot, setMintBallot] = useState(0);
  const [flagShape, setFlagShape] = useState(0);
  const [flagColor1, setFlagColor1] = useState('#ff0000');
  const [flagColor2, setFlagColor2] = useState('#00ff00');
  const [flagColor3, setFlagColor3] = useState('#0000ff');
  const [tokenURI, setTokenURI] = useState('');

  const flagValue = BigInt(`0x${flagColor3.slice(1)}${flagColor2.slice(1)}${flagColor1.slice(1)}0${flagShape}`);

  function submitForm(event) {
    event.preventDefault();
    writeContract({
      ...contracts.DemoERC721,
      functionName: 'mint',
      args: [ mintBallot * 10, flagValue, tokenURI ],
      value: data[0].result,
    });
  }

  if(isLoading) return (<div className="loading">
    Loading...
  </div>);

  if(isError || !data) return (<div className="error">
    Error loading!
  </div>);

  const insufficientBalance = data[0].result > balance.value;
  return (
    <form onSubmit={submitForm}>
      <p className="price">
        Current Price:
        <span className="value">{formatEther(data[0].result)} {contracts.nativeCurrency}</span>
        {insufficientBalance && <span className="help">Insufficient Balance!</span>}
      </p>
      <p className="help">
        Each token can be configured by the owner at any time.
      </p>
      <fieldset>
        <legend>Mint Ballot</legend>
        <p className="help">
          Optionally, submit a ballot for the price to mint another token.
        </p>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={mintBallot}
          onChange={(e) => setMintBallot(Number(e.target.value))}
          />
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={mintBallot}
          onChange={(e) => setMintBallot(Number(e.target.value))}
          />
        {mintBallot === 0 && <span className="help">(Abstaining from voting)</span>}
      </fieldset>
      <fieldset>
        <legend>Flag Configuration</legend>
        <p className="help">
          Choose your flag design and three colors.
        </p>
        <Flag value={flagValue} />
        <select
          value={flagShape}
          onChange={(e) => setFlagShape(Number(e.target.value))}
          >
          <option value="0">Vertical Stripes</option>
          <option value="1">Horizontal Stripes</option>
          <option value="2">Diagonal Stripes</option>
          <option value="3">Concentric Circles</option>
          <option value="4">Conic Slices</option>
        </select>
        <input
          value={flagColor1}
          onChange={(e) => setFlagColor1(e.target.value)}
          type="color"
          />
        <input
          value={flagColor2}
          onChange={(e) => setFlagColor2(e.target.value)}
          type="color"
          />
        <input
          value={flagColor3}
          onChange={(e) => setFlagColor3(e.target.value)}
          type="color"
          />

      </fieldset>
      <fieldset>
        <legend>Token URI</legend>
        <p className="help">
          Link to another resource for more information.
        </p>
        <input
          name="tokenURI"
          value={tokenURI}
          onChange={(e) => setTokenURI(e.target.value)}
          />
      </fieldset>
      <div className="controls">
        <button type="submit">Mint New Token</button>
        {writeLoading && <p className="form-status">Waiting for user...</p>}
        {writeError && <p className="form-status error">Transaction error!</p>}
        {writeSuccess && (
          txError ? (<p className="form-status error">Transaction error!</p>)
          : txLoading ? (<p className="form-status">Waiting for transaction...</p>)
          : txSuccess ? (<p className="form-status">Success!</p>)
          : (<p className="form-status">Transaction sent...</p>))}
      </div>
    </form>
  );
}
