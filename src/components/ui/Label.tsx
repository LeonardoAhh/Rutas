import { type LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  strong?: boolean;
}

export default function Label({
  strong = false,
  className = '',
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={`mb-xs block text-caption font-medium ${strong ? 'text-body-strong' : 'text-body'} ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
