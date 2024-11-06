import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Komunikator Warsztatowy
      </h1>
      
      <div className="grid gap-4 max-w-md mx-auto">
        <Link 
          href="/home/warsztaty" 
          className="bg-orange-500 text-white p-4 rounded text-center hover:bg-orange-600"
        >
          Zarządzaj Warsztatami
        </Link>

        <Link 
          href="/home/naprawy" 
          className="bg-blue-500 text-white p-4 rounded text-center hover:bg-blue-600"
        >
          Zarządzaj Naprawami
        </Link>

      </div>
    </div>
  )
}