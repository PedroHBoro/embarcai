import { StyleSheet } from "react-native";

export const Colors = {
  light: {
    background: "#D9D9D9",
    surface: "#D8D5DBFF",
    inputBackground: "#FAF1FC",
    pillActive: "#adacb5ff",
    primary: "#6750A4",
    text: "#1D1B20",
    textSecondary: "#49454F",
  },
  dark: {
    background: "#1c1e26",
    surface: "#2a2d3a",
    inputBackground: "#2B2930",
    pillActive: "#4A4458",
    primary: "#D0BCFF",
    text: "#E6E0E9",
    textSecondary: "#CAC4D0",
  },
};
export type ThemeColors = typeof Colors.light;

export const createTabsStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.surface,
      borderTopWidth: 0,
      height: 75,
      paddingTop: 8,
      paddingBottom: 10,
      elevation: 0,
    },
    tabBarLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: 4,
    },
    iconWrapper: {
      width: 64,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapperActive: {
      backgroundColor: colors.pillActive,
    },
});