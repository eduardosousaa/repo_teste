"use client";
import React from "react";
import { useState } from "react";

interface ActionButtonProps {
	label: string;
	variant?: "primary" | "secondary" | "danger" | "black";
	onClick: () => void;
	disabled?: boolean;
	loading?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
	label,
	onClick,
	disabled = false,
	loading = false,
	variant = "primary",
}) => {
	const [isHovered, setIsHovered] = useState(false);

	// Estilos baseados no design da página de edição
	const getButtonStyles = () => {
		const baseStyles =
			"px-6 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

		switch (variant) {
			case "primary":
				return `${baseStyles} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 cursor-pointer`;

			case "black":
				return `${baseStyles} bg-gray-900 text-white hover:bg-gray-800 focus:ring-black cursor-pointer`;

			case "secondary":
				return `${baseStyles} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500 cursor-pointer`;

			case "danger":
				return `${baseStyles} bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 cursor-pointer`;

			default:
				return `${baseStyles} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 cursor-pointer`;
		}
	};

	return (
		<button
			className={getButtonStyles()}
			onClick={disabled || loading ? undefined : onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			disabled={disabled || loading}
		>
			{loading ? (
				<span className="flex items-center gap-2">
					<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
							fill="none"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					{label}
				</span>
			) : (
				label
			)}
		</button>
	);
};

export default ActionButton;
