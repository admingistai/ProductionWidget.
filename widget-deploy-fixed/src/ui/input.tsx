import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-transparent tw-px-3 tw-py-2 tw-text-base tw-ring-offset-white focus-visible:tw-outline-none focus-visible:tw-ring-0 focus-visible:tw-ring-offset-0 disabled:tw-cursor-not-allowed disabled:tw-opacity-50 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';