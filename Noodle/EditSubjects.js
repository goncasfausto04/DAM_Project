import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { useFocusEffect } from "@react-navigation/native";

export default function EditSubjects({ navigation, route }) {
  const role = route.params?.role || "teacher";

  const [subjects, setSubjects] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchSubjects = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "subjects"));
          const subjectsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSubjects(subjectsList);
        } catch (error) {
          console.error("Error fetching subjects: ", error);
        }
      };

      fetchSubjects();
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subjectItem}
      onPress={() =>
        navigation.navigate("SubjectDetail", { subjectId: item.id, role })
      }
    >
      <Text style={styles.subjectName}>{item.name}</Text>
      <Text style={styles.teacherName}>👨‍🏫 {item.teacherName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Subjects</Text>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }} // give space for button
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("CreateSubject", { role })}
      >
        <Text style={styles.floatingButtonText}>＋</Text>
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
  subjectItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  teacherName: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  floatingButtonText: {
    color: "#FFF",
    fontSize: 30,
    lineHeight: 30,
  },
});
