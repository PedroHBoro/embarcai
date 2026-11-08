import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const CHAVE = "sessao";

function lerBruto(): Promise<string | null> {
  if (Platform.OS === "web") {
    return Promise.resolve(localStorage.getItem(CHAVE));
  }
  return SecureStore.getItemAsync(CHAVE);
}

function gravarBruto(valor: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(CHAVE, valor);
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(CHAVE, valor);
}

function apagarBruto(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(CHAVE);
    return Promise.resolve();
  }
  return SecureStore.deleteItemAsync(CHAVE);
}

export type Sessao = {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
};

export async function lerSessao(): Promise<Sessao | null> {
  const bruto = await lerBruto();
  if (!bruto) return null;

  try {
    return JSON.parse(bruto) as Sessao;
  } catch {
    return null;
  }
}

export async function gravarSessao(sessao: Sessao) {
  await gravarBruto(JSON.stringify(sessao));
}

export async function apagarSessao() {
  await apagarBruto();
}
