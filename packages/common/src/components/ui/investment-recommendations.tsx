"use client";

import type React from "react";

import { useState } from "react";
import { TrendingUp, Scale, Rocket, Info, FileText, Mail, Maximize2, Sparkles } from "lucide-react";
import { Button } from "@common/components/ui/Button";
import { Card } from "@common/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@common/components/ui/dialog";
import { Input } from "@common/components/inputs/Input";
import { Label } from "@common/components/ui/Label";
import { Textarea } from "@common/components/ui/textarea";

type InvestmentOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  expectedReturn: string;
  riskLevel: string;
  juryScore: number;
  suitability: number;
  holdings: Array<{ name: string; ticker: string; allocation: string }>;
  aiRecommended?: boolean;
  suitabilityJustification: string;
  expandedInfo: string;
};

const investmentOptions: InvestmentOption[] = [
  {
    id: "conservative",
    title: "Conservative",
    description: "Combines income generation with modest growth potential",
    icon: <TrendingUp className="w-8 h-8 text-muted-foreground" />,
    expectedReturn: "4.2%",
    riskLevel: "Low",
    juryScore: 73,
    suitability: 85,
    aiRecommended: false,
    holdings: [
      { name: "Canadian Aggregate Bonds", ticker: "VAB.TO", allocation: "35%" },
      { name: "Dividend Growth Stocks", ticker: "VDY.TO", allocation: "25%" },
      { name: "Preferred Shares", ticker: "ZPR.TO", allocation: "20%" },
      { name: "GICs", ticker: "N/A", allocation: "15%" },
      { name: "Cash", ticker: "N/A", allocation: "5%" },
    ],
    suitabilityJustification:
      "This conservative portfolio is highly suitable for clients seeking capital preservation with steady income. The 85% suitability score reflects strong alignment with risk-averse investors nearing retirement or those prioritizing stability. The diversified bond holdings and dividend-paying stocks provide reliable cash flow while minimizing volatility exposure.",
    expandedInfo:
      "The Conservative portfolio emphasizes capital preservation and income generation through a balanced mix of fixed-income securities and stable dividend-paying equities. With 60% allocated to bonds, preferred shares, and cash equivalents, this strategy minimizes market volatility while providing consistent returns. The remaining 40% in dividend growth stocks offers modest appreciation potential without excessive risk exposure.",
  },
  {
    id: "moderate",
    title: "Moderate",
    description: "Moderate approach with emphasis on growth potential",
    icon: <Scale className="w-8 h-8 text-muted-foreground" />,
    expectedReturn: "7.2%",
    riskLevel: "Medium",
    juryScore: 95,
    suitability: 91,
    aiRecommended: true,
    holdings: [
      { name: "Canadian Equity Index", ticker: "VCN.TO", allocation: "35%" },
      { name: "International Developed", ticker: "XAW.TO", allocation: "30%" },
      { name: "Bond Index", ticker: "VAB.TO", allocation: "20%" },
      { name: "REITs", ticker: "VRE.TO", allocation: "10%" },
      { name: "Emerging Markets", ticker: "VEE.TO", allocation: "5%" },
    ],
    suitabilityJustification:
      "The Moderate portfolio achieves an exceptional 91% suitability score, making it ideal for investors with a balanced risk tolerance and 10-15 year investment horizon. This strategy optimally balances growth potential with downside protection through diversified global equity exposure and strategic bond allocation. The AI recommendation is based on superior risk-adjusted returns and alignment with typical client profiles.",
    expandedInfo:
      "Our Moderate strategy represents the optimal balance between growth and stability for most investors. With 80% equity exposure across Canadian, international, and emerging markets, this portfolio captures global growth opportunities while maintaining 20% in bonds for stability. The inclusion of REITs adds real estate diversification and income generation. Historical analysis shows this allocation delivers strong long-term returns with manageable volatility.",
  },
  {
    id: "growth",
    title: "Growth",
    description: "Aggressive growth strategy focused on technology innovation",
    icon: <Rocket className="w-8 h-8 text-muted-foreground" />,
    expectedReturn: "9.5%",
    riskLevel: "High",
    juryScore: 80,
    suitability: 78,
    aiRecommended: false,
    holdings: [
      { name: "US Technology ETF", ticker: "VGT", allocation: "30%" },
      { name: "Innovation ETF", ticker: "TDB891", allocation: "25%" },
      { name: "AI & Robotics ETF", ticker: "ROBO", allocation: "20%" },
      { name: "Global Growth Stocks", ticker: "VGRO.TO", allocation: "15%" },
      { name: "Small Cap Growth", ticker: "VBK", allocation: "10%" },
    ],
    suitabilityJustification:
      "The Growth portfolio's 78% suitability score indicates strong alignment for younger investors with high risk tolerance and long investment horizons (20+ years). This aggressive strategy is designed for clients who can withstand significant short-term volatility in pursuit of maximum long-term capital appreciation. The technology-heavy allocation capitalizes on innovation trends but requires emotional discipline during market downturns.",
    expandedInfo:
      "The Growth portfolio is engineered for maximum capital appreciation through concentrated exposure to high-growth sectors and innovative companies. With 100% equity allocation heavily weighted toward technology, AI, and disruptive innovation, this strategy targets superior long-term returns. While volatility will be higher than balanced portfolios, the growth potential is substantial for investors with appropriate time horizons and risk capacity.",
  },
];

