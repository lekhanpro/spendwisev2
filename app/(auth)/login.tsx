// Login Screen
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Colors } from '../../constants/app';
import { signIn, signUp, resetPassword } from '../../lib/auth';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
                Alert.alert(
                    'Verify Email',
                    'A verification email has been sent. Please verify your email before logging in.',
                    [{ text: 'OK', onPress: () => setIsLogin(true) }]
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };



    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            await resetPassword(email);
            Alert.alert('Success', 'Password reset email sent');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send reset email');
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>💰</Text>
                    <Text style={[styles.appName, { color: theme.text }]}>SpendWise</Text>
                    <Text style={[styles.tagline, { color: theme.textSecondary }]}>
                        Smart money management
                    </Text>
                </View>

                {/* Form */}
                <View style={[styles.form, { backgroundColor: theme.card }]}>
                    <Text style={[styles.formTitle, { color: theme.text }]}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </Text>



                    <TextInput
                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                        placeholder="Email"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                        placeholder="Password"
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    {!isLogin && (
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Confirm Password"
                            placeholderTextColor={theme.textSecondary}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    )}

                    {isLogin && (
                        <TouchableOpacity onPress={handleForgotPassword}>
                            <Text style={[styles.forgotText, { color: theme.primary }]}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.authButton, { backgroundColor: theme.primary }]}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.authButtonText}>
                                {isLogin ? 'Login' : 'Sign Up'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.switchContainer}>
                        <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        </Text>
                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                            <Text style={[styles.switchLink, { color: theme.primary }]}>
                                {isLogin ? ' Sign Up' : ' Login'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        fontSize: 64,
        marginBottom: 8,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
    },
    tagline: {
        fontSize: 14,
        marginTop: 4,
    },
    form: {
        borderRadius: 24,
        padding: 24,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 24,
    },

    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    forgotText: {
        textAlign: 'right',
        marginBottom: 16,
        fontSize: 14,
    },
    authButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    authButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    switchText: {
        fontSize: 14,
    },
    switchLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});
