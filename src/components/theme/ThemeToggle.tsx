import { useState, useRef, useEffect } from "react";
import { Laptop, Moon, Palette, Sun, Check } from "lucide-react";
import { useTheme } from "../../context/useTheme";
import { THEME_OPTIONS, type ThemeChoice } from "../../context/themeTypes";

const ICONS: Record<ThemeChoice, typeof Sun> = {
  automatico: Laptop,
  claro: Sun,
  escuro: Moon,
  retro: Palette,
};

export default function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const { themeChoice, activeTheme, setThemeChoice } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Fecha ao pressionar Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const ActiveIcon = ICONS[themeChoice] || Sun;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Tema atual: ${themeChoice} (ativo: ${activeTheme}). Clique para alterar tema.`}
        title="Alterar tema de cores"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--buyer-border)] bg-[var(--buyer-surface)] text-[var(--buyer-forest)] shadow-xs transition-colors hover:bg-[var(--buyer-soft)] hover:text-[var(--buyer-green)] focus:outline-hidden"
      >
        <ActiveIcon size={18} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-label="Opções de tema"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-[var(--buyer-line)] bg-[var(--buyer-surface)] p-2 shadow-xl ring-1 ring-black/5 focus:outline-hidden"
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--buyer-muted)]">
            Tema de cores
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((option) => {
              const isSelected = themeChoice === option.id;
              const Icon = ICONS[option.id];

              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setThemeChoice(option.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-[var(--buyer-soft)] text-[var(--buyer-green)] font-semibold"
                      : "text-[var(--buyer-forest)] hover:bg-[var(--buyer-soft)]/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md ${
                        isSelected
                          ? "bg-[var(--buyer-green)] text-white"
                          : "bg-black/5 text-[var(--buyer-forest)] dark:bg-white/10"
                      }`}
                    >
                      <Icon size={14} aria-hidden="true" />
                    </span>
                    <span>{option.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {option.palette && (
                      <div className="flex items-center gap-0.5" aria-hidden="true">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: option.palette.background }}
                        />
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: option.palette.primary }}
                        />
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: option.palette.accent }}
                        />
                      </div>
                    )}
                    {isSelected && (
                      <Check size={14} strokeWidth={2.5} className="text-[var(--buyer-green)]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
