import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTimeUntil(scheduledDate: string) {
  const now = new Date()
  const utcDate = new Date(scheduledDate)
  const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)

  const diffInMinutes = Math.round((localDate.getTime() - now.getTime()) / (1000 * 60))

  if (diffInMinutes > 0) {
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutos`
    }
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60
    return `${hours}h${minutes > 0 ? ` e ${minutes}min` : ''}`
  } else {
    const passedMinutes = Math.abs(diffInMinutes)
    if (passedMinutes < 60) {
      return `atrasado ${passedMinutes} minutos`
    }
    const hours = Math.floor(passedMinutes / 60)
    const minutes = passedMinutes % 60
    return `atrasado ${hours}h${minutes > 0 ? ` e ${minutes}min` : ''}`
  }
}
