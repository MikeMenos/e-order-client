import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type StepperTone = "reserve" | "basket";

export function Stepper({
    label,
    value,
    onDec,
    onInc,
    onChange,
    onFocus,
    onBlur,
    ariaDec,
    ariaInc,
    ariaValue,
    disabled,
    tone,
}: {
    label: string;
    value: string | number;
    onDec: () => void;
    onInc: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    ariaDec: string;
    ariaInc: string;
    ariaValue: string;
    disabled?: boolean;
    tone: StepperTone;
}) {
    const toneStyles =
        tone === "reserve"
            ? {
                wrap: "border-[#E2E8F0] bg-[#F1F5F9]",
                btn: "bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100",
                mid: "bg-[#F1F5F9] text-slate-600",
                ring: "focus-within:ring-slate-300/40",
            }

            : {
                wrap: "border-emerald-200/70 bg-white",
                btn: "bg-white text-emerald-900 hover:bg-emerald-100/50 active:bg-emerald-100/50",
                mid: "bg-emerald-50/60 text-emerald-950",
                ring: "focus-within:ring-emerald-100/50",
            };

    return (
        <div className="flex flex-col items-start gap-1.5 text-base text-slate-500">
            <span className="w-16">{label}</span>

            <div
                className={`inline-flex items-center overflow-hidden rounded-xl border h-9 focus-within:ring-4 ${toneStyles.wrap} ${toneStyles.ring}`}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-10 rounded-none text-xl font-semibold ${toneStyles.btn}`}
                    aria-label={ariaDec}
                    onClick={onDec}
                    disabled={disabled}
                >
                    −
                </Button>

                <div className="h-9 w-px bg-black/10" />

                <Input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => onChange(e)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="0"
                    aria-label={ariaValue}
                    disabled={disabled}
                    className={["h-10 w-16 border-0 rounded-none text-center font-semibold", "bg-white focus-visible:ring-0", "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none", toneStyles.mid,].join(" ")} />

                <div className="h-9 w-px bg-black/10" />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-10 rounded-none text-xl font-semibold ${toneStyles.btn}`}
                    aria-label={ariaInc}
                    onClick={onInc}
                    disabled={disabled}
                >
                    +
                </Button>
            </div>
        </div>
    );
}
