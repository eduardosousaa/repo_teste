"use client";

import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import SideBar from "../sidebar/Sidebar";
import type { MenuGroup } from "@/sharedComponents/sideBar/types";
import  useUserService  from "@/sharedComponents/service/UserService";

type DefaultLayoutProps = {
	children: React.ReactNode;
	headerTitle: string;
	headerSubtitle?: string;
	haveActionButtons?: boolean;
	menuGroups: MenuGroup[];
	footerText?: string;
	actionButtons?: React.ReactNode[];
};

export default function DefaultLayout({
	children,
	headerTitle,
	headerSubtitle,
	haveActionButtons = false,
	menuGroups,
	footerText,
	actionButtons = [],
}: DefaultLayoutProps) {
	const { getUserInfo } = useUserService();
	const [userName, setUserName] = useState<string>("Carregando...");
	const [userRole, setUserRole] = useState<string>("");

	useEffect(() => {
		
		async function fetchUser() {
			const info = await getUserInfo();
			if (info) {
				setUserName(info?.displayName);
				
				setUserRole(info?.roles || "Sem função");
			}
		}
		fetchUser();
	}, [getUserInfo]);

	return (
		<div className="flex h-screen bg-gray-50">
			<SideBar
				menuGroups={menuGroups}
				userName={userName}
				userRole={userRole}
				footerText={footerText}
			/>

			<div className="flex-1 flex flex-col">
				<Header
					title={headerTitle}
					subtitle={headerSubtitle}
					haveActionButtons={haveActionButtons}
					actionButtons={actionButtons}
				/>

				<main className="flex-1 p-6 overflow-auto space-y-6">
					{children}
				</main>
			</div>
		</div>
	);
}
