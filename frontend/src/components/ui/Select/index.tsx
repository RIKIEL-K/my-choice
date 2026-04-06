import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Context ─────────────────────────────────────────────────────────────────

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

const useSelect = () => {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("Select components must be used within Select");
  return ctx;
};

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  defaultValue?: string;
}

function Select({
  value: controlledValue,
  onValueChange,
  children,
  defaultValue = "",
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (v: string) => {
    setInternalValue(v);
    onValueChange?.(v);
    setOpen(false);
  };

  // Close on outside click
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

// ─── SelectTrigger ───────────────────────────────────────────────────────────

function SelectTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useSelect();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-2 focus:outline-teal-600",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className={cn("ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

// ─── SelectValue ─────────────────────────────────────────────────────────────

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSelect();
  // Walk up to find the label of the selected item from content
  return <span className="flex-1 text-left truncate">{value || <span className="text-gray-400">{placeholder}</span>}</span>;
}

// ─── SelectContent ────────────────────────────────────────────────────────────

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useSelect();
  if (!open) return null;
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  );
}

// ─── SelectItem ───────────────────────────────────────────────────────────────

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function SelectItem({ value, children, className }: SelectItemProps) {
  const { value: selected, onValueChange } = useSelect();
  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 transition-colors",
        selected === value && "bg-slate-100 font-medium",
        className
      )}
    >
      {children}
    </button>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
