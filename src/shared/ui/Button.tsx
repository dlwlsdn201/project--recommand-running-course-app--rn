import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const variantClass = {
    primary: 'bg-primary-500',
    secondary: 'bg-card border border-primary-500',
    ghost: 'bg-transparent',
  }[variant];

  const textClass = {
    primary: 'text-white font-bold text-base',
    secondary: 'text-primary-500 font-bold text-base',
    ghost: 'text-white font-semibold text-base',
  }[variant];

  return (
    <TouchableOpacity
      className={`rounded-xl py-4 px-6 items-center justify-center flex-row ${variantClass} ${disabled || isLoading ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading && <ActivityIndicator size="small" color="white" className="mr-2" />}
      <Text className={textClass}>{label}</Text>
    </TouchableOpacity>
  );
}
