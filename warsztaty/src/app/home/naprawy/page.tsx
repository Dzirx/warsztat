'use client'

import { useEffect, useState } from 'react'
import RepairForm from './components/RepairForm'
import { getRepairs, getWorkshops, addRepair } from './actions'
import type { Repair, Workshop } from './types'

export default function RepairsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const newRepairs = await getRepairs()
      const newWorkshops = await getWorkshops()
      setRepairs(newRepairs as Repair[])
      setWorkshops(newWorkshops as Workshop[])
    } catch (error) {
      console.error('Błąd podczas odświeżania danych:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zarządzanie Naprawami</h1>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Odświeżanie...
            </>
          ) : (
            'Odśwież dane'
          )}
        </button>
      </div>

      <RepairForm 
        addRepair={addRepair} 
        workshops={workshops}
        onSuccess={refreshData}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">VIN</th>
              <th className="p-2 text-left">Warsztat</th>
              <th className="p-2 text-left">Część/Usługa</th>
              <th className="p-2 text-left">Opis</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((repair) => (
              <tr key={repair.repairs.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  {repair.repairs.repairDate?.toLocaleDateString()}
                </td>
                <td className="p-2">{repair.repairs.vehicleVin}</td>
                <td className="p-2">{repair.workshops?.name}</td>
                <td className="p-2">{repair.repairs.partName}</td>
                <td className="p-2">{repair.repairs.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}