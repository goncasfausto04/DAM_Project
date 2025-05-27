import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function EditClass({ route, navigation }) {
  const { subjectId, classId } = route.params || {};

  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState("");

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  useEffect(() => {
    if (!subjectId || !classId) {
      Alert.alert("Missing subject or class ID");
      navigation.goBack();
    }

    const loadClass = async () => {
      try {
        const classRef = doc(db, `subjects/${subjectId}/classes/${classId}`);
        const classSnap = await getDoc(classRef);

        if (classSnap.exists()) {
          const data = classSnap.data();
          const defaultDate = data.dates?.[0] || "";

          setSelectedDates(data.dates || []);
          setSelectedTimes(data.times || []);
          setStudents(data.students || []);
          setAttendanceRecords(data.attendanceRecords || {});
          setSelectedDate(defaultDate);
          setAttendance(data.attendanceRecords?.[defaultDate] || {});
        } else {
          Alert.alert("Class not found");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error loading class:", error);
        Alert.alert("Failed to load class data");
        navigation.goBack();
      }
    };

    loadClass();
  }, [subjectId, classId]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setAttendance(attendanceRecords[date] || {});
  };

  const handleToggleAttendance = (student) => {
    setAttendance((prev) => ({
      ...prev,
      [student]: prev[student] === "present" ? "missing" : "present",
    }));
  };

  const handleConfirmDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    if (!selectedDates.includes(dateString)) {
      setSelectedDates([...selectedDates, dateString]);
    }
    setDatePickerVisibility(false);
  };

  const handleConfirmTime = (time) => {
    const timeString = time.toTimeString().split(" ")[0].slice(0, 5);
    if (!selectedTimes.includes(timeString)) {
      setSelectedTimes([...selectedTimes, timeString]);
    }
    setTimePickerVisibility(false);
  };

  const handleRemoveDate = (date) => {
    setSelectedDates(selectedDates.filter((d) => d !== date));
  };

  const handleRemoveTime = (time) => {
    setSelectedTimes(selectedTimes.filter((t) => t !== time));
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0 || selectedTimes.length === 0) {
      Alert.alert("Add at least one date and one time ❗");
      return;
    }

    try {
      const updatedAttendance = {
        ...attendanceRecords,
        [selectedDate]: attendance,
      };

      const classRef = doc(db, `subjects/${subjectId}/classes/${classId}`);
      await updateDoc(classRef, {
        dates: selectedDates,
        times: selectedTimes,
        students,
        attendanceRecords: updatedAttendance,
      });

      Alert.alert("Class updated ✅");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating class: ", error);
      Alert.alert("Failed to update class ❗");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Class</Text>

      {/* Date Picker */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setDatePickerVisibility(true)}
      >
        <Text style={styles.dateButtonText}>➕ Add Class Date</Text>
      </TouchableOpacity>
      {selectedDates.map((date, i) => (
        <TouchableOpacity key={i} onPress={() => handleRemoveDate(date)}>
          <Text style={styles.dateItem}>📅 {date} (Tap to remove)</Text>
        </TouchableOpacity>
      ))}

      {/* Time Picker */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setTimePickerVisibility(true)}
      >
        <Text style={styles.dateButtonText}>➕ Add Class Time</Text>
      </TouchableOpacity>
      {selectedTimes.map((time, i) => (
        <TouchableOpacity key={i} onPress={() => handleRemoveTime(time)}>
          <Text style={styles.dateItem}>⏰ {time} (Tap to remove)</Text>
        </TouchableOpacity>
      ))}

      {/* Select Date for Attendance */}
      <Text style={{ fontWeight: "bold", marginTop: 20 }}>
        Attendance Date:
      </Text>
      <View style={styles.dateSelectContainer}>
        {selectedDates.map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dateSelectButton,
              {
                backgroundColor: selectedDate === date ? "#2196F3" : "#E0E0E0",
              },
            ]}
            onPress={() => handleDateSelect(date)}
          >
            <Text style={{ color: selectedDate === date ? "#FFF" : "#000" }}>
              {date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Students with attendance */}
      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Students:</Text>
      <FlatList
        data={students}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const isPresent = attendance[item] === "present";
          return (
            <TouchableOpacity
              onPress={() => handleToggleAttendance(item)}
              style={styles.studentRow}
            >
              <Text style={styles.studentItem}>👤 {item}</Text>
              <Text
                style={{ fontSize: 18, color: isPresent ? "green" : "red" }}
              >
                {isPresent ? "✅" : "❌"}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Submit */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Update Class</Text>
      </TouchableOpacity>

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
  },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
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
  dateSelectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  dateSelectButton: {
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
});
