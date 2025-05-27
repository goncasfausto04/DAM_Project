import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "./Login";
import AdminHome from "./AdminHome";
import TeacherHome from "./TeacherHome";
import CreateClass from "./CreateClass";
import CreateAccount from "./CreateAccount";
import CreateSubject from "./CreateSubject";
import EditSubjects from "./EditSubjects";
import SubjectDetail from "./SubjectDetail"; // Assuming this is the file for subject details
import EditClass from "./EditClass"; // Assuming this is the file for editing class details
import SubjectDashboard from "./SubjectDashboard"; // Import component properly

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AdminHome" component={AdminHome} />
        <Stack.Screen name="TeacherHome" component={TeacherHome} />
        <Stack.Screen name="CreateClass" component={CreateClass} />
        <Stack.Screen name="CreateAccount" component={CreateAccount} />
        <Stack.Screen name="CreateSubject" component={CreateSubject} />
        <Stack.Screen name="EditSubjects" component={EditSubjects} />
        <Stack.Screen name="SubjectDetail" component={SubjectDetail} />
        <Stack.Screen name="EditClass" component={EditClass} />
        <Stack.Screen name="SubjectDashboard" component={SubjectDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
