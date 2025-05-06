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

export default function Login({navigation}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email && password) {
      if (email === "admin") {
        navigation.navigate("AdminHome");
      } else {
        navigation.navigate("TeacherHome");
      }
    } else {
      Alert.alert("Error", "Please enter both email and password");
    }
  };

  return (
    <View style={styles.container}>
      {/* Noodle logo (use an image or text) */}
      <Image
        source={require("./images/logo.png")} // Access the local image from the 'images' folder
        style={styles.logo}
      />

      <Text style={styles.title}>Noodle</Text>

      {/* Email Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Forgot Password Link */}
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
    backgroundColor: "#F9F9F9", // Light background
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: "contain", // Ensure logo fits in the space without distortion
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50", // Noodle brand color (green)
    marginBottom: 40,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#E0E0E0", // Light border color for modern look
    borderWidth: 1,
    borderRadius: 25, // Rounded corners for input fields
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#FFF", // White background for inputs
  },
  button: {
    width: "100%",
    backgroundColor: "#4CAF50", // Green color for the button
    padding: 15,
    borderRadius: 25, // Rounded button corners
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
