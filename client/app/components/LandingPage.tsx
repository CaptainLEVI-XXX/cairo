import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  TrendingUp,
  Shield,
  ChevronRight,
  ChevronLeft,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import VaultDetails from "./VaultDetails";

interface Vault {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  expectedReturn: string;
  features: string[];
  gradient: string;
  hoverGradient: string;
  bgGradient: string;
  tvl: number;
  apy: number;
}

const DeFiPlatform = () => {
  const [activeTab, setActiveTab] = useState<"strategy" | "vault">("strategy");
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);

  const vaults: Vault[] = [
    {
      id: "high-risk",
      name: "High Growth Vault",
      description:
        "Aggressive growth strategy focusing on emerging crypto assets and DeFi protocols with higher potential returns",
      riskLevel: "High",
      expectedReturn: "25-35% APY",
      features: [
        "Emerging DeFi Assets",
        "Yield Optimization",
        "Active Rebalancing",
      ],
      gradient: "from-rose-400 to-rose-600",
      hoverGradient: "from-rose-500 to-rose-700",
      bgGradient: "bg-gradient-to-br from-rose-500/10 to-rose-600/5",
      tvl: 2500000,
      apy: 32.5,
    },
    {
      id: "medium-risk",
      name: "Balanced Vault",
      description:
        "Balanced approach with established crypto assets, providing moderate growth with managed risk",
      riskLevel: "Medium",
      expectedReturn: "15-25% APY",
      features: ["Blue-chip Assets", "Risk Management", "Regular Optimization"],
      gradient: "from-teal-400 to-teal-600",
      hoverGradient: "from-teal-500 to-teal-700",
      bgGradient: "bg-gradient-to-br from-teal-500/10 to-teal-600/5",
      tvl: 5000000,
      apy: 18.7,
    },
    {
      id: "low-risk",
      name: "Stable Vault",
      description:
        "Conservative strategy focused on capital preservation using stablecoins and established assets",
      riskLevel: "Low",
      expectedReturn: "5-15% APY",
      features: [
        "Stablecoin Focus",
        "Capital Protection",
        "Consistent Returns",
      ],
      gradient: "from-indigo-400 to-indigo-600",
      hoverGradient: "from-indigo-500 to-indigo-700",
      bgGradient: "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5",
      tvl: 8000000,
      apy: 12.4,
    },
  ];

  const handleVaultSelect = (vault: Vault) => {
    setSelectedVault(vault);
    setTimeout(() => setActiveTab("vault"), 300);
  };

  const handleBack = () => {
    if (activeTab === "vault") {
      setActiveTab("strategy");
      setSelectedVault(null);
    }
  };

  const handleStepClick = (step: "strategy" | "vault") => {
    if (step === "strategy") {
      setSelectedVault(null);
    }
    setActiveTab(step);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-12 text-center pt-8">
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-teal-400">
            DeFi Mutual Funds Platform
          </h1>
          <p className="text-zinc-400 text-lg">
            AI-powered cryptocurrency investment vaults
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value: string) =>
            setActiveTab(value as "strategy" | "vault")
          }
          className="mb-8"
        >
          <div className="relative mb-12">
            <StepIndicator
              currentStep={activeTab}
              hasStrategy={!!selectedVault}
              onStepClick={handleStepClick}
              onBack={handleBack}
            />
          </div>

          <TabsContent value="strategy" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vaults.map((vault) => (
                <Card
                  key={vault.id}
                  className={`
                    cursor-pointer transition-all duration-300 hover:scale-105
                    bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700
                    backdrop-blur-sm ${vault.bgGradient}
                    ${
                      selectedVault?.id === vault.id
                        ? "ring-2 ring-teal-500/30"
                        : ""
                    }
                  `}
                  onClick={() => handleVaultSelect(vault)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${vault.gradient}`}
                      >
                        {vault.riskLevel === "High" ? (
                          <BarChart3 className="w-6 h-6 text-zinc-100" />
                        ) : vault.riskLevel === "Medium" ? (
                          <TrendingUp className="w-6 h-6 text-zinc-100" />
                        ) : (
                          <Shield className="w-6 h-6 text-zinc-100" />
                        )}
                      </div>
                      <CardTitle className="text-zinc-100">
                        {vault.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-zinc-400">
                      {vault.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>Risk Level</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${vault.gradient} text-zinc-100`}
                        >
                          {vault.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>Current APY</span>
                        <span className="font-bold text-zinc-100">
                          {vault.apy}%
                        </span>
                      </div>
                      <div className="pt-4 border-t border-zinc-800/50">
                        <div className="text-sm text-zinc-400 mb-2">
                          Key Features
                        </div>
                        <div className="space-y-2">
                          {vault.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-zinc-300"
                            >
                              <ChevronRight
                                className={`w-4 h-4 text-zinc-100 bg-gradient-to-r ${vault.gradient} rounded-full`}
                              />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vault" className="mt-8">
            {selectedVault && (
              <VaultDetails vault={selectedVault} onBack={handleBack} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeFiPlatform;

interface StepIndicatorProps {
  currentStep: "strategy" | "vault";
  hasStrategy: boolean;
  onStepClick: (step: "strategy" | "vault") => void;
  onBack: () => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  hasStrategy,
  onStepClick,
  onBack,
}) => {
  const steps = [
    {
      id: "strategy",
      isActive: currentStep === "strategy",
      isCompleted: hasStrategy,
      isEnabled: true,
      canNavigate: true,
    },
    {
      id: "vault",
      isActive: currentStep === "vault",
      isCompleted: false,
      isEnabled: hasStrategy,
      canNavigate: hasStrategy,
    },
  ];

  const showBackButton = currentStep !== "strategy";

  return (
    <div className="relative w-full max-w-md mx-auto mb-12">
      <div className="relative flex items-center justify-center gap-16">
        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute -left-16 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-teal-400"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="sr-only">Go back</span>
          </Button>
        )}

        {/* Step Indicators */}
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() =>
                step.canNavigate && onStepClick(step.id as "strategy" | "vault")
              }
              disabled={!step.canNavigate}
              className="relative focus:outline-none group"
              aria-label={`Step ${index + 1}`}
            >
              <div
                className={`
                  w-4 h-4 rounded-full transition-all duration-300
                  ${
                    step.isCompleted
                      ? "bg-teal-500"
                      : step.isActive
                      ? "bg-teal-400 ring-4 ring-teal-400/20"
                      : "bg-zinc-700"
                  }
                  ${!step.isEnabled ? "opacity-40" : ""}
                  ${
                    step.canNavigate && !step.isActive
                      ? "hover:ring-2 hover:ring-teal-400/20"
                      : ""
                  }
                `}
              />

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[50%] w-[calc(100%_+_4rem)] h-[2px]">
                  <div
                    className={`
                      absolute top-[7px] left-0 w-full h-full transition-colors duration-300
                      ${step.isCompleted ? "bg-teal-500" : "bg-zinc-700"}
                    `}
                  />
                </div>
              )}

              {/* Tooltip */}
              {step.canNavigate && !step.isActive && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200">
                  <div className="px-2 py-1 text-xs text-white bg-zinc-800 rounded shadow-lg whitespace-nowrap">
                    Click to go back
                  </div>
                </div>
              )}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
