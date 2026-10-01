import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The one button system. Corners are rounded but never a pill; hover deepens the color rather
 * than fading it; focus uses the global focus ring. An optional trailing icon nudges forward on
 * hover — the only motion a button makes.
 */
export const buttonVariants = cva(
  'group/button inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded font-medium tracking-[0.01em] transition-[background-color,border-color,color,box-shadow] duration-normal ease-standard disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-espresso-800 active:bg-espresso-900',
        secondary:
          'border border-mocha-700/35 bg-transparent text-foreground hover:border-mocha-700 hover:bg-cream-200/70',
        onDark: 'bg-cream-50 text-espresso-800 hover:bg-cream-200',
        onDarkOutline:
          'border border-cream-50/45 text-cream-50 hover:border-cream-50 hover:bg-cream-50/10',
        danger: 'bg-danger text-cream-50 hover:bg-danger/90',
        ghost: 'text-foreground hover:bg-cream-200',
      },
      size: {
        sm: 'h-10 px-4 text-small',
        md: 'h-12 px-6 text-[0.975rem]',
        lg: 'h-14 px-7 text-body',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

function TrailingIcon({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  return (
    <span
      aria-hidden
      className="inline-flex transition-transform duration-normal ease-out group-hover/button:translate-x-0.5"
    >
      {icon}
    </span>
  );
}

export interface ButtonProps extends ComponentPropsWithoutRef<'button'>, Variants {
  readonly icon?: ReactNode;
}

export function Button({
  className,
  variant,
  size,
  icon,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
      <TrailingIcon icon={icon} />
    </button>
  );
}

interface ButtonLinkProps extends Variants {
  readonly href: string;
  readonly className?: string;
  readonly children: ReactNode;
  readonly icon?: ReactNode;
  /** Opens in a new tab and says so to assistive technology. */
  readonly external?: boolean;
  readonly 'aria-label'?: string;
}

/** A link styled as a button — for navigation, never for an action. */
export function ButtonLink({
  href,
  className,
  variant,
  size,
  icon,
  external,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={rest['aria-label']}
      >
        {children}
        <span className="sr-only"> (új lapon nyílik meg)</span>
        <TrailingIcon icon={icon} />
      </a>
    );
  }
  return (
    <Link href={href} className={classes} aria-label={rest['aria-label']}>
      {children}
      <TrailingIcon icon={icon} />
    </Link>
  );
}
