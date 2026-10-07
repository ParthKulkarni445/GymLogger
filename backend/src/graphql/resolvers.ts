import { pool } from '../db';

export const resolvers = {
  DateTime: {
    serialize(value: Date | string) {
      return value instanceof Date ? value.toISOString() : value;
    },
    parseValue(value: string) {
      return new Date(value);
    },
  },

  Query: {
    exercises: async () => {
      const result = await pool.query(`
        SELECT
          id,
          name,
          muscle_group AS "targetMuscle"
        FROM exercises
        ORDER BY name
      `);

      return result.rows;
    },

    workouts: async () => {
      const result = await pool.query(`
        SELECT
          id,
          name,
          started_at AS "startedAt",
          completed_at AS "completedAt"
        FROM workouts
        ORDER BY started_at DESC
      `);

      return result.rows;
    },

    workout: async (_: unknown, { id }: { id: string }) => {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          started_at AS "startedAt",
          completed_at AS "completedAt"
        FROM workouts
        WHERE id = $1
        `,
        [id]
      );

      return result.rows[0] ?? null;
    },

    exerciseHistory: async (
      _: unknown,
      { exerciseId }: { exerciseId: string }
    ) => {
      const result = await pool.query(
        `
        SELECT
          w.id AS "workoutId",
          w.name AS "workoutName",
          w.started_at AS "workoutStartedAt",
          we.id AS "workoutExerciseId"
        FROM workout_exercises we
        JOIN workouts w
          ON w.id = we.workout_id
        WHERE we.exercise_id = $1
        ORDER BY w.started_at DESC
        `,
        [exerciseId]
      );

      return Promise.all(
        result.rows.map(async (row) => {
          const setsResult = await pool.query(
            `
            SELECT
              id,
              set_number AS "setNumber",
              reps,
              weight,
              completed
            FROM sets
            WHERE workout_exercise_id = $1
            ORDER BY set_number
            `,
            [row.workoutExerciseId]
          );

          return {
            workoutId: row.workoutId,
            workoutName: row.workoutName,
            workoutStartedAt: row.workoutStartedAt,
            sets: setsResult.rows,
          };
        })
      );
    },
  },

  Workout: {
    exercises: async ({ id }: { id: string }) => {
      const result = await pool.query(
        `
        SELECT
          id,
          exercise_id AS "exerciseId",
          position
        FROM workout_exercises
        WHERE workout_id = $1
        ORDER BY position
        `,
        [id]
      );

      return result.rows;
    },
  },

  WorkoutExercise: {
    exercise: async ({ exerciseId }: { exerciseId: string }) => {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          muscle_group AS "targetMuscle"
        FROM exercises
        WHERE id = $1
        `,
        [exerciseId]
      );

      return result.rows[0];
    },

    sets: async ({ id }: { id: string }) => {
      const result = await pool.query(
        `
        SELECT
          id,
          set_number AS "setNumber",
          reps,
          weight,
          completed
        FROM sets
        WHERE workout_exercise_id = $1
        ORDER BY set_number
        `,
        [id]
      );

      return result.rows;
    },
  },

  Mutation: {
    createExercise: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          name: string;
          targetMuscle?: string | null;
        };
      }
    ) => {
      const result = await pool.query(
        `
        INSERT INTO exercises (name, muscle_group)
        VALUES ($1, $2)
        RETURNING
          id,
          name,
          muscle_group AS "targetMuscle"
        `,
        [input.name, input.targetMuscle ?? null]
      );

      return result.rows[0];
    },

    updateExercise: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string | null;
          targetMuscle?: string | null;
        };
      }
    ) => {
      const result = await pool.query(
        `
        UPDATE exercises
        SET
          name = COALESCE($2, name),
          muscle_group = COALESCE($3, muscle_group),
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          muscle_group AS "targetMuscle"
        `,
        [
          id,
          input.name ?? null,
          input.targetMuscle ?? null,
        ]
      );

      return result.rows[0] ?? null;
    },

    createWorkout: async (
      _: unknown,
      { input }: { input: { name: string } }
    ) => {
      const result = await pool.query(
        `
        INSERT INTO workouts (name)
        VALUES ($1)
        RETURNING
          id,
          name,
          started_at AS "startedAt",
          completed_at AS "completedAt"
        `,
        [input.name]
      );

      return result.rows[0];
    },

    completeWorkout: async (
      _: unknown,
      { id }: { id: string }
    ) => {
      const result = await pool.query(
        `
        UPDATE workouts
        SET
          completed_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          started_at AS "startedAt",
          completed_at AS "completedAt"
        `,
        [id]
      );

      return result.rows[0] ?? null;
    },

    addExerciseToWorkout: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          workoutId: string;
          exerciseId: string;
        };
      }
    ) => {
      const result = await pool.query(
        `
        INSERT INTO workout_exercises (
          workout_id,
          exercise_id,
          position
        )
        VALUES (
          $1,
          $2,
          COALESCE(
            (
              SELECT MAX(position) + 1
              FROM workout_exercises
              WHERE workout_id = $1
            ),
            1
          )
        )
        RETURNING
          id,
          exercise_id AS "exerciseId",
          position
        `,
        [input.workoutId, input.exerciseId]
      );

      return result.rows[0];
    },

    removeExerciseFromWorkout: async (
      _: unknown,
      { workoutExerciseId }: { workoutExerciseId: string }
    ) => {
      const result = await pool.query(
        `
        DELETE FROM workout_exercises
        WHERE id = $1
        RETURNING id
        `,
        [workoutExerciseId]
      );

      return result.rowCount === 1;
    },

    addSet: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          workoutExerciseId: string;
          weight: number;
          reps: number;
        };
      }
    ) => {
      const result = await pool.query(
        `
        INSERT INTO sets (
          workout_exercise_id,
          set_number,
          weight,
          reps
        )
        VALUES (
          $1,
          COALESCE(
            (
              SELECT MAX(set_number) + 1
              FROM sets
              WHERE workout_exercise_id = $1
            ),
            1
          ),
          $2,
          $3
        )
        RETURNING
          id,
          set_number AS "setNumber",
          reps,
          weight,
          completed
        `,
        [
          input.workoutExerciseId,
          input.weight,
          input.reps,
        ]
      );

      return result.rows[0];
    },

    updateSet: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          weight?: number | null;
          reps?: number | null;
          completed?: boolean | null;
        };
      }
    ) => {
      const result = await pool.query(
        `
        UPDATE sets
        SET
          weight = COALESCE($2, weight),
          reps = COALESCE($3, reps),
          completed = COALESCE($4, completed),
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          set_number AS "setNumber",
          reps,
          weight,
          completed
        `,
        [
          id,
          input.weight ?? null,
          input.reps ?? null,
          input.completed ?? null,
        ]
      );

      return result.rows[0] ?? null;
    },

    deleteSet: async (
      _: unknown,
      { id }: { id: string }
    ) => {
      const result = await pool.query(
        `
        DELETE FROM sets
        WHERE id = $1
        RETURNING id
        `,
        [id]
      );

      return result.rowCount === 1;
    },
  },
};