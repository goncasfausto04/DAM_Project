import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AdminHome({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Admin 👑</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("EditSubjects", { role: "admin" })}
      >
        <Text style={styles.buttonText}>Manage Subjects</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateAccount")}
      >
        <Text style={styles.buttonText}>Create Teacher Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#222",
  },
  button: {
    width: "80%",
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 18,
  },
});
