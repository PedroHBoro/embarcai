
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ListaFiltrada from "../../components/ListaFiltrada";

const onibus = [
  {
    id: "101",
    nome: "101 - Centro",
    rotas: ["Centro", "Terminal", "Universidade"],
  },
  {
    id: "202",
    nome: "202 - Zona Norte",
    rotas: ["Zona Norte", "Zona Sul"],
  },
  {
    id: "303",
    nome: "303 - Terminal",
    rotas: ["Terminal", "Aeroporto"],
  },
];

export default function AbaMapa() {
  const [onibusSelecionado, setOnibusSelecionado] = useState<
    (typeof onibus)[number] | null
  >(null);

  const [rotaSelecionada, setRotaSelecionada] = useState<string | null>(
    null
  );

  const [pontoSelecionado, setPontoSelecionado] = useState<string | null>(
    null
  );

  function selecionarOnibus(nome: string) {
    const bus = onibus.find((item) => item.nome === nome);

    if (bus) {
      setOnibusSelecionado(bus);
      setRotaSelecionada(null);
      setPontoSelecionado(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mapa de ônibus</Text>

      <View style={styles.seletores}>
        <View style={styles.seletor}>
          <Text style={styles.label}>Ônibus</Text>

          <ListaFiltrada
            titulo="um ônibus"
            opcoes={onibus.map((bus) => bus.nome)}
            selecionado={onibusSelecionado?.nome ?? null}
            onSelecionar={selecionarOnibus}
          />
        </View>

        <View
          style={[
            styles.seletor,
            !onibusSelecionado && styles.desabilitado,
          ]}
          pointerEvents={onibusSelecionado ? "auto" : "none"}
        >
          <Text style={styles.label}>Rota</Text>

          <ListaFiltrada
            titulo="uma rota"
            opcoes={onibusSelecionado?.rotas ?? []}
            selecionado={rotaSelecionada}
            onSelecionar={(rota) => {
              setRotaSelecionada(rota);
              setPontoSelecionado(null);
            }}
          />
        </View>

        <View
          style={[
            styles.seletor,
            (!onibusSelecionado || !rotaSelecionada) &&
              styles.desabilitado,
          ]}
          pointerEvents={
            onibusSelecionado && rotaSelecionada ? "auto" : "none"
          }
        >
          <Text style={styles.label}>Ponto</Text>

          <ListaFiltrada
            titulo="um ponto"
            opcoes={
              onibusSelecionado && rotaSelecionada
                ? ["Ponto inicial", "Ponto intermediário", "Ponto final"]
                : []
            }
            selecionado={pontoSelecionado}
            onSelecionar={setPontoSelecionado}
          />
        </View>
      </View>

      {!onibusSelecionado && (
        <Text style={styles.aviso}>
          Selecione um ônibus para visualizar suas rotas.
        </Text>
      )}

      {onibusSelecionado && !rotaSelecionada && (
        <Text style={styles.aviso}>
          Agora selecione uma rota.
        </Text>
      )}

      {onibusSelecionado && rotaSelecionada && (
        <View style={styles.mapa}>
          <Text style={styles.mapaTitulo}>Mapa</Text>
          <Text>{onibusSelecionado.nome}</Text>
          <Text>Rota: {rotaSelecionada}</Text>
          {pontoSelecionado && <Text>Ponto: {pontoSelecionado}</Text>}
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
  mapa: {
    flex: 1,
    minHeight: 180,
    marginTop: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  mapaTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
