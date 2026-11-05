import { StyleSheet } from "react-native";
import { Colors, ThemeColors } from "./tab";

export const createCartoesStyles = (colors: ThemeColors) => {
  const isDark = colors.background === Colors.dark.background;

  const chipBg = isDark ? "#3F3A4D" : "#E8DEF8";
  const chipText = isDark ? "#E6E0E9" : "#6750A4";
  const primaryBtnBg = "#6750A4";
  const primaryBtnText = "#FFFFFF";
  const highlightBoxBg = isDark ? "#363242" : "#EFE6FD";
  const dangerBg = isDark ? "#5C2B29" : "#F9DEDC";
  const dangerText = isDark ? "#F2B8B5" : "#B3261E";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 110,
    },

    // Card de Cartão na listagem
    cartaoCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 28,
      padding: 22,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    cartaoHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
      gap: 8,
    },
    cartaoTitulo: {
      fontSize: 22,
      fontWeight: "600",
      color: colors.text,
      flexShrink: 1,
    },
    tipoBadge: {
      backgroundColor: chipBg,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    tipoBadgeText: {
      color: chipText,
      fontSize: 12,
      fontWeight: "700",
    },
    cartaoNumero: {
      fontSize: 14,
      color: colors.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    saldoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: highlightBoxBg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 14,
    },
    saldoLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    saldoValor: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
    },
    cartaoInfoEstudante: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
    },

    // Botões de ação dentro do card (NFC / Consultar Saldo / Atualizar Cadastro / Remover)
    cartaoActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
    },
    chipButton: {
      backgroundColor: chipBg,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    chipButtonAtivo: {
      backgroundColor: primaryBtnBg,
    },
    chipButtonText: {
      color: chipText,
      fontSize: 13,
      fontWeight: "600",
    },
    chipButtonTextAtivo: {
      color: primaryBtnText,
    },
    chipButtonDanger: {
      backgroundColor: dangerBg,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    chipButtonDangerText: {
      color: dangerText,
      fontSize: 13,
      fontWeight: "600",
    },

    // Card de Switch (Ativar NFC / Passe estudantil)
    switchCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 8,
      marginBottom: 18,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    switchLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },

    // Botão primário roxo (Cadastrar / Salvar)
    primaryPillButton: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primaryBtnBg,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 28,
      gap: 10,
      marginTop: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    primaryPillButtonText: {
      color: primaryBtnText,
      fontSize: 16,
      fontWeight: "600",
    },

    dangerPillButton: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#B3261E",
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 28,
      gap: 10,
      marginTop: 12,
    },
    dangerPillButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },

    secondaryPillButton: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginTop: 8,
    },
    secondaryPillButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },

    // Botão flutuante "+" (FAB)
    fab: {
      position: "absolute",
      right: 24,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: primaryBtnBg,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    },

    // Formulário de Cadastro / Edição
    headerBadge: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 10,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    headerBadgeText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },

    inputWrapper: {
      backgroundColor: colors.inputBackground,
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
      borderBottomWidth: 1.5,
      borderBottomColor: colors.textSecondary,
      marginBottom: 18,
    },
    inputLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    textInput: {
      fontSize: 16,
      color: colors.text,
      paddingVertical: 2,
    },

    // Estado vazio
    emptyCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 24,
      padding: 28,
      alignItems: "center",
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginTop: 10,
      marginBottom: 6,
      textAlign: "center",
    },
    avisoTexto: {
      textAlign: "center",
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    erroTexto: {
      textAlign: "center",
      color: dangerText,
      fontSize: 14,
      marginBottom: 12,
      fontWeight: "500",
    },

    // Modais (Consulta de Saldo e Confirmação de Remoção)
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "center",
      padding: 24,
    },
    modalCard: {
      backgroundColor: colors.inputBackground,
      borderRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    modalTitulo: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 6,
    },
    modalSubtitulo: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    modalSaldoDestaque: {
      backgroundColor: highlightBoxBg,
      borderRadius: 16,
      padding: 18,
      alignItems: "center",
      marginBottom: 12,
    },
    modalSaldoLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    modalSaldoValor: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.primary,
    },
  });
};
