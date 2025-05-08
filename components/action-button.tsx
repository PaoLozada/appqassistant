"use client"

interface ActionButtonProps {
  type: "add" | "edit" | "delete"
  onClick: () => void
  label: string
  className?: string
}

export default function ActionButton({ type, onClick, label, className = "" }: ActionButtonProps) {
  let buttonClass = ""
  let icon = ""

  switch (type) {
    case "add":
      buttonClass = "action-button-add"
      icon = "bi-plus-lg"
      break
    case "edit":
      buttonClass = "action-button-edit"
      icon = "bi-pencil"
      break
    case "delete":
      buttonClass = "action-button-delete"
      icon = "bi-dash-lg"
      break
  }

  return (
    <button className={`${buttonClass} ${className}`} onClick={onClick} aria-label={label} title={label}>
      <i className={`bi ${icon}`}></i>
    </button>
  )
}
