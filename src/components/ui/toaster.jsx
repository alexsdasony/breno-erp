import * as React from "react"
import { Toast, ToastViewport, ToastTitle, ToastDescription, ToastProvider, ToastClose } from "./toast"
import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, dismiss }) => (
        <Toast key={id} variant={variant} id={`toast-${variant || 'default'}-${id}`}>
          <div className="grid gap-1">
            {title && <ToastTitle id={`toast-title-${id}`}>{title}</ToastTitle>}
            {description && (
              <ToastDescription id={`toast-description-${id}`}>{description}</ToastDescription>
            )}
          </div>
          <ToastClose onClick={dismiss} id={`toast-close-${id}`} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}