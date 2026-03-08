import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
    value: string;
    onValueChange: (value: string) => void;
    name: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

const useRadioGroup = () => {
    const ctx = React.useContext(RadioGroupContext);
    if (!ctx) throw new Error("RadioGroupItem must be used within RadioGroup");
    return ctx;
};

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    value?: string;
    onValueChange?: (value: string) => void;
    name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value = "", onValueChange, name: nameProp, ...props }, ref) => {
        const name = nameProp ?? React.useId();
        return (
            <RadioGroupContext.Provider
                value={{ value, onValueChange: onValueChange ?? (() => {}), name }}
            >
                <div
                    ref={ref}
                    role="radiogroup"
                    className={cn("grid gap-2", className)}
                    {...props}
                />
            </RadioGroupContext.Provider>
        );
    }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    id?: string;
}

const RadioGroupItem = React.forwardRef<HTMLDivElement, RadioGroupItemProps>(
    ({ className, value, id: idProp, ...props }, ref) => {
        const { value: groupValue, onValueChange, name } = useRadioGroup();
        const id = idProp ?? value;
        const checked = groupValue === value;
        return (
            <div
                ref={ref}
                className={cn("flex items-center space-x-2", className)}
                {...props}
            >
                <input
                    type="radio"
                    id={id}
                    name={name}
                    value={value}
                    checked={checked}
                    onChange={() => onValueChange(value)}
                    className="h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
            </div>
        );
    }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
