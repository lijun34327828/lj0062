import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, fullWidth = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border';
    
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary-600 text-cream-50 border-gold-500 hover:bg-primary-500 hover:shadow-lg hover:shadow-gold-500/30 focus:ring-gold-500',
      secondary: 'bg-gold-600 text-primary-900 border-gold-400 hover:bg-gold-500 hover:shadow-lg hover:shadow-gold-500/40 focus:ring-gold-500',
      outline: 'bg-transparent text-gold-500 border-gold-500 hover:bg-gold-500/10 hover:shadow-lg hover:shadow-gold-500/20 focus:ring-gold-500',
      danger: 'bg-accent-600 text-cream-50 border-accent-500 hover:bg-accent-500 hover:shadow-lg hover:shadow-accent-500/30 focus:ring-accent-500',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
      md: 'px-5 py-2.5 text-base rounded-lg gap-2',
      lg: 'px-7 py-3.5 text-lg rounded-xl gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'md' ? 18 : 22} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
