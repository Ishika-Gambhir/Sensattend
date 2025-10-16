import { useEffect, useState } from "react";

export default function ShowAllStudents() {
  const [studentData, setStudentData] = useState([]);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/students`,
          {
            method: "GET",
            header: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response) {
          const data = await response.json();
          if (data) {
            setStudentData(data);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetchStudents();
  }, []);

  async function onDelete(student) {
    if (window.confirm(`Delete ${student.name}?`)) {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/students/${student.roll_number}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          // Optionally refresh the student list
          setStudentData((prev) =>
            prev.filter((s) => s.roll_number !== student.roll_number)
          );
        } else {
          alert(`Error: ${data.error}`);
        }
      } catch (err) {
        console.log(err);
        alert("Failed to delete student");
      }
    }
  }

  return (
    <div style={styles.container}>
      <p>View All Students</p>
      {studentData.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div style={styles.grid}>
          {studentData.map((student, idx) => (
            <div key={student.roll_number ?? idx} style={styles.card}>
              <img
                src={`${process.env.REACT_APP_SERVER_URL}${student.image_url}`}
                alt={student.name || "Student"}
                style={styles.img}
              />
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <div style={{ fontWeight: 600 }}>
                  {student.name || "Unnamed"}
                </div>
                <div style={{ color: "#666", fontSize: 14 }}>
                  Roll: {student.roll_number ?? "N/A"}
                </div>
                <button
                  style={styles.deleteButton}
                  onClick={() => onDelete(student)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: 120,
    height: 120,
    objectFit: "cover",
    borderRadius: "50%",
    marginBottom: 12,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    width: "100%",
    padding: 16,
    boxSizing: "border-box",
    maxWidth: 1000,
  },
  deleteButton: {
    marginTop: 6,
    padding: "4px 8px",
    fontSize: 12,
    color: "white",
    backgroundColor: "red",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
};
