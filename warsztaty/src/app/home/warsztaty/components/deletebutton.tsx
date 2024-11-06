'use client'

interface DeleteButtonProps {
    workshopId: number;
    deleteWorkshop: (formData: FormData) => Promise<void>;
  }
  
  export default function DeleteButton({ workshopId, deleteWorkshop }: DeleteButtonProps) {
    return (
      <form action={deleteWorkshop}>
        <input type="hidden" name="id" value={workshopId} />
        <button
          type="submit"
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          onClick={(e) => {
            if (!confirm('Czy na pewno chcesz usunąć ten warsztat?')) {
              e.preventDefault();
            }
          }}
        >
          Usuń
        </button>
      </form>
    );
  }