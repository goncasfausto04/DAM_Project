import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // make sure the path is correct
import { addDoc } from "firebase/firestore";

export default function CreateSubject({ navigation }) {
  const [subjectName, setSubjectName] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const teachersList = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "teacher") {
          teachersList.push({ id: doc.id, ...data });
        }
      });

      setTeachers(teachersList);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      Alert.alert("Error", "Could not fetch teachers.");
    }
  };

  const handleCreateSubject = async () => {
    if (!subjectName || !selectedTeacher) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "subjects"), {
        name: subjectName,
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.fullName || "Unnamed Teacher",
      });

      Alert.alert("Success", "Subject created successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error creating subject:", error);
      Alert.alert("Error", "Could not create subject.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Subject 📚</Text>

      <TextInput
        style={styles.input}
        placeholder="Subject Name"
        placeholderTextColor="#999"
        value={subjectName}
        onChangeText={setSubjectName}
      />

      <Text style={styles.label}>Select a Teacher:</Text>

      {teachers.length === 0 ? (
        <Text>No teachers available.</Text>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.teacherItem,
                selectedTeacher?.id === item.id && styles.selected,
              ]}
              onPress={() => setSelectedTeacher(item)}
            >
              <Text>{item.fullName}</Text>
            </TouchableOpacity>
          )}
          style={{ marginBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateSubject}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Create Subject</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  teacherItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginBottom: 10,
  },
  selected: {
    backgroundColor: "#ADD8E6",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
