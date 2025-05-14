import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

export default function Class({ route, navigation }) {
  const { classId } = route.params;
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState("");
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const unsubscribe = fetchClassData();
    return () => unsubscribe();
  }, [classId]);

  const fetchClassData = () => {
    const classDocRef = doc(db, "classes", classId);
    const unsubscribe = onSnapshot(classDocRef, (classDocSnap) => {
      if (classDocSnap.exists()) {
        const data = classDocSnap.data();
        setClassData(data);
        setSubject(data.subject);
        setDates(data.dates || []);
        setTimes(data.times || []);
        setStudents(data.students || []);
        const initialDate = data.dates[0] || "";
        setSelectedDate(initialDate);
        loadAttendanceForDate(initialDate, data);
      } else {
        console.error("Class not found!");
      }
    });
    return unsubscribe;
  };

  const loadAttendanceForDate = (date, data = classData) => {
    if (!date) return;
    const attendanceRecords = data.attendanceRecords || {};
    const recordForDate = attendanceRecords[date] || {};
    const newAttendance = (data.students || []).reduce((acc, student) => {
      acc[student] = recordForDate[student] || "missing";
      return acc;
    }, {});
    setAttendance(newAttendance);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    loadAttendanceForDate(date);
  };

  const handleAttendanceChange = (student) => {
    setAttendance((prev) => ({
      ...prev,
      [student]: prev[student] === "present" ? "missing" : "present",
    }));
  };

  const handleSaveChanges = async () => {
    Keyboard.dismiss();
    if (!selectedDate) {
      alert("Please select a date first!");
      return;
    }
    try {
      const classDocRef = doc(db, "classes", classId);
      const classDocSnap = await getDoc(classDocRef);
      let currentData = classDocSnap.exists() ? classDocSnap.data() : {};
      let updatedAttendanceRecords = currentData.attendanceRecords || {};
      updatedAttendanceRecords = {
        ...updatedAttendanceRecords,
        [selectedDate]: attendance,
      };
      await updateDoc(classDocRef, {
        subject,
        dates,
        times,
        students,
        attendanceRecords: updatedAttendanceRecords,
      });
      alert("Class and attendance updated successfully!");
    } catch (error) {
      console.error("Error updating class: ", error.message);
      alert("Failed to update class!");
    }
  };

  const handleDeleteClass = async () => {
    Alert.alert("Delete Class", "Are you sure you want to delete this class?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const classDocRef = doc(db, "classes", classId);
            await deleteDoc(classDocRef);
            alert("Class deleted successfully!");
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting class: ", error.message);
            alert("Failed to delete class!");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const renderStudent = ({ item }) => {
    const isPresent = attendance[item] === "present";
    return (
      <TouchableOpacity
        style={styles.studentItem}
        onPress={() => handleAttendanceChange(item)}
      >
        <Text style={styles.studentText}>{item}</Text>
        <Text
          style={[styles.checkmark, { color: isPresent ? "green" : "red" }]}
        >
          {isPresent ? "✅" : "❌"}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!classData) {
    return (
      <View style={styles.container}>
        <Text>Loading class data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{classData.subject} Class</Text>
          <Text style={styles.classInfo}>🗓️ Dates: {dates.join(", ")}</Text>
          <Text style={styles.classInfo}>⏰ Times: {times.join(", ")}</Text>

          <View style={styles.datePicker}>
            {dates.map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateButton,
                  {
                    backgroundColor:
                      selectedDate === date ? "#2196F3" : "#E0E0E0",
                  },
                ]}
                onPress={() => handleDateSelect(date)}
              >
                <Text
                  style={{ color: selectedDate === date ? "#FFF" : "#000" }}
                >
                  {date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={students}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderStudent}
            style={styles.list}
            scrollEnabled={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Edit Subject"
            value={subject}
            onChangeText={setSubject}
          />

          <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#F44336" }]}
            onPress={handleDeleteClass}
          >
            <Text style={styles.buttonText}>Delete Class</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#F9F9F9", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  classInfo: { fontSize: 16, marginVertical: 5 },
  datePicker: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
  dateButton: { padding: 10, borderRadius: 10, margin: 5 },
  list: { marginBottom: 20 },
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
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#FFF", fontWeight: "bold" },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
  },
  studentText: { fontSize: 16 },
  checkmark: { fontSize: 20 },
});
