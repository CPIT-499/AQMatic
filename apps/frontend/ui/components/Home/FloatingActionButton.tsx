import { Button } from "../ui/button";

interface FloatingActionButtonProps { // Renamed interface
    onClick: () => void;
    label?: string; // Added optional label prop
}

export function FloatingActionButton({ onClick, label = "Get Started" }: FloatingActionButtonProps) { // Renamed component, added label prop with default
    return (
        <div className="fixed bottom-4 right-4 z-50 md:hidden">
            <Button
                className="rounded-full shadow-lg bg-primary text-primary-foreground"
                onClick={onClick} // Use prop handler
            >
                {label} {/* Use label prop */}
            </Button>
        </div>
    );
}
