import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DialogContextValue {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

const useDialog = () => {
    const ctx = React.useContext(DialogContext);
    if (!ctx) throw new Error("Dialog components must be used within Dialog");
    return ctx;
};

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

function Dialog({ open = false, onOpenChange, children }: DialogProps) {
    return (
        <DialogContext.Provider
            value={{ open: open, onOpenChange: onOpenChange ?? (() => {}) }}
        >
            {children}
        </DialogContext.Provider>
    );
}

interface DialogTriggerProps {
    asChild?: boolean;
    children: React.ReactNode;
}

function DialogTrigger({ asChild, children }: DialogTriggerProps) {
    const { onOpenChange } = useDialog();
    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
        return React.cloneElement(child, {
            onClick: (e: React.MouseEvent) => {
                child.props.onClick?.(e);
                onOpenChange(true);
            },
        });
    }
    return (
        <button type="button" onClick={() => onOpenChange(true)}>
            {children}
        </button>
    );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    onEscapeKeyDown?: () => void;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, onEscapeKeyDown, ...props }, ref) => {
        const { open, onOpenChange } = useDialog();

        React.useEffect(() => {
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    onEscapeKeyDown?.();
                    onOpenChange(false);
                }
            };
            if (open) {
                document.addEventListener("keydown", handleEscape);
                document.body.style.overflow = "hidden";
            }
            return () => {
                document.removeEventListener("keydown", handleEscape);
                document.body.style.overflow = "";
            };
        }, [open, onOpenChange, onEscapeKeyDown]);

        if (!open) return null;

        const content = (
            <>
                <div
                    className="fixed inset-0 z-50 bg-black/50"
                    aria-hidden
                    onClick={() => onOpenChange(false)}
                />
                <div
                    ref={ref}
                    role="dialog"
                    aria-modal="true"
                    className={cn(
                        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 rounded-lg",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                    {...props}
                >
                    {children}
                </div>
            </>
        );

        return createPortal(content, document.body);
    }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

const DialogFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
));
DialogFooter.displayName = "DialogFooter";

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
};
