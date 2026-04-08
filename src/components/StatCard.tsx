import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  value: string | number;
  label: string;
  icon: LucideIcon;
  loading?: boolean;
}

const StatCard = ({ value, label, icon: Icon, loading }: StatCardProps) => {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
        <div className="skeleton-pulse h-3 w-3 rounded-full mb-4" />
        <div className="skeleton-pulse h-7 w-16 mb-2" />
        <div className="skeleton-pulse h-3 w-24" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-shadow group hover:border-primary/20 transition-all duration-200">
      <div className="text-muted-foreground/60 mb-3 group-hover:text-primary/60 transition-colors">
        <Icon size={15} strokeWidth={2} />
      </div>
      <div className="text-2xl font-semibold text-foreground tracking-tight truncate leading-none mb-1.5">
        {value}
      </div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
    </div>
  );
};

export default StatCard;
