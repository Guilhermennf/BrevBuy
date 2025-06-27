# 🛒 Sistema de Gestão de Produtos para Revenda

Um sistema completo desenvolvido em Next.js para controle de produtos comprados e vendidos, ideal para pequenos empreendedores e revendedores.

## ✨ Funcionalidades

- **📦 Gestão de Produtos**: Cadastro, edição e exclusão de produtos
- **💰 Controle Financeiro**: Acompanhamento de lucros e perdas
- **📊 Dashboard**: Estatísticas de vendas e produtos em tempo real
- **🔄 Status de Produtos**: Marcar produtos como vendidos ou disponíveis
- **🌙 Dark Mode**: Interface elegante com tema escuro padrão
- **📱 Responsivo**: Funciona perfeitamente em desktop e mobile

## 🚀 Tecnologias Utilizadas

### Frontend

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Ícones consistentes

### Backend & Banco de Dados

- **Prisma** - ORM moderno para TypeScript
- **SQLite** - Banco de dados local
- **Zod** - Validação de schemas

### Formulários & UX

- **React Hook Form** - Gerenciamento de formulários
- **React Hot Toast** - Notificações elegantes
- **Next Themes** - Gerenciamento de temas

## 📋 Pré-requisitos

- Node.js 18.17 ou superior
- npm ou yarn

## ⚡ Instalação e Configuração

1. **Clone o repositório**

   ```bash
   git clone https://github.com/Guilhermennf/BrevBuy.git
   cd BrevBuy
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure o banco de dados**

   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Execute o projeto**

   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📖 Como Usar

### Adicionando um Produto

1. Clique no botão "Adicionar Produto"
2. Preencha as informações do produto:
   - Nome (obrigatório)
   - Descrição
   - Preço de compra (obrigatório)
   - Categoria
   - Fornecedor
   - URL da imagem
3. Clique em "Adicionar"

### Marcando como Vendido

1. Clique nos três pontos do produto
2. Selecione "Marcar como Vendido"
3. Informe o preço de venda
4. Confirme a operação

### Visualizando Estatísticas

O dashboard mostra automaticamente:

- Total investido
- Total vendido
- Lucro total e margem
- Produtos disponíveis

## 🎨 Estrutura do Projeto

```
BrevBuy/
├── app/                    # Páginas e API routes (App Router)
│   ├── api/               # Endpoints da API
│   │   └── products/      # CRUD de produtos
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes base do shadcn/ui
│   ├── product-form.tsx  # Formulário de produtos
│   └── stats-cards.tsx   # Cards de estatísticas
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
│   ├── prisma.ts         # Cliente Prisma
│   └── utils.ts          # Funções utilitárias
├── prisma/               # Schema do banco de dados
└── public/               # Arquivos estáticos
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em desenvolvimento
- `npm run build` - Constrói para produção
- `npm run start` - Executa a versão de produção
- `npm run lint` - Executa o linter
- `npx prisma studio` - Interface visual do banco

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🐛 Reportar Issues

Encontrou um bug? [Abra uma issue](https://github.com/Guilhermennf/BrevBuy/issues) detalhando o problema.

---

Desenvolvido por Guilherme Nunes
