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

### Populando dados de teste (Opcional)
Para visualizar ou inserir linhas, rotas, pontos, itinerários e saldo de cartões pelo navegador, abra um novo terminal na pasta `api` e execute:
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
   *(No Windows PowerShell: `Copy-Item .env.example .env`)*

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
3. **Cartões e NFC:** Na aba **Cartões**, toque no botão **`+`** para cadastrar um cartão (Comum ou Estudante, com 8 a 10 dígitos). No card do cartão é possível **Consultar Saldo**, **Atualizar Cadastro**, **Remover** ou tocar em **NFC** para simular a aproximação do cartão na catraca.