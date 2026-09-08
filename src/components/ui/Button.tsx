import React from "react";

export type ButtonVariant = "primary" | "outline" | "invert" | "glass" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  href?: string;
  className?: string;
}

/**
 * Thin wrapper over the `btn-*` utilities in `global.css`. Everything visual —
 * radius, tracking, press feedback, elevation — lives there, so a button
 * rendered from React and one written inline in an `.astro` file are the same
 * object.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "btn btn-primary",
  outline: "btn btn-outline",
  invert: "btn btn-invert",
  glass: "btn btn-glass",
  icon: "icon-btn",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-5 py-2.5 text-[0.65rem]",
  md: "",
  lg: "px-8 py-4 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = "primary", size = "md", icon, href, className = "", children, ...props }, ref) => {
    const classes = [VARIANTS[variant], variant === "icon" ? "" : SIZES[size], className]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
        {icon && <span className="shrink-0 text-lg">{icon}</span>}
        {children}
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          className={classes}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button className={classes} ref={ref as React.Ref<HTMLButtonElement>} {...props}>
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
