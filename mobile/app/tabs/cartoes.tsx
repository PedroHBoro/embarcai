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
import * as Haptics from "expo-haptics";
import { Colors } from "@/styles/tab";
import { createCartoesStyles } from "@/styles/cartoes";
import { API_URL } from "@/constants/config";
import { api } from "@/constants/api";
import ListaFiltrada from "@/components/ListaFiltrada";

export type TipoPasse = "NORMAL" | "ESTUDANTE";
export type TipoDescontoEstudante = "TOTAL" | "PARCIAL";

type InstituicaoEnsino = {
  id: number;
  nome: string;
  municipioId: number;
};

export type Cartao = {
  id: number;
  nome: string;
  numeroTccc: string;
  saldo: number;
  perfilId?: number | null;
  tipoPasse: TipoPasse;
  idInstituicaoEnsino?: number | null;
  tipoDescontoEstudante: TipoDescontoEstudante;
  instituicaoEnsino?: (InstituicaoEnsino & { municipio?: { id: number; nome: string } }) | null;
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
  const [instituicoes, setInstituicoes] = useState<InstituicaoEnsino[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroInstituicoes, setErroInstituicoes] = useState<string | null>(null);

  const [modoTela, setModoTela] = useState<"lista" | "formulario">("lista");
  const [cartaoEditando, setCartaoEditando] = useState<Cartao | null>(null);

  const [nfcAtivo, setNfcAtivo] = useState(false);
  const [cartaoNfcId, setCartaoNfcId] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [passeEstudantil, setPasseEstudantil] = useState(false);
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState<InstituicaoEnsino | null>(null);
  const [tipoDescontoEstudante, setTipoDescontoEstudante] = useState<TipoDescontoEstudante>("TOTAL");
  const [comprovanteResidencia, setComprovanteResidencia] = useState("");
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);

  const [cartaoSaldoModal, setCartaoSaldoModal] = useState<Cartao | null>(null);
  const [consultandoSaldo, setConsultandoSaldo] = useState(false);

  const [cartaoParaRemover, setCartaoParaRemover] = useState<Cartao | null>(
    null
  );

  const [cartaoNfcModal, setCartaoNfcModal] = useState<Cartao | null>(null);
  const [processandoNfc, setProcessandoNfc] = useState(false);
  const [resultadoNfc, setResultadoNfc] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);

  async function carregarInstituicoes() {
    if (!API_URL) {
      setErroInstituicoes("API não configurada.");
      return;
    }

    try {
      const resposta = await api.get("/instituicoes-ensino");
      if (!resposta.ok) {
        if (resposta.status === 401) {
          throw new Error("Sessão ausente ou expirada. Entre novamente na sua conta.");
        }
        throw new Error(`A API respondeu HTTP ${resposta.status} ao buscar instituições.`);
      }
      setInstituicoes((await resposta.json()) as InstituicaoEnsino[]);
      setErroInstituicoes(null);
    } catch (e) {
      setErroInstituicoes(e instanceof Error ? e.message : "Falha ao carregar instituições.");
    }
  }

  useEffect(() => {
    async function carregarCartoes() {
      if (!API_URL) {
        setErro("API não configurada. Verifique EXPO_PUBLIC_API_LOCAL.");
        return;
      }
      setCarregando(true);
      setErro(null);

      try {
        const resposta = await api.get("/cartoes");
        if (!resposta.ok) {
          const body = await resposta.json().catch(() => null);
          if (resposta.status === 401) {
            throw new Error("Sessão ausente ou expirada. Entre novamente na sua conta.");
          }
          throw new Error(body?.erro ?? `A API respondeu HTTP ${resposta.status}.`);
        }
        const dados = (await resposta.json()) as Cartao[];
        setCartoes(dados);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Falha de conexão ao carregar seus cartões.");
      } finally {
        setCarregando(false);
      }
    }

    carregarCartoes();
    carregarInstituicoes();
  }, []);

  function abrirCadastro() {
    void carregarInstituicoes();
    setCartaoEditando(null);
    setNome("");
    setNumero("");
    setPasseEstudantil(false);
    setInstituicaoSelecionada(null);
    setTipoDescontoEstudante("TOTAL");
    setComprovanteResidencia("");
    setErroFormulario(null);
    setModoTela("formulario");
  }

  function abrirEdicao(cartao: Cartao) {
    void carregarInstituicoes();
    setCartaoEditando(cartao);
    setNome(cartao.nome);
    setNumero(cartao.numeroTccc);
    setPasseEstudantil(cartao.tipoPasse === "ESTUDANTE");
    setInstituicaoSelecionada(
      instituicoes.find((item) => item.id === cartao.idInstituicaoEnsino) ??
        cartao.instituicaoEnsino ??
        null
    );
    setTipoDescontoEstudante(cartao.tipoDescontoEstudante ?? "TOTAL");
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
      (!instituicaoSelecionada || !comprovanteResidencia.trim())
    ) {
      setErroFormulario(
        "Preencha a Instituição de Ensino e o Comprovante de residência."
      );
      return;
    }

    setErroFormulario(null);

    if (!API_URL) {
      setErroFormulario("A API não está configurada; o cartão não foi salvo.");
      return;
    }

    const payload = {
      nome: nome.trim(),
      numeroTccc: numeroLimpo,
      tipoPasse: (passeEstudantil ? "ESTUDANTE" : "NORMAL") as TipoPasse,
      idInstituicaoEnsino: passeEstudantil ? instituicaoSelecionada?.id : null,
      tipoDescontoEstudante: passeEstudantil ? tipoDescontoEstudante : "TOTAL",
      comprovanteResidencia: passeEstudantil
        ? comprovanteResidencia.trim()
        : null,
    };

    if (cartaoEditando) {
      try {
        const resposta = await api.put(
          `/cartoes/${cartaoEditando.id}`,
          payload
        );
        const body = resposta.ok ? null : await resposta.json().catch(() => null);
        if (!resposta.ok) {
          setErroFormulario(body?.erro ?? `Não foi possível salvar o cartão (HTTP ${resposta.status}).`);
          return;
        }
        const atualizado = (await resposta.json()) as Cartao;
        setCartoes((lista) =>
          lista.map((c) => (c.id === atualizado.id ? atualizado : c))
        );
        setModoTela("lista");
      } catch (e) {
        setErroFormulario(e instanceof Error ? e.message : "Falha de conexão ao salvar o cartão.");
      }
    } else {
      try {
        const resposta = await api.post("/cartoes", { ...payload, saldo: 0 });
        const body = resposta.ok ? null : await resposta.json().catch(() => null);
        if (!resposta.ok) {
          setErroFormulario(body?.erro ?? `Não foi possível cadastrar o cartão (HTTP ${resposta.status}).`);
          return;
        }
        const criado = (await resposta.json()) as Cartao;
        setCartoes((lista) => [...lista, criado]);
        setModoTela("lista");
      } catch (e) {
        setErroFormulario(e instanceof Error ? e.message : "Falha de conexão ao cadastrar o cartão.");
      }
    }
  }

  async function confirmarRemocaoCartao() {
    if (!cartaoParaRemover) return;
    const id = cartaoParaRemover.id;

    try {
      const resposta = await api.delete(`/cartoes/${id}`);
      if (!resposta.ok) {
        setErro(`Não foi possível remover o cartão (HTTP ${resposta.status}).`);
        return;
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha de conexão ao remover o cartão.");
      return;
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

  function abrirModalNfc(cartao: Cartao) {
    setNfcAtivo(true);
    setCartaoNfcId(cartao.id);
    setResultadoNfc(
      cartao.saldo < 0
        ? {
            tipo: "erro",
            texto: "Cartão sem saldo suficiente. Regularize o saldo antes de aproximar novamente.",
          }
        : null
    );
    setCartaoNfcModal(cartao);
    Haptics.selectionAsync().catch(() => {});
  }

  async function usarNfcNaCatraca() {
    if (!cartaoNfcModal || processandoNfc) return;
    if (cartaoNfcModal.saldo < 0) {
      setResultadoNfc({
        tipo: "erro",
        texto: "Cartão sem saldo suficiente. Regularize o saldo antes de aproximar novamente.",
      });
      return;
    }

    setProcessandoNfc(true);
    setResultadoNfc(null);

    try {
      if (!API_URL) {
        throw new Error("API não configurada; não foi possível registrar a viagem.");
      }

      const resposta = await api.post(
        `/cartoes/${cartaoNfcModal.id}/uso-nfc`,
        {}
      );
      const dados = await resposta.json().catch(() => null);
      if (!resposta.ok) {
        throw new Error(dados?.erro ?? `A API respondeu HTTP ${resposta.status}.`);
      }

      const atualizado = {
        ...cartaoNfcModal,
        ...dados.cartao,
      } as Cartao;
      setCartoes((lista) =>
        lista.map((c) => (c.id === atualizado.id ? atualizado : c))
      );
      setCartaoNfcModal(atualizado);
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
      setResultadoNfc({
        tipo: "sucesso",
        texto: [
          `Viagem registrada: ${dados.pontoRota.rota.linha.nome} · ${dados.pontoRota.ponto.nome}.`,
          `Débito: ${formatarMoeda(dados.saldoGasto)}.`,
          dados.tipoDesconto === "TOTAL"
            ? "Desconto total aplicado."
            : dados.tipoDesconto === "PARCIAL"
              ? "Desconto parcial aplicado."
              : null,
          atualizado.saldo < 0
            ? "Cartão sem saldo suficiente. Regularize o saldo antes de aproximar novamente."
            : null,
        ].filter(Boolean).join(" "),
      });
    } catch (e) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      ).catch(() => {});
      setResultadoNfc({
        tipo: "erro",
        texto: e instanceof Error ? e.message : "Não foi possível registrar a viagem.",
      });
    } finally {
      setProcessandoNfc(false);
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
              onValueChange={(ativo) => {
                setPasseEstudantil(ativo);
                if (ativo) void carregarInstituicoes();
              }}
              trackColor={{ false: "#79747E", true: "#6750A4" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {passeEstudantil && (
            <>
              <View style={{ marginBottom: 18 }}>
                <Text style={styles.inputLabel}>Instituição de Ensino</Text>
                <ListaFiltrada
                  titulo="uma instituição"
                  opcoes={instituicoes}
                  selecionado={instituicaoSelecionada}
                  onSelecionar={(opcao) =>
                    setInstituicaoSelecionada(
                      instituicoes.find((item) => item.id === opcao.id) ?? null
                    )
                  }
                />
                {erroInstituicoes && (
                  <Text style={styles.erroTexto}>{erroInstituicoes}</Text>
                )}
              </View>

              <View style={styles.switchCard}>
                <Text style={styles.switchLabel}>
                  Desconto total
                </Text>
                <Switch
                  value={tipoDescontoEstudante === "TOTAL"}
                  onValueChange={(ativo) =>
                    setTipoDescontoEstudante(ativo ? "TOTAL" : "PARCIAL")
                  }
                  trackColor={{ false: "#79747E", true: "#6750A4" }}
                  thumbColor="#FFFFFF"
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
                  Instituição: {cartao.instituicaoEnsino.nome} · Desconto {cartao.tipoDescontoEstudante === "TOTAL" ? "integral" : "parcial"}
                </Text>
              )}

              <View style={styles.cartaoActions}>
                <Pressable
                  style={[
                    styles.chipButton,
                    nfcSelecionado && styles.chipButtonAtivo,
                  ]}
                  onPress={() => abrirModalNfc(cartao)}
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
            onValueChange={(ativo) => {
              setNfcAtivo(ativo);
              if (ativo && cartaoNfcId === null && cartoes.length > 0) {
                setCartaoNfcId(cartoes[0].id);
              } else if (!ativo) {
                setCartaoNfcId(null);
              }
            }}
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

      <Modal
        visible={cartaoNfcModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCartaoNfcModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.nfcPulseCircle}>
              <MaterialCommunityIcons
                name="contactless-payment"
                size={46}
                color={colors.primary}
              />
            </View>

            <Text style={[styles.modalTitulo, { textAlign: "center" }]}>
              Aproxime do leitor
            </Text>
            <Text style={[styles.modalSubtitulo, { textAlign: "center" }]}>
              {cartaoNfcModal?.nome} •{" "}
              {cartaoNfcModal?.tipoPasse === "ESTUDANTE"
                ? "Passe estudantil"
                : "Passe comum"}
            </Text>

            <View style={styles.modalSaldoDestaque}>
              <Text style={styles.modalSaldoLabel}>Saldo Disponível</Text>
              <Text style={styles.modalSaldoValor}>
                {formatarMoeda(cartaoNfcModal?.saldo ?? 0)}
              </Text>
            </View>

            {resultadoNfc && (
              <Text
                style={
                  resultadoNfc.tipo === "sucesso" &&
                  !(cartaoNfcModal?.saldo !== undefined && cartaoNfcModal.saldo < 0)
                    ? styles.sucessoTexto
                    : styles.erroTexto
                }
              >
                {resultadoNfc.texto}
              </Text>
            )}

            <Pressable
              style={[
                styles.primaryPillButton,
                (processandoNfc || (cartaoNfcModal?.saldo ?? 0) < 0) && { opacity: 0.55 },
              ]}
              onPress={usarNfcNaCatraca}
              disabled={processandoNfc || (cartaoNfcModal?.saldo ?? 0) < 0}
            >
              {processandoNfc ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="cellphone-nfc"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.primaryPillButtonText}>
                    Aproxime do leitor
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.secondaryPillButton}
              onPress={() => setCartaoNfcModal(null)}
            >
              <Text style={styles.secondaryPillButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
