import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import phantomLogo from "../assets/phantom.svg";
import { formatAddress } from "../utils";

export const ConnectButton: React.FC = () => {
  const { connected, publicKey, connect, disconnect, wallet, select, wallets } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      if (!wallet) {
        const phantomWallet = wallets.find(w => 
          w.adapter.name === 'Phantom' || 
          w.adapter.name.toLowerCase().includes('phantom')
        );
        
        if (phantomWallet) {
          await select(phantomWallet.adapter.name);
        } else {
          throw new Error("Phantom wallet not found");
        }
      }
      
      await connect();
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
    } catch (error) {
      console.error("Disconnection error:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={connected ? handleDisconnect : handleConnect}
        disabled={isConnecting || isDisconnecting}
        className="bg-[#0A0F1C] hover:bg-[#1a1f2c] text-white font-medium px-6 py-2.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Connecting...</span>
          </>
        ) : isDisconnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Disconnecting...</span>
          </>
        ) : connected ? (
          <>
            <img src={phantomLogo} alt="Phantom" className="w-5 h-5" />
            <span>{formatAddress(publicKey?.toBase58() || '')}</span>
          </>
        ) : (
          <>
            <img src={phantomLogo} alt="Phantom" className="w-5 h-5" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    </div>
  );
};