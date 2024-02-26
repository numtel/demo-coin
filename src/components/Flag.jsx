import {useState} from 'react';
import {
  useAccount,
} from 'wagmi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

import { chainContracts } from '../contracts.js';
import Dialog from './Dialog.jsx';

export default function Flag({ value, href, className, tokenId }) {
  const [show, setShow] = useState(0);
  const {address: account, chainId} = useAccount();
  const contracts = chainContracts(chainId);

  const shape = Number(value & 0xFFn);
  const color1 = ((value >> 8n) & 0xFFFFFFn).toString(16).padStart(6, '0');
  const color2 = ((value >> 32n) & 0xFFFFFFn).toString(16).padStart(6, '0');
  const color3 = ((value >> 56n) & 0xFFFFFFn).toString(16).padStart(6, '0');
  let background;

  if(shape === 0) {
    background = `linear-gradient(90deg,
      #${color1} 33.2%,
      #${color2} 33.3%, #${color2} 66.6%,
      #${color3} 66.7%)`;
  } else if(shape === 1) {
    background = `linear-gradient(0deg,
      #${color1} 33.2%,
      #${color2} 33.3%, #${color2} 66.6%,
      #${color3} 66.7%)`;
  } else if(shape === 2) {
    background = `linear-gradient(-30deg,
      #${color1} 32.0%,
      #${color2} 33.3%, #${color2} 65.6%,
      #${color3} 66.9%)`;
  } else if(shape === 3) {
    background = `radial-gradient(
      #${color1} 31.0%,
      #${color2} 33.3%, #${color2} 65.6%,
      #${color3} 67.9%)`;
  } else if(shape === 4) {
    background = `conic-gradient(
      #${color1} 1%, #${color1} 32.5%,
      #${color2} 33.3%, #${color2} 66.3%,
      #${color3} 67.9%, #${color3} 99%)`;
  } else {
    background = `black`;
  }

  return (<>
    <button
      type="button"
      onClick={() => tokenId && setShow(show + 1)}
      className={`flag ${className}`}
      title={tokenId ? `Token #${String(tokenId)}` : null}
      style={{
        background
      }}
    />
    <Dialog {...{show, setShow}} button="Close">
      <h2>Token #{String(tokenId)}<br />
        <a href={contracts.explorer + 'token/' + contracts.DemoERC721.address + '?a=' + String(tokenId)}
          rel="noopener" target="_blank" title="View on Explorer">
            <FontAwesomeIcon icon={faUpRightFromSquare} />
          </a>
      </h2>
      <div
        className={`flag`}
        title={tokenId ? `Token #${String(tokenId)}` : null}
        style={{
          background
        }}
      />
      {href && (<p className="token-uri"><a href={href} title="Owner-Submitted Token URI" rel="noopener" target="_blank">{href}</a></p>)}
    </Dialog>

  </>);
}
