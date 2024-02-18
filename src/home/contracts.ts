import { ABI_FORGE_404 } from 'abi/Forge404';
import { ABI_FORGECORE } from 'abi/ForgeCore';
import config from '../config.json';

export const forgeCoreContracts = {
  abi: ABI_FORGECORE,
  address: config.core_address as `0x${string}`,
} as const;

export const forge404Contracts = {
  abi: ABI_FORGE_404,
  address: config.collection_address as `0x${string}`,
} as const;
