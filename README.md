# Travel Points Calculator

A Next.js and TypeScript workspace for comparing flight redemptions and sales scenarios. Enter mileage costs, cash fees, sale prices and commissions to compare calculated net profit, save local snapshots and export CSV files.

The calculator uses user-supplied values and sample defaults. It is not a live airline pricing or booking system.

## Try a comparison

1. Set the price per thousand miles for each airline.
2. Add two redemption options with their mileage, fees, sale amount and commission.
3. Compare the ranking, which sorts by net profit, then net margin and total cost.
4. Save a snapshot, change an input, restore the snapshot and export the options or history to CSV.

For example, **10,000 miles at R$20 per thousand**, a **R$50 fee**, a **R$300 sale** and a **R$10 fixed commission** produce R$200 mileage cost, R$250 total cost and R$40 calculated net profit. This is a synthetic example, not a fare quote.

## Calculation model

The functions live in [lib/calculations.ts](lib/calculations.ts):

| Value | Formula |
| --- | --- |
| Mileage cost | `(miles / 1000) * pricePerThousand` |
| Total cost | `mileageCost + cashFees` |
| Gross profit | `saleAmount - totalCost` |
| Commission | Fixed amount, or `saleAmount * percentage / 100` |
| Net profit | `grossProfit - commission` |
| Net margin | `netProfit / saleAmount * 100` when sale amount is positive |

The current `calculateBreakevenSale` returns **total cost only**. It does not include commission, so its displayed minimum-sale value is not a full commission-adjusted break-even figure.

## Run locally

Use Node.js **22.12+** so the test command's TypeScript-stripping flag and the Next.js toolchain are available.

```bash
git clone https://github.com/helberjf/travel-points-calculate.git
cd travel-points-calculate
npm ci
npm run dev
```

Open `http://localhost:3000`.

```bash
npm test
npm run lint
npm run build
```

The root test suite currently covers navigation behavior; it is not a complete financial-calculation regression suite. A production build can be served with `npm start`.

## Source and companion tool

- [app/page.tsx](app/page.tsx): comparison workspace and state orchestration.
- [lib/calculations.ts](lib/calculations.ts), [lib/filters.ts](lib/filters.ts): calculations and filtering.
- [lib/storage.ts](lib/storage.ts), [lib/csv.ts](lib/csv.ts): browser persistence and exports.
- [components](components): comparison, quick calculator, quotation, history and fuel-consumption UI.
- [docs/interface-de-viagens.md](docs/interface-de-viagens.md): interface notes in Portuguese.

The separate [flight-research companion](pesquisa-passagens/README.md) has its own local workflow and tests. Its Windows launcher, `pesquisa-passagens/Iniciar Milhas.cmd`, opens the research form/report environment. It is separate from the main Next.js deployment.

## Design tradeoffs

- **Local persistence:** snapshots and inputs remain available without accounts or a backend, but depend on the browser/device and can be lost when browser data is cleared. CSV provides a portable export.
- **Explicit formulas:** separate pure functions make the model inspectable; JavaScript number arithmetic and the simplified minimum-sale formula are not a full accounting system.
- **Manual price inputs:** users can compare scenarios immediately, while price freshness and completeness remain their responsibility rather than an external feed guarantee.
- **Separate research companion:** local research can evolve without redeploying the calculator, but has its own runtime, data and operational steps.

Cloud synchronization, CSV import and a full PDF export remain future extensions unless implemented in a subsequent revision.
