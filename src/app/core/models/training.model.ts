export interface Training {
    _id: string;
    trainingName: string;
    adoptionGap: string;
    description: string;
    materials: Array<Material>;
    createdAt?: string;
  }
  
  export interface Material {
    _id: string;
    fileName: string;
    url: string;
  }
  
  