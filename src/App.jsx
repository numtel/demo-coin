import { useState } from 'react';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import {
  useAccount,
} from 'wagmi';
import { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faEthereum } from '@fortawesome/free-brands-svg-icons';

import { chainContracts } from './contracts.js';
import DarkModeDetector from './components/DarkModeDetector.jsx';
import Mint from './components/Mint.jsx';
import MyTokens from './components/MyTokens.jsx';
import PriceHistory from './components/PriceHistory.jsx';
import MintBallots from './components/MintBallots.jsx';

export default function App() {
  const {address: account, chainId} = useAccount();
  const { openConnectModal } = useConnectModal();
  const contracts = chainContracts(chainId);
  return (
    <main>
      <Toaster />
      <h1>Optimeme<br />Factory</h1>
      <div className="rainbowkit">
        {account ? <ConnectButton /> :
          <button type="button" onClick={openConnectModal}>Connect Wallet</button>}
      </div>
      <blockquote>This is what democracy looks like?</blockquote>
      <p>A new tokenomics, from the token holders<br />
      For &hellip; the median!</p>

      <p>Continuous election complements traditional discrete elections by providing a sliding scale for deciding along an individual criteria.</p>

      <p>As an initial demonstration of this new type of decision-making protocol, this project has a single criteria under continous election: the price to mint another NFT.</p>
      <p>All mint fees are redistributed equally among the tokens. Get in early to earn the most!</p>
      <Mint />
      <h3>Price History</h3>
      <PriceHistory />
      <h3>Mint Ballots</h3>
      <MintBallots />
      {account && <>
        <h2 style={{transform:'rotate(2deg)'}}>My Tokens</h2>
        <MyTokens />
      </>}

      <footer>
        <a href="https://github.com/numtel/democoin" rel="noopener" target="_blank" title="Github Repository">
          <FontAwesomeIcon icon={faGithub} size="2xl" />
        </a>&nbsp;
        <a href={contracts.explorer + 'address/' + contracts.DemoERC721.address} rel="noopener" target="_blank" title="Collection on Block Explorer">
          <FontAwesomeIcon icon={faEthereum} size="2xl" />
        </a>
      </footer>
    </main>
  );
}

