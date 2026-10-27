
import { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";

type Props = {
  titulo: string;
  opcoes: string[];
  selecionado: string | null;
  onSelecionar: (valor: string) => void;
};

export default function ListaFiltrada({
  titulo,
  opcoes,
  selecionado,
  onSelecionar,
}: Props) {
  const [visivel, setVisivel] = useState(false);
  const [filtro, setFiltro] = useState("");

  const filtradas = useMemo(
    () =>
      opcoes.filter((opcao) =>
        opcao.toLowerCase().includes(filtro.trim().toLowerCase())
      ),
    [opcoes, filtro]
  );

  function selecionar(valor: string) {
    onSelecionar(valor);
    setVisivel(false);
    setFiltro("");
  }

  return (
    <>
      <Pressable
        style={styles.botao}
        onPress={() => setVisivel(true)}
      >
        <Text>
          {selecionado ?? `Selecionar ${titulo}`}
        </Text>
      </Pressable>

      <Modal
        visible={visivel}
        animationType="slide"
        transparent
        onRequestClose={() => setVisivel(false)}
      >
        <View style={styles.fundo}>
          <View style={styles.modal}>
            <Text style={styles.titulo}>{titulo}</Text>

            <TextInput
              style={styles.input}
              placeholder="Pesquisar..."
              value={filtro}
              onChangeText={setFiltro}
              autoCapitalize="none"
            />

            <FlatList
              data={filtradas}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.vazio}>Nenhum resultado.</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={styles.opcao}
                  onPress={() => selecionar(item)}
                >
                  <Text>{item}</Text>
                </Pressable>
              )}
            />

            <Pressable
              style={styles.fechar}
              onPress={() => setVisivel(false)}
            >
              <Text>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botao: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  fundo: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  modal: {
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  opcao: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  vazio: {
    padding: 14,
    color: "#777",
  },
  fechar: {
    alignItems: "center",
    padding: 12,
    marginTop: 8,
  },
});
