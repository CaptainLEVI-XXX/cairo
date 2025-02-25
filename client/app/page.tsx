"use client";
import LandingPage from "./components/LandingPage";
import { usePoolManager } from "./Contract/Instances/PoolManager";
import RegisteredAssets from "./Contract/ReadHooks/RegisteredAssets";
// import { useRegisteredAssets } from "./Contract/ReadHooks/TokenID";

export default function Home() {
  const { contract } = usePoolManager();
  // const { assets } = useRegisteredAssets();
  const getAssets = async () => {
    await RegisteredAssets(contract);
  };
  return (
    <div className="min-h-screen w-full bg-[#0a0b0f] bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="mb-12 text-center pt-8">
        <h1
          onClick={getAssets}
          className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-teal-400"
        >
          STRKTropy
        </h1>
        <p className="text-zinc-400 text-lg">
          AI-powered cryptocurrency investment vaults
        </p>
      </div>
      <LandingPage />
    </div>
  );
}
