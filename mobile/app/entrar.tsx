import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/styles/tab";
import { createCartoesStyles } from "@/styles/cartoes";
import { api } from "@/constants/api";
import { gravarSessao } from "@/constants/sessao";

type Modo = "entrar" | "cadastro";

function formatarCpf(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length <= 9) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  }
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

function formatarTelefone(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : "";
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export default function EntrarScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createCartoesStyles(colors);
  const router = useRouter();

  const [modo, setModo] = useState<Modo>("entrar");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const emailLimpo = email.trim().toLowerCase();
    setErro(null);

    if (modo === "entrar") {
      if (!emailLimpo || senha.length < 8) {
        setErro("Email ou senha inválidos.");
        return;
      }
    } else {
      const cpfLimpo = cpf.replace(/\D/g, "");
      const telefoneLimpo = telefone.replace(/\D/g, "");

      if (!nome.trim()) {
        setErro("O nome é obrigatório.");
        return;
      }
      if (cpfLimpo.length !== 11) {
        setErro("O CPF deve ter exatamente 11 dígitos.");
        return;
      }
      if (!emailLimpo) {
        setErro("O email é obrigatório.");
        return;
      }
      if (telefoneLimpo.length !== 11) {
        setErro("O telefone deve ter exatamente 11 dígitos.");
        return;
      }
      if (senha.length < 8) {
        setErro("A senha deve ter no mínimo 8 caracteres.");
        return;
      }
      if (senha !== confirmarSenha) {
        setErro("As senhas não conferem.");
        return;
      }
    }

    const caminho = modo === "entrar" ? "/auth/login" : "/auth/cadastro";
    const corpo =
      modo === "entrar"
        ? { email: emailLimpo, senha }
        : {
            nome: nome.trim(),
            cpf: cpf.replace(/\D/g, ""),
            email: emailLimpo,
            telefone: telefone.replace(/\D/g, ""),
            senha,
          };

    setEnviando(true);
    try {
      const resposta = await api.post(caminho, corpo);
      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        setErro(dados?.erro ?? "Não foi possível concluir.");
        return;
      }

      await gravarSessao({ token: dados.token, usuario: dados.usuario });
      router.replace("/tabs/viagens");
    } catch (error) {
      setErro(
        error instanceof Error && error.message === "API não configurada."
          ? error.message
          : "Não foi possível conectar à API."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerBadge}>
        <MaterialCommunityIcons name="account" size={22} color={colors.primary} />
        <Text style={styles.headerBadgeText}>
          {modo === "entrar" ? "Entrar" : "Criar conta"}
        </Text>
      </View>

      {modo === "cadastro" && (
        <>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nome completo</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.textSecondary}
              value={nome}
              onChangeText={setNome}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>CPF</Text>
            <TextInput
              style={styles.textInput}
              placeholder="000.000.000-00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={cpf}
              onChangeText={(texto) => setCpf(formatarCpf(texto))}
            />
          </View>
        </>
      )}

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.textInput}
          placeholder="seu@email.com"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {modo === "cadastro" && (
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Telefone celular</Text>
          <TextInput
            style={styles.textInput}
            placeholder="(00) 00000-0000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={(texto) => setTelefone(formatarTelefone(texto))}
          />
        </View>
      )}

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Senha</Text>
        <TextInput
          style={styles.textInput}
          placeholder={modo === "cadastro" ? "Mínimo de 8 caracteres" : "Sua senha"}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      {modo === "cadastro" && (
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Confirmar a senha</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Repita a senha"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />
        </View>
      )}

      {erro && <Text style={styles.erroTexto}>{erro}</Text>}

      <Pressable style={styles.primaryPillButton} onPress={enviar} disabled={enviando}>
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.primaryPillButtonText}>
              {modo === "entrar" ? "Entrar" : "Criar Conta"}
            </Text>
          </>
        )}
      </Pressable>

      <Pressable
        style={styles.secondaryPillButton}
        onPress={() => {
          setErro(null);
          setModo(modo === "entrar" ? "cadastro" : "entrar");
        }}
      >
        <Text style={styles.secondaryPillButtonText}>
          {modo === "entrar" ? "Criar conta" : "Já tenho conta"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
