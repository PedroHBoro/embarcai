import React from "react";
import { View, useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { createTabsStyles, Colors } from "@/styles/tab";

function TabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createTabsStyles(colors);
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      {children}
    </View>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createTabsStyles(colors);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="viagens"
        options={{
          title: "Viagens",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <MaterialIcons name="commute" size={24} color={color as string} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={24}
                color={color as string}
              />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="cartoes"
        options={{
          title: "Cartões",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <MaterialCommunityIcons
                name={focused ? "credit-card-chip" : "credit-card-chip-outline"}
                size={24}
                color={color as string}
              />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="usuario"
        options={{
          title: "Usuario",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <MaterialCommunityIcons
                name="account-outline"
                size={24}
                color={color as string}
              />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="ajuda"
        options={{
          title: "Ajuda",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <MaterialCommunityIcons
                name="star-circle-outline"
                size={24}
                color={color as string}
              />
            </TabIcon>
          ),
        }}
      />

    </Tabs>
  );
}