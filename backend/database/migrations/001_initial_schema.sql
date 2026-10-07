CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT exercises_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE UNIQUE INDEX exercises_name_lower_unique
  ON exercises (lower(name));

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT workouts_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT workouts_completion_after_start CHECK (
    completed_at IS NULL OR completed_at >= started_at
  )
);

CREATE INDEX workouts_started_at_idx ON workouts (started_at DESC);

CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts (id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises (id) ON DELETE RESTRICT,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT workout_exercises_position_positive CHECK (position > 0),
  CONSTRAINT workout_exercises_position_unique UNIQUE (workout_id, position),
  CONSTRAINT workout_exercises_exercise_unique UNIQUE (workout_id, exercise_id)
);

CREATE INDEX workout_exercises_exercise_id_idx
  ON workout_exercises (exercise_id);

CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises (id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC(8, 2) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sets_set_number_positive CHECK (set_number > 0),
  CONSTRAINT sets_reps_non_negative CHECK (reps >= 0),
  CONSTRAINT sets_weight_non_negative CHECK (weight >= 0),
  CONSTRAINT sets_set_number_unique UNIQUE (workout_exercise_id, set_number)
);

CREATE INDEX sets_workout_exercise_id_idx
  ON sets (workout_exercise_id);
