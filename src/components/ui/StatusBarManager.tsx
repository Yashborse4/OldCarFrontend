import React from 'react';
import { StatusBar, StatusBarProps, useColorScheme } from 'react-native';

interface StatusBarManagerProps extends Omit<StatusBarProps, 'translucent' | 'backgroundColor'> {
  backgroundColor?: string;
  forceTranslucent?: boolean; // Only use this if absolutely necessary
}

export const StatusBarManager: React.FC<StatusBarManagerProps> = ({
  backgroundColor,
  barStyle,
  forceTranslucent = false,
  hidden = false,
  ...rest
}) => {
  const isDark = useColorScheme() === 'dark';
  
  const defaultBackgroundColor = isDark ? '#0F0F0F' : '#FAFBFC';
  const defaultBarStyle = isDark ? 'light-content' : 'dark-content';
  
  return (
    <StatusBar
      backgroundColor={backgroundColor || defaultBackgroundColor}
      barStyle={barStyle || defaultBarStyle}
      translucent={forceTranslucent}
      hidden={hidden}
      {...rest}
    />
  );
};

// Higher-order component to wrap screens with consistent status bar
export const withStatusBar = (Component: React.ComponentType<any>) => {
  return React.forwardRef<any, any>((props, ref) => (
    <>
      <StatusBarManager />
      <Component {...props} ref={ref} />
    </>
  ));
};

export default StatusBarManager;