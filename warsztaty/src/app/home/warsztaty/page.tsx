import { db } from '@/lib/db/config'
import { workshops } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import DeleteButton from './components/deletebutton'
import WorkshopForm from './components/workshopform'

export default async function WorkshopsPage() {
  const allWorkshops = await db
    .select()
    .from(workshops)
    .orderBy(desc(workshops.createdAt));

  async function addWorkshop(formData: FormData) {
    'use server'
    
    try {
        const code = formData.get('code') as string
        const name = formData.get('name') as string
        const address = formData.get('address') as string
        const phone = formData.get('phone') as string
        const website = formData.get('website') as string
    
        // Sprawdź czy kod warsztatu już istnieje
        const existingWorkshop = await db
        .select()
        .from(workshops)
        .where(eq(workshops.code, code))
        .limit(1);
    
        if (existingWorkshop.length > 0) {
        return { error: `Warsztat o kodzie ${code} już istnieje!` }
        }
    
        await db.insert(workshops).values({
        code,
        name,
        address,
        phone,
        website,
        createdAt: new Date(),
        updatedAt: new Date(),
        })
    
        revalidatePath('/home/warsztaty')
        return { success: true }
    } catch (error) {
        console.error('Błąd podczas dodawania warsztatu:', error)
        return { 
        error: error instanceof Error 
            ? error.message 
            : 'Wystąpił błąd podczas dodawania warsztatu'
        }
    }
  }

  async function deleteWorkshop(formData: FormData) {
    'use server'
    
    const id = Number(formData.get('id'))
    
    if (!id || isNaN(id)) {
      throw new Error('Nieprawidłowe ID warsztatu')
    }

    await db.delete(workshops)
      .where(eq(workshops.id, id))

    revalidatePath('/home/warsztaty')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Zarządzanie Warsztatami</h1>
      
      {/* Formularz dodawania */}
      <WorkshopForm addWorkshop={addWorkshop} />

      {/* Lista warsztatów */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Kod</th>
              <th className="p-2 text-left">Nazwa</th>
              <th className="p-2 text-left">Adres</th>
              <th className="p-2 text-left">Telefon</th>
              <th className="p-2 text-left">Strona internetowa</th>
              <th className="p-2 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {allWorkshops.map((workshop) => (
              <tr key={workshop.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{workshop.code}</td>
                <td className="p-2">{workshop.name}</td>
                <td className="p-2">{workshop.address}</td>
                <td className="p-2">{workshop.phone}</td>
                <td className="p-2">
                  {workshop.website ? (
                    <a 
                      href={workshop.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      {workshop.website}
                    </a>
                  ) : '-'}
                </td>
                <td className="p-2">
                  <DeleteButton 
                    workshopId={workshop.id} 
                    deleteWorkshop={deleteWorkshop}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}