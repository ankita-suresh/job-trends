import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import JobList from "./components/JobList";
import JobForm from "./components/JobForm";
import Analytics3d from "./components/Analytics3d";
import "./styles.css";

export default function App() {
  return (
    <Router>
      <nav className="navbar">
        <h2 style={{ margin: 0 }}>Job Trends</h2>
        <div>
          <Link to="/">Dashboard</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/add">Add Job</Link>
          <Link to="/analytics3d">Analytics</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/add" element={<JobForm />} />
        <Route path="/edit/:id" element={<JobForm />} />
        <Route path="/analytics3d" element={<Analytics3d />} />

      </Routes>
    </Router>
  );
}
