"use client"

import * as Drawer from "@radix-ui/react-dialog"
import { X } from "lucide-react"

export default function VersionHistory() {
  const versions = [
    { id: 1, data: "15/07/25", status: "Ativa" },
    { id: 2, data: "10/06/25", status: "Inativa" },
    { id: 3, data: "05/05/25", status: "Ativa" },
  ]

  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 cursor-pointer">
          Histórico de Versões
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50" />

        <Drawer.Content
          className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <Drawer.Title className="text-lg font-semibold">
              Histórico de Versões
            </Drawer.Title>
            <Drawer.Close asChild>
              <button className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </Drawer.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{v.data}</p>
                  <p className="text-sm text-gray-500">Status: {v.status}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500">
                    Visualizar
                  </button>
                  <button className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-400">
                    Restaurar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
