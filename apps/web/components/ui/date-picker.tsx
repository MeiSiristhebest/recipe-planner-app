"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/button"
import { Calendar } from "@repo/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  locale?: any
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export function DatePicker({ date, onSelect }: DatePickerProps) {
  const formattedValue = date ? format(date, "yyyy-MM-dd") : ""

  return (
    <div className="relative inline-block w-[240px]">
      <input
        type="date"
        value={formattedValue}
        onChange={(e) => {
          if (e.target.value) {
            onSelect(new Date(e.target.value))
          } else {
            onSelect(undefined)
          }
        }}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}
