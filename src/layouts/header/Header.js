import React from "react";
import {
	Navbar,
	Collapse,
	Nav,
	NavbarBrand,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Dropdown,
	Button,
} from "reactstrap";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import Constantes from "../../Constantes/Constantes";
import { AuthContext } from "../../Context/AuthContext";

const Header = ({ onToggleSidebar }) => {
	const [dropdownOpen, setDropdownOpen] = React.useState(false);
	const { user } = React.useContext(AuthContext);
	const router = useRouter();

	const toggle = () => setDropdownOpen((prev) => !prev);

	const logout = () => {
		destroyCookie(undefined, Constantes.nome_token, { path: "/" });
		router.push("/");
	};

	const userName = user?.name || user?.nome || user?.username || "Usuário";
	const authority =
		user?.authority ||
		user?.role ||
		(Array.isArray(user?.authorities) ? user.authorities[0] : null) ||
		"—";

	return (
		<Navbar className="topbar bg-white border-bottom" light expand="lg">
			<div className="d-flex align-items-center w-100 px-3">
				<button
					type="button"
					className="btn btn-link p-0 text-dark position-relative d-lg-none"
					onClick={onToggleSidebar}
					aria-label="Abrir menu"
					title="Abrir menu"
				>
					<i className="bi bi-list fs-3" />
				</button>

				<div className="ms-auto d-flex align-items-center justify-content-end gap-3">
					<button
						type="button"
						className="btn btn-link p-0 text-dark position-relative"
						aria-label="Notificações"
						title="Notificações"
					>
						<i className="bi bi-bell fs-5" />
						<span className="notif-dot position-absolute translate-middle rounded-circle"></span>
					</button>

					<div className="d-flex align-items-center gap-2">
						<div className="text-end lh-1">
							<div className="fw-semibold text-dark">{userName}</div>
							<div className="small text-muted">{authority}</div>
						</div>
						<i className="bi bi-person-circle fs-3 text-secondary" />
					</div>

					<Dropdown isOpen={dropdownOpen} toggle={toggle}>
						<DropdownToggle color="light" className="border-0 p-2">
							<i className="bi bi-list fs-4" />
						</DropdownToggle>
						<DropdownMenu end>
							<DropdownItem onClick={logout}>Sair</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			</div>
		</Navbar>
	);
};

export default Header;
