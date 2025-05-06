import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AdminHome({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Admin 👑</Text>

      {/* Create Class Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateClass")}
      >
        <Text style={styles.buttonText}>Create Class</Text>
      </TouchableOpacity>

      {/* Create Account Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateAccount")}
      >
        <Text style={styles.buttonText}>Create Account</Text>
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    width: "80%",
    backgroundColor: "#2196F3", // Blue for admin buttons
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
});
