import { forwardRef, type InputHTMLAttributes } from 'react';

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`h-[44px] w-full rounded-md border border-hairline-strong bg-surface-card px-base text-body-md text-ink placeholder-muted focus:border-2 focus:border-ink-primary focus:outline-none ${className}`}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
