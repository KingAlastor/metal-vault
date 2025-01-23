import React, { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface FirstTimeUserNoticeProps {
  title: string
  description: string
  onDismiss?: () => void
}

export function FirstTimeUserNotice({ title, description, onDismiss }: FirstTimeUserNoticeProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!isVisible) return null

  return (
    <Alert className="relative">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleDismiss}>
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}