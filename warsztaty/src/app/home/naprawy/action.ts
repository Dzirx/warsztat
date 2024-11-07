'use server'

import { db } from '@/lib/db/config'
import { repairs, workshops, vehicles } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { Repair } from './types'

export async function getRepairs() {
  const results = await db
    .select({
      repairs: repairs,
      workshops: workshops
    })
    .from(repairs)
    .leftJoin(workshops, eq(repairs.workshopId, workshops.id))
    .orderBy(desc(repairs.repairDate));

  return results as Repair[];
}

export async function getWorkshops() {
  return await db
    .select()
    .from(workshops)
    .orderBy(desc(workshops.name));
}

export async function addRepair(formData: FormData) {
  try {
    const vin = formData.get('vin') as string
    const workshopId = Number(formData.get('workshop_id'))
    const partName = formData.get('part_name') as string
    const description = formData.get('description') as string

    const existingVehicle = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.vin, vin))
      .limit(1);

    if (existingVehicle.length === 0) {
      await db.insert(vehicles).values({
        vin: vin,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

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