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
  Wallet,
  Check,
  ChevronRight,
  ChevronLeft,
  BarChart3,
} from "lucide-react";


import InvestmentPools from "./InvestmentPools";
import { Button } from "@/components/ui/button";

interface Strategy {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  expectedReturn: string;
  features: string[];
  gradient: string;
  hoverGradient: string;
  bgGradient: string;
}

const DeFiPlatform = () => {
  const [activeTab, setActiveTab] = useState<"strategy" | "investment" | "pools">("strategy");
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [investmentType, setInvestmentType] = useState<'sip' | 'lump' | null>(null);

  const strategies: Strategy[] = [
    {
      id: "high-risk",
      name: "High Growth Strategy",
      description: "Maximize potential returns through emerging crypto assets and DeFi protocols",
      riskLevel: "High",
      expectedReturn: "25-35% APY",
      features: ["Emerging DeFi Protocols", "New Layer 1 Chains", "Yield Farming"],
      gradient: "from-rose-400 to-rose-600",
      hoverGradient: "from-rose-500 to-rose-700",
      bgGradient: "bg-gradient-to-br from-rose-500/10 to-rose-600/5"
    },
    {
      id: "medium-risk",
      name: "Balanced Growth",
      description: "Optimal balance between stability and growth with established assets",
      riskLevel: "Medium",
      expectedReturn: "15-25% APY",
      features: ["Blue-chip DeFi", "Top Layer 1s", "Staking Rewards"],
      gradient: "from-teal-400 to-teal-600",
      hoverGradient: "from-teal-500 to-teal-700",
      bgGradient: "bg-gradient-to-br from-teal-500/10 to-teal-600/5"
    },
    {
      id: "low-risk",
      name: "Stable Growth",
      description: "Focus on preservation of capital with steady returns",
      riskLevel: "Low",
      expectedReturn: "5-15% APY",
      features: ["Stablecoins", "Major Assets", "Fixed Yield"],
      gradient: "from-indigo-400 to-indigo-600",
      hoverGradient: "from-indigo-500 to-indigo-700",
      bgGradient: "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5"
    }
  ];

  const handleStepClick = (step: "strategy" | "investment" | "pools") => {
    if (step === "strategy") {
      setSelectedStrategy(null);
      setInvestmentType(null);
    } else if (step === "investment") {
      setInvestmentType(null);
    }
    setActiveTab(step);
  };

  const handleBack = () => {
    if (activeTab === "pools") {
      setActiveTab("investment");
      setInvestmentType(null);
    } else if (activeTab === "investment") {
      setActiveTab("strategy");
      setSelectedStrategy(null);
      setInvestmentType(null);
    }
  };

  const handleStrategySelect = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setTimeout(() => setActiveTab("investment"), 300);
  };

  const handleInvestmentTypeSelect = (type: 'sip' | 'lump') => {
    setInvestmentType(type);
    setTimeout(() => setActiveTab("pools"), 300);
  };

  const handleInvestmentProceed = async (poolId: string) => {
    // Handle investment logic here
    console.log('Proceeding with investment in pool:', poolId);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-12 text-center pt-8">
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-teal-400">
            DeFi Mutual Funds Platform
          </h1>
          <p className="text-zinc-400 text-lg">
            AI-powered cryptocurrency investment strategies for your portfolio
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value: string) => setActiveTab(value as "strategy" | "investment" | "pools")} 
          className="mb-8"
        >
          <div className="relative mb-12">
            <StepIndicator
              currentStep={activeTab}
              hasStrategy={!!selectedStrategy}
              hasInvestmentType={!!investmentType}
              onStepClick={handleStepClick}
              onBack={handleBack}
            />
          </div>

          <TabsContent value="strategy" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {strategies.map((strategy) => (
                <Card
                  key={strategy.id}
                  className={`
                    cursor-pointer transition-all duration-300 hover:scale-105
                    bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700
                    backdrop-blur-sm ${strategy.bgGradient}
                    ${selectedStrategy?.id === strategy.id ? "ring-2 ring-teal-500/30" : ""}
                  `}
                  onClick={() => handleStrategySelect(strategy)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${strategy.gradient}`}>
                        {strategy.riskLevel === "High" ? (
                          <BarChart3 className="w-6 h-6 text-zinc-100" />
                        ) : strategy.riskLevel === "Medium" ? (
                          <TrendingUp className="w-6 h-6 text-zinc-100" />
                        ) : (
                          <Shield className="w-6 h-6 text-zinc-100" />
                        )}
                      </div>
                      <CardTitle className="text-zinc-100">{strategy.name}</CardTitle>
                    </div>
                    <CardDescription className="text-zinc-400">
                      {strategy.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>Risk Level</span>
                        <span className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${strategy.gradient} text-zinc-100`}>
                          {strategy.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-300">
                        <span>Expected Return</span>
                        <span className="font-bold text-zinc-100">{strategy.expectedReturn}</span>
                      </div>
                      <div className="pt-4 border-t border-zinc-800/50">
                        <div className="text-sm text-zinc-400 mb-2">Key Features</div>
                        <div className="space-y-2">
                          {strategy.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-zinc-300">
                              <ChevronRight className={`w-4 h-4 text-zinc-100 bg-gradient-to-r ${strategy.gradient} rounded-full`} />
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

          <TabsContent value="investment" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card
                className={`
                  cursor-pointer transition-all duration-300 hover:scale-105
                  bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700
                  backdrop-blur-sm
                  ${investmentType === "sip" ? "ring-2 ring-teal-500/30" : ""}
                `}
                onClick={() => handleInvestmentTypeSelect('sip')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-teal-400 to-teal-600">
                      <BarChart3 className="w-6 h-6 text-zinc-100" />
                    </div>
                    <div>
                      <CardTitle className="text-zinc-100">
                        Systematic Investment Plan (SIP)
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Invest a fixed amount regularly
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className={`
                  cursor-pointer transition-all duration-300 hover:scale-105
                  bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700
                  backdrop-blur-sm
                  ${investmentType === "lump" ? "ring-2 ring-teal-500/30" : ""}
                `}
                onClick={() => handleInvestmentTypeSelect('lump')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-teal-400 to-teal-600">
                      <Wallet className="w-6 h-6 text-zinc-100" />
                    </div>
                    <div>
                      <CardTitle className="text-zinc-100">
                        Lump Sum Investment
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Invest all at once
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pools" className="mt-8">
            {selectedStrategy && (
              <InvestmentPools
                selectedStrategy={selectedStrategy.id}
                investmentType={investmentType as 'sip' | 'lump'}
                onInvestmentProceed={handleInvestmentProceed}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeFiPlatform;

interface StepIndicatorProps {
  currentStep: "strategy" | "investment" | "pools";
  hasStrategy: boolean;
  hasInvestmentType: boolean;
  onStepClick: (step: "strategy" | "investment" | "pools") => void;
  onBack: () => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  hasStrategy,
  hasInvestmentType,
  onStepClick,
  onBack,
}) => {
  const steps = [
    {
      id: "strategy",
      number: 1,
      title: "Strategy",
      isActive: currentStep === "strategy",
      isCompleted: hasStrategy,
      isEnabled: true,
      canNavigate: true,
    },
    {
      id: "investment",
      number: 2,
      title: "Investment",
      isActive: currentStep === "investment",
      isCompleted: hasInvestmentType,
      isEnabled: hasStrategy,
      canNavigate: hasStrategy,
    },
    {
      id: "pools",
      number: 3,
      title: "Pools",
      isActive: currentStep === "pools",
      isCompleted: false,
      isEnabled: hasStrategy && hasInvestmentType,
      canNavigate: hasStrategy && hasInvestmentType,
    },
  ];

  const showBackButton = currentStep !== "strategy";

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-12">
      {/* Back Button */}
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -left-16 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-teal-400"
          onClick={onBack}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="sr-only">Go back</span>
        </Button>
      )}

      {/* Steps Container */}
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Item */}
            <button
              onClick={() => step.canNavigate && onStepClick(step.id as "strategy" | "investment" | "pools")}
              disabled={!step.canNavigate}
              className={`
                relative flex flex-col items-center group
                ${step.canNavigate ? 'cursor-pointer' : 'cursor-default'}
                focus:outline-none
              `}
            >
              {/* Circle with number or check */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  transition-all duration-300 ease-out
                  ${
                    step.isCompleted
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20"
                      : step.isActive
                      ? "bg-gradient-to-r from-teal-400 to-teal-500 text-white shadow-lg shadow-teal-500/20 ring-4 ring-teal-500/20"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                  }
                  ${!step.isEnabled ? "opacity-40" : ""}
                  ${step.isActive ? "scale-110" : ""}
                  ${
                    step.canNavigate && !step.isActive
                      ? "hover:scale-105 hover:shadow-lg hover:shadow-teal-500/10"
                      : ""
                  }
                  group-focus-visible:ring-2 group-focus-visible:ring-teal-500/50
                `}
              >
                {step.isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-base font-medium">{step.number}</span>
                )}

                {/* Tooltip for clickable steps */}
                {step.canNavigate && !step.isActive && (
                  <div className="absolute -top-8 scale-0 group-hover:scale-100 transition-transform duration-200">
                    <div className="px-2 py-1 text-xs text-white bg-zinc-800 rounded shadow-lg whitespace-nowrap">
                      Click to go back
                    </div>
                  </div>
                )}
              </div>

              {/* Step Title */}
              <div className="mt-3">
                <span
                  className={`
                    text-sm font-medium transition-colors duration-300
                    ${
                      step.isActive
                        ? "text-teal-400"
                        : step.isCompleted
                        ? "text-zinc-300"
                        : "text-zinc-500"
                    }
                    ${!step.isEnabled ? "opacity-40" : ""}
                  `}
                >
                  {step.title}
                </span>
              </div>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[50%] w-[calc(100%_-_4rem)] h-[2px]">
                  <div
                    className={`
                      absolute top-6 left-0 w-full h-full transition-colors duration-300
                      ${
                        step.isCompleted
                          ? "bg-gradient-to-r from-teal-500 to-teal-600"
                          : "bg-zinc-800"
                      }
                    `}
                  />
                </div>
              )}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

