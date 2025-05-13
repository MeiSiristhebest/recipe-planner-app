"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster 
      richColors
      position="top-right"
      closeButton
      duration={5000}
      className="z-50"
    />
  )
}
