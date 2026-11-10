import { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  useColorScheme,
} from "react-native";
import { Colors } from "@/styles/tab";
import { createListaFiltradaStyles } from "@/styles/listaFiltrada";

type Opcao = {
  id: number;
  nome: string;
};

type Props = {
  titulo: string;
  opcoes: Opcao[];
  selecionado: Opcao | null;
  onSelecionar: (valor: Opcao) => void;
};

export default function ListaFiltrada({
  titulo,
  opcoes,
  selecionado,
  onSelecionar,
}: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createListaFiltradaStyles(colors);

  const [visivel, setVisivel] = useState(false);
  const [filtro, setFiltro] = useState("");

  const filtradas = useMemo(
    () =>
      opcoes.filter((opcao) =>
        opcao.nome.toLowerCase().includes(filtro.trim().toLowerCase())
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
        <Text style={styles.texto}>
          {selecionado?.nome ?? `Selecionar ${titulo}`}
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
              placeholderTextColor={colors.textSecondary}
              value={filtro}
              onChangeText={setFiltro}
              autoCapitalize="none"
            />

            <FlatList
              data={filtradas}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.vazio}>Nenhum resultado.</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={styles.opcao}
                  onPress={() => selecionar(item)}
                >
                  <Text style={styles.texto}>{item.nome}</Text>
                </Pressable>
              )}
            />

            <Pressable
              style={styles.fechar}
              onPress={() => setVisivel(false)}
            >
              <Text style={styles.fecharTexto}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
