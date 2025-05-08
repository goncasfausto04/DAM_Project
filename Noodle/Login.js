import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { auth, db } from "./firebase"; // Import Firebase auth and Firestore
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (email && password) {
      try {
        // Authenticate user with email and password
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Fetch the role from Firestore based on UID
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role; // 'role' is stored in Firestore

          if (role === "admin") {
            navigation.navigate("AdminHome");
          } else if (role === "teacher") {
            navigation.navigate("TeacherHome");
          } else {
            Alert.alert("Error", "No valid role found.");
          }
        } else {
          Alert.alert("Error", "User role not found in the database.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Login Error", error.message);
      }
    } else {
      Alert.alert("Error", "Please enter both email and password");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("./images/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Noodle</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => alert("Forgot password?")}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  button: {
    width: "100%",
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  forgot: {
    color: "#4CAF50",
    marginTop: 15,
    fontSize: 14,
  },
});
