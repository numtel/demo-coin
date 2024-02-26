import {useState, useEffect} from 'react';
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import {
  useConnectModal,
} from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import { chainContracts } from '../contracts.js';

import Flag from './Flag.jsx';

export default function TokenForm({
  initMintBallot, initFlag, initTokenURI, tokenId,
  mintPrice, setShow,
}) {
  const {address: account, chainId} = useAccount();
  const { openConnectModal } = useConnectModal();
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
    onSuccess: function() {
      // TODO close dialog and refresh mytokens
      console.log('doooon');
    },
  });

  let shape, color1, color2, color3;
  if(initFlag) {
    shape = Number(initFlag & 0xFFn);
    color1 = ((initFlag >> 8n) & 0xFFFFFFn).toString(16).padStart(6, '0');
    color2 = ((initFlag >> 32n) & 0xFFFFFFn).toString(16).padStart(6, '0');
    color3 = ((initFlag >> 56n) & 0xFFFFFFn).toString(16).padStart(6, '0');
  }
  const [mintBallot, setMintBallot] = useState(Number(initMintBallot || 0) / 10);
  const [flagShape, setFlagShape] = useState(shape || 0);
  const [flagColor1, setFlagColor1] = useState(`#${color1 || 'ff0000'}`);
  const [flagColor2, setFlagColor2] = useState(`#${color2 || '00ff00'}`);
  const [flagColor3, setFlagColor3] = useState(`#${color3 || '0000ff'}`);
  const [tokenURI, setTokenURI] = useState(initTokenURI || '');

  const flagValue = BigInt(`0x${flagColor3.slice(1)}${flagColor2.slice(1)}${flagColor1.slice(1)}0${flagShape}`);

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

  function submitForm(event) {
    event.preventDefault();
    if(!account) {
      setShow && setShow(false);
      openConnectModal();
      return;
    }
    if(tokenId) {
      writeContract({
        ...contracts.DemoERC721,
        functionName: 'setAll',
        args: [ tokenId, mintBallot * 10, flagValue, tokenURI ],
      });
    } else {
      writeContract({
        ...contracts.DemoERC721,
        functionName: 'mint',
        args: [ mintBallot * 10, flagValue, tokenURI ],
        value: mintPrice,
      });
    }
  }

  return (
    <form onSubmit={submitForm}>
      <div className="fields">
        <fieldset>
          <legend>Ballot</legend>
          <p className="help">
            Optionally, submit a ballot for the price in {contracts.nativeCurrency} to mint another token.
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
            <div className="controls">
              <button type="button" onClick={() => setMintBallot(Number(Math.max(mintBallot - 0.1, 0).toFixed(1)))}><FontAwesomeIcon icon={faMinus} /></button>
              <button type="button" onClick={() => setMintBallot(Number(Math.min(mintBallot + 0.1, 100).toFixed(1)))}><FontAwesomeIcon icon={faPlus} /></button>
            </div>
          {mintBallot === 0 && <span className="abstain">(Abstaining from voting)</span>}
        </fieldset>
        <fieldset>
          <legend>Flag</legend>
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
          </select><br />
          <div className="colors">
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
          </div>
        </fieldset>
        <fieldset>
          <legend>Token URI</legend>
          <p className="help">
            Link to another resource for more information.
          </p>
          <input
            name="tokenURI"
            type="text"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            />
        </fieldset>
      </div>
      <div className="controls">
        <button type="submit">{tokenId ? 'Update Token' : 'Mint New Token'}</button>
      </div>
    </form>
  );
}

