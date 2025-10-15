import DefaultLayout from "@/components/layout/DefaultLayout";
import { menuGroups } from "@/config/menuConfig";

export default function InitialParamsPage() {
	return (
		<DefaultLayout
			headerTitle="Configuração do Módulo de Petição Inicial"
			headerSubtitle=""
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<h1 className="text-xl font-bold text-gray-900 mb-4" >
						Comarca Preferencial
					</h1>
					<label className="flex items-center gap-2 text-gray-700">
						<input type="checkbox" className="h-4 w-4 text-blue-600" />
						Utilizar Núcleo de Justiça 4.0 como prioritário
					</label>
				</div>

				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-xl font-bold text-gray-900 ">
							Parâmetros Fiscais
						</h1>
						<button className="px-3 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
							Editar
						</button>
					</div>
					<p className="inline-block text-black font-bold text-sm bg-gray-100 rounded-lg px-3 py-2">
						Valor da UFIR-PI: R$ 4,74
					</p>
				</div>

				<div className="bg-white border border-gray-200 rounded-lg p-6 md:col-span-2">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-lg font-semibold text-gray-900">
							Tabela de Valores Mínimos para Ajuizamento
						</h1>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full border border-gray-200 rounded-lg text-sm">
							<thead className="bg-gray-50 text-gray-700 text-left">
								<tr>
									<th className="px-4 py-2 border-b">Tributo</th>
									<th className="px-4 py-2 border-b">Limite mínimo (UFIRs)</th>
									<th className="px-4 py-2 border-b"></th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className="px-4 py-2 border-b">IPVA</td>
									<td className="px-4 py-2 border-b">
										<div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
									</td>
									<td className="px-4 py-2 border-b text-right">
										<button className="px-3 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
											Editar
										</button>
									</td>
								</tr>
								<tr>
									<td className="px-4 py-2 border-b">ICMS</td>
									<td className="px-4 py-2 border-b">
										<div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
									</td>
									<td className="px-4 py-2 border-b text-right">
										<button className="px-3 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
											Editar
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div className="flex justify-end mt-4">
				<button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer">
					Salvar
				</button>
			</div>
		</DefaultLayout>
	);
}
