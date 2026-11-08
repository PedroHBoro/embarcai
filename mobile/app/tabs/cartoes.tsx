import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  Modal,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/styles/tab";
import { createCartoesStyles } from "@/styles/cartoes";
import { API_URL } from "@/constants/config";
import { api } from "@/constants/api";

export type TipoPasse = "NORMAL" | "ESTUDANTE";

export type Cartao = {
  id: number;
  nome: string;
  numeroTccc: string;
  saldo: number;
  perfilId?: number | null;
  tipoPasse: TipoPasse;
  instituicaoEnsino?: string | null;
  comprovanteResidencia?: string | null;
};

const FORMATO_NUMERO_CARTAO = /^\d{8,10}$/;

function formatarNumeroMascarado(numero: string): string {
  const limpo = numero.replace(/\s+/g, "");
  if (limpo.length <= 4) {
    return limpo;
  }
  return `${"*".repeat(limpo.length - 4)}${limpo.slice(-4)}`;
}

function formatarMoeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

export default function CartoesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createCartoesStyles(colors);

  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [modoTela, setModoTela] = useState<"lista" | "formulario">("lista");
  const [cartaoEditando, setCartaoEditando] = useState<Cartao | null>(null);

  const [nfcAtivo, setNfcAtivo] = useState(false);
  const [cartaoNfcId, setCartaoNfcId] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [passeEstudantil, setPasseEstudantil] = useState(false);
  const [instituicaoEnsino, setInstituicaoEnsino] = useState("");
  const [comprovanteResidencia, setComprovanteResidencia] = useState("");
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);

  const [cartaoSaldoModal, setCartaoSaldoModal] = useState<Cartao | null>(null);
  const [consultandoSaldo, setConsultandoSaldo] = useState(false);

  const [cartaoParaRemover, setCartaoParaRemover] = useState<Cartao | null>(
    null
  );

  useEffect(() => {
    async function carregarCartoes() {
      if (!API_URL) return;
      setCarregando(true);
      setErro(null);

      try {
        const resposta = await api.get("/cartoes");
        if (!resposta.ok) {
          throw new Error(`Erro HTTP ${resposta.status}`);
        }
        const dados = (await resposta.json()) as Cartao[];
        setCartoes(dados);
      } catch {

      } finally {
        setCarregando(false);
      }
    }

    carregarCartoes();
  }, []);

  function abrirCadastro() {
    setCartaoEditando(null);
    setNome("");
    setNumero("");
    setPasseEstudantil(false);
    setInstituicaoEnsino("");
    setComprovanteResidencia("");
    setErroFormulario(null);
    setModoTela("formulario");
  }

  function abrirEdicao(cartao: Cartao) {
    setCartaoEditando(cartao);
    setNome(cartao.nome);
    setNumero(cartao.numeroTccc);
    setPasseEstudantil(cartao.tipoPasse === "ESTUDANTE");
    setInstituicaoEnsino(cartao.instituicaoEnsino ?? "");
    setComprovanteResidencia(cartao.comprovanteResidencia ?? "");
    setErroFormulario(null);
    setModoTela("formulario");
  }

  async function salvarCartao() {
    if (!nome.trim()) {
      setErroFormulario("Informe o apelido/nome do cartão.");
      return;
    }

    const numeroLimpo = numero.replace(/\s+/g, "");
    if (!numeroLimpo) {
      setErroFormulario("Informe o número do cartão.");
      return;
    }

    if (!FORMATO_NUMERO_CARTAO.test(numeroLimpo)) {
      setErroFormulario(
        "Formato inválido. O número do cartão deve conter apenas dígitos (entre 8 e 10 números)."
      );
      return;
    }

    const duplicadoLocal = cartoes.some(
      (c) =>
        c.numeroTccc === numeroLimpo &&
        (!cartaoEditando || c.id !== cartaoEditando.id)
    );
    if (duplicadoLocal) {
      setErroFormulario("Já existe um cartão cadastrado com este número.");
      return;
    }

    if (
      passeEstudantil &&
      (!instituicaoEnsino.trim() || !comprovanteResidencia.trim())
    ) {
      setErroFormulario(
        "Preencha a Instituição de Ensino e o Comprovante de residência."
      );
      return;
    }

    setErroFormulario(null);

    const payload = {
      nome: nome.trim(),
      numeroTccc: numeroLimpo,
      tipoPasse: (passeEstudantil ? "ESTUDANTE" : "NORMAL") as TipoPasse,
      instituicaoEnsino: passeEstudantil ? instituicaoEnsino.trim() : null,
      comprovanteResidencia: passeEstudantil
        ? comprovanteResidencia.trim()
        : null,
    };

    if (cartaoEditando) {
      try {
        if (API_URL) {
          const resposta = await api.put(
            `/cartoes/${cartaoEditando.id}`,
            payload
          );
          if (resposta.status === 409 || resposta.status === 400) {
            const body = await resposta.json();
            setErroFormulario(body.erro ?? "Erro ao validar dados do cartão.");
            return;
          }
          if (resposta.ok) {
            const atualizado = (await resposta.json()) as Cartao;
            setCartoes((lista) =>
              lista.map((c) => (c.id === atualizado.id ? atualizado : c))
            );
            setModoTela("lista");
            return;
          }
        }
      } catch {

      }

      setCartoes((lista) =>
        lista.map((c) =>
          c.id === cartaoEditando.id ? { ...c, ...payload } : c
        )
      );
      setModoTela("lista");
    } else {
      try {
        if (API_URL) {
          const resposta = await api.post("/cartoes", { ...payload, saldo: 0 });
          if (resposta.status === 409 || resposta.status === 400) {
            const body = await resposta.json();
            setErroFormulario(body.erro ?? "Erro ao validar dados do cartão.");
            return;
          }
          if (resposta.ok) {
            const criado = (await resposta.json()) as Cartao;
            setCartoes((lista) => [...lista, criado]);
            setModoTela("lista");
            return;
          }
        }
      } catch {

      }

      const novoId =
        cartoes.length > 0 ? Math.max(...cartoes.map((c) => c.id)) + 1 : 1;
      const novoCartao: Cartao = {
        id: novoId,
        saldo: 0,
        ...payload,
      };
      setCartoes((lista) => [...lista, novoCartao]);
      setModoTela("lista");
    }
  }

  async function confirmarRemocaoCartao() {
    if (!cartaoParaRemover) return;
    const id = cartaoParaRemover.id;

    try {
      if (API_URL) {
        await api.delete(`/cartoes/${id}`);
      }
    } catch {
 
    }

    setCartoes((lista) => lista.filter((c) => c.id !== id));
    if (cartaoNfcId === id) {
      setCartaoNfcId(null);
    }
    setCartaoParaRemover(null);
  }

  async function consultarSaldoCartao(cartao: Cartao) {
    setCartaoSaldoModal(cartao);

    if (!API_URL) return;
    setConsultandoSaldo(true);

    try {
      const resposta = await api.get(`/cartoes/${cartao.id}/saldo`);
      if (resposta.ok) {
        const dadosSaldo = (await resposta.json()) as Pick<
          Cartao,
          "id" | "saldo"
        >;
        setCartoes((lista) =>
          lista.map((c) =>
            c.id === cartao.id ? { ...c, saldo: dadosSaldo.saldo } : c
          )
        );
        setCartaoSaldoModal((atual) =>
          atual && atual.id === cartao.id
            ? { ...atual, saldo: dadosSaldo.saldo }
            : atual
        );
      }
    } catch {

    } finally {
      setConsultandoSaldo(false);
    }
  }

  if (modoTela === "formulario") {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerBadge}>
            <MaterialCommunityIcons
              name="credit-card-chip-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={styles.headerBadgeText}>
              {cartaoEditando ? "Atualizar cartão" : "Cadastrar cartão"}
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.textInput}
              placeholder="nome do cartao"
              placeholderTextColor={colors.textSecondary}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Numero (8 a 10 dígitos)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="..."
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={10}
              value={numero}
              onChangeText={(texto) => setNumero(texto.replace(/\D/g, ""))}
            />
          </View>

          <View style={styles.switchCard}>
            <Text style={styles.switchLabel}>
              Passe estudantil ({passeEstudantil ? "Estudante" : "Comum"})
            </Text>
            <Switch
              value={passeEstudantil}
              onValueChange={setPasseEstudantil}
              trackColor={{ false: "#79747E", true: "#6750A4" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {passeEstudantil && (
            <>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Instituição de Ensino</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="UEM"
                  placeholderTextColor={colors.textSecondary}
                  value={instituicaoEnsino}
                  onChangeText={setInstituicaoEnsino}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Comprovante de residência</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="iptu"
                  placeholderTextColor={colors.textSecondary}
                  value={comprovanteResidencia}
                  onChangeText={setComprovanteResidencia}
                />
              </View>
            </>
          )}

          {erroFormulario && (
            <Text style={styles.erroTexto}>{erroFormulario}</Text>
          )}

          <Pressable style={styles.primaryPillButton} onPress={salvarCartao}>
            <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.primaryPillButtonText}>
              {cartaoEditando ? "Salvar" : "Cadastrar"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryPillButton}
            onPress={() => setModoTela("lista")}
          >
            <Text style={styles.secondaryPillButtonText}>Voltar</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {carregando && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginBottom: 16 }}
          />
        )}

        {erro && <Text style={styles.erroTexto}>{erro}</Text>}

        {cartoes.length === 0 && !carregando && (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="credit-card-plus-outline"
              size={40}
              color={colors.primary}
            />
            <Text style={styles.emptyTitle}>Nenhum cartão cadastrado</Text>
            <Text style={styles.avisoTexto}>
              Toque no botão + no canto inferior direito para cadastrar seu
              primeiro cartão de transporte.
            </Text>
          </View>
        )}

        {cartoes.map((cartao) => {
          const nfcSelecionado = nfcAtivo && cartaoNfcId === cartao.id;
          const labelTipo =
            cartao.tipoPasse === "ESTUDANTE" ? "Estudante" : "Comum";

          return (
            <View key={cartao.id} style={styles.cartaoCard}>
              <View style={styles.cartaoHeaderRow}>
                <Text style={styles.cartaoTitulo}>{cartao.nome}</Text>
                <View style={styles.tipoBadge}>
                  <Text style={styles.tipoBadgeText}>{labelTipo}</Text>
                </View>
              </View>

              <Text style={styles.cartaoNumero}>
                {formatarNumeroMascarado(cartao.numeroTccc)}
              </Text>

              <Pressable
                style={styles.saldoContainer}
                onPress={() => consultarSaldoCartao(cartao)}
              >
                <Text style={styles.saldoLabel}>
                  Saldo disponível (toque para consultar)
                </Text>
                <Text style={styles.saldoValor}>
                  {formatarMoeda(cartao.saldo)}
                </Text>
              </Pressable>

              {cartao.tipoPasse === "ESTUDANTE" && cartao.instituicaoEnsino && (
                <Text style={styles.cartaoInfoEstudante}>
                  Instituição: {cartao.instituicaoEnsino}
                </Text>
              )}

              <View style={styles.cartaoActions}>
                <Pressable
                  style={[
                    styles.chipButton,
                    nfcSelecionado && styles.chipButtonAtivo,
                  ]}
                  onPress={() => setCartaoNfcId(cartao.id)}
                >
                  <Text
                    style={[
                      styles.chipButtonText,
                      nfcSelecionado && styles.chipButtonTextAtivo,
                    ]}
                  >
                    NFC
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.chipButton}
                  onPress={() => consultarSaldoCartao(cartao)}
                >
                  <Text style={styles.chipButtonText}>Consultar Saldo</Text>
                </Pressable>

                <Pressable
                  style={styles.chipButton}
                  onPress={() => abrirEdicao(cartao)}
                >
                  <Text style={styles.chipButtonText}>Atualizar Cadastro</Text>
                </Pressable>

                <Pressable
                  style={styles.chipButtonDanger}
                  onPress={() => setCartaoParaRemover(cartao)}
                >
                  <Text style={styles.chipButtonDangerText}>Remover</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={styles.switchCard}>
          <Text style={styles.switchLabel}>Ativar NFC</Text>
          <Switch
            value={nfcAtivo}
            onValueChange={setNfcAtivo}
            trackColor={{ false: "#79747E", true: "#6750A4" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={abrirCadastro}>
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={cartaoSaldoModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCartaoSaldoModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {cartaoSaldoModal?.nome ?? "Cartão"}
            </Text>
            <Text style={styles.modalSubtitulo}>
              Tipo:{" "}
              {cartaoSaldoModal?.tipoPasse === "ESTUDANTE"
                ? "Estudante"
                : "Comum"}{" "}
              •{" "}
              {cartaoSaldoModal
                ? formatarNumeroMascarado(cartaoSaldoModal.numeroTccc)
                : ""}
            </Text>

            <View style={styles.modalSaldoDestaque}>
              <Text style={styles.modalSaldoLabel}>Saldo Disponível</Text>
              {consultandoSaldo ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.modalSaldoValor}>
                  {formatarMoeda(cartaoSaldoModal?.saldo ?? 0)}
                </Text>
              )}
            </View>

            <Pressable
              style={styles.primaryPillButton}
              onPress={() => setCartaoSaldoModal(null)}
            >
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              <Text style={styles.primaryPillButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={cartaoParaRemover !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCartaoParaRemover(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Remover cartão?</Text>
            <Text style={styles.modalSubtitulo}>
              Tem certeza que deseja remover o cartão &quot;
              {cartaoParaRemover?.nome}&quot; (
              {cartaoParaRemover
                ? formatarNumeroMascarado(cartaoParaRemover.numeroTccc)
                : ""}
              )? Essa ação não poderá ser desfeita.
            </Text>

            <Pressable
              style={styles.dangerPillButton}
              onPress={confirmarRemocaoCartao}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.dangerPillButtonText}>Confirmar Remoção</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryPillButton}
              onPress={() => setCartaoParaRemover(null)}
            >
              <Text style={styles.secondaryPillButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}