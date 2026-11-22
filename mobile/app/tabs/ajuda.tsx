import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/styles/tab";
import { createCartoesStyles } from "@/styles/cartoes";

type TopicoAjuda = {
  id: string;
  icone: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  titulo: string;
  resumo: string;
  resposta: string;
};

const TOPICOS_AJUDA: TopicoAjuda[] = [
  {
    id: "linhas",
    icone: "map-marker-path",
    titulo: "Como consultar linhas, pontos e itinerários?",
    resumo: "Visualização no mapa e horários por tipo de dia",
    resposta:
      "Na aba Linhas, selecione primeiro uma Linha e depois uma Rota para carregar os pontos de parada no mapa interativo. Você também pode tocar em 'Ver itinerário' para consultar a ordem das paradas e os horários em Dias úteis, Sábados ou Domingos.",
  },
  {
    id: "compatibilidade",
    icone: "check-decagram-outline",
    titulo: "Como funciona a compatibilidade de cartões?",
    resumo: "Passe comum vs. Passe estudante entre municípios",
    resposta:
      "Ao selecionar uma linha na aba Linhas e tocar em 'Ver compatibilidade', o aplicativo verifica quais dos seus cartões são aceitos naquela linha. Cartões de Passe Comum são compatíveis com todas as linhas, enquanto cartões de Passe Estudante são compatíveis apenas com linhas do mesmo município da sua Instituição de Ensino.",
  },
  {
    id: "cartoes",
    icone: "credit-card-chip-outline",
    titulo: "Como cadastrar ou atualizar meu cartão?",
    resumo: "Regras de numeração e passe estudantil",
    resposta:
      "Na aba Cartões, toque no botão '+' no canto inferior direito. Informe um apelido para o cartão e o número TCCC (de 8 a 10 dígitos numéricos). Para passe estudantil, ative a chave correspondente, selecione sua Instituição de Ensino, o tipo de desconto e o comprovante de residência.",
  },
  {
    id: "saldo",
    icone: "cash-multiple",
    titulo: "Como consultar meu saldo disponível?",
    resumo: "Atualização em tempo real do saldo do cartão",
    resposta:
      "Na aba Cartões, toque sobre a faixa 'Saldo disponível' ou no botão 'Consultar Saldo' dentro do cartão desejado para buscar o valor atualizado diretamente no sistema.",
  },
  {
    id: "nfc",
    icone: "cellphone-nfc",
    titulo: "Como usar o pagamento por aproximação (NFC)?",
    resumo: "Ativação do NFC e embarque direto na catraca",
    resposta:
      "Na aba Cartões, ative a chave 'Ativar NFC' no final da tela e toque no botão 'NFC' do cartão que deseja utilizar para selecioná-lo como ativo (destacado em roxo). Ao aproximar o celular da catraca, a tarifa correspondente ao seu tipo de passe será validada e descontada do saldo disponível.",
  },
  {
    id: "perfil",
    icone: "account-cog-outline",
    titulo: "Como editar meu perfil ou alterar minha senha?",
    resumo: "Atualização de dados cadastrais e segurança",
    resposta:
      "Na aba Usuario, toque em 'Editar Perfil' para atualizar seu nome, e-mail ou telefone celular (o CPF permanece fixo por segurança). Para trocar sua senha de acesso, toque em 'Alterar senha', informe a senha atual e defina a nova senha com no mínimo 8 caracteres.",
  },
];

export default function AjudaScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createCartoesStyles(colors);

  const [abertoId, setAbertoId] = useState<string | null>("linhas");

  function alternarTopico(id: string) {
    setAbertoId((atual) => (atual === id ? null : id));
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.headerBadgeText}>Central de Ajuda</Text>
        </View>

        {TOPICOS_AJUDA.map((topico) => {
          const expandido = abertoId === topico.id;

          return (
            <Pressable
              key={topico.id}
              style={styles.cartaoCard}
              onPress={() => alternarTopico(topico.id)}
            >
              <View style={styles.cartaoHeaderRow}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                  }}
                >
                  <MaterialCommunityIcons
                    name={topico.icone}
                    size={24}
                    color={colors.primary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.cartaoTitulo,
                        { fontSize: 16, marginBottom: 2 },
                      ]}
                    >
                      {topico.titulo}
                    </Text>
                    <Text
                      style={[
                        styles.cartaoNumero,
                        { marginBottom: 0, letterSpacing: 0 },
                      ]}
                    >
                      {topico.resumo}
                    </Text>
                  </View>
                </View>

                <MaterialCommunityIcons
                  name={expandido ? "chevron-up" : "chevron-down"}
                  size={22}
                  color={colors.textSecondary}
                />
              </View>

              {expandido && (
                <View
                  style={[
                    styles.saldoContainer,
                    { marginTop: 12, marginBottom: 0 },
                  ]}
                >
                  <Text
                    style={[
                      styles.avisoTexto,
                      { textAlign: "left", color: colors.text, flex: 1 },
                    ]}
                  >
                    {topico.resposta}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}

        <View style={styles.emptyCard}>
          <MaterialCommunityIcons
            name="bus-clock"
            size={34}
            color={colors.primary}
          />
          <Text style={styles.emptyTitle}>Atendimento ao Passageiro</Text>
          <Text style={styles.avisoTexto}>
            Terminal Intermodal Urbano de Maringá{"\n"}
            Seg a Sex: 07h30 às 18h00 • Sáb: 08h00 às 12h00{"\n"}
            Projeto Embarcaí — Construção de Software (UEM)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
