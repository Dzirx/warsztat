export interface Repair {
    repairs: {
      id: number;
      vehicleVin: string;
      workshopId: number;
      partName: string;
      description: string | null;
      repairDate: Date;
    };
    workshops: {
      id: number;
      name: string;
      code: string;
    } | null;
  }
  
  export interface Workshop {
    id: number;
    code: string;
    name: string;
    address: string | null;
    phone: string | null;
    website: string | null;
    createdAt: Date | null;  // Dodane pole
    updatedAt: Date | null;  // Dodane pole
  }