export const typeDefs = `
    scalar DateTime

    type Workout {
        id: ID!
        name: String!
        startedAt: DateTime!
        completedAt: DateTime
        exercises: [WorkoutExercise!]!
    }

    type WorkoutExercise {
        id: ID!
        exercise: Exercise!
        position: Int!
        sets: [Set!]!
    }

    type Exercise {
        id: ID!
        name: String!
        targetMuscle: String
    }

    type Set {
        id: ID!
        setNumber: Int!
        reps: Int!
        weight: Float!
        completed: Boolean!
    }

    type ExerciseHistoryEntry {
        workoutId: ID!
        workoutName: String!
        workoutStartedAt: DateTime!
        sets: [Set!]!
    }

    input CreateExerciseInput {
        name: String!
        targetMuscle: String
    }

    input UpdateExerciseInput {
        name: String
        targetMuscle: String
    }

    input CreateWorkoutInput {
        name: String!
    }

    input AddExerciseToWorkoutInput {
        workoutId: ID!
        exerciseId: ID!
    }

    input AddSetInput {
        workoutExerciseId: ID!
        weight: Float!
        reps: Int!
    }

    input UpdateSetInput {
        weight: Float
        reps: Int
        completed: Boolean
    }

    type Query {
        exercises: [Exercise!]!
        workouts: [Workout!]!
        workout(id: ID!): Workout
        exerciseHistory(exerciseId: ID!): [ExerciseHistoryEntry!]!
    }


    type Mutation {
        createExercise(input: CreateExerciseInput!): Exercise!
        updateExercise(id: ID!, input: UpdateExerciseInput!): Exercise

        createWorkout(input: CreateWorkoutInput!): Workout!
        completeWorkout(id: ID!): Workout

        addExerciseToWorkout(
            input: AddExerciseToWorkoutInput!
        ): WorkoutExercise!

        removeExerciseFromWorkout(workoutExerciseId: ID!): Boolean!

        addSet(input: AddSetInput!): Set!
        updateSet(id: ID!, input: UpdateSetInput!): Set!
        deleteSet(id: ID!): Boolean!
    }
`