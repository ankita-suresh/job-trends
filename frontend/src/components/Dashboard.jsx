// Dashboard.jsx
import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [totalJobs, setTotalJobs] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${BASE}/jobs/count`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        setTotalJobs(data.total_jobs ?? 0);
      } catch (err) {
        console.error("Error fetching job count:", err);
        // fallback: request one row and use total = unknown (keeps UX usable)
        try {
          const r2 = await fetch(`${BASE}/jobs?skip=0&limit=1`);
          if (r2.ok) {
            const arr = await r2.json();
            setTotalJobs(arr.length === 0 ? 0 : "unknown");
          } else {
            setTotalJobs("unknown");
          }
        } catch {
          setTotalJobs("unknown");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 30, background: "#fff", borderRadius: 8 }}>
      <h2>Dashboard</h2>
      <p style={{ color: "#666" }}>Total Jobs in Database:</p>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <h1 style={{ color: "#007bff", fontSize: 48 }}>
          {typeof totalJobs === "number" ? totalJobs : totalJobs}
        </h1>
      )}
    </div>
  );
}
