export interface Gap {
  _id: string;
  gap_name: string;
  gap_weight: number;
  gap_score: number;
  picture_text: string;
  sections: Array<Section>;
  status: string;
  createdAt?: Date;
}

export interface Section {
  _id: string;
  section_name: string;
  questions: Array<Question>;
}

export interface Question {
  _id: string;
  question: string;
  question_type: string;
  weight: number;
  answers: Array<Answer>;
  is_not_applicable: boolean;
}

export interface Answer {
  _id: string;
  answer: string;
  description: string,
  weight: number,
  is_not_applicable: boolean,
}
