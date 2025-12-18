/**
 * Common chart configurations for consistent styling across all charts
 * Supports light and dark mode with theme-aware colors
 */

export const chartColors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  error: 'hsl(0, 84%, 60%)',
  info: 'hsl(199, 89%, 48%)',
  muted: 'hsl(var(--muted-foreground))',
  
  // Chart color palette
  chart1: 'hsl(221, 83%, 53%)',
  chart2: 'hsl(142, 76%, 36%)',
  chart3: 'hsl(280, 81%, 56%)',
  chart4: 'hsl(38, 92%, 50%)',
  chart5: 'hsl(0, 84%, 60%)',
  chart6: 'hsl(199, 89%, 48%)',
};

export const chartColorsDark = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(142, 71%, 45%)',
  warning: 'hsl(38, 92%, 50%)',
  error: 'hsl(0, 84%, 60%)',
  info: 'hsl(199, 89%, 48%)',
  muted: 'hsl(var(--muted-foreground))',
  
  // Chart color palette (dark mode)
  chart1: 'hsl(221, 83%, 63%)',
  chart2: 'hsl(142, 71%, 45%)',
  chart3: 'hsl(280, 81%, 66%)',
  chart4: 'hsl(38, 92%, 60%)',
  chart5: 'hsl(0, 84%, 70%)',
  chart6: 'hsl(199, 89%, 58%)',
};

/**
 * Get theme-aware chart colors
 */
export function getChartColors(isDark: boolean = false) {
  return isDark ? chartColorsDark : chartColors;
}

/**
 * Common chart margin configuration
 */
export const chartMargin = {
  top: 10,
  right: 10,
  left: 0,
  bottom: 0,
};

/**
 * Responsive chart configuration
 */
export const responsiveConfig = {
  sm: { width: 320, height: 200 },
  md: { width: 640, height: 300 },
  lg: { width: 1024, height: 350 },
  xl: { width: 1280, height: 400 },
};

/**
 * Common axis configuration
 */
export const axisConfig = {
  tickLine: false,
  axisLine: false,
  fontSize: 12,
};

/**
 * Tooltip configuration
 */
export const tooltipConfig = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    padding: '8px 12px',
  },
  labelStyle: {
    color: 'hsl(var(--popover-foreground))',
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: 'hsl(var(--popover-foreground))',
  },
  cursor: {
    fill: 'hsl(var(--muted))',
    opacity: 0.1,
  },
};

/**
 * Legend configuration
 */
export const legendConfig = {
  iconType: 'circle' as const,
  iconSize: 8,
  wrapperStyle: {
    paddingTop: '12px',
    fontSize: '12px',
  },
};

/**
 * Grid configuration
 */
export const gridConfig = {
  strokeDasharray: '3 3',
  stroke: 'hsl(var(--border))',
  opacity: 0.3,
};

/**
 * Animation configuration
 */
export const animationConfig = {
  duration: 500,
  easing: 'ease-in-out' as const,
};

/**
 * Format large numbers for chart display
 */
export function formatChartNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format percentage for chart display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency for chart display
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Get color by index (cycles through chart colors)
 */
export function getColorByIndex(index: number, isDark: boolean = false): string {
  const colors = getChartColors(isDark);
  const colorKeys = ['chart1', 'chart2', 'chart3', 'chart4', 'chart5', 'chart6'] as const;
  const colorKey = colorKeys[index % colorKeys.length];
  return colors[colorKey];
}
