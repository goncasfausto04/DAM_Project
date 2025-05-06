import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Correct import for Picker

export default function CreateClass() {
  const [subject, setSubject] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [timesPerDay, setTimesPerDay] = useState({
    Mon: "",
    Tue: "",
    Wed: "",
    Thu: "",
    Fri: "",
    Sat: "",
    Sun: "",
  });
  const [isExtra, setIsExtra] = useState(false);
  const [teacher, setTeacher] = useState("");
  const [studentName, setStudentName] = useState("");
  const [students, setStudents] = useState([]);

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const availableTimes = [
    "08:00 AM",
    "10:00 AM",
    "12:00 PM",
    "02:00 PM",
    "04:00 PM",
    "06:00 PM",
  ];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleTimeChange = (day, time) => {
    setTimesPerDay({
      ...timesPerDay,
      [day]: time,
    });
  };

  const handleAddStudent = () => {
    if (studentName.trim() !== "") {
      setStudents([...students, studentName.trim()]);
      setStudentName("");
    }
  };

  const handleSubmit = () => {
    if (subject && selectedDays.length > 0 && teacher && students.length > 0) {
      alert(`Class Created ✅\nExtra Class: ${isExtra ? "Yes" : "No"}`);
      // Later you'll send this data to backend
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

      {/* Days Selector */}
      <Text style={styles.label}>Select Days:</Text>
      <View style={styles.daysContainer}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDays.includes(day) && styles.dayButtonSelected,
            ]}
            onPress={() => toggleDay(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDays.includes(day) && styles.dayButtonTextSelected,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time Selectors for each selected day */}
      {selectedDays.map((day) => (
        <View key={day} style={styles.timeSelectorContainer}>
          <Text style={styles.dayLabel}>{day}:</Text>
          <Picker
            selectedValue={timesPerDay[day]}
            style={styles.picker}
            onValueChange={(itemValue) => handleTimeChange(day, itemValue)}
          >
            {availableTimes.map((time) => (
              <Picker.Item key={time} label={time} value={time} />
            ))}
          </Picker>
        </View>
      ))}

      {/* Extra Class Toggle */}
      <View style={styles.extraContainer}>
        <Text style={styles.label}>Mark as Extra Class</Text>
        <Switch
          value={isExtra}
          onValueChange={setIsExtra}
          trackColor={{ false: "#ccc", true: "#4CAF50" }}
          thumbColor={isExtra ? "#fff" : "#fff"}
        />
      </View>

      {/* Teacher */}
      <TextInput
        style={styles.input}
        placeholder="Assign Teacher (e.g., Mr. Smith)"
        value={teacher}
        onChangeText={setTeacher}
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

      {/* Show list of added students */}
      <FlatList
        data={students}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.studentItem}>👤 {item}</Text>
        )}
        style={{ marginVertical: 10, width: "100%" }}
      />

      {/* Submit Button */}
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
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  dayButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 5,
  },
  dayButtonSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  dayButtonText: {
    color: "#333",
  },
  dayButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  timeSelectorContainer: {
    marginVertical: 5,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  picker: {
    height: 50,
    width: "70%",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#FFF",
    marginLeft: 10,
  },
  extraContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "space-between",
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
