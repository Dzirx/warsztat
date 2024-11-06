import { db } from '@/lib/db/config'
import { repairs, vehicles, workshops } from '@/lib/db/schema' // dodany import workshops
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// Typ dla danych przychodzących z SQL Server
interface SQLServerRepairData {
  vin: string;
  workshop_code: string;  // kod warsztatu
  part_name: string;     // nazwa części/usługi
  description?: string;  // opcjonalny opis
  repair_date?: string;  // data naprawy w formacie ISO
}

export async function POST(request: Request) {
  try {
    // Parsowanie danych przychodzących
    const data = (await request.json()) as SQLServerRepairData[];

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Dane muszą być tablicą' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      errors: 0,
      details: [] as string[]
    };

    // Przetwarzanie każdego rekordu
    for (const record of data) {
      try {
        // Walidacja wymaganych pól
        if (!record.vin || !record.workshop_code || !record.part_name) {
          results.errors++;
          results.details.push(`Brakujące wymagane pola dla VIN: ${record.vin || 'brak'}`);
          continue;
        }

        // Sprawdź czy pojazd istnieje, jeśli nie - dodaj
        const existingVehicle = await db
          .select()
          .from(vehicles)
          .where(eq(vehicles.vin, record.vin))
          .limit(1);

        if (existingVehicle.length === 0) {
          await db.insert(vehicles).values({
            vin: record.vin,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // Znajdź warsztat po kodzie
        const workshopResult = await db
          .select()
          .from(workshops)
          .where(eq(workshops.code, record.workshop_code))
          .limit(1);

        if (workshopResult.length === 0) {
          results.errors++;
          results.details.push(`Nie znaleziono warsztatu o kodzie: ${record.workshop_code}`);
          continue;
        }

        const workshop = workshopResult[0];

        // Dodaj naprawę
        await db.insert(repairs).values({
          vehicleVin: record.vin,
          workshopId: workshop.id,
          partName: record.part_name,
          description: record.description || null,
          repairDate: record.repair_date ? new Date(record.repair_date) : new Date(),
        });

        results.success++;
      } catch (error) {
        results.errors++;
        results.details.push(`Błąd przetwarzania rekordu dla VIN: ${record.vin} - ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
      }
    }

    return NextResponse.json({
      message: `Przetworzono pomyślnie: ${results.success}, Błędów: ${results.errors}`,
      details: results.details
    });

  } catch (error) {
    console.error('Błąd podczas przetwarzania danych:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas przetwarzania danych' },
      { status: 500 }
    );
  }
}

// Metoda GET do sprawdzenia czy endpoint działa
export async function GET() {
  return NextResponse.json({
    status: 'API działa poprawnie',
    example: {
      vin: "WBA1234567890",
      workshop_code: "WARSZ001",
      part_name: "Wymiana oleju",
      description: "Wymiana oleju i filtra",
      repair_date: "2024-03-15T10:00:00Z"
    }
  });
}