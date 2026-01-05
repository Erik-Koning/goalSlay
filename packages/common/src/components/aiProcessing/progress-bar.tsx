interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="space-y-3 animate-slide-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overall Progress:</h1>
        <span className="text-lg font-medium text-muted-foreground">{progress}% Complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-gradient-to-r from-destructive to-destructive/80 transition-all duration-500 ease-out animate-progress-pulse"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
