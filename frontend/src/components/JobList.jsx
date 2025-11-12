import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const navigate = useNavigate();

  const fetchCount = async () => {
    const res = await fetch("http://127.0.0.1:8000/jobs/count");
    const data = await res.json();
    setRowCount(data.total_jobs);
  };

  const fetchJobs = async (page = 0, limit = 25) => {
    setLoading(true);
    const skip = page * limit; // ← correct skip calculation
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/jobs?skip=${skip}&limit=${limit}`
      );
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  useEffect(() => {
    fetchJobs(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    await fetch(`http://127.0.0.1:8000/jobs/${id}`, { method: "DELETE" });
    fetchCount();
    fetchJobs(paginationModel.page, paginationModel.pageSize);
  };

  const columns = [
    { field: "Job_ID", headerName: "ID", width: 70 },
    { field: "Job_Title", headerName: "Title", flex: 1, minWidth: 200 },
    // { field: "Company", headerName: "Company", flex: 1, minWidth: 150 },
    // { field: "Location", headerName: "Location", width: 150 },
    { field: "Salary_USD", headerName: "Salary (USD)", width: 130, type: "number" },
    { field: "Experience_Level", headerName: "Experience", width: 130 },
    { field: "Employment_Type", headerName: "Type", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => navigate(`/edit/${params.row.Job_ID}`)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => handleDelete(params.row.Job_ID)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Job Listings
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <DataGrid
          rows={jobs}
          columns={columns}
          getRowId={(row) => row.Job_ID}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          paginationMode="server"
          rowCount={rowCount}
          loading={loading}
          sortingMode="client"
          filterMode="client"
          autoHeight
          disableSelectionOnClick
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 2,
            "& .MuiDataGrid-cell": { fontSize: "0.9rem" },
          }}
        />
      )}
    </Box>
  );
}
