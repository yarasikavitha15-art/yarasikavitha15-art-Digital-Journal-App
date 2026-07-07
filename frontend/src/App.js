import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchEntries();
    }
  }, [token]);

  const register = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
      });
      alert("Registration Successful!");
    } catch (err) {
      alert("Registration Failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      setToken(res.data.token);
      alert("Login Successful!");
    } catch (err) {
      alert("Login Failed");
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/journal", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setEntries(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const saveJournal = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/journal",
        {
          title,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Journal Saved!");

      setTitle("");
      setContent("");

      fetchEntries();
    } catch (err) {
      alert("Failed to Save");
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Digital Journal App</h1>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button onClick={register}>Register</button>

        <button onClick={login} style={{ marginLeft: "10px" }}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Digital Journal App</h1>

      <button onClick={() => {
        localStorage.removeItem("token");
        setToken("");
      }}>
        Logout
      </button>

      <br />
      <br />

      <input
        placeholder="Journal Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "300px" }}
      />

      <br />
      <br />

      <textarea
        placeholder="Write your journal..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="5"
        cols="40"
      />

      <br />
      <br />

      <button onClick={saveJournal}>Save Journal</button>

      <hr />

      <h2>My Journal Entries</h2>

      {entries.map((entry) => (
        <div
          key={entry._id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{entry.title}</h3>
          <p>{entry.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;