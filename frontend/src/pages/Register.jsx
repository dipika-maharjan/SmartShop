import { useState } from "react";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    await API.post("/auth/register", form);
    alert("Registered successfully");
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Name" onChange={(e) => setForm({...form, name: e.target.value})}/>
      <input placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})}/>
      <input placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})}/>
      <button onClick={handleSubmit}>Register</button>
    </div>
  );
}