# Cadastro de Vinil e CD — Dev Web III

CRUD completo (backend + frontend) em **Node.js + Express + TypeScript + Mongoose** para gerenciar discos de **vinil** e **CD**. A interface permite **cadastrar, listar, editar** (recarregando o formulário) e **excluir** com confirmação.

## Tecnologias

* **Node.js + Express** (API REST)
* **TypeScript**
* **MongoDB** (Atlas ou local) via **Mongoose** (ODM) - **Atlas** configurado via `.env`
* **HTML/CSS/JS** servidos pelo próprio Express (pasta `public/`)

## Funcionalidades

* Cadastro de discos com: **título, artista, ano, gênero, formato (vinil|cd), preço**.
* **Formatação de moeda BRL (R$)** no front e validação de **preço não-negativo**.
* Campo **Ano** inicia em **2000** e só bloqueia valores **negativos** (pode cadastrar 1999, 1980 etc.).
* Botão **Excluir** com destaque **vermelho** (ação destrutiva clara).

---

## Arquitetura do projeto

```
src/
  index.ts               # Express + conexão Mongo + registro das rotas
  models/
    Disco.ts             # Schema/Model Mongoose (coleção 'discos')
  routes/
    discoRoutes.ts       # Rotas REST (GET/POST/PUT/DELETE)
  public/
    index.html           # Front (form + tabela)
    script.js            # Fetch para API + UX (moeda BRL, validações)
```

* `src/index.ts` é o “bootstrap”: configura Express, conecta no Mongo (Mongoose), registra rotas e sobe o servidor.
* `routes/*` organiza endpoints por recurso (separação de responsabilidades).
* `public/*` é servido estaticamente pelo Express em `http://localhost:3000/`.

---

## Model de dados (Mongoose)

`Disco`

```ts
{
  titulo: string (required),
  artista: string (required),
  ano: number (required, >= 0 no front),
  genero: string (required),
  formato: "vinil" | "cd" (required),
  preco: number (required, >= 0 no front)
}
```

> Observação: por padrão, `model("Disco", ...)` usa a coleção `discos`. Se quiser forçar `Discos`, defina `{ collection: "Discos" }` no schema.

---

## Rotas da API

Base: `http://localhost:3000/discos`

| Método | Rota   | Descrição                |
| :----: | ------ | ------------------------ |
|  GET   | `/`    | Lista todos os discos    |
|  POST  | `/`    | Cria um novo disco       |
|  PUT   | `/:id` | Atualiza um disco por ID |
| DELETE | `/:id` | Remove um disco por ID   |

### Exemplo de payload (POST/PUT)

```json
{
  "titulo": "Kind of Blue",
  "artista": "Miles Davis",
  "ano": 1959,
  "genero": "Jazz",
  "formato": "vinil",
  "preco": 129.9
}
```

---

## Frontend (UX/validações)

* **Preço (R$)**: renderização com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` e conversão segura texto→número.
* **Sem negativos**: front valida `preco >= 0` e `ano >= 0`.
* **Ano** inicia em `2000` (valor padrão do input), mas permite qualquer ano ≥ 0.
* **Excluir em vermelho**: botão com classe `btn-danger` para evidenciar ação destrutiva.

---

## Como rodar

### 1) Pré-requisitos

* Node 18+
* MongoDB **Atlas** (recomendado) ou local
* Variáveis de ambiente em `.env`

### 2) Instalação

```bash
npm install
```

### 3) TypeScript (tsconfig)

Arquivo `tsconfig.json` (trecho relevante):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node16",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "verbatimModuleSyntax": false,
    "skipLibCheck": true
  }
}
```

Scripts em `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts"
  }
}
```

### 4) Banco de dados (Atlas) — `.env`

Crie um arquivo **`.env`** na raiz:

```env
# Exemplo SRV (Atlas)
MONGODB_URI="mongodb+srv://SEU_USER:SUA_SENHA@SEU-CLUSTER.mongodb.net/dweb3?retryWrites=true&w=majority&appName=dweb3"
```

Passos no Atlas (resumo):

1. Criar **Database User** (username/senha)
2. Liberar **IP** (em dev pode usar `0.0.0.0/0`)
3. Copiar a **connection string** e **incluir o nome do DB** após o host (ex.: `/dweb3`)

> Dicas de rede (se necessário):
>
> * Em Windows/VPN, adicionar:
>
>   ```ts
>   import dns from "dns";
>   dns.setDefaultResultOrder("ipv4first");
>   ```
> * Se a rede bloquear SRV/DNS, use **seed list** (sem `+srv`) com `replicaSet` e `tls=true`.

### 5) Executar

```bash
npm run dev
```

Acesse: `http://localhost:3000/`

---

## Troubleshooting

### TS1295 — “ECMAScript imports/exports em CommonJS com `verbatimModuleSyntax`”

* Use `module: "CommonJS"` **com** `verbatimModuleSyntax: false`.
* `moduleResolution: "node16"`.

### TS2345 em `mongoose.connect(uri)` — “string | undefined”

* Faça o narrowing antes (`if (!uri) { ... }`) **ou** use non-null assertion `uri!`.

### `MongooseServerSelectionError` (Atlas)

Checklist:

1. **URI** tem o **nome do DB**? ex.: `...mongodb.net/dweb3?...`
2. **IP liberado** no Atlas (em dev, `0.0.0.0/0`)
3. **Senha** com caracteres especiais? Use **URL-encode** (ex.: `@` → `%40`)
4. Em Windows/VPN: `dns.setDefaultResultOrder('ipv4first')`
5. Se a rede bloquear **SRV/DNS**: use **seed list** (sem `+srv`) com `replicaSet` e `tls=true`
6. Rota de saúde: `GET /health` → `mongoState` deve ser **1** quando conectado

---

## Teste end‑to‑end (rápido)

1. Cadastrar pelo formulário, ver a tabela atualizar.
2. **Editar** carrega os dados no formulário → **Salvar** envia **PUT**.
3. **Excluir** (botão vermelho) confirma e envia **DELETE**.

---

## Postman

Caso queira testar o sistema pelo **Postman**, dentro da pasta `/postman` está um arquivo tipo `json` pronto para ser baixado pelo **Postman**, com as rotas já configuradas.

-> **Lembre-se:** Crie um ambiente e carregue as varáveis!