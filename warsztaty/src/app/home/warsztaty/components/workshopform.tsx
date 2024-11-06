'use client'

import { useRef } from 'react'

interface WorkshopFormProps {
  addWorkshop: (formData: FormData) => Promise<{ error?: string, success?: boolean }>
}

export default function WorkshopForm({ addWorkshop }: WorkshopFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form 
      ref={formRef}
      action={async (formData) => {
        try {
          const result = await addWorkshop(formData)
          if (result.success) {
            // Wyczyść formularz po udanym dodaniu
            formRef.current?.reset()
          } else if (result.error) {
            alert(result.error)
          }
        } catch (e) {
          const error = e as Error
          alert(error.message || 'Wystąpił błąd podczas dodawania warsztatu')
        }
      }} 
      className="mb-8 p-4 border rounded-lg"
    >
      <h2 className="text-xl font-semibold mb-4">Dodaj nowy warsztat</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Kod warsztatu*</label>
          <input
            type="text"
            name="code"
            required
            maxLength={10}
            className="w-full p-2 border rounded"
            placeholder="np. WARSZ001"
          />
        </div>
        <div>
          <label className="block mb-1">Nazwa warsztatu*</label>
          <input
            type="text"
            name="name"
            required
            maxLength={200}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Adres</label>
          <input
            type="text"
            name="address"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Telefon</label>
          <input
            type="tel"
            name="phone"
            maxLength={15}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Strona Internetowa</label>
          <input
            type="text"
            name="website"
            maxLength={100}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Dodaj warsztat
      </button>
    </form>
  )
}