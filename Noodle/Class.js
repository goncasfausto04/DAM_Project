import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { db } from "./firebase"; // Firebase database import
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"; // Firebase methods

export default function Class({ route, navigation }) {
  const { classId } = route.params; // Get classId from navigation params
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState("");
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetchClassData();
  }, [classId]); // Fetch data when classId changes

  const fetchClassData = async () => {
    try {
      const classDocRef = doc(db, "classes", classId);
      const classDocSnap = await getDoc(classDocRef);

      if (classDocSnap.exists()) {
        const data = classDocSnap.data();
        setClassData(data);
        setSubject(data.subject);
        setDates(data.dates || []);
        setTimes(data.times || []);
        setStudents(data.students || []);

        // Initialize attendance as all missing if students exist
        const initialAttendance =
          data.students && data.students.length > 0
            ? data.students.reduce((acc, student) => {
                acc[student] = "missing";
                return acc;
              }, {})
            : {};
        setAttendance(initialAttendance);
      } else {
        console.error("Class not found!");
      }
    } catch (error) {
      console.error("Error fetching class data: ", error);
    }
  };

  const handleAttendanceChange = (student) => {
    setAttendance((prev) => ({
      ...prev,
      [student]: prev[student] === "present" ? "missing" : "present",
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const classDocRef = doc(db, "classes", classId);
      await updateDoc(classDocRef, {
        subject,
        dates,
        times,
        attendance,
      });
      alert("Class updated successfully!");
    } catch (error) {
      console.error("Error updating class: ", error.message);
      alert("Failed to update class!");
    }
  };

  const handleDeleteClass = async () => {
    Alert.alert("Delete Class", "Are you sure you want to delete this class?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const classDocRef = doc(db, "classes", classId);
            await deleteDoc(classDocRef);
            alert("Class deleted successfully!");
            navigation.goBack(); // Go back to the previous screen after deletion
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
    const status = attendance[item];
    return (
      <View style={styles.attendanceItem}>
        <Text style={styles.attendanceText}>{item}</Text>
        <TouchableOpacity
          style={[
            styles.attendanceButton,
            { backgroundColor: status === "present" ? "#4CAF50" : "#FF5722" },
          ]}
          onPress={() => handleAttendanceChange(item)}
        >
          <Text style={styles.attendanceButtonText}>
            {status === "present" ? "Present" : "Missing"}
          </Text>
        </TouchableOpacity>
      </View>
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
    <View style={styles.container}>
      <Text style={styles.title}>{classData.subject} Class</Text>

      {/* Class Information */}
      <Text style={styles.classInfo}>🗓️ Dates: {dates.join(", ")}</Text>
      <Text style={styles.classInfo}>⏰ Times: {times.join(", ")}</Text>

      {/* Attendance */}
      <Text style={styles.sectionTitle}>Attendance</Text>
      <FlatList
        data={students}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderStudent}
        style={styles.list}
      />

      {/* Edit Subject */}
      <TextInput
        style={styles.input}
        placeholder="Edit Subject"
        value={subject}
        onChangeText={setSubject}
      />

      {/* Save Changes Button */}
      <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Delete Class Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#F44336" }]}
        onPress={handleDeleteClass}
      >
        <Text style={styles.buttonText}>Delete Class</Text>
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
  classInfo: {
    fontSize: 16,
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  attendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  attendanceText: {
    fontSize: 16,
    flex: 1,
  },
  attendanceButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  attendanceButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  list: {
    marginBottom: 20,
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
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
