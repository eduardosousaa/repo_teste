import { AuthContext } from "../Context/AuthContext";
import { useContext } from "react";

export default function SubMenuText() {
	const { user } = useContext(AuthContext);

	let navigation = [];
	navigation.push({
		title: "Processos",
		
		icon: "bi bi-folder",
		subMenu: true,
		permissao: true,
		subMenuList: [
			{
				title: "Meus processos",
				href: "/processos",
			},
            {
				title: "Criar processo",
				href: "/processos/iniciar-processo",
			},
		],
	});

	return navigation;
}
