"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react" // Asegúrate de tener lucide-react instalado
import { cn } from "../../lib/utils"

const SelectContext = React.createContext(null)

const Select = ({ children, value, onValueChange }) => {
  const [open, setOpen] = React.useState(false)
  
  // Cerrar al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.select-container')) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative select-container">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => {
  const { value } = React.useContext(SelectContext)
  // Aquí podrías mapear el valor a una etiqueta legible si tuvieras la lista, 
  // pero para este caso simple mostramos un texto genérico si hay valor.
  // En la implementación real de Shadcn esto es más complejo.
  // Para el gráfico, el valor "90d" es legible, así que lo mostramos directo o un mapa simple.
  
  const labelMap = {
      "90d": "Últimos 3 meses",
      "30d": "Últimos 30 días",
      "7d": "Última semana"
  }

  return (
    <span
      ref={ref}
      className={cn("block truncate", className)}
      {...props}
    >
      {labelMap[value] || value || placeholder}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  const { open } = React.useContext(SelectContext)
  
  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md animate-in fade-in-80",
        position === "popper" && "translate-y-1",
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { onValueChange, setOpen, value: selectedValue } = React.useContext(SelectContext)
  
  const handleSelect = () => {
      onValueChange(value)
      setOpen(false)
  }

  return (
    <div
      ref={ref}
      onClick={handleSelect}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-gray-100 cursor-pointer data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selectedValue === value && "font-semibold bg-gray-50",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {selectedValue === value && (
             <span className="text-xs">✓</span>
        )}
      </span>
      <span className="truncate">{children}</span>
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}