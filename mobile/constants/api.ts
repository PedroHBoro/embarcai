import { API_URL } from "./config";
import { lerSessao } from "./sessao";

class Api {
  private async headers(extra?: HeadersInit): Promise<Headers> {
    const headers = new Headers(extra);
    const sessao = await lerSessao();

    if (sessao?.token) {
      headers.set("Authorization", `Bearer ${sessao.token}`);
    }

    return headers;
  }

  async request(caminho: string, init: RequestInit = {}): Promise<Response> {
    if (!API_URL) {
      throw new Error("API não configurada.");
    }

    const headers = await this.headers(init.headers);
    return fetch(`${API_URL}${caminho}`, { ...init, headers });
  }

  get(caminho: string) {
    return this.request(caminho);
  }

  post(caminho: string, body: unknown) {
    return this.request(caminho, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  put(caminho: string, body: unknown) {
    return this.request(caminho, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  delete(caminho: string) {
    return this.request(caminho, { method: "DELETE" });
  }
}

export const api = new Api();
