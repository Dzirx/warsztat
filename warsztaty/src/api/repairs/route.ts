import { NextResponse } from 'next/server';
import { db } from '@/lib/db/config';
import { repairs, vehicles, workshops } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Dodajemy export const runtime = 'edge' aby upewnić się, że endpoint działa na Vercel
export const runtime = 'edge';

// Dodajemy konfigurację CORS
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    // Dodajemy nagłówki CORS do odpowiedzi
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Sprawdzamy Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = await request.json();
    console.log('Otrzymane dane:', data);

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Dane muszą być tablicą' },
        { status: 400, headers: corsHeaders }
      );
    }

    const results = {
      success: 0,
      errors: 0,
      details: [] as string[]
    };

    for (const record of data) {
      try {
        // Sprawdzanie warsztatu
        const workshop = await db
          .select()
          .from(workshops)
          .where(eq(workshops.code, record.workshop_code))
          .limit(1);

        if (!workshop || workshop.length === 0) {
          results.errors++;
          results.details.push(`Nie znaleziono warsztatu o kodzie: ${record.workshop_code}`);
          continue;
        }

        // Sprawdzanie/dodawanie pojazdu
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

        // Dodawanie naprawy
        await db.insert(repairs).values({
          vehicleVin: record.vin,
          workshopId: workshop[0].id,
          partName: record.part_name,
          description: record.description || null,
          repairDate: record.repair_date ? new Date(record.repair_date) : new Date(),
        });

        results.success++;
      } catch (error) {
        console.error('Błąd przetwarzania rekordu:', error);
        results.errors++;
        results.details.push(`Błąd przetwarzania rekordu: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json(results, { headers: corsHeaders });
  } catch (error) {
    console.error('Główny błąd:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas przetwarzania danych' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Dodajemy metodę GET do testowania
export async function GET() {
  return NextResponse.json({
    status: 'API działa poprawnie',
    example: {
      vin: "WBA1234567890",
      workshop_code: "LUB001",
      part_name: "Wymiana oleju",
      description: "Test API",
      repair_date: new Date().toISOString()
    }
  });
}