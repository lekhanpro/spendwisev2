import 'package:flutter/material.dart';
import '../constants/app_constants.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final Color? color;
  final EdgeInsets? padding;
  final EdgeInsets? margin;

  const GlassCard({super.key, required this.child, this.color, this.padding, this.margin});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin ?? const EdgeInsets.only(bottom: 12),
      padding: padding ?? const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color ?? AppColors.card.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: child,
    );
  }
}
