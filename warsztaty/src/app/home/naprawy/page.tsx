import { db } from '@/lib/db/config'
import { repairs, workshops, vehicles } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import RepairForm from './components/RepairForm'

export default async function RepairsPage() {
  const allRepairs = await db
    .select()
    .from(repairs)
    .leftJoin(workshops, eq(repairs.workshopId, workshops.id))
    .orderBy(desc(repairs.repairDate));

  const allWorkshops = await db
    .select()
    .from(workshops)
    .orderBy(desc(workshops.name));

  async function addRepair(formData: FormData) {
    'use server'
    
    try {
      const vin = formData.get('vin') as string
      const workshopId = Number(formData.get('workshop_id'))
      const partName = formData.get('part_name') as string
      const description = formData.get('description') as string

      // Sprawdź czy pojazd istnieje
      const existingVehicle = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.vin, vin))
        .limit(1);

      // Jeśli pojazd nie istnieje, dodaj go
      if (existingVehicle.length === 0) {
        await db.insert(vehicles).values({
          vin: vin,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Teraz możemy dodać naprawę
      await db.insert(repairs).values({
        vehicleVin: vin,
        workshopId,
        partName,
        description,
        repairDate: new Date(),
      });

      revalidatePath('/home/naprawy');
      return { success: true };
    } catch (error) {
      console.error('Błąd podczas dodawania naprawy:', error);
      return { 
        error: error instanceof Error 
          ? error.message 
          : 'Wystąpił błąd podczas dodawania naprawy'
      };
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Zarządzanie Naprawami</h1>
      
      <RepairForm addRepair={addRepair} workshops={allWorkshops} />

      {/* Lista napraw */}
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
            {allRepairs.map((repair) => (
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