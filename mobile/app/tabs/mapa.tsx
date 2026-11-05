
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import ListaFiltrada from "../../components/ListaFiltrada";

import { API_URL } from "../../constants/config";

type Linha = {
  id: number;
  nome: string;
};

type Rota = {
  id: number;
  nome: string;
};

type Ponto = {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
};

export default function AbaMapa() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [pontos, setPontos] = useState<Ponto[]>([]);

  const [linhaSelecionada, setLinhaSelecionada] =
    useState<Linha | null>(null);
  const [rotaSelecionada, setRotaSelecionada] =
    useState<Rota | null>(null);
  const [pontoSelecionado, setPontoSelecionado] =
    useState<Ponto | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar<T>(endpoint: string): Promise<T> {
    const resposta = await fetch(`${API_URL}${endpoint}`);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status} em ${endpoint}`);
    }

    return resposta.json() as Promise<T>;
  }

  // Carrega as linhas quando a tela é aberta.
  useEffect(() => {
    async function carregarLinhas() {
      setCarregando(true);
      setErro(null);

      try {
        const dados = await buscar<Linha[]>("/linhas");
        setLinhas(dados);
      } catch (e) {
        setErro(
          e instanceof Error ? e.message : "Não foi possível carregar as linhas."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarLinhas();
  }, []);

  async function selecionarLinha(nome: string) {
    const linha = linhas.find((item) => item.nome === nome);
    if (!linha) return;

    setLinhaSelecionada(linha);
    setRotaSelecionada(null);
    setPontoSelecionado(null);
    setRotas([]);
    setPontos([]);
    setErro(null);
    setCarregando(true);

    try {
      const dados = await buscar<Rota[]>(
        `/linhas/${linha.id}/rotas`
      );
      setRotas(dados);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível carregar as rotas."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarRota(nome: string) {
    const rota = rotas.find((item) => item.nome === nome);
    if (!rota) return;

    setRotaSelecionada(rota);
    setPontoSelecionado(null);
    setPontos([]);
    setErro(null);
    setCarregando(true);

    try {
      const dados = await buscar<Ponto[]>(
        `/rotas/${rota.id}/pontos`
      );
      setPontos(dados);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível carregar os pontos."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mapa de ônibus</Text>

      <View style={styles.seletores}>
        <View style={styles.seletor}>
          <Text style={styles.label}>Linha</Text>
          <ListaFiltrada
            titulo="uma linha"
            opcoes={linhas.map((item) => item.nome)}
            selecionado={linhaSelecionada?.nome ?? null}
            onSelecionar={selecionarLinha}
          />
        </View>

        <View
          style={[
            styles.seletor,
            !linhaSelecionada && styles.desabilitado,
          ]}
          pointerEvents={linhaSelecionada ? "auto" : "none"}
        >
          <Text style={styles.label}>Rota</Text>
          <ListaFiltrada
            titulo="uma rota"
            opcoes={rotas.map((item) => item.nome)}
            selecionado={rotaSelecionada?.nome ?? null}
            onSelecionar={selecionarRota}
          />
        </View>

        <View
          style={[
            styles.seletor,
            !rotaSelecionada && styles.desabilitado,
          ]}
          pointerEvents={rotaSelecionada ? "auto" : "none"}
        >
          <Text style={styles.label}>Ponto</Text>
          <ListaFiltrada
            titulo="um ponto"
            opcoes={pontos.map((item) => item.nome)}
            selecionado={pontoSelecionado?.nome ?? null}
            onSelecionar={(nome) => {
              setPontoSelecionado(
                pontos.find((item) => item.nome === nome) ?? null
              );
            }}
          />
        </View>
      </View>

      {carregando && (
        <Text style={styles.aviso}>Carregando dados...</Text>
      )}

      {erro && <Text style={styles.erro}>{erro}</Text>}

      {!carregando && !erro && linhas.length === 0 && (
        <Text style={styles.aviso}>Nenhuma linha cadastrada.</Text>
      )}

      {linhaSelecionada && !rotaSelecionada && (
        <Text style={styles.aviso}>Selecione uma rota.</Text>
      )}

      {linhaSelecionada && rotaSelecionada && pontos.length > 0 && (
        <View style={styles.mapa}>
          <WebView
            key={pontoSelecionado?.id ?? pontos[0].id}
            source={{
              uri: `https://www.openstreetmap.org/export/embed.html?bbox=${
                pontoSelecionado
                  ? `${pontoSelecionado.longitude - 0.005},${pontoSelecionado.latitude - 0.005},${pontoSelecionado.longitude + 0.005},${pontoSelecionado.latitude + 0.005}`
                  : `${pontos[0].longitude - 0.005},${pontos[0].latitude - 0.005},${pontos[0].longitude + 0.005},${pontos[0].latitude + 0.005}`
              }&layer=mapnik&marker=${
                pontoSelecionado
                  ? `${pontoSelecionado.latitude},${pontoSelecionado.longitude}`
                  : `${pontos[0].latitude},${pontos[0].longitude}`
              }`,
            }}
            style={{
              width: "100%",
              height: 400,
              flex: 1,
            }}
            javaScriptEnabled
            domStorageEnabled
            onError={(event) =>
              console.log("Erro no mapa:", event.nativeEvent)
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
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
  },
  desabilitado: {
    opacity: 0.4,
  },
  aviso: {
    color: "#777",
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
  borderColor: "#ccc",
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: "#f8fafc",
},
  mapaTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
});