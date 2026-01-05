"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

interface LiveLogOutputProps {
  logs: string[];
}

export function LiveLogOutput({ logs }: LiveLogOutputProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const formatLog = (log: string) => {
    // Extract timestamp
    const timestampMatch = log.match(/\[(\d{2}:\d{2}:\d{2})\]/);
    const timestamp = timestampMatch ? timestampMatch[1] : "";
    const content = log.replace(/\[\d{2}:\d{2}:\d{2}\]\s*/, "");

    // Determine log type and color
    let color = "text-blue-400";
    if (content.includes("✅") || content.includes("completed")) {
      color = "text-green-400";
    } else if (content.includes("⏳") || content.includes("processing")) {
      color = "text-yellow-400";
    } else if (content.includes("System:")) {
      color = "text-cyan-400";
    }

    return { timestamp, content, color };
  };

  return (
    <div className="space-y-3 animate-slide-in">
      <div className="flex items-center gap-2 text-foreground">
        <Terminal className="h-5 w-5" />
        <h2 className="text-xl font-semibold tracking-tight">Live Log Output</h2>
      </div>

      <div className="glass overflow-hidden rounded-2xl border border-border/50 shadow-xl">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-3 text-sm font-mono text-gray-400">terminal</span>
          </div>
        </div>

        <div className="h-[400px] overflow-y-auto bg-gray-950 p-6 font-mono text-sm">
          {logs.map((log, index) => {
            const { timestamp, content, color } = formatLog(log);
            return (
              <div key={index} className="mb-1 flex gap-3 leading-relaxed animate-slide-in" style={{ animationDelay: `${index * 20}ms` }}>
                <span className="text-gray-500">{timestamp}</span>
                <span className={color}>{content}</span>
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
