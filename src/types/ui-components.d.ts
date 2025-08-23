declare module '@/components/ui/button' {
  import * as React from 'react'
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: string
    size?: string
  }
  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<any>>
  export default Button
}

declare module '@/components/ui/alert-dialog' {
  import * as React from 'react'
  export const AlertDialog: React.FC<React.PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void }>>
  export const AlertDialogTrigger: React.FC<React.PropsWithChildren<{ asChild?: boolean }>>
  export const AlertDialogContent: React.FC<React.PropsWithChildren<{ className?: string }>>
  export const AlertDialogHeader: React.FC<React.PropsWithChildren<{ className?: string }>>
  export const AlertDialogFooter: React.FC<React.PropsWithChildren<{ className?: string }>>
  export const AlertDialogTitle: React.FC<React.PropsWithChildren<{ className?: string }>>
  export const AlertDialogDescription: React.FC<React.PropsWithChildren<{ className?: string }>>
  export const AlertDialogAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>
  export const AlertDialogCancel: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>
}

declare module '@/components/ui/use-toast' {
  type ToastVariant = 'default' | 'destructive' | string
  export function toast(args: { title?: string; description?: string; variant?: ToastVariant }): void
}
