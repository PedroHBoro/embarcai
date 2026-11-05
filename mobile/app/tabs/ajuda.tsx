import { View, Text, useColorScheme } from "react-native";
import { Colors } from "@/styles/tab";

export default function AjudaScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.text }}>Aba Ajuda funcionando!</Text>
    </View>
  );
}