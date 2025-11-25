import * as React from "react"
import { cn } from "../../lib/utils"

// Estilos base para simular Tailwind
const styles = {
  card: {
    borderRadius: "0.75rem",
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    color: "#0f172a",
    overflow: "hidden" // Para que las esquinas redondeadas funcionen bien
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
    padding: "1.5rem"
  },
  title: {
    fontWeight: 600,
    fontSize: "1.125rem",
    lineHeight: 1,
    margin: 0
  },
  description: {
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0
  },
  content: {
    padding: "1.5rem",
    paddingTop: 0
  },
  footer: {
    display: "flex",
    alignItems: "center",
    padding: "1.5rem",
    paddingTop: 0
  }
}

const Card = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{ ...styles.card, ...style }}
    className={cn("ui-card", className)} // 'ui-card' por si quieres estilar globalmente
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{ ...styles.header, ...style }}
    className={className}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, style, ...props }, ref) => (
  <h3
    ref={ref}
    style={{ ...styles.title, ...style }}
    className={className}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, style, ...props }, ref) => (
  <p
    ref={ref}
    style={{ ...styles.description, ...style }}
    className={className}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, style, ...props }, ref) => (
  <div 
    ref={ref} 
    style={{ ...styles.content, ...style }}
    className={className} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    style={{ ...styles.footer, ...style }}
    className={className}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }