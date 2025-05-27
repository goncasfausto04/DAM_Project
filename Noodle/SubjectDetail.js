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
  const { subjectId, role } = route.params;
  const [subject, setSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [newStudent, setNewStudent] = useState("");

  useEffect(() => {
    fetchSubjectAndClasses();
  }, [subjectId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchSubjectAndClasses);
    return unsubscribe;
  }, [navigation]);

  const fetchSubjectAndClasses = async () => {
    try {
      const subjectRef = doc(db, "subjects", subjectId);
      const subjectSnap = await getDoc(subjectRef);
      if (subjectSnap.exists())
        setSubject({ id: subjectSnap.id, ...subjectSnap.data() });

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

  const handleDeleteStudent = (studentToDelete) => {
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
                (s) => s !== studentToDelete
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
      <Text style={styles.classText}>
        📅 Dates: {item.dates?.join(", ") || "No dates"}
      </Text>
      <Text style={styles.classText}>
        ⏰ Times: {item.times?.join(", ") || "No times"}
      </Text>
      <Text style={styles.classText}>
        👥 Students: {item.students?.join(", ") || "No students"}
      </Text>

      <View style={styles.classButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("EditClass", {
              subjectId: subject.id,
              classId: item.id,
              role,
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

  if (!subject) return <Text style={styles.loadingText}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subject.name}</Text>
      <Text style={styles.subtitle}>👨‍🏫 {subject.teacherName}</Text>

      {role === "admin" && (
        <TouchableOpacity
          style={styles.deleteSubjectButton}
          onPress={handleDeleteSubject}
        >
          <Text style={styles.deleteSubjectButtonText}>🗑️ Delete Subject</Text>
        </TouchableOpacity>
      )}

      <View style={styles.addStudentContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter student name"
          value={newStudent}
          onChangeText={setNewStudent}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={subject.students || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.studentRow}>
            <Text style={styles.studentItem}>👤 {item}</Text>
            <TouchableOpacity
              style={styles.deleteButtonSmall}
              onPress={() => handleDeleteStudent(item)}
            >
              <Text style={styles.deleteButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        style={styles.studentsList}
      />

      {role === "admin" && (
        <TouchableOpacity
          style={styles.addClassButton}
          onPress={() =>
            navigation.navigate("CreateClass", {
              subjectId: subject.id,
              students: subject.students || [],
            })
          }
        >
          <Text style={styles.addClassButtonText}>+ Add Class</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderClassItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
    color: "#222",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 18,
  },
  deleteSubjectButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  deleteSubjectButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
  addStudentContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#222",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginLeft: 12,
  },
  addButtonText: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "700",
  },
  studentsList: {
    marginBottom: 20,
  },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  studentItem: {
    fontSize: 16,
    color: "#444",
  },
  deleteButtonSmall: {
    backgroundColor: "#E53935",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  addClassButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  addClassButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  classItem: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  classText: {
    fontSize: 15,
    color: "#555",
    marginBottom: 6,
  },
  classButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginRight: 12,
  },
  editButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 40,
    fontSize: 18,
    textAlign: "center",
    color: "#999",
  },
});
