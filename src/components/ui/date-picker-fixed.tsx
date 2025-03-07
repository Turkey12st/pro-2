
import * as React from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({ 
  date, 
  setDate, 
  label, 
  placeholder = "اختر تاريخ", 
  className,
  disabled = false
}: DatePickerProps) {
  return (
    <div className={className}>
      {label && <div className="mb-2 text-sm font-medium">{label}</div>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-between text-right font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            {date ? (
              format(date, "dd/MM/yyyy", { locale: ar })
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={ar}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
