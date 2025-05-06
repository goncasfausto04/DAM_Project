import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function TeacherHome({ navigation }) {
  // Fake class data for now
  const classes = [
    { id: "1", subject: "Math", date: "May 10, 2025", time: "10:00 AM" },
    { id: "2", subject: "History", date: "May 11, 2025", time: "2:00 PM" },
    { id: "3", subject: "Science", date: "May 12, 2025", time: "9:00 AM" },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.classItem}>
      <Text style={styles.classTitle}>📚 {item.subject} Class</Text>
      <Text style={styles.classInfo}>
        🗓️ {item.date} - {item.time}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("MarkAttendance", { classId: item.id })
        }
      >
        <Text style={styles.buttonText}>Mark Attendance</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Teacher 👋</Text>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
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
  list: {
    paddingBottom: 20,
  },
  classItem: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  classInfo: {
    fontSize: 14,
    color: "#555",
    marginVertical: 5,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
