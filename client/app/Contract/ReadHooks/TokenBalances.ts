import { useAccount, useReadContract } from "@starknet-react/core";

// Token type definition
type Token = {
  name: string;
  symbol: string;
  decimals: number;
  l2_token_address: string;
  sort_order: number;
  total_supply: null;
  logo_url: string;
};

// Standard ERC20 balance_of ABI
const balanceAbi = {
  name: "balance_of",
  type: "function",
  inputs: [
    {
      name: "account",
      type: "core::starknet::contract_address::ContractAddress",
    },
  ],
  outputs: [
    {
      type: "core::integer::u256",
    },
  ],
  state_mutability: "view",
} as const;

export type { Token };
export function useTokenBalances(tokens: Token[]) {
  const { address } = useAccount();

  // Declare all hooks at the top level
  const ethBalance = useReadContract({
    address: tokens[0].l2_token_address as `0x${string}`,
    functionName: "balance_of",
    abi: [balanceAbi],
    args: address ? [address] : undefined,
  });

  const usdcBalance = useReadContract({
    address: tokens[1].l2_token_address as `0x${string}`,
    functionName: "balance_of",
    abi: [balanceAbi],
    args: address ? [address] : undefined,
  });

  const usdtBalance = useReadContract({
    address: tokens[2].l2_token_address as `0x${string}`,
    functionName: "balance_of",
    abi: [balanceAbi],
    args: address ? [address] : undefined,
  });

  const strkBalance = useReadContract({
    address: tokens[3].l2_token_address as `0x${string}`,
    functionName: "balance_of",
    abi: [balanceAbi],
    args: address ? [address] : undefined,
  });

  const results = [ethBalance, usdcBalance, usdtBalance, strkBalance];

  // Format the results with token info
  return tokens.map((token, index) => {
    const { data, error, isLoading } = results[index];

    return {
      ...token,
      balance: data,
      error,
      isLoading,
      formattedBalance: data
        ? (Number(data) / Math.pow(10, token.decimals)).toFixed(
            token.decimals === 18 ? 4 : 2
          )
        : "0",
    };
  });
}
