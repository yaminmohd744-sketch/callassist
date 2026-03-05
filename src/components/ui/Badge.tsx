
import './Badge.css';

type BadgeVariant = 'cyan' | 'green' | 'red' | 'yellow' | 'purple' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={`badge badge--${variant}`}>{label}</span>
  );
}
