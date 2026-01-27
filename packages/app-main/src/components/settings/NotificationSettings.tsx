"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Slider } from "@/src/components/ui/slider";
import { toast } from "sonner";
import { IconBell, IconLoader2 } from "@tabler/icons-react";

interface Settings {
  progressReminderEnabled: boolean;
  progressThresholdPercent: number;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  weeklySummaryEnabled: boolean;
}

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/notifications/settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = useCallback(async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  if (isLoading || !settings) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-3">
        <IconBell className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Notification Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure how and when you receive notifications
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Daily Reminder */}
        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-1">
            <Label className="font-medium">Daily Update Reminder</Label>
            <p className="text-sm text-muted-foreground">
              Get reminded to log your daily progress
            </p>
            {settings.dailyReminderEnabled && (
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="reminderTime" className="text-sm">
                  Reminder time:
                </Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={settings.dailyReminderTime}
                  onChange={(e) => updateSetting("dailyReminderTime", e.target.value)}
                  className="w-32"
                />
              </div>
            )}
          </div>
          <Switch
            checked={settings.dailyReminderEnabled}
            onCheckedChange={(checked) => updateSetting("dailyReminderEnabled", checked)}
          />
        </div>

        {/* Progress Warning */}
        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-1 flex-1">
            <Label className="font-medium">Progress Warnings</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when you fall below your target pace
            </p>
            {settings.progressReminderEnabled && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Warning threshold</Label>
                  <span className="text-sm font-medium">
                    {settings.progressThresholdPercent}%
                  </span>
                </div>
                <Slider
                  value={[settings.progressThresholdPercent]}
                  onValueChange={([value]) => updateSetting("progressThresholdPercent", value)}
                  min={10}
                  max={90}
                  step={10}
                />
                <p className="text-xs text-muted-foreground">
                  You'll be notified when progress falls below{" "}
                  {settings.progressThresholdPercent}% of expected
                </p>
              </div>
            )}
          </div>
          <Switch
            checked={settings.progressReminderEnabled}
            onCheckedChange={(checked) => updateSetting("progressReminderEnabled", checked)}
          />
        </div>

        {/* Weekly Summary */}
        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-1">
            <Label className="font-medium">Weekly Summary</Label>
            <p className="text-sm text-muted-foreground">
              Receive a weekly email summarizing your progress
            </p>
          </div>
          <Switch
            checked={settings.weeklySummaryEnabled}
            onCheckedChange={(checked) => updateSetting("weeklySummaryEnabled", checked)}
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>

    </div>
  );
}
