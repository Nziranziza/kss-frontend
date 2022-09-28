export interface Training {
    _id: string;
    trainingName: string;
    adoptionGaps: any;
    description: string;
    status?: string;
    schedules?: Array<Schedule>;
    materials: Array<Material>;
    createdAt?: string;
    trainees?: any;
  }
  
  export interface Material {
    _id: string;
    fileName: string;
    url: string;
  }

  export interface Schedule {
    _id: string;
    trainingId: any;
    startTime: string;
    venueName: string;
    trainer: any;
    trainees: string;
    status: string;
  }
