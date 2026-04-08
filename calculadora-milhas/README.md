# Calculadora de Milhas

Aplicação web em Next.js para comparar emissões com milhas, calcular custo real, lucro, margem e venda mínima antes de vender uma passagem para o cliente final.

## Como instalar

```bash
npm install
```

## Como rodar

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Funcionalidades

- edição do valor do milheiro por companhia aérea
- comparador de emissões com ranking automático por maior lucro
- cálculo automático de custo das milhas, custo total, lucro, margem e venda mínima
- destaque visual para a melhor opção do comparador
- calculadora rápida separada do ranking
- persistência automática em `localStorage`
- botão para restaurar os dados padrão
- botão para limpar todas as opções
- formatação em real brasileiro e milhas com separador local

## Fórmulas usadas

- `custo das milhas = (milhas / 1000) * valor do milheiro`
- `custo total = custo das milhas + taxa`
- `lucro = venda - custo total`
- `margem = (lucro / venda) * 100`, quando `venda > 0`
- `venda mínima = custo total`

## Estrutura de pastas

```text
calculadora-milhas/
├─ app/
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ public/
├─ AGENTS.md
├─ CLAUDE.md
├─ eslint.config.mjs
├─ next-env.d.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ README.md
└─ tsconfig.json
```

## Dados iniciais

### Valor do milheiro

- `smiles`: `16`
- `latam`: `26`
- `azul`: `18`
- `outro`: `0`

### Opções iniciais

1. `Opção 1`: Smiles, `46000` milhas, `R$ 0,00` de taxa, `R$ 800,00` de venda
2. `Opção 2`: Smiles, `8280` milhas, `R$ 690,00` de taxa, `R$ 800,00` de venda
3. `Opção 3`: LATAM Pass, `24183` milhas, `R$ 50,00` de taxa, `R$ 800,00` de venda
