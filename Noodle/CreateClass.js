import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export default function CreateClass({ route, navigation }) {
  const { subjectId, students } = route.params; // Passed from SubjectDetail

  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const handleConfirmDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    if (!selectedDates.includes(dateString)) {
      setSelectedDates([...selectedDates, dateString]);
    }
    setDatePickerVisibility(false);
  };

  const handleConfirmTime = (time) => {
    const timeString = time.toTimeString().split(" ")[0].slice(0, 5);
    setSelectedTimes([...selectedTimes, timeString]);
    setTimePickerVisibility(false);
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0 || selectedTimes.length === 0) {
      alert("Add at least one date and one time ❗");
      return;
    }

    try {
      await addDoc(collection(db, `subjects/${subjectId}/classes`), {
        dates: selectedDates,
        times: selectedTimes,
        students,
        createdAt: serverTimestamp(),
      });

      alert("Class Created ✅");
      navigation.goBack();
    } catch (error) {
      console.error("Error creating class: ", error);
      alert("Failed to create class ❗");
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Class</Text>

      {/* Date Picker */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setDatePickerVisibility(true)}
      >
        <Text style={styles.dateButtonText}>➕ Add Class Date</Text>
      </TouchableOpacity>
      {selectedDates.map((date, i) => (
        <Text key={i} style={styles.dateItem}>
          📅 {date}
        </Text>
      ))}

      {/* Time Picker */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setTimePickerVisibility(true)}
      >
        <Text style={styles.dateButtonText}>➕ Add Class Time</Text>
      </TouchableOpacity>
      {selectedTimes.map((time, i) => (
        <Text key={i} style={styles.dateItem}>
          ⏰ {time}
        </Text>
      ))}

      {/* Pickers */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={() => setTimePickerVisibility(false)}
      />

      {/* Students Preview */}
      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Students:</Text>
      <FlatList
        data={students}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.studentItem}>👤 {item}</Text>
        )}
      />

      {/* Submit */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Class</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  dateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  studentItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
