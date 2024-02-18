import { useAccount, useBalance, useChainId, useDisconnect } from 'wagmi';
import Wallet, { DropdownItem } from 'components/wallet';
import * as C from '../style';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export const Header = () => {
  const [doChangeWallet, setDoChangeWallet] = useState(false);

  const { isConnected, address } = useAccount();

  const chainId = useChainId();

  const { data } = useBalance({ chainId, address });

  const balance = data?.value;

  const decimals = data?.decimals;

  const symbol = data?.symbol || '';

  const balanceNumber = new BigNumber(balance?.toString() || 0)
    .div(10 ** (decimals || 0))
    .toFixed(6);

  const copyAddress = useCallback(
    () => navigator.clipboard.writeText(address || ''),
    [address]
  );

  const { disconnectAsync } = useDisconnect();

  const { openConnectModal } = useConnectModal();

  const changeWallet = () => {
    disconnectAsync().then(() => {
      setDoChangeWallet(true);
    });
  };

  useEffect(() => {
    if (doChangeWallet && openConnectModal) {
      openConnectModal();
      setDoChangeWallet(false);
    }
  }, [doChangeWallet, openConnectModal]);

  return (
    <C.Header>
      <C.Logo src={`/images/logo.svg`} />
      {isConnected ? (
        <Wallet
          balance={Number(balanceNumber) + ' ' + symbol}
          address={address}
        >
          <DropdownItem onClick={copyAddress}>Copy Address</DropdownItem>
          <DropdownItem onClick={changeWallet}>Change Wallet</DropdownItem>
          <DropdownItem onClick={disconnectAsync}>Disconnect</DropdownItem>
        </Wallet>
      ) : (
        <C.WalletConnect onClick={openConnectModal}>
          Connect Wallet
        </C.WalletConnect>
      )}
    </C.Header>
  );
};
