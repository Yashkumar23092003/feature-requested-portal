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
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="skeleton-pulse h-8 w-20 mb-2" />
        <div className="skeleton-pulse h-4 w-28" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex items-start gap-4">
      <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-foreground truncate">{value}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
