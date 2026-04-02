import { useState } from "react";
import API from "../services/api";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    const res = await API.post("/auth/login", form);

    localStorage.setItem("token", res.data.token);
    alert("Login successful");
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})}/>
      <input placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})}/>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}