export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: Set[];
}

export interface Workout {
  id: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  exercises: WorkoutExercise[];
}
