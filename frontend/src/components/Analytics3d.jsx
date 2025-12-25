import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./analytics-d3.css";

const BASE_URL = "http://127.0.0.1:8000";

export default function JobSpecificAnalytics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2024);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a job title or keywords");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Fetch all jobs matching the search term
      const response = await fetch(`${BASE_URL}/jobs?limit=10000`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      
      const allJobs = await response.json();
      
      // Filter jobs by search term and year range
      const searchLower = searchTerm.toLowerCase();
      const filteredJobs = allJobs.filter(job => {
        const titleMatch = job.job_title?.toLowerCase().includes(searchLower);
        const yearMatch = job.work_year >= startYear && job.work_year <= endYear;
        return titleMatch && yearMatch;
      });

      if (filteredJobs.length === 0) {
        setError(`No jobs found matching "${searchTerm}" between ${startYear}-${endYear}`);
        setLoading(false);
        return;
      }

      // Calculate trend data by year
      const trendByYear = {};
      filteredJobs.forEach(job => {
        const year = job.work_year || 2024;
        if (!trendByYear[year]) {
          trendByYear[year] = {
            year,
            count: 0,
            totalSalary: 0,
            salaries: []
          };
        }
        trendByYear[year].count += 1;
        if (job.min_salary) {
          trendByYear[year].totalSalary += job.min_salary;
          trendByYear[year].salaries.push(job.min_salary);
        }
      });

      // Calculate averages and format trend data
      const trendData = Object.values(trendByYear).map(yearData => ({
        year: yearData.year,
        count: yearData.count,
        avgSalary: yearData.salaries.length > 0 
          ? Math.round(yearData.totalSalary / yearData.salaries.length)
          : 0,
        minSalary: yearData.salaries.length > 0 ? Math.min(...yearData.salaries) : 0,
        maxSalary: yearData.salaries.length > 0 ? Math.max(...yearData.salaries) : 0
      })).sort((a, b) => a.year - b.year);

      // Calculate overall statistics
      const allSalaries = filteredJobs
        .map(j => j.min_salary)
        .filter(s => s && s > 0);
      
      const stats = {
        totalJobs: filteredJobs.length,
        avgSalary: allSalaries.length > 0 
          ? Math.round(allSalaries.reduce((a, b) => a + b, 0) / allSalaries.length)
          : 0,
        minSalary: allSalaries.length > 0 ? Math.min(...allSalaries) : 0,
        maxSalary: allSalaries.length > 0 ? Math.max(...allSalaries) : 0,
        uniqueLocations: new Set(filteredJobs.map(j => j.location)).size,
        uniqueCompanies: new Set(filteredJobs.map(j => j.company?.company_name).filter(Boolean)).size
      };

      setResults({
        jobs: filteredJobs,
        trendData,
        stats
      });
      setLoading(false);

    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🔍</span>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Job-Specific Analytics</h1>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
            Search and analyze specific job titles over time • {results?.stats.totalJobs || 0} jobs available
          </p>
        </div>

        {/* Search Criteria Card */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.3rem' }}>Search Criteria</h2>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Job Title Search */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 600, 
                color: '#34495e',
                fontSize: '0.95rem'
              }}>
                Job Title or Keywords
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., Data Scientist, Engineer, Manager..."
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #e0e6ed',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e6ed'}
              />
            </div>

            {/* Year Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 600, 
                  color: '#34495e',
                  fontSize: '0.95rem'
                }}>
                  Start Year (Optional)
                </label>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                  min="2020"
                  max="2024"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #e0e6ed',
                    borderRadius: '12px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 600, 
                  color: '#34495e',
                  fontSize: '0.95rem'
                }}>
                  End Year (Optional)
                </label>
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                  min="2020"
                  max="2024"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #e0e6ed',
                    borderRadius: '12px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                background: loading ? '#95a5a6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '1.3rem' }}>📊</span>
              {loading ? 'Analyzing...' : 'Analyze Job Trends'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <h3 style={{ color: '#2c3e50' }}>Loading jobs and building charts...</h3>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: '#fff5f5',
            border: '2px solid #fc8181',
            padding: '1.5rem',
            borderRadius: '12px',
            color: '#c53030',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <strong>{error}</strong>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <>
            {/* Statistics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <StatCard icon="💼" label="Total Jobs" value={results.stats.totalJobs} color="#667eea" />
              <StatCard icon="💰" label="Avg Salary" value={`$${results.stats.avgSalary.toLocaleString()}`} color="#4facfe" />
              <StatCard icon="📈" label="Max Salary" value={`$${results.stats.maxSalary.toLocaleString()}`} color="#43e97b" />
              <StatCard icon="🌍" label="Locations" value={results.stats.uniqueLocations} color="#fa709a" />
              <StatCard icon="🏢" label="Companies" value={results.stats.uniqueCompanies} color="#764ba2" />
            </div>

            {/* Trend Charts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Job Count Trend */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>📊 Job Postings Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="year" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#fff', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#667eea" 
                      strokeWidth={3} 
                      name="Job Count"
                      dot={{ fill: '#667eea', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Salary Trend */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>💰 Salary Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="year" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#fff', 
                        border: '1px solid #ddd', 
                        borderRadius: '8px' 
                      }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avgSalary" 
                      stroke="#4facfe" 
                      strokeWidth={3} 
                      name="Avg Salary"
                      dot={{ fill: '#4facfe', r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="maxSalary" 
                      stroke="#43e97b" 
                      strokeWidth={2} 
                      name="Max Salary"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Job Entries Table */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1.5rem',
              }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                  📋 All Job Entries ({results.jobs.length})
                </h3>
              </div>
              
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem'
                }}>
                  <thead style={{ 
                    position: 'sticky', 
                    top: 0, 
                    background: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    <tr>
                      <th style={tableHeaderStyle}>ID</th>
                      <th style={tableHeaderStyle}>Job Title</th>
                      <th style={tableHeaderStyle}>Company</th>
                      <th style={tableHeaderStyle}>Location</th>
                      <th style={tableHeaderStyle}>Salary</th>
                      <th style={tableHeaderStyle}>Year</th>
                      <th style={tableHeaderStyle}>Experience</th>
                      <th style={tableHeaderStyle}>Work Setting</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.jobs.map((job, idx) => (
                      <tr 
                        key={job.job_id || idx}
                        style={{
                          borderBottom: '1px solid #f1f3f5',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={tableCellStyle}>{job.job_id}</td>
                        <td style={{...tableCellStyle, fontWeight: 600, color: '#2c3e50'}}>
                          {job.job_title}
                        </td>
                        <td style={tableCellStyle}>
                          {job.company?.company_name || 'N/A'}
                        </td>
                        <td style={tableCellStyle}>{job.location || 'N/A'}</td>
                        <td style={{...tableCellStyle, fontWeight: 600, color: '#27ae60'}}>
                          {job.min_salary ? `$${job.min_salary.toLocaleString()}` : 'N/A'}
                        </td>
                        <td style={tableCellStyle}>{job.work_year || 'N/A'}</td>
                        <td style={tableCellStyle}>
                          <span style={{
                            background: '#e3f2fd',
                            color: '#1976d2',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                          }}>
                            {job.experience_level || 'N/A'}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            background: getWorkSettingColor(job.work_setting),
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                          }}>
                            {job.work_setting || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Footer Note */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#fff3e0',
          borderRadius: '12px',
          border: '1px solid #ffb74d',
          color: '#e65100',
          fontSize: '0.9rem'
        }}>
          <strong>Note:</strong> This visualization fetches up to 10,000 jobs from <code>/jobs</code> endpoint and filters them based on your search criteria.
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2c3e50' }}>
        {value}
      </div>
    </div>
  );
}

// Styles
const tableHeaderStyle = {
  padding: '1rem',
  textAlign: 'left',
  fontWeight: 600,
  color: '#495057',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
  letterSpacing: '0.5px'
};

const tableCellStyle = {
  padding: '1rem',
  color: '#495057'
};

function getWorkSettingColor(setting) {
  const colors = {
    'Remote': '#1abc9c',
    'Hybrid': '#e67e22',
    'In-person': '#e74c3c'
  };
  return colors[setting] || '#95a5a6';
}
