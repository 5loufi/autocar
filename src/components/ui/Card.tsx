import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  gradient?: boolean;
}

export function Card({ children, className, hover, onClick, gradient }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "surface overflow-hidden",
        hover && "hover:shadow-card-hover hover:border-white/[0.10] transition-all duration-300 cursor-pointer",
        gradient && "border-gradient",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4 border-b border-foreground/[0.06]", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("font-semibold text-foreground text-sm", className)}>{children}</h3>;
}
