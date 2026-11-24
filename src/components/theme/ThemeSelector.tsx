import { Check, Laptop, Moon, Palette, Sun } from "lucide-react";
import { THEME_OPTIONS, type ThemeChoice } from "../../context/themeTypes";
import { useTheme } from "../../context/useTheme";

const ICONS: Record<ThemeChoice, typeof Sun> = {
  automatico: Laptop,
  claro: Sun,
  escuro: Moon,
  retro: Palette,
};

export default function ThemeSelector() {
  const { themeChoice, activeTheme, setThemeChoice } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold tracking-tight text-[var(--buyer-forest)]">Aparência</h2>
        <p className="text-sm text-[var(--buyer-muted)]">
          Escolha o tema de cores do Reaproveita Franca. O tema é aplicado instantaneamente e salvo na sua conta.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Seleção de tema de cores"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {THEME_OPTIONS.map((option) => {
          const isSelected = themeChoice === option.id;
          const Icon = ICONS[option.id];

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setThemeChoice(option.id)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-[var(--buyer-green)] bg-[var(--buyer-soft)] shadow-sm ring-2 ring-[var(--buyer-green)]/30"
                  : "border-[var(--buyer-line)] bg-[var(--buyer-surface)] hover:border-[var(--buyer-border)] hover:bg-[var(--buyer-soft)]/50"
              }`}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-[var(--buyer-green)] text-white"
                        : "bg-[var(--buyer-soft)] text-[var(--buyer-forest)]"
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="font-semibold text-[var(--buyer-forest)]">
                      {option.title}
                    </span>
                    {option.id === "automatico" && (
                      <span className="ml-2 text-xs font-medium text-[var(--buyer-muted)]">
                        (ativo: {activeTheme})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {option.palette && (
                    <div
                      className="flex items-center gap-1 rounded-full border border-black/10 bg-black/5 p-1 dark:border-white/10 dark:bg-white/5"
                      aria-hidden="true"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/15 shadow-xs"
                        style={{ backgroundColor: option.palette.background }}
                        title="Fundo"
                      />
                      <span
                        className="h-3.5 w-3.5 rounded-full shadow-xs"
                        style={{ backgroundColor: option.palette.primary }}
                        title="Cor primária"
                      />
                      <span
                        className="h-3.5 w-3.5 rounded-full shadow-xs"
                        style={{ backgroundColor: option.palette.accent }}
                        title="Acento"
                      />
                    </div>
                  )}

                  {isSelected && (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--buyer-green)] text-white"
                      aria-label="Selecionado"
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[var(--buyer-muted)]">
                {option.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
