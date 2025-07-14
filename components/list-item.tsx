"use client"

import type React from "react"

interface ListItemProps {
  children: React.ReactNode
  onEdit: () => void
  onDelete: () => void
  icon?: string
  iconColor?: string
}

export function ListItem({
  children,
  onEdit,
  onDelete,
  icon = "bi-check",
  iconColor = "text-green-500",
}: ListItemProps) {
  return (
    <li className="flex items-start p-2 sm:p-3 rounded-lg border border-neutral-200 hover:shadow-custom transition-shadow">
      <i className={`bi ${icon} ${iconColor} mr-2 mt-1`}></i>
      <div className="flex-1 flex justify-between items-start">
        <div className="flex-1">{children}</div>
        <div className="flex space-x-2 ml-2">
          <button
            className="p-1 rounded-full text-accent-custom hover:text-six-custom transition-colors"
            onClick={onEdit}
            aria-label="Editar"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="p-1 hover:text-accent-custom transition-colors"
            onClick={onDelete}
            aria-label="Eliminar"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </li>
  )
}
