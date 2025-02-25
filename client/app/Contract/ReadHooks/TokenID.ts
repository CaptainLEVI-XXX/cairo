import { useReadContract } from "@starknet-react/core";
import { PoolManagerABI } from "../ABI/PoolManager";
import { usePoolManager } from "../Instances/PoolManager";

const PoolManagerAddress = "0x054f62f7f853345475b81a698e4183a813acffa395e2ecb7bebe46c2dfb259da";

// Type for the asset info
type Asset = {
  address: string;
  tokenId: bigint | null;
  isLoading: boolean;
  error: Error | null;
};

export function useRegisteredAssets() {
  // First, fetch all registered assets
//   const { 
//     data: registeredAssets, 
//     isLoading: assetsLoading, 
//     error: assetsError 
//   } = useReadContract({
//     address: PoolManagerAddress,
//     functionName: "get_registered_assets",
//     abi: PoolManagerABI,
//   });

  const {contract } = usePoolManager();
  const registeredAssets = contract.get_registered_assets();
  console.log("registeredAssets", registeredAssets);

  // Fetch token ID for first asset
  const firstTokenId = useReadContract({
    address: PoolManagerAddress ,
    functionName: "asset_to_tokenId",
    abi: PoolManagerABI,
    args: registeredAssets ? [registeredAssets[0]] : undefined,
    enabled: !!registeredAssets?.[0],
  });

  // Fetch token ID for second asset
  const secondTokenId = useReadContract({
    address: PoolManagerAddress as `0x${string}`,
    functionName: "asset_to_tokenId",
    abi: PoolManagerABI,
    args: registeredAssets ? [registeredAssets[1]] : undefined,
    enabled: !!registeredAssets?.[1],
  });

  const assets: Asset[] = !registeredAssets ? [] : [
    {
      address: registeredAssets[0],
      tokenId: firstTokenId.data ? BigInt(firstTokenId.data.toString()) : null,
      isLoading: firstTokenId.isLoading,
      error: firstTokenId.error,
    },
    {
      address: registeredAssets[1],
      tokenId: secondTokenId.data ? BigInt(secondTokenId.data.toString()) : null,
      isLoading: secondTokenId.isLoading,
      error: secondTokenId.error,
    }
  ];

  console.log("Assets", assets);

  return {
    assets
  };
}