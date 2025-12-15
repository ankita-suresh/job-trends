import React, { useState, useEffect } from "react";
import "./JobList.css";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Edit modal state
  const [editingJob, setEditingJob] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  
  const ITEMS_PER_PAGE = 25;

  const fetchJobs = () => {
    console.log("📡 Fetching jobs from backend...");
    
    fetch("http://127.0.0.1:8000/jobs?limit=5000")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log(`✅ Loaded ${data.length} jobs`);
        setJobs(data);
        setFilteredJobs(data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error("❌ Error:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Search functionality
  useEffect(() => {
    if (jobs.length === 0) return;
    
    const filtered = jobs.filter(job => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (job.job_title && job.job_title.toLowerCase().includes(searchLower)) ||
        (job.location && job.location.toLowerCase().includes(searchLower)) ||
        (job.company?.company_name && job.company.company_name.toLowerCase().includes(searchLower)) ||
        (job.job_category && job.job_category.toLowerCase().includes(searchLower))
      );
    });
    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, jobs]);

  // Sort functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredJobs].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === 'min_salary') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredJobs(sorted);
  };

  // Edit job
  const handleEdit = (job) => {
    console.log("📝 Editing job:", job);
    setEditingJob(job);
    
    // Extract skills properly
    let skillsString = '';
    if (job.skills && Array.isArray(job.skills)) {
      skillsString = job.skills.map(s => 
        typeof s === 'string' ? s : s.skill_name
      ).join(', ');
    }
    
    setFormData({
      job_title: job.job_title || '',
      company_name: job.company?.company_name || '',
      location: job.location || '',
      min_salary: job.min_salary || 0,
      max_salary: job.max_salary || 0,
      experience_level: job.experience_level || '',
      work_setting: job.work_setting || '',
      job_category: job.job_category || '',
      company_size: job.company_size || '',
      work_year: job.work_year || 2024,
      skills: skillsString
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      console.log("💾 Saving job with data:", formData);
      
      // Process skills: convert comma-separated string to array
      const skillsArray = formData.skills 
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      
      const payload = {
        job_title: formData.job_title || "Untitled",
        company_name: formData.company_name || "Unknown Company",
        location: formData.location || "Remote",
        min_salary: parseInt(formData.min_salary) || 0,
        max_salary: parseInt(formData.max_salary) || 0,
        experience_level: formData.experience_level || null,
        work_setting: formData.work_setting || null,
        job_category: formData.job_category || null,
        company_size: formData.company_size || null,
        work_year: parseInt(formData.work_year) || 2024,
        skills: skillsArray
      };

      console.log("📤 Sending payload:", payload);

      const response = await fetch(`http://127.0.0.1:8000/jobs/${editingJob.job_id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log("📥 Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error response:", errorData);
        throw new Error(errorData.detail || 'Failed to update job');
      }

      const result = await response.json();
      console.log("✅ Update successful:", result);
      
      alert('Job updated successfully!');
      setShowEditModal(false);
      fetchJobs(); // Refresh list
      
    } catch (err) {
      console.error("❌ Error in handleSaveEdit:", err);
      alert('Error updating job: ' + err.message);
    }
  };

  // Delete job
  const handleDelete = async (job) => {
    if (!window.confirm(`Are you sure you want to delete "${job.job_title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      console.log("🗑️ Deleting job ID:", job.job_id);
      
      const response = await fetch(`http://127.0.0.1:8000/jobs/${job.job_id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log("📥 Delete response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error response:", errorData);
        throw new Error(errorData.detail || 'Failed to delete job');
      }

      const result = await response.json();
      console.log("✅ Delete successful:", result);
      
      alert('Job deleted successfully!');
      fetchJobs(); // Refresh list
      
    } catch (err) {
      console.error("❌ Error in handleDelete:", err);
      alert('Error deleting job: ' + err.message);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="joblist-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <h3>Loading Jobs...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="joblist-container">
        <div className="error-state">
          <h3>⚠️ Failed to load jobs</h3>
          <p>Error: {error}</p>
          <code>python app.py</code>
        </div>
      </div>
    );
  }

  return (
    <div className="joblist-enhanced">
      <div className="joblist-header">
        <div className="header-content">
          <h1>💼 Job Listings</h1>
          <p className="job-count">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title, location, company, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm("")}>✕</button>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('job_id')} className="sortable">
                ID {sortConfig.key === 'job_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('job_title')} className="sortable">
                Job Title {sortConfig.key === 'job_title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('min_salary')} className="sortable">
                Salary {sortConfig.key === 'min_salary' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Location</th>
              <th>Category</th>
              <th>Work Setting</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-results">
                  No jobs found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              currentJobs.map((job) => (
                <tr key={job.job_id} className="job-row">
                  <td className="id-cell">{job.job_id}</td>
                  <td className="title-cell">
                    <strong>{job.job_title || 'Untitled'}</strong>
                    {job.company?.company_name && (
                      <div className="company-name">{job.company.company_name}</div>
                    )}
                  </td>
                  <td className="salary-cell">
                    {job.min_salary ? (
                      <span className="salary-badge">${job.min_salary.toLocaleString()}</span>
                    ) : (
                      <span className="na">N/A</span>
                    )}
                  </td>
                  <td>{job.location || 'Remote'}</td>
                  <td>
                    {job.job_category ? (
                      <span className="category-badge">{job.job_category}</span>
                    ) : (
                      <span className="na">N/A</span>
                    )}
                  </td>
                  <td>
                    <span className={`setting-badge ${job.work_setting?.toLowerCase() || ''}`}>
                      {job.work_setting || 'N/A'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEdit(job)}
                      title="Edit job"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDelete(job)}
                      title="Delete job"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="page-btn">
            « First
          </button>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="page-btn">
            ‹ Prev
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn">
            Next ›
          </button>
          <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="page-btn">
            Last »
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Job</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.job_category}
                    onChange={(e) => setFormData({...formData, job_category: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Min Salary</label>
                  <input
                    type="number"
                    value={formData.min_salary}
                    onChange={(e) => setFormData({...formData, min_salary: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Max Salary</label>
                  <input
                    type="number"
                    value={formData.max_salary}
                    onChange={(e) => setFormData({...formData, max_salary: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    value={formData.experience_level}
                    onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Work Setting</label>
                  <select
                    value={formData.work_setting}
                    onChange={(e) => setFormData({...formData, work_setting: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="In-person">In-person</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Company Size</label>
                  <select
                    value={formData.company_size}
                    onChange={(e) => setFormData({...formData, company_size: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={formData.work_year}
                    onChange={(e) => setFormData({...formData, work_year: e.target.value})}
                    min="2020"
                    max="2025"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    placeholder="Python, SQL, React"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveEdit}>
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}