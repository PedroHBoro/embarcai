import { StyleSheet } from "react-native";
import { ThemeColors } from "./tab";

export const createMapaStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingTop: 40,
      backgroundColor: colors.background,
    },
    titulo: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 24,
      color: colors.text,
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
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: colors.text,
    },
    desabilitado: {
      opacity: 0.4,
    },
    aviso: {
      color: colors.textSecondary,
      marginTop: 12,
    },
    erro: {
      color: "#c00",
      marginTop: 12,
    },
    mapa: {
      flex: 1,
      minHeight: 400,
      marginTop: 24,
      borderWidth: 1,
      borderColor: colors.textSecondary,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: colors.inputBackground,
    },
    mapaTitulo: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.text,
    },
  });

