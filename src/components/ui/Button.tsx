import React from "react";

export type ButtonVariant = "primary" | "black&white" | "simple" | "glass";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  isFalse?: boolean;
  isImage?: boolean;
  href?: string;
  className?: string;
  asChild?: boolean;
}

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      isFalse = false,
      isImage = false,
      href,
      className = "",
      children,
      ...props
    },
    forwardedRef,
  ) => {
    // Determine base classes
    const baseClasses =
      "inline-flex items-center justify-center gap-2 transition-transform duration-300 font-semibold uppercase tracking-[0.2em]";

    // Determine sizes
    let sizeClasses = "";
    if (variant !== "glass") {
      switch (size) {
        case "sm":
          sizeClasses = "px-3 py-1.5 text-[0.65rem]";
          break;
        case "lg":
          sizeClasses = "px-8 py-4 text-sm";
          break;
        case "md":
        default:
          sizeClasses = "px-5 py-2.5 text-xs";
          break;
      }
    } else {
      sizeClasses = "h-10 w-10 md:h-12 md:w-12";
    }

    // Determine variant classes
    let variantClasses = "";
    switch (variant) {
      case "primary":
        variantClasses =
          "bg-ink text-canvas rounded-full hover:-translate-y-0.5";
        break;
      case "black&white":
        variantClasses = "rounded-full hover:-translate-y-0.5";
        if (isImage) {
          variantClasses +=
            " bg-white text-black transition-colors hover:bg-white/90";
        } else {
          variantClasses +=
            " border border-ink bg-canvas text-ink hover:bg-ink hover:text-canvas";
        }
        break;
      case "simple":
        variantClasses =
          "rounded-full border border-line hover:bg-panel bg-transparent text-ink transition-colors duration-300";
        break;
      case "glass":
        variantClasses =
          "rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/20";
        break;
    }

    // Bounce animation if isFalse is true
    const bounceClass = isFalse ? "animate-bounce" : "";

    // Combine classes
    const combinedClasses =
      `${baseClasses} ${sizeClasses} ${variantClasses} ${bounceClass} ${className}`.trim();

    if (href) {
      return (
        <a
          href={href}
          className={combinedClasses}
          ref={forwardedRef as React.Ref<HTMLAnchorElement>}
          {...(props as any)}
        >
          {icon && <span className="shrink-0 text-lg">{icon}</span>}
          {children}
        </a>
      );
    }

    return (
      <button
        className={combinedClasses}
        ref={forwardedRef as React.Ref<HTMLButtonElement>}
        {...(props as any)}
      >
        {icon && <span className="shrink-0 text-lg">{icon}</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
