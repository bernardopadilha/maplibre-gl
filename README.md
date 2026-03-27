# GeoJSON utilizando MapLibre GL

Aplicação full-stack com `Next.js` para gerenciamento de features geográficas em formato `GeoJSON`, com CRUD completo em `Route Handlers` e visualização em mapa interativo com `MapLibre GL`.

## Vídeo explicativo 
```
https://www.youtube.com/watch?v=XZTi7-gXsYo
```
## Stack

- `Next.js` com `App Router`
- `TypeScript`
- `MapLibre GL`
- `Tailwind CSS`
- `Zod`
- `react-hook-form`
- `Sonner`


## Configuração

Defina sua chave do MapTiler no arquivo `.env.local`:

```env
NEXT_PUBLIC_MAPTILER_KEY=BJH29Bi6wvitBXpd71jB
```

## Como executar

```bash
npm install
npm run dev
```

Ou:

```bash
pnpm install
pnpm dev
```

A aplicação fica disponível em [http://localhost:3000](http://localhost:3000).

## O que foi implementado

- CRUD completo para features GeoJSON
- Armazenamento em memoria no servidor
- Mapa interativo com listagem, destaque e popup de features
- Criação por clique no mapa ou preenchimento manual
- Edição e exclusão de features existentes
- Feedback visual com toasts
- Reverse geocoding para enriquecer a exibição de endereço
- Fluxo de geolocalização com consentimento explicito do usuário

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/geojson` | Cria uma feature |
| `GET` | `/api/geojson` | Lista todas as features |
| `GET` | `/api/geojson/[id]` | Busca uma feature por id |
| `PUT` | `/api/geojson/[id]` | Atualiza uma feature |
| `DELETE` | `/api/geojson/[id]` | Remove uma feature |

## Decisões técnicas

### API com contrato explicito

As rotas validam os payloads com `Zod` antes de persistir em memória. Isso garante respostas mais previsíveis, reduz erros silenciosos e reforça a confiança no contrato da API.

Hoje a validação cobre:

- `type: "Feature"`
- `geometry` obrigatória
- `properties` obrigatórias
- coordenadas válidas
- suporte a `Point`, `LineString` e `Polygon`
- validação de anel fechado para `Polygon`

### UI focada em `Point`

A interface de criação e edição foi deliberadamente focada em `Point`, mesmo com a API aceitando outras geometrias. Essa escolha evita uma UX incompleta para `LineString` e `Polygon`, que exigiriam desenho multi-ponto, manipulação espacial e edição mais avançada no mapa.

### Componentes mais simples e legíveis

Os componentes mais complexos foram quebrados em hooks e utilitários menores para melhorar entendimento, manutenção e versionamento.

Exemplos:

- `app/components/map/` foi dividido em hooks para inicialização, API publica, sincronização de features e marker temporário
- `app/components/sheet-create-feature/` foi organizado em `schema`, `default-values`, `coord-utils`, `types` e `hooks`

Essa abordagem evita componentes monolíticos e deixa mais fácil revisar o código por responsabilidade.

### Formulários com `react-hook-form` + `Zod`

O formulário de criação/edição usa `react-hook-form` com `zodResolver`, o que trouxe:

- menos `useState` manual
- validação centralizada
- menor acoplamento entre UI e regras de negócio
- melhor clareza do fluxo de submit

## Permissão e geolocalização

A geolocalização foi implementada com separação entre:

- permissão do navegador
- consentimento explicito dentro da aplicação

O fluxo foi pensado para respeitar a decisão do usuário:

1. A aplicação verifica o estado da permissão quando a `Permissions API` estiver disponível
2. Um dialog explica claramente o uso da localização
3. A centralização automática e o marcador de localização só acontecem com permissão concedida no navegador e consentimento do app
4. A preferencia do usuário é armazenada localmente para visitas futuras

Essa decisão evita usar localização sem contexto e melhora a transparência da UX.

## Organização de pastas

```text
app/
  api/
    geojson/
    map-style/
    reverse-geocode/
  components/
    map/
      hooks/
    sheet-create-feature/
      hooks/
  contexts/
  lib/
  services/
  types/
```

Resumo:

- `api/`: endpoints da aplicação
- `components/`: interface e componentes reutilizáveis
- `components/map/`: mapa, layers, interações e hooks especializados
- `components/sheet-create-feature/`: formulário modularizado
- `contexts/`: coordenação de estado entre mapa, drawer, sidebar e sheet
- `lib/`: store em memoria, validações, camada de API e helpers
- `services/`: serviços externos e integrações
- `types/`: contratos TypeScript compartilhados

## Tipagens e validações

As estruturas GeoJSON foram tipadas em `TypeScript` com unions discriminadas para:

- `FeatureCollection`
- `GeoJsonFeature`
- `Point`
- `LineString`
- `Polygon`
- `properties`

No backend, `Zod` valida os payloads recebidos pelas rotas.

No frontend, `Zod` também valida o formulário, incluindo:

- longitude e latitude válidas
- nome obrigatório
- normalização de entrada numérica

## Diferenciais da implementação

- API e frontend no mesmo projeto, sem complexidade desnecessária
- validação consistente entre domínio, backend e formulário
- fluxo de geolocalização pensado com cuidado de UX e consentimento
- separação clara de responsabilidades
- estrutura preparada para manutenção e evolução contínua

## Observações

- O armazenamento é intencionalmente em memória, conforme o escopo do desafio
- A interface atualmente prioriza manipulação de features do tipo `Point`
- A estrutura do projeto foi pensada para facilitar extensão futura para novas geometrias e interações cartográficas
