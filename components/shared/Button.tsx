import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', fullWidth = false, className, ...props }) => {
    // Base classes: refined transition, softer roundness
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform active:scale-[0.98]';

    const variantClasses = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 focus-visible:ring-indigo-500 border border-transparent',
        secondary: 'bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-200 border border-slate-200 hover:border-slate-300 shadow-sm',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 focus-visible:ring-red-500 border border-red-100'
    };

    const sizeClasses = {
        sm: 'py-1.5 px-3 text-xs tracking-wide',
        md: 'py-2.5 px-5 text-sm',
        lg: 'py-4 px-8 text-base tracking-tight'
    };
    
    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className || ''}`;

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};

export default Button;