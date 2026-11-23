# Embarcai
> O projeto Embarcai tem como objetivo desenvolver uma solução digital integrada para melhorar a experiência do passageiro no transporte público em Maringá. Atualmente, embora existam soluções digitais voltadas ao transporte público em Maringá, a experiência do passageiro ainda apresenta limitações significativas devido à ausência de funcionalidades essenciais integradas. Nas plataformas existentes, falta uma abordagem centralizada, o que afeta a autonomia e a eficiência nos deslocamentos.

## Identificação do integrantes da equipe
> - **Nome:** Guilherme Mayer Chamse Ddine **RA:** 140656
>  - **Nome:** Yuri Gabriel Leandro de Paula **RA:** 139460
>  - **Nome:** Pedro Henrique de Oliveira Bóro **RA:** 140085


## Contexto do projeto
> Esse projeto é para matéria de Construção de Software da Universidade Estadual de Maringá.

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado na máquina:
- **Node.js** (v20 ou superior) e **npm**
- **Docker** e **Docker Compose** (com o Docker Desktop em execução para o banco PostgreSQL)
- **Expo Go** instalado no celular (opcional, caso queira testar no dispositivo físico) ou emulador Android/iOS / navegador Web
- **Stripe CLI**, só para testar a recarga ([instalação](https://docs.stripe.com/stripe-cli))

## 1. Como executar o Backend (`api`)

1. Acesse a pasta da API e instale as dependências:
   ```bash
   cd api
   npm install
   ```

2. Crie o arquivo `.env` a partir do `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(No Windows PowerShell: `Copy-Item .env.example .env`)*

   O arquivo `.env` padrão já está configurado para o banco do Docker:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://embarcai_user:senha123@localhost:5432/embarcai"
   POSTGRES_USER="embarcai_user"
   POSTGRES_PASSWORD="senha123"
   POSTGRES_DB="embarcai"
   JWT_SECRET="troque-este-segredo"
   JWT_TTS=86400
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   API_PUBLIC_URL=http://192.168.1.7:3000
   ```

3. Suba o banco de dados PostgreSQL via Docker:
   ```bash
   npm run db:up
   ```

4. Aplique as migrations do Prisma e gere o Prisma Client:
   ```bash
   npm run db:migrate
   npm run db:generate
   ```
   *(Caso precise limpar/resetar o banco de desenvolvimento do zero, execute `npx prisma migrate reset` e depois `npm run db:generate`).*

5. Inicie o servidor de desenvolvimento da API:
   ```bash
   npm run dev
   ```
   A API ficará disponível em `http://localhost:3000` (você pode testar o status em `http://localhost:3000/health`).

### Populando dados de teste
Para visualizar ou inserir linhas, rotas, pontos, itinerários e saldo de cartões pelo navegador, abra um novo terminal na pasta `api` e execute:
```bash
npx prisma studio
```

### Populando dados de teste (Opcional)
Para inserir um caso de teste rápido com **Municípios**, **Instituições de Ensino**, **Linhas**, **Rotas**, **Pontos** e **Itinerários**, copie e cole o comando abaixo no terminal dentro da pasta `api`:

```bash
@"
TRUNCATE TABLE "Itinerario", "Ponto", "Rota", "Linha", "InstituicaoEnsino", "Municipio" RESTART IDENTITY CASCADE;

INSERT INTO "Municipio" ("nome", "valor") VALUES
  ('Maringá', 5.00),
  ('Sarandi', 5.50);

INSERT INTO "InstituicaoEnsino" ("nome", "municipioId") VALUES
  ('UEM - Universidade Estadual de Maringá', 1),
  ('UNICESUMAR', 1),
  ('Colégio Estadual Jardim Independência', 2);

INSERT INTO "Linha" ("nome", "municipioId") VALUES
  ('021 - Av. Brasil / UEM', 1),
  ('254 - Sarandi / Terminal Metropolitano', 2);

INSERT INTO "Rota" ("nome", "linhaId") VALUES
  ('Terminal Urbano -> UEM (Ida)', 1),
  ('Centro Sarandi -> Terminal (Ida)', 2);

INSERT INTO "Ponto" ("nome", "latitude", "longitude") VALUES
  ('Terminal Intermodal Urbano', -23.4209, -51.9331),
  ('Av. Herval (Esq. Av. Tamandaré)', -23.4175, -51.9355),
  ('Portão Principal UEM (Av. Colombo)', -23.4082, -51.9388),
  ('Praça Ipiranga (Centro Sarandi)', -23.4436, -51.8739);

INSERT INTO "Itinerario" ("rotaId", "pontoId", "tipoDia", "ordem", "horario") VALUES
  (1, 1, 'DIA_UTIL', 1, '07:00'),
  (1, 2, 'DIA_UTIL', 2, '07:10'),
  (1, 3, 'DIA_UTIL', 3, '07:22'),
  (2, 4, 'DIA_UTIL', 1, '06:40'),
  (2, 1, 'DIA_UTIL', 2, '07:15');
"@ | npx prisma db execute --stdin
```

Para visualizar ou editar registros manualmente pelo navegador (como saldo de cartões), abra um novo terminal na pasta `api` e execute:
```bash
npx prisma studio
```

## 2. Como executar o Frontend Mobile (`mobile`)

1. Em um novo terminal, acesse a pasta `mobile` e instale as dependências:
   ```bash
   cd mobile
   npm install
   ```

2. Crie o arquivo `.env` a partir do `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Configure a variável `EXPO_PUBLIC_API_LOCAL` no arquivo `mobile/.env`:
   - **Se for testar pelo celular físico (Expo Go):** coloque o IPv4 da sua máquina na rede local (ex.: `EXPO_PUBLIC_API_LOCAL=http://192.168.1.7:3000`). Você pode descobrir seu IP rodando `ipconfig` (Windows) ou `ifconfig`/`ip a` (Linux/macOS).
   - **Se for testar no navegador Web:** pode usar `EXPO_PUBLIC_API_LOCAL=http://localhost:3000`.
   - **Se for testar no Emulador Android:** use `EXPO_PUBLIC_API_LOCAL=http://10.0.2.2:3000` (ou o IP local da máquina).

4. Inicie o aplicativo com o Expo:
   ```bash
   npm start
   ```
   - Escaneie o QR Code com o aplicativo **Expo Go** (Android/iOS), **ou**
   - Pressione **`a`** no terminal para abrir no emulador Android, **ou**
   - Pressione **`w`** no terminal para abrir no navegador Web.

## Fluxo de Teste no Aplicativo

1. **Autenticação:** Na tela inicial de login, toque em **Criar conta**, preencha nome, CPF (11 dígitos), e-mail, telefone (11 dígitos) e senha (mínimo 8 caracteres) para criar um usuário e entrar automaticamente.
2. **Mapa e Itinerário:** Na aba **Mapa**, selecione uma **Linha**, uma **Rota** e um **Ponto** para visualizar no mapa ou toque em **Ver itinerário** para consultar os horários por tipo de dia (*Dia útil*, *Sábado* ou *Domingo*).
3. **Cartões e NFC:** Na aba **Cartões**, toque no botão **`+`** para cadastrar um cartão (Comum ou Estudante, com 8 a 10 dígitos). No card do cartão é possível **Consultar Saldo**, **Recarregar**, **Atualizar Cadastro**, **Remover** ou tocar em **NFC** para simular a aproximação do cartão na catraca.

## 3. Testar a recarga com a Stripe

A recarga abre o Checkout da Stripe no navegador. O saldo só aumenta quando o webhook `checkout.session.completed` confirma o pagamento. Use a chave de teste da mesma conta em que a CLI está logada. Cartões podem ficar ativos; o teste abaixo usa cartão.

1. No painel da Stripe, no modo teste, copie a chave secreta (`sk_test_...`) para `STRIPE_SECRET_KEY` em `api/.env`. Não commite esse arquivo.

2. Ajuste `API_PUBLIC_URL` no mesmo arquivo. A Stripe redireciona o navegador para `/recargas/retorno` nesse endereço:
   - **Navegador Web na própria máquina:** `API_PUBLIC_URL=http://localhost:3000`
   - **Celular ou emulador:** use o mesmo host de `EXPO_PUBLIC_API_LOCAL` (por exemplo `http://192.168.1.7:3000` no celular, ou `http://10.0.2.2:3000` no emulador Android).

3. Com a API no ar (`npm run dev` na pasta `api`), encaminhe os webhooks em outro terminal. A CLI atual exige `--all-snapshot`:

   ```bash
   stripe listen --forward-to localhost:3000/webhooks/stripe --all-snapshot --api-key sk_test_...
   ```

   Troque `sk_test_...` pela mesma `STRIPE_SECRET_KEY` da API. Sem isso, o pagamento cai em outra conta e o listener não recebe o evento. Copie o `whsec_...` da linha "Ready" para `STRIPE_WEBHOOK_SECRET`, reinicie a API e deixe o `stripe listen` aberto. Na primeira vez, `stripe login` autoriza a CLI antes do listener subir.

4. Suba o app (`npm start` na pasta `mobile`). Para testar na web, confirme `EXPO_PUBLIC_API_LOCAL=http://localhost:3000` em `mobile/.env` e pressione **`w`**.

5. Entre na conta, abra a aba **Cartões**, cadastre um cartão e toque em **Recarregar**. Escolha R$ 10, R$ 20, R$ 50 ou digite outro valor entre R$ 5,00 e R$ 200,00. Na página da Stripe, pague com o cartão de teste `4242 4242 4242 4242`, uma validade futura e qualquer CVC.

6. Confira o resultado:
   - O diálogo de valor fecha e a lista avisa que o saldo será atualizado em instantes.
   - O terminal do `stripe listen` mostra `checkout.session.completed` com resposta `200`. Uma resposta `400` indica que o `STRIPE_WEBHOOK_SECRET` não é o deste `listen`.
   - O aviso da lista muda para a confirmação e o saldo do cartão aumenta. **Consultar Saldo** mostra o mesmo valor.

Para simular uma recusa, repita o fluxo com o cartão `4000 0000 0000 0002`. A Stripe recusa o pagamento e o saldo do cartão não muda.