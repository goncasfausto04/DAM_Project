import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export default function CreateClass() {
  const [subject, setSubject] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "teacher"));
      const querySnapshot = await getDocs(q);
      const teachersList = [];
      querySnapshot.forEach((doc) => {
        teachersList.push({ id: doc.id, ...doc.data() });
      });
      setTeachers(teachersList);
    } catch (error) {
      console.error("Error fetching teachers: ", error);
    }
  };

  const handleAddStudent = () => {
    if (studentName.trim() !== "") {
      setStudents([...students, studentName.trim()]);
      setStudentName("");
    }
  };

  const handleConfirmDate = (date) => {
    const dateString = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    if (!selectedDates.includes(dateString)) {
      setSelectedDates([...selectedDates, dateString]);
    }
    setDatePickerVisibility(false);
  };

  const handleConfirmTime = (time) => {
    const timeString = time.toTimeString().split(" ")[0].slice(0, 5); // Format: HH:MM
    setSelectedTimes([...selectedTimes, timeString]);
    setTimePickerVisibility(false);
  };

  const handleSubmit = async () => {
    if (
      subject &&
      selectedDates.length > 0 &&
      selectedTeacher &&
      students.length > 0
    ) {
      try {
        await addDoc(collection(db, "classes"), {
          subject,
          teacherId: selectedTeacher.id,
          teacherName: selectedTeacher.fullName,
          dates: selectedDates,
          times: selectedTimes, // Save selected times
          students,
          createdAt: serverTimestamp(),
        });

        alert("Class Created ✅");

        // Reset
        setSubject("");
        setSelectedTeacher(null);
        setStudents([]);
        setSelectedDates([]);
        setSelectedTimes([]); // Reset times as well
      } catch (error) {
        console.error("Error creating class: ", error);
        alert("Failed to create class ❗");
      }
    } else {
      alert("Please fill all fields and add at least one student ❗");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Class</Text>

      {/* Subject */}
      <TextInput
        style={styles.input}
        placeholder="Class Subject (e.g., Math)"
        value={subject}
        onChangeText={setSubject}
      />

      {/* Teacher Picker */}
      <Text style={styles.label}>Assign Teacher:</Text>
      <Picker
        selectedValue={selectedTeacher ? selectedTeacher.id : null}
        style={styles.picker}
        onValueChange={(itemValue) => {
          const teacher = teachers.find((t) => t.id === itemValue);
          setSelectedTeacher(teacher);
        }}
      >
        <Picker.Item label="Select a teacher" value={null} />
        {teachers.map((teacher) => (
          <Picker.Item
            key={teacher.id}
            label={teacher.fullName} // Display teacher's full name
            value={teacher.id}
          />
        ))}
      </Picker>

      {/* Date Picker */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setDatePickerVisibility(true)}
      >
        <Text style={styles.dateButtonText}>➕ Add Class Date</Text>
      </TouchableOpacity>

      {/* Show Selected Dates */}
      {selectedDates.map((date, index) => (
        <Text key={index} style={styles.dateItem}>
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

      {/* Show Selected Times */}
      {selectedTimes.map((time, index) => (
        <Text key={index} style={styles.dateItem}>
          ⏰ {time}
        </Text>
      ))}

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={() => setTimePickerVisibility(false)}
      />

      {/* Add Students */}
      <View style={styles.addStudentContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Student Name"
          value={studentName}
          onChangeText={setStudentName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* List Students */}
      <FlatList
        data={students}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.studentItem}>👤 {item}</Text>
        )}
        style={{ marginVertical: 10, width: "100%" }}
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
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#FFF",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 15,
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
  addStudentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 15,
    marginLeft: 10,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
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
