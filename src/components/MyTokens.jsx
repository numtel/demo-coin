import {useState} from 'react';
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { formatEther } from 'viem';

import { chainContracts } from '../contracts.js';

import Flag from './Flag.jsx';
import TokenForm from './TokenForm.jsx';
import ClaimBalance from './ClaimBalance.jsx';
import Dialog from './Dialog.jsx';

export default function MyTokens() {
  const {address: account, chainId} = useAccount();
  const contracts = chainContracts(chainId);
  const {data, isLoading, isError} = useReadContracts({
    contracts: [
      {
        ...contracts.DemoERC721,
        functionName: 'balanceOf',
        args: [account]
      },
    ],
  });
  if(isLoading) return (<div className="loading">
    Loading my token balance...
  </div>);

  if(isError || !data) return (<div className="error">
    Error loading my token balance!
  </div>);

  return (<FetchMyTokenIds count={data[0].result} />);
}

function FetchMyTokenIds({ count }) {
  const {address: account, chainId} = useAccount();
  const contracts = chainContracts(chainId);
  const toLoad = [];
  for(let i = 0; i < count; i++) {
    toLoad.push({
      ...contracts.DemoERC721,
      functionName: 'tokenOfOwnerByIndex',
      args: [account, i]
    });
  }
  const {data, isLoading, isError} = useReadContracts({
    contracts: toLoad,
  });

  if(!count) return(<div className="empty">
    No tokens in wallet.
  </div>);

  if(isLoading) return (<div className="loading">
    Loading my token ids...
  </div>);

  if(isError || !data) return (<div className="error">
    Error loading my token ids!
  </div>);

  return (<FetchTokens list={data.map(x => x.result)} />);
}

function FetchTokens({ list }) {
  const {address: account, chainId} = useAccount();
  const contracts = chainContracts(chainId);
  const toLoad = [];
  for(let tokenId of list) {
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
    toLoad.push({
      ...contracts.DemoERC721,
      functionName: 'mintPrices',
      args: [tokenId]
    });
    toLoad.push({
      ...contracts.DemoERC721,
      functionName: 'claimableBalance',
      args: [tokenId, 9999999999999999n]
    });
  }
  const {data, isLoading, isError} = useReadContracts({
    contracts: toLoad,
  });

  if(isLoading) return (<div className="loading">
    Loading token details...
  </div>);

  if(isError || !data) return (<div className="error">
    Error loading token details!
  </div>);

  return list.map((tokenId, index) => (<DisplayToken
    key={Number(tokenId)}
    tokenId={tokenId}
    flag={data[index * 5].result}
    tokenURI={data[index * 5 + 1].result}
    mintBallot={data[index * 5 + 2].result}
    mintPrice={data[index * 5 + 3].result}
    claimableBalance={data[index * 5 + 4].result}
    />));
}

function DisplayToken({
  tokenId,
  flag,
  tokenURI,
  mintBallot,
  mintPrice,
  claimableBalance,
}) {
  const [show, setShow] = useState(0);
  return (<div className="token">
    <h3>Token #{String(tokenId)}</h3>
    <Flag value={flag} href={tokenURI} />
    <p>Minted for {formatEther(mintPrice)} ETH</p>
    <p>Claimable balance: {formatEther(claimableBalance)} ETH</p>
    <ClaimBalance tokenId={tokenId} balance={claimableBalance} />
    <button onClick={() => setShow(show + 1)}>Update...</button>

    <Dialog {...{show, setShow}} button="Close">
      <h2>Update Token #{String(tokenId)}</h2>
      <TokenForm
        tokenId={tokenId}
        initFlag={flag}
        initTokenURI={tokenURI}
        initMintBallot={mintBallot}
        />
    </Dialog>
  </div>);
}
