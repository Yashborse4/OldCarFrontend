import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface GradientProps {
    colors?: string[]; // Optional, creates manual gradient
    preset?: 'primary' | 'warm' | 'cool' | 'dark' | 'light';
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

/**
 * Gradient wrapper that simulates gradients with opacity layers for compatibility.
 * Now includes presets for common app styles.
 */
export const Gradient: React.FC<GradientProps> = ({
    colors: customColors,
    preset,
    start = { x: 0, y: 0 },
    end = { x: 0, y: 1 },
    style,
    children,
}) => {

    // Define presets
    const getColors = () => {
        if (customColors) return customColors;
        switch (preset) {
            case 'primary': return ['#FFD700', '#FDB931']; // Gold/Yellow
            case 'warm': return ['#F59E0B', '#F97316']; // Orange
            case 'cool': return ['#3B82F6', '#60A5FA']; // Blue
            case 'dark': return ['#1F2937', '#111827']; // Gray/Black
            case 'light': return ['#FFFFFF', '#F3F4F6']; // White/Gray
            default: return ['#FFD700', '#FDB931'];
        }
    };

    const activeColors = getColors();

    // Layer stack for gradient simulation
    return (
        <View style={[styles.container, style]}>
            {/* Base Layer */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: activeColors[0] }]} />

            {/* Overlay Layer (simulates gradient to second color) */}
            <View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: activeColors[1],
                        opacity: 0.6, // Blend factor
                    }
                ]}
            />

            {/* Optional: Add more layers if array > 2 */}
            {activeColors.length > 2 && (
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: activeColors[2],
                            opacity: 0.3,
                            // Transform to change angle effectively could be complex without linear-gradient lib
                        }
                    ]}
                />
            )}

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden', // Ensure rounded corners work if style has them
    },
});

export default Gradient;
