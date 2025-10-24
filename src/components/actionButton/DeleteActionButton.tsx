'use client'

import React from "react"
import Image from "next/image"

interface DeleteActionButtonProps {
    onClick: () => void
    disabled?: boolean
    isLoading?: boolean
}

export const DeleteActionButton: React.FC<DeleteActionButtonProps> = ({
    onClick,
    disabled = false,
    isLoading = false,
}) => {
    return (
        <button
            onClick={onClick}
            className="cursor-pointer bg-transparent p-1 rounded hover:bg-gray-200 transition-colors"
            title="Excluir campanha"
            disabled={disabled || isLoading}
        >
            <Image
            src="/icons/delete.svg"
            alt="Excluir campanha"
            width={20}
            height={20}
            />
        </button>
    )
}
