import {Button, ButtonProps} from "@igniter/ui/components/button";
import clsx from "clsx";

export function ActionButton({children, ...props}: React.PropsWithChildren & Omit<ButtonProps, 'children'>) {
  return (
    <Button
      {...props}
      className={
        clsx(
          'w-full h-[30px] bg-[color:var(--secondary)] border border-[color:var(--button-2-border)] hover:bg-transparent',
          props.className,
        )
      }
    >
      {children}
    </Button>
  )
}