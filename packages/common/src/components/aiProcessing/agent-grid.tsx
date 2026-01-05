import { Shield, TrendingUp, Scale, FileText, BarChart3 } from "lucide-react";
import { cn } from "@common/lib/utils";

export function AgentGrid() {
  const agentCards = [
    {
      id: 1,
      title: "Investment Advisor Copilot",
      subtitle: "Master Orchestrator",
      description: "Coordinating investment analysis",
      status: "Ready",
      progress: 100,
      icon: TrendingUp,
      color: "from-purple-500 to-indigo-500",
      large: true,
    },
    {
      id: 2,
      title: "Investment Selection Agent",
      subtitle: "Conservative Risk",
      description: "",
      status: "Ready",
      progress: 100,
      icon: Shield,
      color: "from-blue-400 to-blue-500",
    },
    {
      id: 3,
      title: "Investment Selection Agent",
      subtitle: "Moderate Risk",
      description: "",
      status: "Ready",
      progress: 100,
      icon: BarChart3,
      color: "from-blue-400 to-blue-500",
    },
    {
      id: 4,
      title: "Investment Selection Agent",
      subtitle: "High Growth Risk",
      description: "",
      status: "Ready",
      progress: 100,
      icon: TrendingUp,
      color: "from-blue-400 to-blue-500",
    },
    {
      id: 5,
      title: "Recommendation Jury",
      subtitle: "Multi-Agent Evaluation",
      description: "Awaiting selection results",
      status: "0% Complete",
      progress: 0,
      icon: Scale,
      color: "from-amber-400 to-orange-400",
    },
    {
      id: 6,
      title: "Presentation Agent",
      subtitle: "Report Generation",
      description: "Ready to generate report",
      status: "0% Complete",
      progress: 0,
      icon: FileText,
      color: "from-cyan-400 to-blue-400",
    },
  ];

  return (
    <div className="glass rounded-3xl border border-border/50 p-8 shadow-xl animate-slide-in">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agentCards.map((card, index) => {
          const Icon = card.icon;

          if (card.large) {
            return (
              <div key={card.id} className="md:col-span-2 lg:col-span-3" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="absolute top-4 right-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20">
                      <div className="h-2 w-2 rounded-full bg-amber-400" />
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg", card.color)}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{card.title}</h3>
                      <p className="text-sm text-white/80 mb-2">{card.subtitle}</p>
                      <p className="text-sm text-white/60">{card.description}</p>

                      <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                          <div className="h-full bg-white/80 rounded-full" style={{ width: "100%" }} />
                        </div>
                        <span className="text-sm font-medium text-white/90">{card.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={card.id} className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="absolute top-4 right-4">
                  <div
                    className={cn("flex h-8 w-8 items-center justify-center rounded-full", card.progress === 100 ? "bg-success/20" : "bg-amber-400/20")}
                  >
                    <div className={cn("h-2 w-2 rounded-full", card.progress === 100 ? "bg-success" : "bg-amber-400")} />
                  </div>
                </div>

                <div className="mb-4">
                  <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-md", card.color)}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-foreground mb-1 leading-tight">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{card.subtitle}</p>

                {card.description && <p className="text-xs text-muted-foreground/80 mb-3">{card.description}</p>}

                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", card.progress === 100 ? "bg-success" : "bg-muted-foreground/30")}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{card.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
