import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div 
            className={`bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[1.75rem] p-5 sm:p-8 border border-slate-100 flex flex-col ${className || ''}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;