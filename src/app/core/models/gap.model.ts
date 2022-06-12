export interface Gap {
  _id: string;
  name: string;
  description: string;
  questions: Array<Question>;
  createdAt?: string;
}

export interface Question {
  _id: string;
  question: string;
  answerType: string;
  answers: Array<Answer>;
}

export interface Answer {
  _id: string;
  answer: string;
}
