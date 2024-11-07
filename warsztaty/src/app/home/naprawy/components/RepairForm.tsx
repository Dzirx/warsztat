'use client'

import { useRef } from 'react'
import type { Workshop } from '@/lib/db/schema'

interface RepairFormProps {
  addRepair: (formData: FormData) => Promise<{ error?: string, success?: boolean }>;
  workshops: Workshop[];
  onSuccess?: () => void;
}

export default function RepairForm({ addRepair, workshops, onSuccess }: RepairFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form 
      ref={formRef}
      action={async (formData) => {
        try {
          const result = await addRepair(formData)
          if (result.success) {
            formRef.current?.reset()
            onSuccess?.();  // Wywołaj odświeżenie po udanym dodaniu
          } else if (result.error) {
            alert(result.error)
          }
        } catch (e) {
          const error = e as Error
          alert(error.message || 'Wystąpił błąd podczas dodawania naprawy')
        }
      }} 
      className="mb-8 p-4 border rounded-lg"
    >
      <h2 className="text-xl font-semibold mb-4">Dodaj nową naprawę</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">VIN pojazdu*</label>
          <input
            type="text"
            name="vin"
            required
            maxLength={17}
            className="w-full p-2 border rounded"
            placeholder="np. WBA1234567890"
          />
        </div>
        
        <div>
          <label className="block mb-1">Warsztat*</label>
          <select
            name="workshop_id"
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Wybierz warsztat</option>
            {workshops.map(workshop => (
              <option key={workshop.id} value={workshop.id}>
                {workshop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Nazwa części/usługi*</label>
          <input
            type="text"
            name="part_name"
            required
            maxLength={200}
            className="w-full p-2 border rounded"
            placeholder="np. Wymiana klocków hamulcowych"
          />
        </div>

        <div>
          <label className="block mb-1">Opis naprawy</label>
          <textarea
            name="description"
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Szczegółowy opis wykonanej naprawy..."
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Dodaj naprawę
      </button>
    </form>
  )
}