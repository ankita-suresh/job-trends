# Job Trends Web Application

**A centralized, normalized platform for analyzing global employment statistics.**

---

## 📌 Project Overview

The Job Trends Web Application is a system designed to ingest, clean, and visualize global employment data. It transitions raw, unstructured CSV data into a strict **Third Normal Form (3NF)** relational schema to ensure high data integrity.

The application serves:
- **Data Analysts** requiring clean, de-duplicated data
- **Job Seekers** visualizing opportunities by industry and location
- **Researchers** looking for aggregate employment trends

---

## 🚀 Key Features

* **Job Management (CRUD)**: Create, Read, Update, and Delete job listings with strict validation to prevent duplicates and ensure integrity
* **Real-Time Analytics Dashboard**: Visualizes "Jobs per Skill," "Average Salary by Role," and other metrics using interactive charts
* **Advanced Search & Filter**: Filter job opportunities by company, location, or technical skills in real-time
* **Robust ETL Pipeline**: A "Constraint-Last" loading strategy that ingests raw CSVs, normalizes data into 6 distinct entities, and enforces referential integrity

---

## 🛠️ Tech Stack

### Backend
* **Language**: Python
* **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
* **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
* **Validation**: [Pydantic](https://docs.pydantic.dev/)

### Frontend
* **Library**: [React](https://react.dev/) (Vite)
* **Visualization**: [Recharts](https://recharts.org/)
* **HTTP Client**: Axios

### Database
* **Engine**: MySQL
* **Design**: Third Normal Form (3NF) Normalized Schema

---

## 🏗️ Architecture & Database Design

The database uses a normalized 6-table schema to eliminate redundancy:

1. **Companies**: Lookup table for unique company names
2. **Locations**: Standardized geographical data
3. **Industries**: Market sector categorization
4. **Skills**: Unique technical competencies
5. **Jobs**: The central Fact Table linking all dimensions
6. **job_skills**: Junction table resolving Many-to-Many relationships between Jobs and Skills

---

## ⚙️ Installation & Setup

### Prerequisites
* Python 3.9+
* Node.js & npm
* MySQL Server

### 1. Database Setup

Ensure your MySQL server is running. Create a database named `job_trends` and update the `db.py` configuration if necessary.
```bash
# In your MySQL terminal
CREATE DATABASE job_trends;
```

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/job-trends.git
cd job-trends/backend

# Install dependencies
pip install -r requirements.txt

# Run the ETL pipeline (if applicable) or start the server
# The server startup will create tables if they don't exist
uvicorn app:app --reload
```

### 3. Frontend Setup
```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 🔌 API Endpoints

The backend provides a comprehensive RESTful API:

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/jobs` | Create a new job listing |
| `GET` | `/jobs` | Retrieve all job listings (with pagination) |
| `GET` | `/jobs/{id}` | Retrieve a specific job with eager loaded details |
| `PUT` | `/jobs/{id}` | Update specific fields of a job listing |
| `DELETE` | `/jobs/{id}` | Remove a job listing (cascades to `job_skills`) |
| `GET` | `/analytics/skills` | Aggregate job counts by technical skill |
| `GET` | `/analytics/locations` | Aggregate job counts by location |
| `GET` | `/analytics/industries` | Aggregate job counts by industry |

---

## 🔮 Future Improvements

* **User Authentication**: Implement JWT-based login to restrict Delete/Update operations to authorized users
* **Advanced Filtering**: Enable range-based filtering for salaries (e.g., "> $100k")
* **Cloud Deployment**: Resolve environment variable injection issues to deploy on cloud platforms

---

## 👥 Contributors

* **Krishi Thiruppathi** - *Backend & Database Lead* (Schema Architecture, ETL Script, API Implementation)
* **Ankita Suresh Kumar** - *Frontend & API Lead* (React UI, Dashboard Visualization, Axios Integration)

---

## 🎓 Acknowledgements

This project benefited from the use of AI-assisted development and reference tools to enhance research depth, code quality, and report clarity.

* **ChatGPT (GPT-5, OpenAI, accessed November 2025)** – Assisted in documentation drafting, debugging explanations, and conceptual understanding
* **Google Gemini (accessed November 2025)** – Used for comparative insights and validation of generated code logic
* **Perplexity AI (accessed November 2025)** – Used for quick factual verification and alternative perspectives
* **Applied Database Technologies – Class Notes (2025)** – Served as a key academic reference for SQL concepts, normalization, and data modeling guidance

*All AI-generated or suggested content was critically reviewed, verified, and refined by the author before inclusion in this repository.*

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Contact

For questions or feedback, please open an issue on the GitHub repository.
