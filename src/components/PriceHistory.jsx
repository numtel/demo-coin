import {useEffect, useState} from 'react';
import {
  useAccount,
  usePublicClient,
} from 'wagmi';
import { parseAbiItem } from 'viem';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

import { chainContracts } from '../contracts.js';

import Flag from './Flag.jsx';

function CustomizedLabel({ x, y, index, value, events, changerDetails }) {
  return (
    <g>
      <foreignObject className="node" data-x={index} x={x} y={y} width="30" height="20">
        {events[index].changers.map(tokenId => {
          const loaded = changerDetails[String(tokenId)];
          if(!loaded) return null;
          return (<Flag
            key={String(tokenId)}
            className="small"
            value={loaded.flag}
            href={loaded.tokenURI}
            tokenId={tokenId}
            />);
          })}
      </foreignObject>
    </g>
  );
}

function CustomizedAxisTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
        {(new Date(payload.value * 1000)).toLocaleTimeString()}
      </text>
    </g>
  );
}

export default function PriceHistory() {
  const {address: account, chainId} = useAccount();
  const contracts = chainContracts(chainId);
  const publicClient = usePublicClient({ chainId });
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState(null);
  const [changerDetails, setChangerDetails] = useState({});
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      const blockNumber = await publicClient.getBlockNumber();
      // TODO multiple requests for when block range > max
      const logs = await publicClient.getLogs({
        address: contracts.DemoERC721.address,
        event: parseAbiItem('event MintBallotUpdate(uint256 indexed tokenId, uint256 oldValue, uint256 newValue)'),
        fromBlock: contracts.startBlock,
        toBlock: blockNumber,
      });
      const allChangers = [];
      const events = [];
      let ballots = {};
      for(let log of logs) {
        if(log.args.oldValue === log.args.newValue) continue;
        ballots = {
          ...ballots,
          [String(log.args.tokenId)]: Number(log.args.newValue)
        };
        if(allChangers.indexOf(log.args.tokenId) === -1) {
          allChangers.push(log.args.tokenId);
        }
        const votes = Object.values(ballots).filter(x => x!==0);
        votes.sort((a,b) => a-b);
        const midIndex = Math.floor(votes.length/2);
        const median = votes.length === 0 ? 0 :
            votes.length === 1 ? votes[0] :
            votes.length % 2 === 1
              ? votes[midIndex]
              : Math.floor((votes[midIndex - 1] + votes[midIndex])/2);
        if(!events.length || events[events.length-1].block !== log.blockNumber) {
          const event = {
            block: log.blockNumber,
            ballots: {...ballots},
            changers: [log.args.tokenId],
            median,
          };
          events.push(event);
        } else {
          events[events.length-1].ballots = {...ballots};
          events[events.length-1].median = meidan;
          events[events.length-1].changers.push(log.args.tokenId);
        }
      }
      const blockPromises = events.map(event => publicClient.getBlock({blockNumber: event.block}));
      const blockDetails = await Promise.all(blockPromises);
      for(let i = 0; i<events.length; i++) {
        events[i].timestamp = Number(blockDetails[i].timestamp);
      }
      setEvents(events);
      setChangerDetails(await loadFlags(publicClient, contracts, allChangers));
      setIsLoading(false);
    }
    fetchEvents();
  }, []);

  if(isLoading) return (<div className="loading">
    Loading price history...
  </div>);

  if(events && events.length === 0) return(<div className="empty">
    No ballots set.
  </div>);

  if(events) return(<div className="price-history">
    <LineChart
      width={500}
      height={300}
      data={events.map(event => ({
        timestamp: Number(event.timestamp),
        ETH: event.median / 10,
      }))}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 100,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']} height={10} tick={<CustomizedAxisTick />} />
      <YAxis />
      <Tooltip labelStyle={{color:'#333333'}} labelFormatter={(value) => (new Date(value * 1000)).toLocaleString()} />
      <Legend />
      <Line type="monotone" dataKey="ETH" stroke="#8884d8" label={<CustomizedLabel {...{events, changerDetails}} />} />
    </LineChart>
  </div>);
}


async function loadFlags(publicClient, contracts, tokenIds) {
  const toLoad = [];
  for(let tokenId of tokenIds) {
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
  }

  const results = await publicClient.multicall({
    contracts: toLoad,
  });
  return tokenIds.reduce((out, tokenId, index) => {
    out[String(tokenId)] = {
      flag: results[index * 2].result,
      tokenURI: results[index * 2 + 1].result,
    };
    return out;
  }, {});
}
