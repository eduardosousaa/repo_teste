"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { MenuItem, MenuGroup } from "@/sharedComponents/sideBar/types";
import useUserService from "@/sharedComponents/service/UserService";
import TokenService from "@/sharedComponents/service/TokenService";
import Image from "next/image";
type SideBarProps = {
	menuGroups: MenuGroup[];
	userName?: string;
	userRole?: string;
	footerText?: string;
};

export default function SideBar({
	menuGroups,
	userName,
	userRole,
	footerText,
}: SideBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [activePath, setActivePath] = useState("");
	const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
	const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
	const { signOut } = useUserService();
	const tokenService = TokenService();
	const [logoError, setLogoError] = useState(false);
	useEffect(() => {
		setActivePath(pathname);

		menuGroups.forEach((group) => {
			group.items.forEach((item) => {
				if (item.children) {
					const hasActiveChild = item.children.some((child) =>
						pathname.startsWith(child.path)
					);
					if (hasActiveChild) {
						setOpenMenus((prev) => ({ ...prev, [item.path]: true }));
					}
				}
			});
		});
	}, [pathname, menuGroups]);

	const handleMenuItemClick = (path: string) => {
		setActivePath(path);
		router.push(path);
	};

	const toggleSubmenu = (path: string) => {
		setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
	};

	const toggleGroup = (title: string) => {
		setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
	};

	const isItemActive = (item: MenuItem): boolean => {
		if (activePath === item.path) return true;
		if (item.children) {
			return item.children.some(
				(child) =>
					activePath === child.path || activePath.startsWith(child.path)
			);
		}
		return activePath.startsWith(item.path) && item.path !== "/";
	};

	const renderMenuItem = (item: MenuItem) => {
		const hasChildren = !!item.children?.length;
		const isOpen = openMenus[item.path] || false;
		const isActive = isItemActive(item);

		return (
			<div key={item.path}>
				<div
					className={`flex items-center justify-between py-3 px-4 cursor-pointer text-sm transition-all duration-200  rounded-lg ${
						isActive
							? "bg-blue-500 text-white shadow-sm"
							: "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
					}`}
					onClick={() =>
						hasChildren
							? toggleSubmenu(item.path)
							: handleMenuItemClick(item.path)
					}
				>
					<div className="flex flex-col">
						<span className="font-medium">{item.name}</span>
						{item.subtitle && (
							<span
								className={`text-xs mt-0.5 ${
									isActive ? "text-blue-100" : "text-gray-500"
								}`}
							>
								{item.subtitle}
							</span>
						)}
					</div>
					{hasChildren && (
						<ChevronDown
							size={16}
							className={`transition-transform duration-200 ${
								isOpen ? "transform rotate-180" : ""
							} ${isActive ? "text-white" : "text-gray-400"}`}
						/>
					)}
				</div>

				<AnimatePresence initial={false}>
					{hasChildren && isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className="ml-6 mt-1 space-y-1 overflow-hidden"
						>
							{item.children!.map((sub, index) => (
								<div
									key={`${sub.path}-${index}`}
									className={`py-2 px-4 cursor-pointer text-sm rounded-lg  transition-all duration-200 ${
										activePath === sub.path || activePath.startsWith(sub.path)
											? "bg-blue-100 text-blue-700 border-l-2 border-blue-500"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
									}`}
									onClick={() => handleMenuItemClick(sub.path)}
								>
									<span className="font-medium">{sub.name}</span>
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		);
	};

	const logoutUser = () => {
		signOut();
		tokenService.removeToken();
	};

	return (
		<div className="w-80 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
			{/* Logo Section */}
			<div className="p-6 border-b border-gray-200 bg-gradient-to-br from-[#E4EAFA]-50 to-[#E4EAFA]-100">
				<div className="flex items-center justify-center">
					{!logoError ? (
						<Image
							src="/icons/gedai-logo.svg"
							alt="Gedai Logo"
							width={180}
							height={60}
							className="object-contain"
							onError={() => setLogoError(true)}
							priority
						/>
					) : (
						<div className="text-2xl font-bold text-gray-700 tracking-tight">
							GEDAI
						</div>
					)}
				</div>
			</div>
			<div className="p-6 border-b border-gray-200 bg-gray-50">
				<div className="text-base font-semibold text-gray-900">{userName}</div>
				<div className="text-sm text-gray-600 mt-1">{userRole}</div>
			</div>

			<nav className="flex-1 overflow-y-auto ">
				{menuGroups.map((group) => {
					const isGroupOpen = openGroups[group.title] ?? true;
					return (
						<div
							key={group.title}
							className="border border-black rounded-lg mb-2"
						>
							<div
								className="flex items-center justify-between cursor-pointer bg-gray-600 text-white text-sm font-semibold py-3 px-4  rounded-lg shadow-sm hover:bg-gray-700 transition-colors duration-200"
								onClick={() => toggleGroup(group.title)}
							>
								<span>{group.title}</span>
								{isGroupOpen ? (
									<ChevronUp size={16} className="text-white" />
								) : (
									<ChevronDown size={16} className="text-white" />
								)}
							</div>

							<AnimatePresence initial={false}>
								{isGroupOpen && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.3, ease: "easeInOut" }}
										className="overflow-hidden"
									>
										<div className="pt-2 space-y-1">
											{group.items.map(renderMenuItem)}
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					);
				})}
			</nav>

			<div className="px-4 pb-2">
				<button
					onClick={() => logoutUser()}
					className="cursor-pointer w-full py-2 px-4 text-sm font-medium rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors"
				>
					Sair
				</button>
			</div>

			<div className="p-4 border-t border-gray-200 bg-gray-50">
				<div className="text-xs text-gray-500 text-center">{footerText}</div>
			</div>
		</div>
	);
}
