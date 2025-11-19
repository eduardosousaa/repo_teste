import { Row } from "reactstrap";
import styles from "./ProcessoHeader.module.css";

export default function ProcessoHeader({
	active,
	onChange,
	disabled = {},
	processo,
	user,
}) {
	const items = [
		{ key: "historico", label: "Consultar Andamento", icon: "bi-clock-history" },
		{ key: "novo", label: "Novo Documento", icon: "bi-file-earmark-plus" },
		{ key: "editar", label: "Editar processo", icon: "bi-pencil-square" },
		{
			key: "documentos",
			label: "Documentos vinculados",
			icon: "bi-file-earmark-text",
		},
		{ key: "ciencia", label: "Dar ciência", icon: "bi-check2-square" },
		{ key: "enviar", label: "Enviar Processo", icon: "bi-box-arrow-right" },
		{ key: "atribuir", label: "Atribuir", icon: "bi-people" },
		//{ key: "duplicar", label: "Duplicar", icon: "bi-files" },
		{
			key: "sobrestar",
			label: `${processo?.status === "SOBRESTADO" ? "Dessobrestar processo" : "Sobrestar processo"}`,
			icon: "bi-pause-btn",
		},
		{
			key: "finalizar",
			label: "Finalizar processo",
			icon: "bi-folder-check",
			variant: "success",
		},
		{
			key: "excluir",
			label: "Excluir processo",
			icon: "bi-trash",
			variant: "danger",
		},
	];

	const visibleItems = items.filter((it) => {
		if (it.key === "sobrestar" && user?.authority !== "ADMIN") return false;

		if (it.key === "editar" && !processo?.usuarioPodeEditar) return false;

		return true;
	});

	return (
		<>
			<div className={styles.processTitle}>
				<i className={`bi bi-folder-plus ${styles.processIcon}`} />
				<span>Processo Nº {processo?.numero}</span>
			</div>
			<div className={styles.header}>
				<div className={styles.title}>Gerenciar Processo</div>
				<Row>
					<nav className={styles.actions} aria-label="Gerenciar processo">
						{visibleItems.map((it) => {
							const activeCls =
								active === it.key
									? it.variant === "success"
										? styles.tileActiveSuccess
										: it.variant === "danger"
											? styles.tileActiveDanger
											: styles.tileActive
									: "";

							const cls = [
								styles.tile,
								activeCls,
								disabled[it.key] ? styles.tileDisabled : "",
							]
								.join(" ")
								.trim();

							const iconCls = [
								"bi",
								it.icon,
								styles.icon,
								it.key === "finalizar" ? styles.iconSuccess : "",
								it.key === "excluir" ? styles.iconDanger : "",
							]
								.join(" ")
								.trim();

							return (
								<>
									<button
										key={it.key}
										type="button"
										className={cls}
										onClick={() => !disabled[it.key] && onChange?.(it.key)}
										aria-current={active === it.key ? "page" : undefined}
									>
										<i className={iconCls} />
										<span className={styles.label}>
											<span className={styles.labelTitle}>{it.label}</span>
										</span>
									</button>
								</>
							);
						})}
					</nav>
				</Row>
			</div>
		</>
	);
}
