"use client"
import ActionButton from "./action-button"

interface SectionHeaderProps {
  title: string
  onAdd?: () => void
  addLabel?: string
  className?: string
}

export default function SectionHeader({ title, onAdd, addLabel = "Añadir", className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex justify-between items-center mb-3 sm:mb-4 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-bold text-primary-custom">{title}</h2>
      {onAdd && <ActionButton type="add" onClick={onAdd} label={addLabel} />}
    </div>
  )
}
