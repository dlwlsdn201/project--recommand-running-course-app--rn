import React from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SafeAreaWrapper({
  children,
  className = "",
}: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      className={`flex-1 bg-surface ${className}`}
      style={{ paddingTop: insets.top }}>
      {children}
    </SafeAreaView>
  );
}
