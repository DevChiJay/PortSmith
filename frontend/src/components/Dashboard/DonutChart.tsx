'use client';

import { useTheme } from 'next-themes';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import {
  chartColors,
  chartColorsDark,
  legendConfig,
  formatChartNumber,
  formatPercentage,
  getColorByIndex,
} from '@/lib/chart-config';
import { cn } from '@/lib/utils';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showPercentage?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

/**
 * Donut chart component for status distributions and proportional data
 * Shows percentage breakdown with optional center label
 */
export function DonutChart({
  data,
  height = 300,
  className,
  showLegend = true,
  showTooltip = true,
  showPercentage = true,
  innerRadius = 60,
  outerRadius = 80,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  const colors = isDark ? chartColorsDark : chartColors;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

    return (
      <div
        className="rounded-lg border bg-background p-3 shadow-md"
        style={{
          borderColor: 'hsl(var(--border))',
        }}
      >
        <p className="text-sm font-semibold mb-1">{data.name}</p>
        <div className="text-xs space-y-0.5">
          <p>
            <span className="text-muted-foreground">Value: </span>
            <span className="font-medium">{formatChartNumber(data.value)}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Percentage: </span>
            <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      </div>
    );
  };

  const renderCustomLabel = (entry: any) => {
    if (!showPercentage) return null;
    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0';
    return `${percentage}%`;
  };

  return (
    <div className={cn('w-full relative', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || getColorByIndex(index, isDark)}
              />
            ))}
          </Pie>
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
        </RechartsPieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <div className="text-2xl font-bold">{centerValue}</div>
          )}
          {centerLabel && (
            <div className="text-xs text-muted-foreground mt-1">{centerLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showPercentage?: boolean;
}

/**
 * Standard pie chart (without center hole)
 */
export function PieChart({
  data,
  height = 300,
  className,
  showLegend = true,
  showTooltip = true,
  showPercentage = true,
}: PieChartProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

    return (
      <div
        className="rounded-lg border bg-background p-3 shadow-md"
        style={{
          borderColor: 'hsl(var(--border))',
        }}
      >
        <p className="text-sm font-semibold mb-1">{data.name}</p>
        <div className="text-xs space-y-0.5">
          <p>
            <span className="text-muted-foreground">Value: </span>
            <span className="font-medium">{formatChartNumber(data.value)}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Percentage: </span>
            <span className="font-medium">{percentage}%</span>
          </p>
        </div>
      </div>
    );
  };

  const renderCustomLabel = (entry: any) => {
    if (!showPercentage) return null;
    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0';
    return `${percentage}%`;
  };

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || getColorByIndex(index, isDark)}
              />
            ))}
          </Pie>
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
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
