import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_constants.dart';
import '../providers/app_provider.dart';

class AIChatbot extends StatefulWidget {
  const AIChatbot({super.key});

  @override
  State<AIChatbot> createState() => _AIChatbotState();
}

class _AIChatbotState extends State<AIChatbot> {
  final _ctrl = TextEditingController();
  final _messages = <_ChatMessage>[];
  bool _loading = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _send() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    _ctrl.clear();

    setState(() {
      _messages.add(_ChatMessage(text: text, isUser: true));
      _loading = true;
    });

    final provider = context.read<AppProvider>();
    final reply = await provider.ai.chat(text, provider.transactions, provider.currency.symbol);

    setState(() {
      _messages.add(_ChatMessage(text: reply, isUser: false));
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 8),
          Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
          const Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                Text('\u{1F916}', style: TextStyle(fontSize: 24)),
                SizedBox(width: 8),
                Text('SpendWise AI', style: TextStyle(color: AppColors.text, fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _messages.length + (_loading ? 1 : 0),
              itemBuilder: (ctx, i) {
                if (i == _messages.length) {
                  return const Align(
                    alignment: Alignment.centerLeft,
                    child: Padding(
                      padding: EdgeInsets.all(8),
                      child: Text('Thinking...', style: TextStyle(color: AppColors.textSecondary, fontStyle: FontStyle.italic)),
                    ),
                  );
                }
                final msg = _messages[i];
                return Align(
                  alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: msg.isUser ? AppColors.primary : AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(msg.text, style: const TextStyle(color: AppColors.text)),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: EdgeInsets.only(left: 16, right: 16, bottom: MediaQuery.of(context).viewInsets.bottom + 16, top: 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _ctrl,
                    style: const TextStyle(color: AppColors.text),
                    onSubmitted: (_) => _send(),
                    decoration: InputDecoration(
                      hintText: 'Ask about your finances...',
                      hintStyle: const TextStyle(color: AppColors.textSecondary),
                      filled: true,
                      fillColor: AppColors.background,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _loading ? null : _send,
                  icon: const Icon(Icons.send, color: AppColors.primary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatMessage {
  final String text;
  final bool isUser;
  _ChatMessage({required this.text, required this.isUser});
}
