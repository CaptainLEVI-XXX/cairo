import { useContract } from "@starknet-react/core";
import { PoolManagerABI } from "../ABI/PoolManager";

const PoolManagerAddress =
  "0x054f62f7f853345475b81a698e4183a813acffa395e2ecb7bebe46c2dfb259da";

// If you need just the contract, create a custom hook instead
export function usePoolManager() {
  const abi = PoolManagerABI;
  const { contract } = useContract({
    abi,
    address: PoolManagerAddress,
  });

  return { contract };
}
