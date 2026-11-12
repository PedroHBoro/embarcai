import { useEffect, useState } from "react";
import { View, Text, useColorScheme, Pressable, Modal, ScrollView } from "react-native";
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

type ItemItinerario = Ponto & {
  ordem: number;
  horario: string;
};

type TipoDia = "DIA_UTIL" | "SABADO" | "DOMINGO";

const TIPOS_DIA: { valor: TipoDia; rotulo: string }[] = [
  { valor: "DIA_UTIL", rotulo: "Dia útil" },
  { valor: "SABADO", rotulo: "Sábado" },
  { valor: "DOMINGO", rotulo: "Domingo" },
];

export default function AbaMapa() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createMapaStyles(colors);

  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [itinerario, setItinerario] = useState<ItemItinerario[]>([]);
  const [tipoDiaSelecionado, setTipoDiaSelecionado] = useState<TipoDia | null>(null);
  const [seletorDiaVisivel, setSeletorDiaVisivel] = useState(false);
  const [itinerarioVisivel, setItinerarioVisivel] = useState(false);
  const [avisoItinerario, setAvisoItinerario] = useState<string | null>(null);

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

  async function selecionarLinha(linhaSelecionada: Linha) {
    const linha = linhas.find((item) => item.id === linhaSelecionada.id);
    if (!linha) return;

    setLinhaSelecionada(linha);
    setRotaSelecionada(null);
    setPontoSelecionado(null);
    setRotas([]);
    setPontos([]);
    setItinerario([]);
    setTipoDiaSelecionado(null);
    setSeletorDiaVisivel(false);
    setItinerarioVisivel(false);
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

  async function selecionarRota(rotaSelecionada: Rota) {
    const rota = rotas.find((item) => item.id === rotaSelecionada.id);
    if (!rota) return;

    setRotaSelecionada(rota);
    setPontoSelecionado(null);
    setPontos([]);
    setErro(null);
    setCarregando(true);

    try {
      const dadosPontos = await buscar<Ponto[]>(`/rotas/${rota.id}/pontos`);
      setPontos(dadosPontos);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível carregar os pontos."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarTipoDia(tipoDia: TipoDia) {
    if (!rotaSelecionada) return;

    setCarregando(true);
    setErro(null);
    try {
      const dados = await buscar<ItemItinerario[]>(
        `/rotas/${rotaSelecionada.id}/itinerario?tipoDia=${tipoDia}`
      );
      if (dados.length === 0) {
        const rotulo = TIPOS_DIA.find((item) => item.valor === tipoDia)?.rotulo;
        setSeletorDiaVisivel(false);
        setAvisoItinerario(
          `Não há itinerário cadastrado para ${rotulo?.toLowerCase() ?? "este dia"}.`
        );
        return;
      }

      setItinerario(dados);
      setTipoDiaSelecionado(tipoDia);
      setAvisoItinerario(null);
      setSeletorDiaVisivel(false);
      setItinerarioVisivel(true);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível carregar o itinerário."
      );
      setSeletorDiaVisivel(false);
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
            opcoes={linhas}
            selecionado={linhaSelecionada}
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
            opcoes={rotas}
            selecionado={rotaSelecionada}
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
            opcoes={pontos}
            selecionado={pontoSelecionado}
            onSelecionar={(ponto) => {
              setPontoSelecionado(
                pontos.find((item) => item.id === ponto.id) ?? null
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

      {linhaSelecionada && rotaSelecionada && (
        <Pressable
          style={styles.botaoItinerario}
          onPress={() => setSeletorDiaVisivel(true)}
          accessibilityRole="button"
          accessibilityLabel={`Ver itinerário da rota ${rotaSelecionada.nome}`}
        >
          <Text style={styles.botaoItinerarioTexto}>Ver itinerário</Text>
        </Pressable>
      )}

      <Modal
        visible={seletorDiaVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setSeletorDiaVisivel(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCartao}>
            <Text style={styles.modalTitulo}>Selecione o tipo de dia</Text>
            <Text style={styles.modalSubtitulo}>{rotaSelecionada?.nome}</Text>
            {TIPOS_DIA.map((tipoDia) => (
              <Pressable
                key={tipoDia.valor}
                style={styles.opcaoTipoDia}
                onPress={() => selecionarTipoDia(tipoDia.valor)}
                accessibilityRole="button"
              >
                <Text style={styles.opcaoTipoDiaTexto}>{tipoDia.rotulo}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.botaoFechar}
              onPress={() => setSeletorDiaVisivel(false)}
              accessibilityRole="button"
            >
              <Text style={styles.botaoItinerarioTexto}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={avisoItinerario !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAvisoItinerario(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCartao}>
            <Text style={styles.modalTitulo}>Itinerário indisponível</Text>
            <Text style={styles.mensagemAvisoItinerario}>{avisoItinerario}</Text>
            <Pressable
              style={styles.botaoFechar}
              onPress={() => setAvisoItinerario(null)}
              accessibilityRole="button"
            >
              <Text style={styles.botaoItinerarioTexto}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={itinerarioVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setItinerarioVisivel(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCartao}>
            <Text style={styles.modalTitulo}>Itinerário · {
              TIPOS_DIA.find((item) => item.valor === tipoDiaSelecionado)?.rotulo
            }</Text>
            <Text style={styles.modalSubtitulo}>
              {linhaSelecionada?.nome} · {rotaSelecionada?.nome}
            </Text>

            <View style={styles.tabelaCabecalho}>
              <Text style={[styles.celula, styles.colunaOrdem]}>#</Text>
              <Text style={[styles.celula, styles.colunaPonto]}>Ponto</Text>
              <Text style={[styles.celula, styles.colunaHorario]}>Horário</Text>
            </View>
            <ScrollView style={styles.tabela}>
              {itinerario.length > 0 ? itinerario.map((item) => (
                <View key={`${item.ordem}-${item.id}`} style={styles.linhaTabela}>
                  <Text style={[styles.celula, styles.colunaOrdem]}>{item.ordem}</Text>
                  <Text style={[styles.celula, styles.colunaPonto]} numberOfLines={2}>
                    {item.nome}
                  </Text>
                  <Text style={[styles.celula, styles.colunaHorario]}>{item.horario}</Text>
                </View>
              )) : (
                <Text style={styles.tabelaVazia}>
                  Nenhum horário cadastrado para esta rota.
                </Text>
              )}
            </ScrollView>

            <Pressable
              style={styles.botaoFechar}
              onPress={() => setItinerarioVisivel(false)}
              accessibilityRole="button"
            >
              <Text style={styles.botaoItinerarioTexto}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
