// import { isProd } from '@/env'
import { mainnet, goerli, bsc, bscTestnet } from 'viem/chains';
import configs from '../../../config.json';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const getChain = () => {
  switch (configs.chain_id) {
    case 1:
      return mainnet;
    case 5:
      return goerli;
    case 56:
      return bsc;
    case 97:
      return bscTestnet;
    default:
      return mainnet;
  }
};

export const config = getDefaultConfig({
  appName: 'forge404',
  projectId: '4b4590dbf82bfe557a2c5f6ec7182229',
  chains: [getChain()],
  ssr: true,
});
