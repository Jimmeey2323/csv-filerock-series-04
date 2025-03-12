
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizesMap = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto'
  };

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src="https://i.imgur.com/9mOm7gP.png" 
        alt="Studio Analytics" 
        className={cn(sizesMap[size], "mr-2")} 
      />
      <span className={cn(
        "font-semibold tracking-tight",
        size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-xl'
      )}>
        StudioStats
      </span>
    </div>
  );
};

export default Logo;
