'use client';

import { useTheme } from 'next-themes';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import {
  chartColors,
  chartColorsDark,
  axisConfig,
  tooltipConfig,
  legendConfig,
  gridConfig,
  animationConfig,
  formatChartNumber,
} from '@/lib/chart-config';
import { cn } from '@/lib/utils';

interface LineChartProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    name: string;
    color?: string;
    strokeWidth?: number;
  }>;
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  formatYAxis?: (value: any) => string;
  formatXAxis?: (value: any) => string;
  formatTooltip?: (value: any, name: string) => [string, string];
}

/**
 * Line chart wrapper component for usage trends
 * Automatically adapts to light/dark theme
 */
export function LineChart({
  data,
  lines,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  height = 350,
  className,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  formatYAxis = formatChartNumber,
  formatXAxis,
  formatTooltip,
}: LineChartProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  const colors = isDark ? chartColorsDark : chartColors;

  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        className="rounded-lg border bg-background p-3 shadow-md"
        style={{
          borderColor: 'hsl(var(--border))',
        }}
      >
        <p className="text-sm font-semibold mb-2">{formatXAxis ? formatXAxis(label) : label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-medium">
                {formatTooltip
                  ? formatTooltip(entry.value, entry.name)[0]
                  : formatChartNumber(entry.value as number)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid {...gridConfig} />}
          <XAxis
            dataKey={xAxisKey}
            {...axisConfig}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={formatXAxis}
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
          />
          <YAxis
            {...axisConfig}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={formatYAxis}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              {...legendConfig}
              wrapperStyle={{
                ...legendConfig.wrapperStyle,
                color: 'hsl(var(--foreground))',
              }}
            />
          )}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || colors[`chart${(index % 6) + 1}` as keyof typeof colors]}
              strokeWidth={line.strokeWidth || 2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={animationConfig.duration}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AreaLineChartProps extends Omit<LineChartProps, 'lines'> {
  areas: Array<{
    dataKey: string;
    name: string;
    color?: string;
    fillOpacity?: number;
  }>;
}

/**
 * Area line chart variant for filled area charts
 */
export function AreaLineChart({
  data,
  areas,
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  height = 350,
  className,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  formatYAxis = formatChartNumber,
  formatXAxis,
}: AreaLineChartProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  const colors = isDark ? chartColorsDark : chartColors;

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {areas.map((area, index) => {
              const color = area.color || colors[`chart${(index % 6) + 1}` as keyof typeof colors];
              return (
                <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={area.fillOpacity || 0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          {showGrid && <CartesianGrid {...gridConfig} />}
          <XAxis
            dataKey={xAxisKey}
            {...axisConfig}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={formatXAxis}
          />
          <YAxis
            {...axisConfig}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={formatYAxis}
          />
          {showTooltip && <Tooltip {...tooltipConfig} />}
          {showLegend && <Legend {...legendConfig} />}
          {areas.map((area, index) => {
            const color = area.color || colors[`chart${(index % 6) + 1}` as keyof typeof colors];
            return (
              <Line
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${area.dataKey})`}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={animationConfig.duration}
              />
            );
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
