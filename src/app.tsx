import { useEffect } from 'react';
import config from './config.json';
import Home from './home';
import { Toaster } from 'react-hot-toast';
import { color } from 'styles/theme';
import { Hex2Rgba } from 'utils/helpers';
import { WalletProvider } from 'components/wallet-wagmi/provider';
import '@rainbow-me/rainbowkit/styles.css';

const App = () => {
  useEffect(() => {
    document.title = config.name;
  }, []);

  return (
    <WalletProvider>
      <Home />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            border: '1px solid ' + color.black,
            color: color.white,
            background: Hex2Rgba(color.black, 0.95),
          },
        }}
      />
    </WalletProvider>
  );
};

export default App;
