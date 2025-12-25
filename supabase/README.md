# PRONTEV - Supabase Setup

Este diretório contém todas as migrations e configurações do Supabase para o projeto PRONTEV.

## 📁 Estrutura

```
supabase/
├── migrations/              # Database migrations
│   ├── 20251224_initial_schema.sql    # Tabelas, índices, triggers
│   ├── 20251224_rls_policies.sql      # Row Level Security
│   └── 20251224_functions.sql         # Database functions
├── functions/               # Edge Functions (Deno)
│   └── (a ser criado)
└── seed.sql                # Dados iniciais para testes
```

## 🚀 Como Usar (Próximos Passos)

### 1. Criar Projeto Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta (se não tiver)
3. Clique em "New Project"
4. Preencha:
   - **Name:** PRONTEV
   - **Database Password:** (escolha uma senha forte)
   - **Region:** escolha a mais próxima (ex: Frankfurt para Angola)
   - **Pricing Plan:** Free (ou Pro se preferir)
5. Aguarde ~2 minutos para o projeto ser criado

### 2. Obter Credenciais

Após criar o projeto, vá em **Project Settings > API**:

- **URL:** `https://xxxxxxxxxxxxx.supabase.co`
- **anon/public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role key:** (mantenha secreta!)

### 3. Executar Migrations

**Opção A: Via Supabase Dashboard (Mais Fácil)**

1. Acesse seu projeto Supabase
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de cada arquivo na ordem:
   - `migrations/20251224_initial_schema.sql`
   - `migrations/20251224_rls_policies.sql`
   - `migrations/20251224_functions.sql`
   - `seed.sql` (dados de teste)
4. Execute cada um (botão RUN)

**Opção B: Via Supabase CLI (Avançado)**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref xxxxxxxxxxxxx

# Executar migrations
supabase db push

# Popular com dados de teste
supabase db seed
```

### 4. Criar Usuários de Teste

Via **Supabase Dashboard > Authentication > Users**:

Clique em "Add user" e crie:

#### Usuário Admin
- **Email:** admin@prontev.com
- **Password:** (escolha uma)
- **User Metadata:**
```json
{
  "name": "Admin PRONTEV",
  "role": "HQ_ADMIN",
  "branch_id": "00000000-0000-0000-0000-000000000001"
}
```

#### Usuário Gerente
- **Email:** gerente.sul@prontev.com
- **Password:** (escolha uma)
- **User Metadata:**
```json
{
  "name": "Gerente Luanda Sul",
  "role": "BRANCH_ADMIN",
  "branch_id": "00000000-0000-0000-0000-000000000002"
}
```

#### Usuário Vendedor
- **Email:** vendedor.sul@prontev.com
- **Password:** (escolha uma)
- **User Metadata:**
```json
{
  "name": "Vendedor Luanda Sul",
  "role": "BRANCH_USER",
  "branch_id": "00000000-0000-0000-0000-000000000002"
}
```

### 5. Verificar RLS

Via **Supabase Dashboard > Database > Policies**, verifique que todas as tabelas têm políticas RLS ativas.

### 6. Testar Conexão

Crie um arquivo de teste `test-connection.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xxxxxxxxxxxxx.supabase.co',
  'sua_anon_key_aqui'
)

// Testar consulta
const { data, error } = await supabase
  .from('categories')
  .select('*')

console.log('Categories:', data)
```

## 📊 Schema Overview

### Tabelas Principais

- **branches** - Filiais do negócio
- **users** - Perfis de usuários (extends auth.users)
- **categories** - Categorias de produtos
- **products** - Produtos em estoque
- **services** - Serviços oferecidos
- **sales** - Vendas registradas
- **sale_items** - Itens de cada venda
- **sync_logs** - Logs de sincronização offline

### Segurança (RLS)

Todas as tabelas têm Row Level Security habilitado:

- **HQ_ADMIN:** Acesso total
- **BRANCH_ADMIN:** Acesso à sua filial
- **BRANCH_USER:** Acesso de leitura + criar vendas

### Funções do Banco

- `create_sale_with_items()` - Criar venda com itens atomicamente
- `get_branch_sales_summary()` - Resumo de vendas
- `get_low_stock_products()` - Produtos com estoque baixo
- `get_top_selling_products()` - Produtos mais vendidos
- `search_products()` - Busca de produtos

## 🔐 Configuração de Autenticação

Via **Supabase Dashboard > Authentication > Providers**:

### Email (já habilitado)
- ✅ Enable email provider
- ✅ Enable email confirmations (recomendado)

### Google OAuth (opcional)
1. Crie projeto no Google Cloud Console
2. Configure OAuth consent screen
3. Crie credenciais OAuth 2.0
4. Adicione Client ID e Secret no Supabase
5. Adicione redirect URL autorizada

### Microsoft OAuth (opcional)
Similar ao Google, configure via Azure AD

## 📦 Storage Buckets

Criar buckets via **Supabase Dashboard > Storage**:

### 1. product-images
- **Public:** Yes
- **File size limit:** 5MB
- **Allowed types:** image/jpeg, image/png, image/webp

### 2. user-avatars
- **Public:** Yes
- **File size limit:** 2MB
- **Allowed types:** image/jpeg, image/png

### 3. reports
- **Public:** No (RLS protected)
- **File size limit:** 10MB
- **Allowed types:** application/pdf, application/json

## 🔄 Realtime

Via **Supabase Dashboard > Database > Replication**:

Habilitar para tabelas que precisam de real-time:
- ✅ sales
- ✅ sale_items
- ✅ products (para atualização de estoque)

## ⚙️ Database Settings

Recomendações via **Supabase Dashboard > Database > Settings**:

- **Connection pooling:** Max 15 connections (Free) / 50+ (Pro)
- **Statement timeout:** 8000ms
- **Backup schedule:** Daily (automático no Pro)

## 📝 Notas Importantes

1. **UUID vs Serial:** Usamos UUID para melhor sync offline
2. **Soft Deletes:** Produtos usam `deleted_at` em vez de DELETE
3. **Audit Trail:** `created_at` e `updated_at` em todas as tabelas
4. **Offline Support:** Campo `offline_id` para tracking de sync
5. **JSONB Metadata:** Campos flexíveis para extensões futuras

## 🆘 Troubleshooting

### Erro: "relation does not exist"
Certifique-se que executou todas as migrations na ordem correta.

### Erro: "RLS policy violation"
Verifique se o usuário está autenticado e tem a role correta no metadata.

### Erro: "permission denied for schema public"
Verifique as policies RLS - pode estar bloqueando acesso.

## 📚 Documentação Supabase

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Checklist de Setup

- [ ] Projeto Supabase criado
- [ ] Migrations executadas
- [ ] RLS policies verificadas
- [ ] Seed data inserido
- [ ] Usuários de teste criados
- [ ] Storage buckets criados
- [ ] Realtime habilitado
- [ ] Credenciais salvas (.env)
- [ ] Teste de conexão OK

**Próximo Passo:** Configurar o frontend para conectar ao Supabase!
