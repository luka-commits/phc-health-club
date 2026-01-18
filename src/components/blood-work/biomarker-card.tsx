import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calculateTrendChange } from "@/lib/utils/biomarker-utils";

interface BiomarkerCardProps {
  name: string;
  value: number;
  unit: string;
  previousValue?: number;
  referenceRange: { low: number | null; high: number | null };
  flag: "normal" | "low" | "high" | null;
}

export function BiomarkerCard({
  name,
  value,
  unit,
  previousValue,
  referenceRange,
  flag,
}: BiomarkerCardProps) {
  const trend = previousValue ? calculateTrendChange(value, previousValue) : null;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{name}</span>
        {flag && (
          <Badge
            variant={
              flag === "high"
                ? "destructive"
                : flag === "low"
                  ? "secondary"
                  : "default"
            }
          >
            {flag}
          </Badge>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>

      {trend && (
        <div className="flex items-center gap-1 mt-1 text-sm">
          {trend.direction === "up" ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : trend.direction === "down" ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <Minus className="h-4 w-4 text-muted-foreground" />
          )}
          <span
            className={
              trend.direction === "up"
                ? "text-green-500"
                : trend.direction === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
            }
          >
            {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
            {trend.percent.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">vs last</span>
        </div>
      )}

      {(referenceRange.low !== null || referenceRange.high !== null) && (
        <div className="text-xs text-muted-foreground mt-2">
          Range:{" "}
          {referenceRange.low !== null && referenceRange.high !== null
            ? `${referenceRange.low} - ${referenceRange.high}`
            : referenceRange.low !== null
              ? `> ${referenceRange.low}`
              : `< ${referenceRange.high}`}{" "}
          {unit}
        </div>
      )}
    </div>
  );
}
