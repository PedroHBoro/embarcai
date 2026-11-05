import { StyleSheet } from "react-native";
import { Colors, ThemeColors } from "./tab";

export const createListaFiltradaStyles = (colors: ThemeColors) => {
  const isDark = colors.background === Colors.dark.background;
  const highlightBoxBg = isDark ? "#363242" : "#EFE6FD";

  return StyleSheet.create({
    // Mesmo estilo de "pedaço destacado" dos campos de Cartões (sem contorno em volta)
    botao: {
      backgroundColor: colors.inputBackground,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.textSecondary,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    texto: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
    },
    fundo: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      padding: 24,
    },
    modal: {
      maxHeight: "80%",
      backgroundColor: colors.inputBackground,
      borderRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    titulo: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 14,
      color: colors.text,
    },
    // Campo de pesquisa sem contorno em volta, seguindo o padrão de Cartões
    input: {
      backgroundColor: highlightBoxBg,
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.textSecondary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 12,
      color: colors.text,
      fontSize: 15,
    },
    opcao: {
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 6,
      backgroundColor: highlightBoxBg,
    },
    vazio: {
      padding: 16,
      textAlign: "center",
      color: colors.textSecondary,
    },
    fechar: {
      alignSelf: "center",
      backgroundColor: "#6750A4",
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 28,
      marginTop: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    fecharTexto: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
    },
  });
};
