'use client';

import { useTheme } from 'next-themes';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
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
  getColorByIndex,
} from '@/lib/chart-config';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: any[];
  bars: Array<{
    dataKey: string;
    name: string;
    color?: string;
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
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
}

/**
 * Bar chart wrapper component for API comparisons and statistics
 * Supports both vertical and horizontal orientations
 */
export function BarChart({
  data,
  bars,
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
  layout = 'horizontal',
  stacked = false,
}: BarChartProps) {
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
                {formatChartNumber(entry.value as number)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const isVertical = layout === 'vertical';

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 10, left: isVertical ? 60 : 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid {...gridConfig} />}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                {...axisConfig}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={formatYAxis}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                {...axisConfig}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={formatXAxis}
                width={100}
              />
            </>
          ) : (
            <>
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
            </>
          )}
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
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || colors[`chart${(index % 6) + 1}` as keyof typeof colors]}
              radius={[4, 4, 0, 0]}
              animationDuration={animationConfig.duration}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SimpleBarChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
  className?: string;
  colorByValue?: boolean;
  formatValue?: (value: any) => string;
}

/**
 * Simple single-bar chart with automatic coloring
 */
export function SimpleBarChart({
  data,
  dataKey,
  nameKey,
  height = 300,
  className,
  colorByValue = false,
  formatValue = formatChartNumber,
}: SimpleBarChartProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid {...gridConfig} />
          <XAxis
            dataKey={nameKey}
            {...axisConfig}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            {...axisConfig}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={formatValue}
          />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorByIndex(index, isDark)} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
