import { useEffect, useState, type ComponentProps } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  KeyboardTypeOptions,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/styles/tab";
import { createUsuarioStyles } from "@/styles/usuario";
import { api } from "@/constants/api";
import { apagarSessao, gravarSessao, lerSessao } from "@/constants/sessao";

type Modo = "ver" | "editar" | "senha";

type Perfil = {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
};

type Icone = ComponentProps<typeof MaterialCommunityIcons>["name"];

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

function Campo({
  label,
  icon,
  value,
  editable,
  bloqueado,
  onChangeText,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  styles,
  iconColor,
}: {
  label: string;
  icon: Icone;
  value: string;
  editable: boolean;
  bloqueado?: boolean;
  onChangeText?: (texto: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences";
  styles: ReturnType<typeof createUsuarioStyles>;
  iconColor: string;
}) {
  return (
    <View style={[styles.campo, bloqueado && styles.campoBloqueado]}>
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      <View style={styles.campoTexto}>
        <Text style={styles.campoLabel}>{label}</Text>
        {editable ? (
          <TextInput
            style={styles.campoValor}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize ?? "sentences"}
          />
        ) : (
          <Text style={styles.campoValor}>{value}</Text>
        )}
      </View>
    </View>
  );
}

export default function UsuarioScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const styles = createUsuarioStyles(colors);
  const router = useRouter();

  const [modo, setModo] = useState<Modo>("ver");
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  function aplicarPerfil(dados: Perfil) {
    setPerfil(dados);
    setNome(dados.nome);
    setEmail(dados.email);
    setTelefone(formatarTelefone(dados.telefone));
  }

  useEffect(() => {
    lerSessao().then(async (sessao) => {
      if (!sessao) {
        router.replace("/entrar");
        return;
      }

      try {
        const resposta = await api.get(`/usuarios/${sessao.usuario.id}`);
        const dados = await resposta.json();
        if (!resposta.ok) {
          setErro(dados.error);
          return;
        }
        aplicarPerfil(dados);
      } catch (error) {
        setErro(error instanceof Error ? error.message : null);
      } finally {
        setCarregando(false);
      }
    });
  }, [router]);

  function abrirEdicao() {
    if (!perfil) return;
    aplicarPerfil(perfil);
    setErro(null);
    setModo("editar");
  }

  function abrirSenha() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErro(null);
    setModo("senha");
  }

  function voltar() {
    if (perfil) aplicarPerfil(perfil);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErro(null);
    setModo("ver");
  }

  async function sair() {
    await apagarSessao();
    router.replace("/entrar");
  }

  async function salvarPerfil() {
    if (!perfil) return;

    setEnviando(true);
    setErro(null);
    try {
      const resposta = await api.put(`/usuarios/${perfil.id}`, {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.replace(/\D/g, ""),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.error);
        return;
      }

      aplicarPerfil({ ...perfil, ...dados });
      const sessao = await lerSessao();
      if (sessao) {
        await gravarSessao({
          token: sessao.token,
          usuario: { ...sessao.usuario, nome: dados.nome, email: dados.email },
        });
      }
      setModo("ver");
    } catch (error) {
      setErro(error instanceof Error ? error.message : null);
    } finally {
      setEnviando(false);
    }
  }

  async function salvarSenha() {
    if (!perfil) return;
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const resposta = await api.patch(`/usuarios/${perfil.id}/senha`, {
        senha: senhaAtual,
        novaSenha,
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.error);
        return;
      }

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setModo("ver");
    } catch (error) {
      setErro(error instanceof Error ? error.message : null);
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const campo = {
    styles,
    iconColor: colors.textSecondary,
  };
  const editando = modo === "editar";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarLetra}>
          {(perfil?.nome ?? nome).trim().charAt(0).toUpperCase() || "?"}
        </Text>
      </View>

      {modo === "senha" ? (
        <>
          <Campo
            {...campo}
            label="Senha atual"
            icon="lock-outline"
            value={senhaAtual}
            editable
            secureTextEntry
            autoCapitalize="none"
            onChangeText={setSenhaAtual}
          />
          <Campo
            {...campo}
            label="Nova senha"
            icon="lock-reset"
            value={novaSenha}
            editable
            secureTextEntry
            autoCapitalize="none"
            onChangeText={setNovaSenha}
          />
          <Campo
            {...campo}
            label="Confirmar senha"
            icon="lock-check-outline"
            value={confirmarSenha}
            editable
            secureTextEntry
            autoCapitalize="none"
            onChangeText={setConfirmarSenha}
          />
        </>
      ) : (
        <>
          <Campo
            {...campo}
            label="Nome completo"
            icon="account-outline"
            value={editando ? nome : (perfil?.nome ?? "")}
            editable={editando}
            onChangeText={setNome}
          />
          <Campo
            {...campo}
            label="CPF"
            icon="card-account-details-outline"
            value={formatarCpf(perfil?.cpf ?? "")}
            editable={false}
            bloqueado={editando}
          />
          <Campo
            {...campo}
            label="Email"
            icon="email-outline"
            value={editando ? email : (perfil?.email ?? "")}
            editable={editando}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
          />
          <Campo
            {...campo}
            label="Telefone celular"
            icon="phone-outline"
            value={editando ? telefone : formatarTelefone(perfil?.telefone ?? "")}
            editable={editando}
            keyboardType="phone-pad"
            onChangeText={(texto) => setTelefone(formatarTelefone(texto))}
          />
        </>
      )}

      {erro && <Text style={styles.erroTexto}>{erro}</Text>}

      {modo === "ver" && (
        <>
          <Pressable style={styles.primaryPillButton} onPress={abrirEdicao} disabled={!perfil}>
            <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
            <Text style={styles.primaryPillButtonText}>Editar Perfil</Text>
          </Pressable>
          <Pressable style={styles.primaryPillButton} onPress={abrirSenha} disabled={!perfil}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryPillButtonText}>Alterar senha</Text>
          </Pressable>
          <Pressable style={styles.dangerPillButton} onPress={sair}>
            <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
            <Text style={styles.dangerPillButtonText}>Sair da Conta</Text>
          </Pressable>
        </>
      )}

      {modo === "editar" && (
        <>
          <Pressable style={styles.primaryPillButton} onPress={salvarPerfil} disabled={enviando}>
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.primaryPillButtonText}>Salvar edição</Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.voltarButton} onPress={voltar} disabled={enviando}>
            <Text style={styles.voltarButtonText}>Voltar</Text>
          </Pressable>
        </>
      )}

      {modo === "senha" && (
        <>
          <Pressable style={styles.primaryPillButton} onPress={salvarSenha} disabled={enviando}>
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.primaryPillButtonText}>Salvar senha</Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.voltarButton} onPress={voltar} disabled={enviando}>
            <Text style={styles.voltarButtonText}>Voltar</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
