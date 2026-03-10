import type React from 'react';

interface MicrosoftIconProps {
  className?: string;
}

export const MicrosoftIcon: React.FC<MicrosoftIconProps> = ({ className = 'h-4 w-4' }) => {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <title>Microsoft</title>
      <path fill="#F35325" d="M0 0h21v21H0V0z" />
      <path fill="#81BC06" d="M24 0h21v21H24V0z" />
      <path fill="#05A6F0" d="M0 24h21v21H0V24z" />
      <path fill="#FFBA08" d="M24 24h21v21H24V24z" />
    </svg>
  );
};
