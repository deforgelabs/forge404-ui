import { useBalance } from 'wagmi';

export const useDecimalsSymbol = () => {
  const { data: balanceData, isLoading } = useBalance({
    address: '0x75511e04a9d36e0c25aea2e57bcbe08a10fc46f2',
  });

  const decimals = balanceData?.decimals;

  const symbol = balanceData?.symbol;

  return { decimals, symbol, isLoading };
};
