import {useEffect, useState} from 'react';
import {
  useAccount,
useReadContracts,
} from 'wagmi';
import { parseAbiItem } from 'viem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

import { chainContracts } from '../contracts.js';

import Flag from './Flag.jsx';

export default function MintBallots() {
  const {chainId} = useAccount();
  const contracts = chainContracts(chainId);

  const {data, isLoading, isError} = useReadContracts({
    contracts: [
      {
        ...contracts.DemoERC721,
        functionName: 'mintCount',
      },
    ],
  });
  if(isLoading) return (<div className="loading">
    Loading token count...
  </div>);

  if(isError || !data) return (<div className="error">
    Error loading token count!
  </div>);

  return (<LoadBallots count={data[0].result} />);
}

function LoadBallots({ count }) {
  const {chainId} = useAccount();
  const contracts = chainContracts(chainId);

  const toLoad = [];
  for(let tokenId = 1n; tokenId < count + 1n; tokenId++) {
    toLoad.push({
      ...contracts.DemoERC721,
      functionName: 'flags',
      args: [tokenId]
    });
    toLoad.push({
      ...contracts.DemoERC721,
      functionName: 'tokenURI',
      args: [tokenId]
    });
    toLoad.push({
      ...contracts.DemoERC721,
      functionName: 'mintBallots',
      args: [tokenId]
    });
  }
  const {data, isLoading, isError} = useReadContracts({
    contracts: toLoad,
  });

  if(!count) return(<div className="empty">
    No ballots set.
  </div>);

  if(isLoading) return (<div className="loading">
    Loading ballot data...
  </div>);

  if(isError || !data) return (<div className="error">
    Error loading ballot data!
  </div>);

  const byBallot = {};
  for(let i = 0; i < count; i++) {
    const tokenId = BigInt(i+1);
    const flag = data[i * 3].result;
    const tokenURI = data[i * 3 + 1].result;
    const ballot = String(data[i * 3 + 2].result);
    if(!(ballot in byBallot)) {
      byBallot[ballot] = [];
    }
    byBallot[ballot].push({ tokenId, flag, tokenURI });
  }
  const ballots = Object.keys(byBallot).sort((a,b) => a-b);

  return(<div className="mint-ballots">
    <table>
      <thead>
        <tr>
          <th>Ballot</th>
          <th>Tokens</th>
        </tr>
      </thead>
      <tbody>
        {ballots.length === 0 ? (
          <tr>
            <td colspan="3">No ballots yet.</td>
          </tr>
        ) : ballots.map((ballot) => (
          <tr key={ballot}>
            <td>
              {Number(ballot) / 10} {contracts.nativeCurrency}
            </td>
            <td>
              {byBallot[ballot].map(({tokenId, flag, tokenURI}) => (<Flag
                key={String(tokenId)}
                className="small"
                value={flag}
                href={tokenURI}
                tokenId={tokenId}
              />))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>);
}

