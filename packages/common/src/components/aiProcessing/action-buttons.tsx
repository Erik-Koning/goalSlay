import { StopCircle, Download } from "lucide-react";
import { Button } from "@common/components/ui/Button";

export function ActionButtons() {
  return (
    <div className="flex flex-wrap gap-4 animate-slide-in">
      <Button size="lg" variant="destructive" className="gap-2 rounded-xl px-8 py-6 text-base font-medium shadow-lg transition-all hover:scale-105">
        <StopCircle className="h-5 w-5" />
        Cancel Processing
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="gap-2 rounded-xl px-8 py-6 text-base font-medium shadow-lg transition-all hover:scale-105 hover:bg-muted bg-transparent"
      >
        <Download className="h-5 w-5" />
        Download Logs
      </Button>
    </div>
  );
}
