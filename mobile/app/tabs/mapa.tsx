import { useEffect, useState } from "react";
import { View, Text, useColorScheme } from "react-native";
import { WebView } from "react-native-webview";
import ListaFiltrada from "../../components/ListaFiltrada";
import { Colors } from "@/styles/tab";
import { createMapaStyles } from "@/styles/mapa";

import { api } from "../../constants/api";

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
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createMapaStyles(colors);

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
    const resposta = await api.get(endpoint);

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
