// components/GlassCard.tsx - Reusable glass effect card component
import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'highlight' | 'success' | 'danger' | 'blue';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, variant = 'default' }) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'highlight':
                return { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' };
            case 'success':
                return { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' };
            case 'danger':
                return { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' };
            case 'blue':
                return { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.3)' };
            default:
                return { backgroundColor: 'rgba(24, 24, 27, 0.5)', borderColor: '#27272a' };
        }
    };

    return (
        <View style={[styles.card, getVariantStyles(), style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});

export default GlassCard;
