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
    <li className="flex items-start bg-neutral-50 p-2 sm:p-3 rounded-lg border border-neutral-200 hover:shadow-custom transition-shadow">
      <i className={`bi ${icon} ${iconColor} mr-2 mt-1`}></i>
      <div className="flex-1 flex justify-between items-start">
        <div className="flex-1">{children}</div>
        <div className="flex space-x-2 ml-2">
          <button
            className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            onClick={onEdit}
            aria-label="Editar"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            onClick={onDelete}
            aria-label="Eliminar"
          >
            <i className="bi bi-dash-lg"></i>
          </button>
        </div>
      </div>
    </li>
  )
}
