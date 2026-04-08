import { EmptyState } from "@/components/empty-state";
import { OptionFormCard } from "@/components/option-form-card";
import type {
  CalculatedFlightOption,
  CommissionType,
  CompanyKey,
} from "@/types";

type OptionsListProps = {
  options: CalculatedFlightOption[];
  onTextChange: (id: string, field: "name", value: string) => void;
  onCompanyChange: (id: string, company: CompanyKey) => void;
  onNumberChange: (
    id: string,
    field: "miles" | "cashAmount" | "saleAmount" | "commissionValue",
    value: string,
  ) => void;
  onCommissionTypeChange: (id: string, value: CommissionType) => void;
  onRemove: (id: string) => void;
};

export function OptionsList({
  options,
  onTextChange,
  onCompanyChange,
  onNumberChange,
  onCommissionTypeChange,
  onRemove,
}: OptionsListProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
          Opções de emissão
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Cenários editáveis para comparação
        </h2>
      </div>

      {options.length === 0 ? (
        <EmptyState
          title="Nenhuma opção visível"
          description="Ajuste os filtros ou adicione novas emissões para continuar comparando cenários."
        />
      ) : (
        options.map((option, index) => (
          <OptionFormCard
            key={option.id}
            option={option}
            position={index}
            onTextChange={onTextChange}
            onCompanyChange={onCompanyChange}
            onNumberChange={onNumberChange}
            onCommissionTypeChange={onCommissionTypeChange}
            onRemove={onRemove}
          />
        ))
      )}
    </section>
  );
}