export default function InvestmentRecommendations() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [expandModalOpen, setExpandModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [suitabilityModalOpen, setSuitabilityModalOpen] = useState(false);
  const [currentOption, setCurrentOption] = useState<InvestmentOption | null>(null);

  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    message: "",
  });

  const handleCardSelect = (id: string) => {
    setSelectedOption(selectedOption === id ? null : id);
  };

  const openExpandModal = (option: InvestmentOption) => {
    setCurrentOption(option);
    setExpandModalOpen(true);
  };

  const openEmailModal = (option: InvestmentOption) => {
    setCurrentOption(option);
    setEmailForm({
      to: "",
      subject: `Investment Recommendation: ${option.title} Portfolio`,
      message: `I'd like to share the ${option.title} investment recommendation with you.\n\nExpected Return: ${option.expectedReturn}\nRisk Level: ${
        option.riskLevel
      }\nSuitability Score: ${option.suitability}%\n\nThis portfolio ${option.description.toLowerCase()}.`,
    });
    setEmailModalOpen(true);
  };

  const openPdfModal = (option: InvestmentOption) => {
    setCurrentOption(option);
    setPdfModalOpen(true);
  };

  const openSuitabilityModal = (option: InvestmentOption) => {
    setCurrentOption(option);
    setSuitabilityModalOpen(true);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "text-success";
      case "medium":
        return "text-amber-600";
      case "high":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 85) return "bg-success";
    if (score >= 70) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-3">
          <TrendingUp className="w-6 h-6 text-accent" />
          <h1 className="text-4xl font-semibold text-foreground">Investment Recommendations</h1>
        </div>
        <p className="text-lg text-muted-foreground">Choose the best option for your client:</p>
      </div>

      {/* Investment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {investmentOptions.map((option) => (
          <Card
            key={option.id}
            className={`relative p-6 transition-all duration-300 hover:shadow-xl cursor-pointer ${
              selectedOption === option.id ? "ring-2 ring-accent shadow-lg" : option.aiRecommended ? "ring-2 ring-success shadow-lg" : "hover:shadow-md"
            }`}
            onClick={() => handleCardSelect(option.id)}
          >
            {/* Selection Bubble */}
            <div className="absolute top-4 left-4">
              <div
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  selectedOption === option.id ? "bg-accent border-accent" : "bg-background border-border"
                }`}
              >
                {selectedOption === option.id && <div className="w-3 h-3 rounded-full bg-accent-foreground" />}
              </div>
            </div>

            {/* AI Recommended Badge */}
            {option.aiRecommended && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1.5 bg-success text-success-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Recommended
                </div>
              </div>
            )}

            {/* Icon and Title */}
            <div className="flex flex-col items-center text-center mt-8 mb-6">
              <div className="mb-4">{option.icon}</div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">{option.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
            </div>

            {/* Returns and Risk */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">{option.expectedReturn}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Expected Return</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${getRiskColor(option.riskLevel)}`}>{option.riskLevel}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Risk Level</div>
              </div>
            </div>

            {/* Jury Score */}
            <div className="text-center mb-6 py-4 bg-secondary rounded-lg">
              <div className="text-4xl font-bold text-foreground mb-1">{option.juryScore}/100</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Jury Score</div>
            </div>

            {/* Holdings */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Holdings:</h3>
              <div className="space-y-2">
                {option.holdings.map((holding, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-foreground">{holding.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-destructive font-mono text-xs font-medium">{holding.ticker}</span>
                      <span className="text-muted-foreground font-medium">{holding.allocation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suitability Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Suitability:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSuitabilityModal(option);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm font-bold text-foreground">{option.suitability}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${getSuitabilityColor(option.suitability)} transition-all duration-500`}
                  style={{ width: `${option.suitability}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  openExpandModal(option);
                }}
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-secondary"
              >
                <Maximize2 className="w-4 h-4 text-destructive" />
                <span className="text-xs text-destructive font-medium">Expand Report</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  openPdfModal(option);
                }}
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-secondary"
              >
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  openEmailModal(option);
                }}
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-success/10"
              >
                <Mail className="w-4 h-4 text-success" />
                <span className="text-xs text-success font-medium">Email</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Export All Options */}
      <div className="text-center py-12 border-t border-border">
        <div className="flex items-center justify-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-semibold text-foreground">Export All Options</h2>
        </div>
        <p className="text-muted-foreground mb-6">Download comprehensive analysis of all three recommendation options</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" variant="destructive" className="gap-2">
            <Maximize2 className="w-4 h-4" />
            Expand Report
          </Button>
          <Button size="lg" variant="outline" className="gap-2 bg-transparent">
            <FileText className="w-4 h-4" />
            Export All as PDF
          </Button>
          <Button size="lg" variant="secondary" className="gap-2">
            <Mail className="w-4 h-4" />
            Email All Reports
          </Button>
        </div>
      </div>

      {/* AI Recommendation Box */}
      <div className="mt-8 p-6 bg-success/10 border-2 border-success rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">AI Recommendation:</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">AI recommendation analysis completed. Review the options above.</p>
          </div>
        </div>
      </div>

      {/* Expand Modal */}
      <Dialog open={expandModalOpen} onOpenChange={setExpandModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{currentOption?.title} Portfolio - Detailed Analysis</DialogTitle>
            <DialogDescription>Comprehensive information about this investment strategy</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentOption?.expandedInfo}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Expected Return</div>
                <div className="text-2xl font-bold text-foreground">{currentOption?.expectedReturn}</div>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
                <div className={`text-2xl font-bold ${getRiskColor(currentOption?.riskLevel || "")}`}>{currentOption?.riskLevel}</div>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Jury Score</div>
                <div className="text-2xl font-bold text-foreground">{currentOption?.juryScore}/100</div>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Suitability</div>
                <div className="text-2xl font-bold text-foreground">{currentOption?.suitability}%</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Portfolio Holdings</h3>
              <div className="space-y-2">
                {currentOption?.holdings.map((holding, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{holding.name}</div>
                      <div className="text-xs text-muted-foreground">{holding.ticker}</div>
                    </div>
                    <div className="text-lg font-bold text-foreground">{holding.allocation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Email {currentOption?.title} Recommendation</DialogTitle>
            <DialogDescription>Send this investment recommendation via email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                type="email"
                placeholder="client@example.com"
                value={emailForm.to}
                onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                type="text"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                rows={8}
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <h4 className="text-sm font-semibold text-foreground mb-2">Preview</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{emailForm.message}</div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button className="gap-2">
                <Mail className="w-4 h-4" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Modal */}
      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{currentOption?.title} Portfolio - PDF Report</DialogTitle>
            <DialogDescription>View and download the full investment report</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-secondary rounded-lg p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">PDF Viewer Component would be rendered here</p>
              <p className="text-sm text-muted-foreground mb-6">This would display your separate PDF viewer component with the full report</p>
              <Button className="gap-2">
                <FileText className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Suitability Justification Modal */}
      <Dialog open={suitabilityModalOpen} onOpenChange={setSuitabilityModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Suitability Analysis - {currentOption?.title}</DialogTitle>
            <DialogDescription>Why this portfolio received a {currentOption?.suitability}% suitability score</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Suitability Score</span>
                <span className="text-2xl font-bold text-foreground">{currentOption?.suitability}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${getSuitabilityColor(currentOption?.suitability || 0)} transition-all duration-500`}
                  style={{ width: `${currentOption?.suitability}%` }}
                />
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <h4 className="text-base font-semibold text-foreground mb-3">Justification</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentOption?.suitabilityJustification}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
