import { useContract } from "@starknet-react/core";

const PoolManagerAddress =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

const abi = [
  {
    members: [
      {
        name: "low",
        type: "felt",
      },
      {
        name: "high",
        type: "felt",
      },
    ],
    name: "Uint256",
    type: "struct",
  },
  {
    inputs: [
      {
        name: "name",
        type: "felt",
      },
      {
        name: "symbol",
        type: "felt",
      },
      {
        name: "recipient",
        type: "felt",
      },
    ],
    name: "constructor",
    type: "constructor",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        type: "felt",
      },
    ],
    state_mutability: "view",
    type: "function",
  },
] as const;

export function PoolManager() {
  const { contract } = useContract({
    abi,
    address: PoolManagerAddress,
  });

  return { contract };
}
