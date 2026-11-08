import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { lerSessao } from "@/constants/sessao";

export default function Index() {
  const [destino, setDestino] = useState<"entrar" | "abas" | null>(null);

  useEffect(() => {
    lerSessao().then((sessao) => {
      setDestino(sessao ? "abas" : "entrar");
    });
  }, []);

  if (destino === "entrar") {
    return <Redirect href="/entrar" />;
  }

  if (destino === "abas") {
    return <Redirect href="/tabs/viagens" />;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}
