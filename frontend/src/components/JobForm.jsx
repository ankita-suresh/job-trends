import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();

const [form, setForm] = useState({
  Job_Title: "",
  Job_Description: "",
  Company_ID: "",
  Location_ID: "",
  Industry_ID: "",
  Salary_USD: "",
  Experience_Level: "",
  Employment_Type: "",
  Work_Setting: "",
});


  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetch(`http://127.0.0.1:8000/jobs/${id}`)
        .then((res) => res.json())
        .then((data) => setForm(data));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `http://127.0.0.1:8000/jobs/${id}`
      : "http://127.0.0.1:8000/jobs";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(() => navigate("/jobs"))
      .catch((err) => console.error(err));
  };

  return (
    <div className="container">
      <h2>{isEdit ? "Edit Job" : "Add Job"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Job Title</label>
          <input
            value={form.Job_Title}
            onChange={(e) => setForm({ ...form, Job_Title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Salary (USD)</label>
          <input
            type="number"
            value={form.Salary_USD}
            onChange={(e) => setForm({ ...form, Salary_USD: e.target.value })}
          />
        </div>
        <div className="form-group">
  <label>Job Description</label>
  <textarea
    value={form.Job_Description}
    onChange={(e) => setForm({ ...form, Job_Description: e.target.value })}
  />
</div>

<div className="form-group">
  <label>Company ID</label>
  <input
    type="number"
    value={form.Company_ID}
    onChange={(e) => setForm({ ...form, Company_ID: e.target.value })}
  />
</div>

<div className="form-group">
  <label>Location ID</label>
  <input
    type="number"
    value={form.Location_ID}
    onChange={(e) => setForm({ ...form, Location_ID: e.target.value })}
  />
</div>

<div className="form-group">
  <label>Industry ID</label>
  <input
    type="number"
    value={form.Industry_ID}
    onChange={(e) => setForm({ ...form, Industry_ID: e.target.value })}
  />
</div>


        <div className="form-group">
          <label>Experience Level</label>
          <input
            value={form.Experience_Level}
            onChange={(e) =>
              setForm({ ...form, Experience_Level: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Employment Type</label>
          <input
            value={form.Employment_Type}
            onChange={(e) =>
              setForm({ ...form, Employment_Type: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Work Setting</label>
          <input
            value={form.Work_Setting}
            onChange={(e) => setForm({ ...form, Work_Setting: e.target.value })}
          />
        </div>

        <button className="btn" type="submit">
          {isEdit ? "Update Job" : "Add Job"}
        </button>
      </form>
    </div>
  );
}
