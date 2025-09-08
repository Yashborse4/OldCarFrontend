import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line' | 'pie';
  title: string;
  subtitle?: string;
  height?: number;
  showValues?: boolean;
  animated?: boolean;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  type,
  title,
  subtitle,
  height = 200,
  showValues = true,
  animated = true,
}) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();

  const maxValue = Math.max(...data.map(item => item.value));
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const defaultColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const renderBarChart = () => {
    const barWidth = (width - 80) / data.length - 8;
    
    return (
      <View style={styles.chartContainer}>
        <View style={[styles.barsContainer, { height: height - 60 }]}>
          {data.map((item, index) => {
            const barHeight = ((item.value / maxValue) * (height - 100)) || 1;
            const color = item.color || defaultColors[index % defaultColors.length];
            
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                  {showValues && (
                    <Text style={[styles.barValue, { color: themeColors.text }]}>
                      {item.value}
                    </Text>
                  )}
                  <Animatable.View
                    animation={animated ? "fadeInUp" : undefined}
                    delay={animated ? index * 200 : 0}
                    duration={800}
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: themeColors.textSecondary }]}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    const chartWidth = width - 80;
    const chartHeight = height - 80;
    const stepX = chartWidth / (data.length - 1);
    
    return (
      <View style={styles.chartContainer}>
        <View style={[styles.lineChartContainer, { height: chartHeight }]}>
          {/* Grid lines */}
          <View style={styles.gridLines}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <View
                key={index}
                style={[
                  styles.gridLine,
                  {
                    bottom: ratio * chartHeight,
                    backgroundColor: themeColors.border,
                  },
                ]}
              />
            ))}
          </View>
          
          {/* Data points and line */}
          <View style={styles.lineContainer}>
            {data.map((item, index) => {
              const x = index * stepX;
              const y = chartHeight - ((item.value / maxValue) * chartHeight);
              const color = item.color || themeColors.primary;
              
              return (
                <Animatable.View
                  key={index}
                  animation={animated ? "zoomIn" : undefined}
                  delay={animated ? index * 200 : 0}
                  style={[
                    styles.dataPoint,
                    {
                      left: x - 6,
                      top: y - 6,
                      backgroundColor: color,
                    },
                  ]}
                >
                  {showValues && (
                    <View style={[styles.valueLabel, { backgroundColor: themeColors.surface }]}>
                      <Text style={[styles.valueLabelText, { color: themeColors.text }]}>
                        {item.value}
                      </Text>
                    </View>
                  )}
                </Animatable.View>
              );
            })}
            
            {/* Connect points with lines */}
            {data.map((_, index) => {
              if (index === data.length - 1) return null;
              
              const x1 = index * stepX;
              const y1 = chartHeight - ((data[index].value / maxValue) * chartHeight);
              const x2 = (index + 1) * stepX;
              const y2 = chartHeight - ((data[index + 1].value / maxValue) * chartHeight);
              
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
              
              return (
                <Animatable.View
                  key={`line-${index}`}
                  animation={animated ? "fadeIn" : undefined}
                  delay={animated ? (index + 1) * 200 : 0}
                  style={[
                    styles.connectingLine,
                    {
                      left: x1,
                      top: y1,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: themeColors.primary,
                    },
                  ]}
                />
              );
            })}
          </View>
          
          {/* X-axis labels */}
          <View style={styles.xAxisLabels}>
            {data.map((item, index) => (
              <Text
                key={index}
                style={[
                  styles.xAxisLabel,
                  {
                    left: index * stepX - 20,
                    color: themeColors.textSecondary,
                  },
                ]}
              >
                {item.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    const centerX = (width - 80) / 2;
    const centerY = (height - 80) / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    let currentAngle = 0;
    
    return (
      <View style={styles.chartContainer}>
        <View style={[styles.pieChartContainer, { height: height - 80 }]}>
          {data.map((item, index) => {
            const percentage = (item.value / totalValue) * 100;
            const angle = (item.value / totalValue) * 360;
            const color = item.color || defaultColors[index % defaultColors.length];
            
            // Calculate position for percentage label
            const labelAngle = currentAngle + (angle / 2);
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos((labelAngle - 90) * (Math.PI / 180)) * labelRadius;
            const labelY = centerY + Math.sin((labelAngle - 90) * (Math.PI / 180)) * labelRadius;
            
            const slice = (
              <Animatable.View
                key={index}
                animation={animated ? "fadeIn" : undefined}
                delay={animated ? index * 200 : 0}
                style={[
                  styles.pieSlice,
                  {
                    width: radius * 2,
                    height: radius * 2,
                    borderRadius: radius,
                    backgroundColor: color,
                    transform: [
                      { rotate: `${currentAngle}deg` },
                    ],
                  },
                ]}
              />
            );
            
            currentAngle += angle;
            
            return (
              <View key={index}>
                {slice}
                {showValues && percentage > 5 && (
                  <View
                    style={[
                      styles.pieLabel,
                      {
                        left: labelX - 20,
                        top: labelY - 10,
                      },
                    ]}
                  >
                    <Text style={[styles.pieLabelText, { color: themeColors.text }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  {
                    backgroundColor: item.color || defaultColors[index % defaultColors.length],
                  },
                ]}
              />
              <Text style={[styles.legendLabel, { color: themeColors.text }]}>
                {item.label}: {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface }, shadows.md]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  
  // Bar Chart Styles
  chartContainer: {
    alignItems: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    alignItems: 'center',
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Line Chart Styles
  lineChartContainer: {
    position: 'relative',
    width: '100%',
  },
  gridLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    opacity: 0.3,
  },
  lineContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  valueLabel: {
    position: 'absolute',
    top: -30,
    left: -15,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  valueLabelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  connectingLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: -25,
    width: '100%',
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    width: 40,
    textAlign: 'center',
  },
  
  // Pie Chart Styles
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pieSlice: {
    position: 'absolute',
  },
  pieLabel: {
    position: 'absolute',
    width: 40,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieLabelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  legend: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 10,
  },
});

export default SimpleChart;



