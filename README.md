# DIGITALDOCS-V2-TESTE

Digitaldocs da Caixa Económica de Cabo Verde - Ambiente de Teste

---

## Descrição

**DIGITALDOCS** é uma plataforma digital integrada para gestão eletrônica de documentos, projetada para modernizar e automatizar processos documentais em organizações públicas e privadas. Facilita o armazenamento, organização, acesso e controle de documentos com segurança e eficiência.

Projetado com **React** e **Vite**, o sistema é altamente escalável, com uma arquitetura moderna e integração com APIs internas e serviços como Mapbox e autenticação com JWT.

---

## Funcionalidades Principais

- Gestão centralizada de documentos com categorização e controle de versões
- Busca rápida e filtros avançados para consulta de documentos
- Configuração detalhada de permissões de acesso e edição
- Workflows customizados para aprovação e assinatura digital
- Histórico completo de auditoria para rastreabilidade
- Integração com sistemas corporativos existentes

---

## Tecnologias Utilizadas

- **React 18** – Biblioteca principal de UI
- **Vite** – Empacotador e servidor de desenvolvimento rápido
- **JavaScript (JSX)** – Linguagem principal do projeto
- **Material UI (MUI)** – Biblioteca de componentes visuais
- **React Router** – Roteamento entre páginas
- **Context API** – Gerenciamento de estado global (ex: autenticação)
- **Mapbox GL JS** – Mapas interativos
- **Axios** – Comunicação com APIs
- **Yup** – Validação de schemas
- **JWT (JSON Web Token)** – Autenticação segura
- **Prettier** – Padronização de código
- **ESLint** – Linter para qualidade de código

---

## Instalação e Execução

### Pré-requisitos

- Node.js 18 ou superior
- Yarn

### Passos

1. Clone o repositório:

   ```bash
   git clone https://github.com/caixaceca/digitaldocs-v2-front-test.git
   cd digitaldovs-v2-teste
   ```

2. Instale as dependências:

   ```bash
   yarn install
   ```

3. Execute o projeto em modo desenvolvimento:

   ```bash
   yarn dev
   ```

4. Gere a versão de produção:

   ```bash
   yarn build
   ```

5. Pré-visualize a build:
   ```bash
   yarn preview
   ```

---

## Estrutura de Pastas

```
📁 public/
📁 src/
 ┣ 📁 assets/
 ┣ 📁 components/
 ┣ 📁 context/
 ┣ 📁 guards/
 ┣ 📁 hooks/
 ┣ 📁 pages/
 ┣ 📁 layouts/
 ┣ 📁 providers/
 ┣ 📁 redux/
 ┣ 📁 routs/
 ┣ 📁 sections/
 ┣ 📁 theme/
 ┣ 📁 utils/
 ┣ 📄 App.jsx
 ┗ 📄 config.js
 ┗ 📄 main.jsx
```

---
