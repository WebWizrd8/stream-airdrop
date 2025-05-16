import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage, DetailPage } from "./page"; 
import { PATH } from "./constant";
import { useMemo } from "react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { AirdropProvider } from "./context/AirdropsContext";

function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <AirdropProvider>
      <BrowserRouter>
        <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
          <WalletProvider wallets={wallets} autoConnect>
            <Routes>
              <Route path={PATH.HOME} element={<HomePage />} />
              <Route path={`${PATH.AIRDROP}/:address`} element={<DetailPage />} />
            </Routes>
          </WalletProvider>
        </ConnectionProvider>
      </BrowserRouter>
    </AirdropProvider>
  )
}

export default App
