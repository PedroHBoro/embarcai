import { StyleSheet } from "react-native";
import { Colors, ThemeColors } from "./tab";

export const createMapaStyles = (colors: ThemeColors) => {
  const isDark = colors.background === Colors.dark.background;

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    // Mesmo estilo de bloco destacado ("headerBadge") da tela de Cartões
    titulo: {
      alignSelf: "center",
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 22,
      paddingVertical: 14,
      borderRadius: 12,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    seletores: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    seletor: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 6,
      color: colors.textSecondary,
      paddingLeft: 4,
    },
    desabilitado: {
      opacity: 0.4,
    },
    aviso: {
      textAlign: "center",
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 20,
    },
    erro: {
      textAlign: "center",
      color: isDark ? "#F2B8B5" : "#B3261E",
      fontSize: 14,
      marginTop: 12,
      fontWeight: "500",
    },
    // Card do mapa destacado com sombra e sem contorno branco
    mapa: {
      flex: 1,
      minHeight: 400,
      marginTop: 20,
      borderRadius: 28,
      overflow: "hidden",
      backgroundColor: colors.inputBackground,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    mapaTitulo: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.text,
    },
  });
};
