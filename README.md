# Toledos Açaí 02 🍇

Sistema completo de Delivery e Gestão para Açaiteria (PWA).
Desenvolvido com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

### Para o Cliente
- **Cardápio Digital**: Navegação por categorias.
- **Personalização**: Escolha de adicionais (Leite Ninho, Paçoca, etc).
- **Carrinho Inteligente**: Cálculo automático de totais.
- **Checkout Simples**: Pedido sem necessidade de login prévio.
- **Rastreamento**: Acompanhamento do status do pedido em tempo real.

### Para o Administrador
- **Dashboard em Tempo Real**: Pedidos aparecem instantaneamente.
- **Gestão de Status**: Recebido -> Preparando -> Em Entrega -> Entregue.
- **Detalhes do Pedido**: Visualização completa dos adicionais e endereço.

## 🛠️ Tecnologias

- **Frontend**: React + Vite + TypeScript
- **Estilização**: Tailwind CSS + Framer Motion (Animações)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Ícones**: Lucide React

## 📦 Como Rodar Localmente

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/SEU-USUARIO/Toledo-acai-02.git
\`\`\`

2. Instale as dependências:
\`\`\`bash
yarn install
\`\`\`

3. Configure as variáveis de ambiente:
Crie um arquivo \`.env\` na raiz com suas credenciais do Supabase:
\`\`\`env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
\`\`\`

4. Rode o projeto:
\`\`\`bash
yarn run dev
\`\`\`

## 🔐 Acesso Admin

Para acessar o painel administrativo, vá para \`/admin\`.
