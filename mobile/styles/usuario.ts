import { StyleSheet } from "react-native";
import { Colors, ThemeColors } from "./tab";

export const createUsuarioStyles = (colors: ThemeColors) => {
  const isDark = colors.background === Colors.dark.background;
  const avatarBg = isDark ? "#4F378A" : "#EADDFF";
  const avatarText = isDark ? "#EADDFF" : "#4F378A";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 110,
    },
    centro: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    avatar: {
      alignSelf: "center",
      width: 92,
      height: 92,
      borderRadius: 46,
      backgroundColor: avatarBg,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 28,
    },
    avatarLetra: {
      fontSize: 36,
      fontWeight: "500",
      color: avatarText,
    },
    campo: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 14,
      gap: 14,
    },
    campoBloqueado: {
      opacity: 0.72,
    },
    campoTexto: {
      flex: 1,
    },
    campoLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    campoValor: {
      fontSize: 16,
      color: colors.text,
      paddingVertical: 0,
    },
    erroTexto: {
      textAlign: "center",
      color: isDark ? "#F2B8B5" : "#B3261E",
      fontSize: 14,
      marginBottom: 8,
      marginTop: 4,
      fontWeight: "500",
    },
    primaryPillButton: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#6750A4",
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 28,
      gap: 10,
      marginTop: 12,
      minWidth: 178,
    },
    primaryPillButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    dangerPillButton: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FF383C",
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 28,
      gap: 10,
      marginTop: 12,
      minWidth: 178,
    },
    dangerPillButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    voltarButton: {
      alignSelf: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginTop: 8,
    },
    voltarButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
  });
};
