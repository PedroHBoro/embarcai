import { StyleSheet } from "react-native";
import { ThemeColors } from "./tab";

export const createViagensStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    conteudo: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 36,
    },
    loader: {
      marginVertical: 20,
    },
    erro: {
      marginBottom: 14,
      color: "#B3261E",
      fontSize: 14,
      textAlign: "center",
    },
    vazio: {
      paddingVertical: 22,
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
    },
    viagemCard: {
      marginBottom: 10,
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.inputBackground,
    },
    viagemCabecalho: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    viagemTitulo: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    viagemValor: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "700",
    },
    viagemDetalhe: {
      marginTop: 5,
      color: colors.textSecondary,
      fontSize: 13,
    },
  });
