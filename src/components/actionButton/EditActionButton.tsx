'use client'

import React from "react"
import Image from "next/image"


interface EditActionButtonProps {
    onClick: () => void
}

export const EditActionButton: React.FC<EditActionButtonProps> = ({
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className="cursor-pointer bg-transparent p-1 rounded hover:bg-gray-200 transition-colors"
            title="Editar campanha"
        >
            <Image
            src="/icons/edit.svg"
            alt="Editar campanha"
            width={20}
            height={20}
            />
        </button>
    )
}