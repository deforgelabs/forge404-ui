// import { isProd } from '@/env'
import * as chains from 'viem/chains';
import configs from '../../../config.json';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const getChain = () => {
  return  Object.entries(chains).find(([_,chain])=>{
    return  chain.id===configs.chain_id
  })?.[1] || chains.mainnet
};

export const config = getDefaultConfig({
  appName: 'forge404',
  projectId: '4b4590dbf82bfe557a2c5f6ec7182229',
  chains: [getChain()],
  ssr: true,
});
