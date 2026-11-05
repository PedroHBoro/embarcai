import { StyleSheet } from "react-native";
import { ThemeColors } from "./tab";

export const createListaFiltradaStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    botao: {
      padding: 14,
      borderWidth: 1,
      borderColor: colors.textSecondary,
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      marginBottom: 12,
    },
    texto: {
      color: colors.text,
    },
    fundo: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.4)",
      padding: 20,
    },
    modal: {
      maxHeight: "80%",
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 20,
    },
    titulo: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.textSecondary,
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
      color: colors.text,
    },
    opcao: {
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary,
    },
    vazio: {
      padding: 14,
      color: colors.textSecondary,
    },
    fechar: {
      alignItems: "center",
      padding: 12,
      marginTop: 8,
    },
  });

