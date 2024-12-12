import { useState, useEffect } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom"; // Correct import for useLocation

import Login from "./components/Login";
import SignUp from "./components/Register";
import CalendarPage from "./components/CalendarPage";
import Home from "./components/Home";
import { auth } from "./firebase.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState(null); // Set initial state to null
  const location = useLocation(); // Now it's inside Router context

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Set user state based on authentication status
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  // Background color change logic based on the current route
  useEffect(() => {
    // Remove all background color classes before adding the new one
    document.body.classList.remove(
      "dark-background",
      "light-background",
      "green-background"
    );

    if (location.pathname === "/home") {
      document.body.classList.add("dark-background-home");
    } else if (location.pathname === "/calendar") {
      document.body.classList.add("dark-background-calendar");
    } else {
      document.body.classList.add("green-background");
    }

    // Cleanup when component unmounts or pathname changes
    return () => {
      document.body.classList.remove(
        "dark-background",
        "light-background",
        "green-background"
      );
    };
  }, [location.pathname]); // This effect will run on each route change

  return (
    <div className="App">
      <div className="auth-wrapper">
        <div className="auth-inner">
          <Routes>
            <Route
              path="/"
              element={
                user ? <Navigate to="/home" /> : <Navigate to="/register" />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/home" element={<Home />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Routes>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

// Wrap the entire app inside <Router> so useLocation can work
export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
