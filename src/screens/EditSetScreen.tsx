import {
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  useMutation,
} from "@apollo/client/react";

import {
  UPDATE_SET_MUTATION,
} from "../graphql/mutations/updateSet";

import {
  DELETE_SET_MUTATION,
} from "../graphql/mutations/deleteSet";

import type {
  RootStackParamList,
} from "../navigation/AppNavigator";

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "EditSet"
  >;

export function EditSetScreen({
  navigation,
  route,
}: Props) {
  const {
    setId,
    exerciseName,
    setNumber,
    weight,
    reps,
    completed,
  } = route.params;

  const [weightValue, setWeightValue] =
    useState(String(weight));

  const [repsValue, setRepsValue] =
    useState(String(reps));

  const [completedValue, setCompletedValue] =
    useState(completed);

  const [
    updateSet,
    { loading: updating },
  ] = useMutation(
    UPDATE_SET_MUTATION
  );

  const [
    deleteSet,
    { loading: deleting },
  ] = useMutation(
    DELETE_SET_MUTATION
  );

  const handleSave = async () => {
    const parsedWeight =
      Number(weightValue);

    const parsedReps =
      Number(repsValue);

    if (
      Number.isNaN(parsedWeight) ||
      Number.isNaN(parsedReps)
    ) {
      return;
    }

    try {
      await updateSet({
        variables: {
          id: setId,
          input: {
            weight: parsedWeight,
            reps: parsedReps,
            completed:
              completedValue,
          },
        },
      });

      navigation.goBack();
    } catch (error) {
      console.error(
        "Failed to update set:",
        error
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSet({
        variables: {
          id: setId,
        },
      });

      navigation.goBack();
    } catch (error) {
      console.error(
        "Failed to delete set:",
        error
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="#146EF5"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          Edit Set
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          style={styles.label}
        >
          Exercise
        </Text>

        <View
          style={styles.exerciseField}
        >
          <Text
            style={styles.exerciseText}
          >
            {exerciseName}
          </Text>
        </View>

        <Text
          style={styles.label}
        >
          Set Number
        </Text>

        <View
          style={styles.readOnlyField}
        >
          <Text
            style={
              styles.readOnlyText
            }
          >
            {setNumber}
          </Text>
        </View>

        <View
          style={styles.row}
        >
          <View
            style={styles.halfField}
          >
            <Text
              style={styles.label}
            >
              Weight (kg)
            </Text>

            <TextInput
              value={weightValue}
              onChangeText={
                setWeightValue
              }
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>

          <View
            style={styles.halfField}
          >
            <Text
              style={styles.label}
            >
              Reps
            </Text>

            <TextInput
              value={repsValue}
              onChangeText={
                setRepsValue
              }
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
        </View>

        <View
          style={styles.completedRow}
        >
          <Text
            style={styles.completedText}
          >
            Completed
          </Text>

          <Switch
            value={completedValue}
            onValueChange={
              setCompletedValue
            }
            trackColor={{
              false: "#D0D5DD",
              true: "#9CC2FF",
            }}
            thumbColor={
              completedValue
                ? "#146EF5"
                : "#F2F4F7"
            }
          />
        </View>
      </View>

      {/* Actions */}
      <View
        style={styles.actions}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            updating &&
              styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={
            updating || deleting
          }
        >
          {updating ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.saveButtonText
              }
            >
              Save Changes
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            deleting &&
              styles.disabledDeleteButton,
          ]}
          onPress={handleDelete}
          disabled={
            updating || deleting
          }
        >
          {deleting ? (
            <ActivityIndicator
              color="#D92D20"
            />
          ) : (
            <Text
              style={
                styles.deleteButtonText
              }
            >
              Delete Set
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 35,
    justifyContent: "center",
  },

  backIcon: {
    fontSize: 34,
    color: "#102A68",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#102A68",
  },

  content: {
    marginTop: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#102A68",
    marginBottom: 6,
  },

  exerciseField: {
    height: 43,
    backgroundColor: "#F3F6FA",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 17,
  },

  exerciseText: {
    fontSize: 13,
    color: "#667085",
  },

  readOnlyField: {
    height: 43,
    backgroundColor: "#F3F6FA",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 17,
  },

  readOnlyText: {
    fontSize: 13,
    color: "#667085",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  halfField: {
    flex: 1,
  },

  input: {
    height: 43,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#344054",
  },

  completedRow: {
    marginTop: 20,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  completedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#102A68",
  },

  actions: {
    marginTop: "auto",
    marginBottom: 10,
  },

  saveButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: "#146EF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  deleteButton: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F04438",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledDeleteButton: {
    opacity: 0.6,
  },

  deleteButtonText: {
    color: "#D92D20",
    fontSize: 12,
    fontWeight: "600",
  },
});