import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@common/lib/utils";

interface Agent {
  id: number;
  name: string;
  icon: string;
  status: "complete" | "processing" | "pending";
  time: string;
}

interface AgentSidebarProps {
  agents: Agent[];
}

export function AgentSidebar({ agents }: AgentSidebarProps) {
  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center gap-2 text-foreground">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-semibold tracking-tight">Agents</h2>
      </div>

      <div className="space-y-3">
        {agents.map((agent, index) => (
          <div
            key={agent.id}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
              agent.status === "complete" && "border-success/20 bg-success/5 hover:bg-success/10",
              agent.status === "processing" && "border-warning/20 bg-warning/5 hover:bg-warning/10",
              agent.status === "pending" && "border-border bg-card hover:bg-muted/50"
            )}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-transform group-hover:scale-110",
                    agent.status === "complete" && "bg-success/10",
                    agent.status === "processing" && "bg-warning/10",
                    agent.status === "pending" && "bg-muted"
                  )}
                >
                  {agent.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground leading-tight">{agent.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{agent.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {agent.status === "complete" && (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium text-success">Complete</span>
                  </>
                )}
                {agent.status === "processing" && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-warning" />
                    <span className="text-sm font-medium text-warning">Processing...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
