import React from 'react';
import ReactDOM from 'react-dom/client'

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  sepolia,
  holesky,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import App from './App.jsx';
import DarkModeDetector from './components/DarkModeDetector.jsx';
import './index.css';

const config = getDefaultConfig({
  appName: 'Optimeme Factory',
  projectId: 'ba13d5bdabc28403d3af4b511efa2bf3',
  chains: [holesky],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();
const accentColor = '#c22b66';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DarkModeDetector
          dark={{ theme: darkTheme({ accentColor }) }}
          light={{ theme: lightTheme({ accentColor }) }}
        >
          <RainbowKitProvider>
            <App />
          </RainbowKitProvider>
        </DarkModeDetector>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
