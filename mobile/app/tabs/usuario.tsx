import { useEffect, useState } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/styles/tab";
import { createCartoesStyles } from "@/styles/cartoes";
import { apagarSessao, lerSessao } from "@/constants/sessao";

export default function UsuarioScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createCartoesStyles(colors);
  const router = useRouter();
  const [nome, setNome] = useState("");

  useEffect(() => {
    lerSessao().then((sessao) => {
      if (!sessao) {
        router.replace("/entrar");
        return;
      }
      setNome(sessao.usuario.nome);
    });
  }, [router]);

  async function sair() {
    await apagarSessao();
    router.replace("/entrar");
  }

  return (
    <View style={[styles.container, styles.scrollContent]}>
      <Text style={styles.headerBadgeText}>{nome}</Text>
      <Pressable style={styles.dangerPillButton} onPress={sair}>
        <Text style={styles.dangerPillButtonText}>Sair</Text>
      </Pressable>
    </View>
  );
}
