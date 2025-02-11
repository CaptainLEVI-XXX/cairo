import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Token, useTokenBalances } from "../Contract/ReadHooks/TokenBalances";

interface InvestmentSectionProps {
  vault: {
    gradient: string;
    apy: number;
  };
  onInvest: (amount: string, token: string) => Promise<void>;
}

const TokenSection: React.FC<InvestmentSectionProps> = ({
  vault,
  onInvest,
}) => {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const tokens = [
    {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      l2_token_address:
        "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
      sort_order: 5,
      logo_url:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
    },
    {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      l2_token_address:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      sort_order: 3,
      logo_url:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      l2_token_address:
        "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
      sort_order: 4,
      logo_url:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/c8a721d1-07c3-46e4-ab4e-523977c30b00/logo",
    },
    {
      name: "StarkNet Token",
      symbol: "STRK",
      decimals: 18,
      l2_token_address:
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      sort_order: 2,
      logo_url:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
    },
  ];

  const tokenBalances = useTokenBalances(tokens as Token[]);

  const getTokenGradient = (symbol: string) => {
    const gradients = {
      ETH: "from-blue-500 to-blue-600",
      USDC: "from-blue-400 to-cyan-500",
      STRK: "from-purple-500 to-purple-600",
      USDT: "from-green-500 to-teal-500",
    };
    return gradients[symbol] || "from-gray-500 to-gray-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateExpectedReturns = (amount: string) => {
    const principal = parseFloat(amount) || 0;
    const annualReturn = (principal * vault.apy) / 100;
    return {
      monthly: annualReturn / 12,
      annual: annualReturn,
    };
  };

  const handleInvest = async () => {
    if (!selectedToken || !investmentAmount) return;
    setIsLoading(true);
    try {
      await onInvest(investmentAmount, selectedToken);
    } catch (error) {
      console.error("Investment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const returns = calculateExpectedReturns(investmentAmount);

  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50">
      <CardHeader>
        <CardTitle className="text-lg text-zinc-100">Invest in Vault</CardTitle>
        <CardDescription className="text-zinc-400">
          Select token and enter the amount you want to invest
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Selection */}
        <div className="space-y-3">
          <label className="text-sm text-zinc-400">Select Token</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tokenBalances.map((token) => (
              <button
                key={token.symbol}
                onClick={() => setSelectedToken(token.symbol)}
                className={`
                  p-3 rounded-lg border transition-all duration-200
                  ${
                    selectedToken === token.symbol
                      ? "bg-zinc-700/50 border-teal-500/50"
                      : "bg-zinc-900/50 border-zinc-700/50 hover:border-zinc-600"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTokenGradient(
                      token.symbol
                    )} 
                    flex items-center justify-center text-white font-semibold text-sm`}
                  >
                    {token.symbol.slice(0, 1)}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-zinc-100 font-medium">
                      {token.symbol}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {token.isLoading
                        ? "Loading..."
                        : `${token.formattedBalance} available`}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input - Only shown after token is selected */}
        {selectedToken && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder={`Enter ${selectedToken} amount`}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="pl-10 bg-zinc-900/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${getTokenGradient(
                      selectedToken
                    )} 
                    flex items-center justify-center text-white font-semibold text-[10px]`}
                  >
                    {selectedToken?.slice(0, 1)}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-zinc-400">Available</span>
                <button
                  onClick={() => {
                    const token = tokenBalances.find(
                      (t) => t.symbol === selectedToken
                    );
                    if (token) setInvestmentAmount(token.formattedBalance);
                  }}
                  className="text-teal-400 hover:text-teal-300"
                >
                  Max:{" "}
                  {
                    tokenBalances.find((t) => t.symbol === selectedToken)
                      ?.formattedBalance
                  }{" "}
                  {selectedToken}
                </button>
              </div>
            </div>

            {investmentAmount && parseFloat(investmentAmount) > 0 && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-zinc-900/50 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">
                      Expected Monthly Returns
                    </span>
                    <span className="text-teal-400">
                      {formatCurrency(returns.monthly)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">
                      Expected Annual Returns
                    </span>
                    <span className="text-teal-400">
                      {formatCurrency(returns.annual)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleInvest}
          disabled={
            !selectedToken ||
            !investmentAmount ||
            parseFloat(investmentAmount) <= 0 ||
            isLoading
          }
          className={`w-full bg-gradient-to-r ${vault.gradient} text-white hover:opacity-90 transition-opacity`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-zinc-100/30 border-t-zinc-100 rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            `Invest with ${selectedToken || "Token"}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TokenSection;
