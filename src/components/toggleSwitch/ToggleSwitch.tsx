"use client"

interface ToggleSwitchProps {
  enabled: boolean
  onToggle: () => void
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export default function ToggleSwitch({ enabled, onToggle, size = "md", disabled = false }: ToggleSwitchProps) {
  const sizeClasses = {
    sm: "w-8 h-4",
    md: "w-11 h-6",
    lg: "w-14 h-7",
  }

  const thumbSizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const translateClasses = {
    sm: enabled ? "translate-x-4" : "translate-x-0",
    md: enabled ? "translate-x-5" : "translate-x-0",
    lg: enabled ? "translate-x-7" : "translate-x-0",
  }

  return (
    <button
      type="button"
      className={`
        ${sizeClasses[size]}
        ${enabled ? "bg-blue-600" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full
        transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-blue-500
      `}
      role="switch"
      aria-checked={enabled}
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
    >
      <span className="sr-only">Toggle switch</span>
      <span
        aria-hidden="true"
        className={`
          ${thumbSizeClasses[size]}
          ${translateClasses[size]}
          pointer-events-none inline-block rounded-full bg-white shadow transform ring-0
          transition ease-in-out duration-200
        `}
      />
    </button>
  )
}
