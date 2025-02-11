import React from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import { useStarknetkitConnectModal, StarknetkitConnector } from "starknetkit";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [isConnecting, setIsConnecting] = React.useState(false);

  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  const connectButton = async () => {
    if (isConnected) return;
    setIsConnecting(true);
    try {
      const { connector } = await starknetkitConnectModal();
      if (!connector) {
        return;
      }
      await connectAsync({ connector });
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <button
      onClick={connectButton}
      disabled={isConnecting}
      className="group flex items-center gap-3 px-5 py-2.5 bg-[#0C0E46] hover:bg-[#161973] disabled:opacity-70 text-white rounded-xl font-medium transition-all duration-200 border border-[#2D2F7C] hover:border-[#3D40A2] shadow-lg hover:shadow-xl"
    >
      <img
        src="/starknet.png"
        alt="Starknet Logo"
        className="w-5 h-5 object-contain"
      />

      {isConnecting ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {!address ? (
            <span>Connect Wallet</span>
          ) : (
            <span className="text-gray-200">{formatAddress(address)}</span>
          )}
        </div>
      )}
    </button>
  );
}
