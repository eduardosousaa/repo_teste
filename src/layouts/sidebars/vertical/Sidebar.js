import { Nav, NavItem } from "reactstrap";
import Logo from "../../logo/Logo";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { AuthContext } from "../../../Context/AuthContext";
import SubMenuText from "../../../Constantes/SubMenusText";
import SubMenu from "../../../../src/components/ElementosUI/SubMenu";

const Sidebar = ({ isOpen, onToggle }) => {
	const router = useRouter();
	const location = router.pathname;
	const { user } = useContext(AuthContext);
	const menu = SubMenuText(user);

	return (
		<aside className={`sidebarArea ${isOpen ? "" : "collapsed"} ${isOpen ? "mobile-open" : ""}`}>
			<div className="d-flex flex-column p-3 align-items-center">
				<Logo isOpen={isOpen} />
				<button
					type="button"
					className="btn btn-light btn-sm mt-3"
					onClick={onToggle}
					aria-label={isOpen ? "Recolher" : "Expandir"}
					title={isOpen ? "Recolher" : "Expandir"}
				>
					{isOpen ? (
						<i className="bi bi-arrow-bar-left" />
					) : (
						<i className="bi bi-arrow-bar-right" />
					)}
				</button>
			</div>

			<div className="pt-2">
				<Nav vertical className="sidebarBox">
					{menu.map((navi, index) =>
						navi.permissao ? (
							navi.subMenu ? (
								<SubMenu
									key={index}
									dados={navi.subMenuList}
									icon={navi.icon}
									location={location}
									nomeMenu={navi.title}
									showText={isOpen}
								/>
							) : (
								<NavItem key={index} className="sidenav-bg">
									<Link
										href={navi.href}
										className={`nav-link py-3 d-flex align-items-center ${
											location === navi.href ? "text-primary" : "text-secondary"
										}`}
									>
										<i className={navi.icon} aria-hidden="true" />
										{isOpen && (
											<span className="ms-3 d-inline-block">{navi.title}</span>
										)}
									</Link>
								</NavItem>
							)
						) : null
					)}
				</Nav>
			</div>
		</aside>
	);
};

export default Sidebar;
