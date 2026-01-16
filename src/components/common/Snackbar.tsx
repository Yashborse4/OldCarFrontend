import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { getResponsiveSpacing, getResponsiveTypography, getResponsiveBorderRadius, scaleSize } from '../../utils/responsiveEnhanced';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface Props {
    visible: boolean;
    message: string;
    type?: SnackbarType;
    onDismiss: () => void;
    actionLabel?: string;
    onAction?: () => void;
    duration?: number;
}

const Snackbar: React.FC<Props> = ({
    visible,
    message,
    type = 'info',
    onDismiss,
    actionLabel,
    onAction,
    duration = 3000,
}) => {
    // Constants
    const TranslateY_HIDDEN = 100;
    const TranslateY_VISIBLE = 0;

    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const slideAnim = useRef(new Animated.Value(TranslateY_HIDDEN)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Show
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: TranslateY_VISIBLE,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleDismiss();
                }, duration);
                return () => clearTimeout(timer);
            }
        } else {
            // Hide instantly if visible becomes false from parent
            handleDismiss();
        }
    }, [visible]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: TranslateY_HIDDEN,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return '#10B981';
            case 'error': return '#EF4444';
            case 'warning': return '#F59E0B';
            default: return '#3B82F6'; // info
        }
    };

    const getIconName = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            default: return 'information-circle';
        }
    };

    // Use visible prop directly - we don't need to access internal animated _value.
    // The animation handles showing/hiding; when visible is false, we still render to animate out.
    // Return null only if we were never visible (initial state before first show).
    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                    backgroundColor: getBackgroundColor(),
                },
            ]}
        >
            <View style={styles.content}>
                <Ionicons name={getIconName()} size={24} color="#FFFFFF" />
                <Text style={styles.message}>{message}</Text>
            </View>

            {(actionLabel || onAction) ? (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onAction || handleDismiss}
                >
                    <Text style={styles.actionText}>{actionLabel || 'DISMISS'}</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: getResponsiveSpacing('xl'),
        left: getResponsiveSpacing('lg'),
        right: getResponsiveSpacing('lg'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: getResponsiveSpacing('md'),
        borderRadius: getResponsiveBorderRadius('lg'),
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        zIndex: 9999,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: getResponsiveSpacing('sm'),
    },
    message: {
        color: '#FFFFFF',
        fontSize: getResponsiveTypography('sm'),
        fontWeight: '500',
        flex: 1, // Ensure text wraps
    },
    actionButton: {
        marginLeft: getResponsiveSpacing('md'),
        paddingHorizontal: getResponsiveSpacing('sm'),
        paddingVertical: scaleSize(4),
    },
    actionText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: getResponsiveTypography('sm'),
        textTransform: 'uppercase',
    },
    closeButton: {
        padding: scaleSize(4),
        marginLeft: getResponsiveSpacing('sm'),
    }
});

export default Snackbar;
