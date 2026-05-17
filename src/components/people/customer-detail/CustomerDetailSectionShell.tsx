import { View, type ViewProps } from "react-native";

export default function CustomerDetailSectionShell({ className, ...props }: ViewProps) {
  return (
    <View
      className={`mx-4 mt-4 overflow-hidden rounded-xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark ${className ?? ""}`}
      {...props}
    />
  );
}
