export type QuestionType = "multiple_choice" | "true_false" | "matching";
export type QuestionLang = "uz" | "en" | "ar";

export interface AnswerOption {
  id: string;
  text: string;
}

export interface MatchingPair {
  id: string;
  left: { text: string; transliteration?: string };
  right: { text: string };
}

export interface QuestionData {
  type: QuestionType;
  promptLang: QuestionLang;
  order: number;
  // multiple_choice
  prompt?: string;
  promptTransliteration?: string;
  options?: AnswerOption[];
  correctOptionId?: string;
  // true_false
  statement?: string;
  isCorrect?: boolean;
  // matching
  instruction?: string;
  pairs?: MatchingPair[];
  // unused but present in the shared schema
  teacherId?: string | null;
  classId?: string | null;
}

export interface Question extends QuestionData {
  id: string;
}

export interface CollectionData {
  title: string;
  order: number;
  passThreshold: number;
  questionCount: number;
  ownerId: string;
}

export interface QuestionCollection extends CollectionData {
  id: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  groupCode: string;
  totalBall: number;
  totalAnswered: number;
  totalCorrect: number;
  role: string;
  teacherId?: string;
}

export interface CollectionProgress {
  collectionId: string;
  completed: boolean;
  bestScorePct: number;
}
