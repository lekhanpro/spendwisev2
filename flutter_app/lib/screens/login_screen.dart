import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_constants.dart';
import '../providers/app_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isLogin = true;
  bool _loading = false;
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  void _submit() async {
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text;
    if (email.isEmpty || pass.isEmpty) {
      _showError('Please fill in all fields');
      return;
    }
    if (!_isLogin && pass != _confirmCtrl.text) {
      _showError('Passwords do not match');
      return;
    }

    setState(() => _loading = true);
    try {
      final provider = context.read<AppProvider>();
      if (_isLogin) {
        await provider.signIn(email, pass);
      } else {
        await provider.signUp(email, pass);
      }
    } catch (e) {
      _showError(e.toString().replaceAll('Exception: ', '').replaceAll(RegExp(r'\[.*?\]'), '').trim());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _forgotPassword() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty) {
      _showError('Enter your email first');
      return;
    }
    try {
      await context.read<AppProvider>().resetPassword(email);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password reset email sent')));
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: AppColors.danger));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('\u{1F4B0}', style: TextStyle(fontSize: 64)),
                const SizedBox(height: 8),
                const Text('SpendWise', style: TextStyle(color: AppColors.text, fontSize: 32, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text('Smart Finance Tracker', style: TextStyle(color: AppColors.textSecondary, fontSize: 16)),
                const SizedBox(height: 40),
                _buildField(_emailCtrl, 'Email', Icons.email_outlined, false),
                const SizedBox(height: 12),
                _buildField(_passCtrl, 'Password', Icons.lock_outline, true),
                if (!_isLogin) ...[
                  const SizedBox(height: 12),
                  _buildField(_confirmCtrl, 'Confirm Password', Icons.lock_outline, true),
                ],
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _loading
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text(_isLogin ? 'Sign In' : 'Sign Up', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
                const SizedBox(height: 16),
                if (_isLogin)
                  TextButton(
                    onPressed: _forgotPassword,
                    child: const Text('Forgot Password?', style: TextStyle(color: AppColors.primary)),
                  ),
                TextButton(
                  onPressed: () => setState(() => _isLogin = !_isLogin),
                  child: Text(
                    _isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField(TextEditingController ctrl, String hint, IconData icon, bool obscure) {
    return TextField(
      controller: ctrl,
      obscureText: obscure,
      style: const TextStyle(color: AppColors.text),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textSecondary),
        prefixIcon: Icon(icon, color: AppColors.textSecondary),
        filled: true,
        fillColor: AppColors.card,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.primary)),
      ),
    );
  }
}
