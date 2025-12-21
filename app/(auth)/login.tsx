// Login Screen - Final Version with Logo
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import { Colors } from '../../constants/app';
import { signIn, signUp, resetPassword } from '../../lib/auth';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const theme = Colors.dark;
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!isLogin) {
            if (!username.trim()) {
                Alert.alert('Error', 'Please enter a username');
                return;
            }
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
                Alert.alert(
                    'Verify Email',
                    'Account created! Please check your email and click the verification link to sign in.',
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
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo & Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/icon.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {isLogin ? 'Welcome Back!' : 'Join SpendWise'}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {isLogin
                            ? 'Sign in to manage your finances'
                            : 'Start your journey to financial freedom'}
                    </Text>
                </View>

                {/* Form */}
                <View style={[styles.form, { backgroundColor: theme.card }]}>
                    {/* Username Field (Sign Up Only) */}
                    {!isLogin && (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Username</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.background,
                                    color: theme.text,
                                    borderColor: theme.border
                                }]}
                                placeholder="Choose a username"
                                placeholderTextColor={theme.textSecondary}
                                autoCapitalize="none"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>
                    )}

                    {/* Email Field */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.background,
                                color: theme.text,
                                borderColor: theme.border
                            }]}
                            placeholder="you@example.com"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Password Field */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.background,
                                color: theme.text,
                                borderColor: theme.border
                            }]}
                            placeholder="••••••••"
                            placeholderTextColor={theme.textSecondary}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {/* Confirm Password Field (Sign Up Only) */}
                    {!isLogin && (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.background,
                                    color: theme.text,
                                    borderColor: theme.border
                                }]}
                                placeholder="••••••••"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    )}

                    {/* Forgot Password Link (Login Only) */}
                    {isLogin && (
                        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
                            <Text style={[styles.forgotText, { color: theme.primary }]}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Main Auth Button */}
                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={handleAuth}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.authButtonText}>
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Switch Login/Signup */}
                    <View style={styles.switchContainer}>
                        <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        </Text>
                        <TouchableOpacity onPress={() => {
                            setIsLogin(!isLogin);
                            setEmail('');
                            setPassword('');
                            setConfirmPassword('');
                            setUsername('');
                        }}>
                            <Text style={[styles.switchLink, { color: theme.text }]}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: width > 600 ? 48 : 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        padding: 8,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        borderRadius: 24,
        padding: width > 600 ? 32 : 24,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    forgotText: {
        fontSize: 14,
        fontWeight: '600',
    },
    authButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    authButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        flexWrap: 'wrap',
    },
    switchText: {
        fontSize: 14,
    },
    switchLink: {
        fontSize: 14,
        fontWeight: '700',
    },
});
