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

export default function SubjectDetail({ route, navigation }) {
  const { subjectId } = route.params;
  const [subject, setSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [newStudent, setNewStudent] = useState("");

  useEffect(() => {
    fetchSubjectAndClasses();
  }, [subjectId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchSubjectAndClasses();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchSubjectAndClasses = async () => {
    try {
      const subjectRef = doc(db, "subjects", subjectId);
      const subjectSnap = await getDoc(subjectRef);

      if (subjectSnap.exists()) {
        setSubject({ id: subjectSnap.id, ...subjectSnap.data() });
      }

      const q = query(collection(db, `subjects/${subjectId}/classes`));
      const querySnapshot = await getDocs(q);
      const classList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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

  const handleDeleteStudent = async (studentToDelete) => {
    Alert.alert(
      "Remove Student",
      `Are you sure you want to remove ${studentToDelete}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedStudents = (subject.students || []).filter(
                (student) => student !== studentToDelete
              );
              await updateDoc(doc(db, "subjects", subjectId), {
                students: updatedStudents,
              });
              setSubject({ ...subject, students: updatedStudents });
            } catch (error) {
              console.error("Error deleting student: ", error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteClass = (classId) => {
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

  // NEW: Delete subject function
  const handleDeleteSubject = () => {
    Alert.alert(
      "Delete Subject",
      "Are you sure you want to delete this subject? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "subjects", subjectId));
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting subject:", error);
              Alert.alert("Error", "Failed to delete the subject.");
            }
          },
        },
      ]
    );
  };

  const renderClassItem = ({ item }) => (
    <View style={styles.classItem}>
      <Text>📅 Dates: {item.dates?.join(", ") || "No dates"}</Text>
      <Text>⏰ Times: {item.times?.join(", ") || "No times"}</Text>
      <Text>👥 Students: {item.students?.join(", ") || "No students"}</Text>

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("EditClass", {
              subjectId: subject.id,
              classId: item.id,
            })
          }
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteClass(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!subject) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subject: {subject.name}</Text>
      <Text style={styles.subtitle}>👨‍🏫 {subject.teacherName}</Text>

      {/* DELETE SUBJECT BUTTON */}
      <TouchableOpacity
        style={styles.deleteSubjectButton}
        onPress={handleDeleteSubject}
      >
        <Text style={styles.deleteSubjectButtonText}>🗑️ Delete Subject</Text>
      </TouchableOpacity>

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

      {/* Student List */}
      <FlatList
        data={subject.students || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.studentRow}>
            <Text style={styles.studentItem}>👤 {item}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteStudent(item)}
            >
              <Text style={styles.deleteButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ marginVertical: 10 }}
      />

      {/* Add Class Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("CreateClass", {
            subjectId: subject.id,
            students: subject.students || [],
          })
        }
      >
        <Text style={styles.buttonText}>➕ Add Class</Text>
      </TouchableOpacity>

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
  deleteSubjectButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
  },
  deleteSubjectButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
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
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#FFF",
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
  editButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  editButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
