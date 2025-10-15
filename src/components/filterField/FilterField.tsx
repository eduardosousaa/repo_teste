"use client"

import type React from "react"

interface FilterFieldOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface FilterFieldProps {
  label: string
  name: string
  placeholder?: string
  isEditing?: boolean
  type?: "text" | "select" | "number" | "date" | "time" | "email" | "tel" | "url" | "textarea"
  options?: FilterFieldOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  disabled?: boolean
  required?: boolean
  min?: number
  max?: number
  step?: number
  rows?: number
  helpText?: string
  error?: string
  className?: string
  inputClassName?: string
  labelClassName?: string
}

export default function FilterField({
  label,
  name,
  placeholder,
  isEditing = false,
  type = "text",
  options = [],
  value,
  onChange,
  disabled = false,
  required = false,
  min,
  max,
  step,
  rows = 3,
  helpText,
  error,
  className = "",
  inputClassName = "",
  labelClassName = ""
}: FilterFieldProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!onChange) return

    const rawValue = e.target.value

    // Conversão de tipo baseada no tipo do input
    if (type === "number") {
      // Se estiver vazio, retorna string vazia ao invés de NaN
      if (rawValue === "") {
        onChange("")
        return
      }
      const numValue = Number(rawValue)
      onChange(isNaN(numValue) ? "" : numValue)
    } else {
      onChange(rawValue)
    }
  }

  // Classes base do campo
  const getFieldClasses = () => {
    const baseClasses = "w-full border rounded-lg px-3 py-2.5 text-sm transition-colors"
    
    let stateClasses = ""
    if (error) {
      stateClasses = "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
    } else if (isEditing) {
      stateClasses = "border-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-50"
    } else {
      stateClasses = "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
    }

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""

    return `${baseClasses} ${stateClasses} ${disabledClasses} ${inputClassName}`
  }

  // Renderizar o input apropriado
  const renderInput = () => {
    const commonProps = {
      id: name,
      name: name,
      value: value ?? "",
      onChange: handleChange,
      disabled: disabled,
      required: required,
      className: getFieldClasses()
    }

    switch (type) {
      case "select":
        return (
          <select {...commonProps}>
            {placeholder && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={`${option.value}`} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        )

      case "textarea":
        return (
          <textarea
            {...commonProps}
            placeholder={placeholder}
            rows={rows}
          />
        )

      case "number":
        return (
          <input
            {...commonProps}
            type="number"
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
          />
        )

      case "date":
      case "time":
      case "email":
      case "tel":
      case "url":
        return (
          <input
            {...commonProps}
            type={type}
            placeholder={placeholder}
          />
        )

      default: // text
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={placeholder}
          />
        )
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label 
        htmlFor={name} 
        className={`mb-2 text-sm font-medium text-gray-700 ${labelClassName}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {isEditing && (
          <span className="ml-2 text-xs text-orange-600 font-normal">
            (editando)
          </span>
        )}
      </label>

      {renderInput()}

      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">
          {helpText}
        </p>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}