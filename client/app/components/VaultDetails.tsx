import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Coins,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  Activity,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TokenSection from "./TokenSection";

interface VaultDetailsProps {
  vault: {
    id: string;
    name: string;
    description: string;
    riskLevel: string;
    gradient: string;
    tvl: number;
    apy: number;
  };
  onBack: () => void; // Add this line
}

const VaultDetails: React.FC<VaultDetailsProps> = ({ vault }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInvest = async (amount: string, token: string) => {
    try {
      // Add your investment logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      console.log("Investment processed:", {
        vaultId: vault.id,
        amount,
        token,
      });
    } catch (error) {
      console.error("Investment failed:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg bg-gradient-to-r ${vault.gradient}`}
            >
              <Coins className="w-6 h-6 text-zinc-100" />
            </div>
            <div>
              <CardTitle className="text-2xl text-zinc-100">
                {vault.name}
              </CardTitle>
              <CardDescription className="text-zinc-400">
                {vault.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-800/50 border-zinc-700/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <DollarSign className="w-4 h-4" />
                  Total Value Locked
                </div>
                <div className="text-xl font-bold text-zinc-100">
                  {formatCurrency(vault.tvl)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Current APY
                </div>
                <div className="text-xl font-bold text-teal-400">
                  {vault.apy}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <Users className="w-4 h-4" />
                  Active Investors
                </div>
                <div className="text-xl font-bold text-zinc-100">1,234</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                  <Activity className="w-4 h-4" />
                  Risk Level
                </div>
                <div
                  className={`text-xl font-bold bg-gradient-to-r ${vault.gradient} bg-clip-text text-transparent`}
                >
                  {vault.riskLevel}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Replace the Protocol Distribution section with this simpler token distribution */}
          <div>
            <div className="text-sm font-medium text-zinc-100 mb-4">
              Current Token Distribution
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  symbol: "ETH",
                  amount: "450",
                  value: "1,200,000",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  symbol: "USDC",
                  amount: "750,000",
                  value: "750,000",
                  color: "from-blue-400 to-cyan-500",
                },
                {
                  symbol: "STRK",
                  amount: "25,000",
                  value: "500,000",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  symbol: "USDT",
                  amount: "500,000",
                  value: "500,000",
                  color: "from-green-500 to-teal-500",
                },
              ].map((token) => (
                <div
                  key={token.symbol}
                  className="bg-zinc-900/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-white font-semibold text-sm`}
                      >
                        {token.symbol.slice(0, 1)}
                      </div>
                      <div className="text-zinc-200 font-medium">
                        {token.symbol}
                      </div>
                    </div>
                    <div
                      className={`text-sm bg-gradient-to-r ${token.color} bg-clip-text text-transparent font-medium`}
                    >
                      ${token.value}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Amount Locked</span>
                    <span className="text-zinc-300 font-medium">
                      {token.amount} {token.symbol}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Accepted Tokens Section */}
            <div className="mt-6 p-4 bg-zinc-900/50 rounded-lg">
              <div className="text-sm font-medium text-zinc-100 mb-3">
                Accepted Tokens for Deposit
              </div>
              <div className="flex flex-wrap gap-3">
                {["ETH", "USDC", "USDT", "STRK"].map((token) => (
                  <div
                    key={token}
                    className="px-3 py-1.5 bg-zinc-800 rounded-full flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                    <span className="text-zinc-300 text-sm">{token}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-zinc-400">
                Deposit any of these tokens - we will convert them to rTokens
                based on the vaults strategy
              </div>
            </div>

            {/* Auto-Conversion Info */}
            <Alert className="mt-6 bg-zinc-900/50 border-teal-500/20">
              <AlertDescription className="text-zinc-400 flex items-start gap-2">
                <Activity className="w-4 h-4 text-teal-400 mt-0.5" />
                <span>
                  All deposited tokens are automatically converted to rTokens at
                  the current exchange rate. The vault manages the token
                  distribution to maintain optimal risk-adjusted returns.
                </span>
              </AlertDescription>
            </Alert>
          </div>

          {/* Investment Section */}
          <TokenSection vault={vault} onInvest={handleInvest} />

          {/* Vault Security */}
          <Card className="bg-zinc-800/50 border-zinc-700/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <CardTitle className="text-lg text-zinc-100">
                  Vault Security
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1.5 rounded-full bg-teal-400/10">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="font-medium text-zinc-100 mb-1">
                    Smart Contract Audited
                  </div>
                  <div className="text-zinc-400">
                    All smart contracts are thoroughly audited by leading
                    security firms
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1.5 rounded-full bg-teal-400/10">
                  <Wallet className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="font-medium text-zinc-100 mb-1">
                    Asset Security
                  </div>
                  <div className="text-zinc-400">
                    Assets are secured using industry-leading custody solutions
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="p-1.5 rounded-full bg-teal-400/10">
                  <Activity className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="font-medium text-zinc-100 mb-1">
                    24/7 Monitoring
                  </div>
                  <div className="text-zinc-400">
                    Continuous monitoring and risk assessment of all positions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default VaultDetails;
