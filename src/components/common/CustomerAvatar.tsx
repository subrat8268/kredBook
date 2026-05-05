import { customerAvatarGradientPairs } from "@/src/styles/sheetTokens";
import { useTheme } from "@/src/utils/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2 } from "lucide-react-native";
import { memo } from "react";
import { Text, View } from "react-native";

interface CustomerAvatarProps {
  name: string;
  size: number;
  selected?: boolean;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getPairFromName(name: string) {
  const hash = name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return customerAvatarGradientPairs[hash % customerAvatarGradientPairs.length] as readonly [string, string];
}

const CustomerAvatar = memo(function CustomerAvatar({ name, size, selected = false }: CustomerAvatarProps) {
  const { colors } = useTheme();
  const initials = getInitials(name);
  const gradient = getPairFromName(name);

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", flexShrink: 0 }}>
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.surface, fontWeight: "700", fontSize: size * 0.38 }}>
          {initials}
        </Text>
      </LinearGradient>

      {selected ? (
        <>
          <View style={{ position: "absolute", inset: 0, backgroundColor: `${colors.surface}4D` }} />
          <View
            style={{
              position: "absolute",
              right: -1,
              bottom: -1,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: colors.surface,
              backgroundColor: colors.success,
            }}
          >
            <CheckCircle2 size={16} color={colors.surface} />
          </View>
        </>
      ) : null}
    </View>
  );
});

export default CustomerAvatar;
