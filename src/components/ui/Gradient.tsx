import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface GradientProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

/**
 * Custom gradient component to replace react-native-linear-gradient
 * Uses layered views with opacity to simulate gradient effect
 */
export const Gradient: React.FC<GradientProps> = ({
    colors,
    start = { x: 0, y: 0 },
    end = { x: 0, y: 1 },
    style,
    children,
}) => {
    // Calculate gradient direction
    const isVertical = Math.abs(end.y - start.y) > Math.abs(end.x - start.x);
    const isReverse = isVertical ? end.y < start.y : end.x < start.x;

    // For simple two-color gradients, create layered effect
    if (colors.length === 2) {
        return (
            <View style={[styles.container, style]}>
                {/* Base color */}
                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[0] }]} />

                {/* Gradient overlay using opacity */}
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: colors[1],
                            opacity: 0.7,
                        },
                    ]}
                />

                {children}
            </View>
        );
    }

    // For multiple colors, create multiple layers
    return (
        <View style={[styles.container, style]}>
            {colors.map((color, index) => {
                const opacity = index === 0 ? 1 : (colors.length - index) / colors.length;
                return (
                    <View
                        key={`gradient-${index}`}
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                backgroundColor: color,
                                opacity: opacity,
                            },
                        ]}
                    />
                );
            })}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
});

export default Gradient;
