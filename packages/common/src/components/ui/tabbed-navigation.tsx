"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/packages/app/lib/utils";

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: "client", label: "Client" },
  { id: "consultation", label: "Investment Consultation" },
  { id: "recommendations", label: "Recommendations" },
];

export function TabbedNavigation() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <nav className="relative bg-card rounded-2xl p-1.5 shadow-sm border border-border/50 backdrop-blur-xl">
        <div className="flex gap-1 relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex-1 px-6 py-3 text-sm font-medium rounded-xl transition-colors duration-200 z-10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border/50"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 p-8 bg-card rounded-2xl border border-border/50 shadow-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-balance">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
        <p className="text-muted-foreground leading-relaxed">
          {activeTab === "client" && "View and manage client profiles, personal information, and investment preferences."}
          {activeTab === "consultation" && "Schedule and conduct investment consultations with AI-powered insights and recommendations."}
          {activeTab === "recommendations" && "Review personalized investment recommendations based on client profiles and market analysis."}
        </p>
      </motion.div>
    </div>
  );
}
