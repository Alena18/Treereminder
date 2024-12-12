import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import Trees from "../public/trees64.svg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
      setRedirect(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (redirect) {
    return <Navigate to="/home" />;
  }

  return (
    <>
      <img alt="Tree" src={Trees} style={{ marginBottom: "5%" }} />
      <form onSubmit={handleLogin}>
        <h3>Login</h3>
        <div className="mb-3">
          <label>Email address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div
          className="d-grid justify-content-center"
          style={{ marginTop: "5%" }}
        >
          <button type="submit" className="btn text-white btn-outline-light">
            Login
          </button>
        </div>
        <p className="forgot-password text-right" style={{ marginTop: "5%" }}>
          New user? <a href="/register">Register here</a>
        </p>
      </form>
    </>
  );
}

export default Login;
