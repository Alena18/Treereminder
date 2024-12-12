import { useState, useEffect } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import SignUp from "./components/Register";
import CalendarPage from "./components/CalendarPage";
import Home from "./components/Home";
import { auth } from "./firebase.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState(null); // Set initial state to null

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Set user state based on authentication status
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

 // Background color change logic
 useEffect(() => {
  if (location.pathname === "/home" ) {
    document.body.classList.add("dark-background");
    document.body.classList.remove("green-background");
  } else if(location.pathname === "/calendar") {
    document.body.classList.add("light-background");
    document.body.classList.remove("green-background");
  }else {
    document.body.classList.add("green-background");
    document.body.classList.remove("dark-background");
  }

  // Cleanup when component unmounts or pathname changes
  return () => {
    document.body.classList.remove("dark-background");
    document.body.classList.remove("green-background");
  };
}, [location.pathname]);

  return (
    <Router>
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
              <Route path="/home" element={<Home className="dark-background"/>} />
              <Route path="/calendar" element={<CalendarPage className="light-background"/>} />
            </Routes>
            <ToastContainer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
