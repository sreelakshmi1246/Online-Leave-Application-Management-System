import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const colorClasses = {
  blue: 'bg-primary/10 text-primary',
  purple: 'bg-secondary/10 text-secondary',
  green: 'bg-success/10 text-success',
  orange: 'bg-warning/10 text-warning',
};

export const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
