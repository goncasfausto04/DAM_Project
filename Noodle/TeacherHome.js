import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

export default function TeacherHome({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [teacherName, setTeacherName] = useState("Teacher");

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      fetchUserDetails(user.uid);
      fetchSubjects(user.uid);
    } else {
      console.error("No user is logged in.");
    }
  }, []);

  const fetchUserDetails = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setTeacherName(userData.fullName || "Teacher");
      } else {
        console.error("User data not found!");
      }
    } catch (error) {
      console.error("Error fetching user details: ", error);
    }
  };

  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const fetchSubjects = (teacherId) => {
    try {
      const q = query(
        collection(db, "subjects"),
        where("teacherId", "==", teacherId)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const subjectList = [];
        querySnapshot.forEach((doc) => {
          subjectList.push({ id: doc.id, ...doc.data() });
        });
        setSubjects(subjectList);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching subjects: ", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subjectItem}
      onPress={() =>
        navigation.navigate("SubjectDashboard", { subjectId: item.id })
      }
    >
      <Text style={styles.subjectTitle}>📘 {item.name}</Text>
      <Text style={styles.subjectTeacher}>👨‍🏫 {teacherName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>📅 {getFormattedDate()}</Text>
      <Text style={styles.title}>Welcome, {teacherName} 👋</Text>

      {subjects.length === 0 ? (
        <Text style={styles.noSubjects}>No subjects assigned yet.</Text>
      ) : (
        <FlatList
          data={subjects}
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
    backgroundColor: "#F4F6F8",
    padding: 20,
  },
  dateText: {
    fontSize: 16,
    color: "#777",
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  noSubjects: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
  list: {
    paddingBottom: 20,
  },
  subjectItem: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 3,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  subjectTeacher: {
    fontSize: 14,
    color: "#555",
  },
});
