import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function MainScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Conference App!</Text>

      <Button
        title="Go to Articles"
        onPress={() => alert("Articles screen coming soon")}
      />

      <Button
        title="Go to Schedule"
        onPress={() => alert("Schedule screen coming soon")}
      />

      <Button
        title="Logout"
        onPress={() => navigation.replace("Login")}
        color="red"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#e6f7ff",
  },
  title: {
    fontSize: 22,
    marginBottom: 40,
    textAlign: "center",
  },
});
