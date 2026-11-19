import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View, useColorScheme } from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "@/constants/api";
import { Colors } from "@/styles/tab";
import { createViagensStyles } from "@/styles/viagens";
import { createCartoesStyles } from "@/styles/cartoes";

type Viagem = {
  id: number;
  saldoGasto: number;
  tipoDesconto: "TOTAL" | "PARCIAL" | null;
  criadoEm: string;
  cartao: {
    nome: string;
    tipoPasse: "NORMAL" | "ESTUDANTE";
    tipoDescontoEstudante: "TOTAL" | "PARCIAL";
  };
  pontoRota: {
    ponto: { nome: string };
    rota: { nome: string; linha: { nome: string } };
  };
};

function formatarMoeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function ViagensScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createViagensStyles(colors);
  const cartaoStyles = createCartoesStyles(colors);

  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarHistorico() {
        setCarregando(true);
        setErro(null);
        try {
          const resposta = await api.get("/viagens");
          const dados = await resposta.json().catch(() => null);
          if (!resposta.ok) {
            throw new Error(dados?.erro ?? `Erro HTTP ${resposta.status}.`);
          }
          if (ativo) setViagens(dados as Viagem[]);
        } catch (e) {
          if (ativo) {
            setErro(e instanceof Error ? e.message : "Não foi possível carregar o histórico.");
          }
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      void carregarHistorico();
      return () => {
        ativo = false;
      };
    }, [])
  );

  const viagensFiltradas = useMemo(() => {
    const termo = normalizar(pesquisa.trim());
    if (!termo) return viagens;
    return viagens.filter((viagem) =>
      normalizar([
        viagem.pontoRota.rota.linha.nome,
        viagem.pontoRota.rota.nome,
        viagem.pontoRota.ponto.nome,
        viagem.cartao.nome,
      ].join(" ")).includes(termo)
    );
  }, [pesquisa, viagens]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={cartaoStyles.inputWrapper}>
          <Text style={cartaoStyles.inputLabel}>Pesquisar viagens</Text>
          <TextInput
            style={cartaoStyles.textInput}
            placeholder="Linha, rota, ponto ou cartão"
            placeholderTextColor={colors.textSecondary}
            value={pesquisa}
            onChangeText={setPesquisa}
            accessibilityLabel="Pesquisar viagens"
          />
        </View>

        {carregando && <ActivityIndicator color={colors.primary} style={styles.loader} />}
        {erro && <Text style={styles.erro}>{erro}</Text>}
        {!carregando && !erro && viagensFiltradas.length === 0 && (
          <Text style={styles.vazio}>
            {pesquisa.trim() ? "Nenhuma viagem corresponde à pesquisa." : "Ainda não há viagens registradas."}
          </Text>
        )}
        {viagensFiltradas.map((viagem) => {
          const tipoDesconto = viagem.tipoDesconto ??
            (viagem.cartao.tipoPasse === "ESTUDANTE"
              ? viagem.cartao.tipoDescontoEstudante
              : null);
          return (
          <View key={viagem.id} style={styles.viagemCard}>
            <View style={styles.viagemCabecalho}>
              <Text style={styles.viagemTitulo}>{viagem.pontoRota.rota.linha.nome}</Text>
              <Text style={styles.viagemValor}>{formatarMoeda(viagem.saldoGasto)}</Text>
            </View>
            <Text style={styles.viagemDetalhe}>
              {viagem.pontoRota.rota.nome} · {viagem.pontoRota.ponto.nome}
            </Text>
            {tipoDesconto && (
              <Text style={styles.viagemDetalhe}>
                {tipoDesconto === "TOTAL"
                  ? "Desconto total aplicado"
                  : "Desconto parcial aplicado"}
              </Text>
            )}
            <Text style={styles.viagemDetalhe}>
              {viagem.cartao.nome} · {new Date(viagem.criadoEm).toLocaleString("pt-BR")}
            </Text>
          </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
