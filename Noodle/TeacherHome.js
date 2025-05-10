import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // import your firebase config
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

export default function TeacherHome({ navigation }) {
  const [classes, setClasses] = useState([]);
  const [teacherId, setTeacherId] = useState(null);

  useEffect(() => {
    const auth = getAuth(); // Initialize Firebase Authentication
    const user = auth.currentUser; // Get the currently logged-in user
    if (user) {
      setTeacherId(user.uid); // Set the teacherId to the current user's ID
      fetchClasses(user.uid); // Fetch classes for the logged-in teacher
    } else {
      console.error("No user is logged in.");
    }
  }, []);

  const fetchClasses = async (teacherId) => {
    try {
      // Check if teacherId is set before querying
      if (!teacherId) {
        console.error("No teacher ID available.");
        return;
      }

      const q = query(
        collection(db, "classes"),
        where("teacherId", "==", teacherId)
      );
      console.log("Firestore Query:", q); // Log the query

      const querySnapshot = await getDocs(q);
      const classesList = [];

      querySnapshot.forEach((doc) => {
        console.log("Fetched Class:", doc.data()); // Log each fetched class
        classesList.push({ id: doc.id, ...doc.data() });
      });

      console.log("Fetched Classes:", classesList);
      setClasses(classesList); // Set the classes state
    } catch (error) {
      console.error("Error fetching classes: ", error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.classItem}>
      <Text style={styles.classTitle}>📚 {item.subject} Class</Text>
      <Text style={styles.classInfo}>
        🗓️ {item.dates.join(", ")} - ⏰ {item.times.join(", ")}
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Class", { classId: item.id })}
      >
        <Text style={styles.buttonText}>Enter Class</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Teacher 👋</Text>
      {classes.length === 0 ? (
        <Text>No classes assigned yet.</Text>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
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
