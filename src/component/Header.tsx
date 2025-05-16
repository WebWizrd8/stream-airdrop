import { ConnectButton } from "./ConnectButton";
import streamflowLogo from "../assets/streamflow.svg";

export const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img src={streamflowLogo} alt="Streamflow Logo" className="h-8 w-auto" />
            <span className="text-xl font-semibold text-gray-900">Streamflow Airdrop</span>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};
