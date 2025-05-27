import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Ensure Firebase Auth is initialized before login attempt
    if (auth) {
      console.log("Firebase Auth initialized successfully.");
    } else {
      console.log("Firebase Auth not ready.");
    }
  }, [auth]);

  const handleLogin = async () => {
    if (email && password) {
      try {
        setErrorMessage("");
        setHasError(false);

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        console.log("User logged in:", user.uid);

        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role;

          console.log("User role:", role);

          if (role === "admin") {
            navigation.navigate("AdminHome", {role});
          } else if (role === "teacher") {
            navigation.navigate("TeacherHome");
          } else {
            setErrorMessage("Email and password don’t match.");
            setHasError(true);
          }
        } else {
          setErrorMessage("Email and password don’t match.");
          setHasError(true);
        }
      } catch (error) {
        console.error("Login error:", error.code);
        setErrorMessage("Email and password don’t match.");
        setHasError(true);
      }
    } else {
      setErrorMessage("Email and password don’t match.");
      setHasError(true);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("./images/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Noodle</Text>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => console.log("Forgot password tapped")}>
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
  inputError: {
    borderColor: "red",
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
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
