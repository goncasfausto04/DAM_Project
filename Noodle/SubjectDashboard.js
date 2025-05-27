import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export default function SubjectDashboard({ route, navigation }) {
  const { subjectId } = route.params;
  const [subject, setSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [newStudent, setNewStudent] = useState("");

  useEffect(() => {
    fetchSubjectAndClasses();
  }, [subjectId]);

  const fetchSubjectAndClasses = async () => {
    try {
      const subjectRef = doc(db, "subjects", subjectId);
      const subjectSnap = await getDoc(subjectRef);

      if (subjectSnap.exists()) {
        setSubject({ id: subjectSnap.id, ...subjectSnap.data() });
      } else {
        console.warn("Subject not found:", subjectId);
      }

      const classesRef = collection(db, `subjects/${subjectId}/classes`);
      const q = query(classesRef);
      const querySnapshot = await getDocs(q);

      const classList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched classes:", classList); // Debug here

      setClasses(classList);
    } catch (error) {
      console.error("Error loading subject/classes: ", error);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.trim()) return;
    try {
      const updatedStudents = [...(subject.students || []), newStudent.trim()];
      await updateDoc(doc(db, "subjects", subjectId), {
        students: updatedStudents,
      });
      setSubject({ ...subject, students: updatedStudents });
      setNewStudent("");
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  const removeStudent = async (studentToRemove) => {
    Alert.alert(
      "Remove Student",
      `Are you sure you want to remove ${studentToRemove}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedStudents = (subject.students || []).filter(
                (s) => s !== studentToRemove
              );
              await updateDoc(doc(db, "subjects", subjectId), {
                students: updatedStudents,
              });
              setSubject({ ...subject, students: updatedStudents });
            } catch (error) {
              console.error("Error removing student:", error);
            }
          },
        },
      ]
    );
  };

  const deleteClass = (classId) => {
    Alert.alert("Delete Class", "Are you sure you want to delete this class?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, `subjects/${subjectId}/classes`, classId));
            setClasses((prev) => prev.filter((cls) => cls.id !== classId));
          } catch (error) {
            console.error("Error deleting class:", error);
          }
        },
      },
    ]);
  };

  const renderClassItem = ({ item }) => (
    <View style={styles.classItem}>
      <Text style={styles.classInfo}>
        🗓️ {item.dates?.join(", ") || "No dates"}
      </Text>
      <Text style={styles.classInfo}>
        ⏰ {item.times?.join(", ") || "No times"}
      </Text>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate("EditClass", { subjectId, classId: item.id })
        }
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteClass(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (!subject) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subject: {subject.name}</Text>
      <Text style={styles.subtitle}>👨‍🏫 {subject.teacherName}</Text>

      {/* Add Student */}
      <View style={styles.addStudentContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter student name"
          value={newStudent}
          onChangeText={setNewStudent}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Student List with Remove */}
      <FlatList
        data={subject.students || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.studentRow}>
            <Text style={styles.studentItem}>👤 {item}</Text>
            <TouchableOpacity onPress={() => removeStudent(item)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ marginVertical: 10 }}
      />

      {/* Classes List */}
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderClassItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: "#555",
  },
  addStudentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
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
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  studentItem: {
    fontSize: 16,
  },
  removeText: {
    color: "red",
    marginLeft: 10,
    fontWeight: "bold",
  },
  classItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  classInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  editButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});
