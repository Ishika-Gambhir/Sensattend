import { useEffect, useState } from "react";
import { Box, Button, Text, VStack, Heading } from "@chakra-ui/react";
import UploadStudent from "./UploadStudent";
import bg2 from "../resources/bg2.jpeg";

export default function ShowAllStudents() {
  const [studentData, setStudentData] = useState([]);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/students`,
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
          `${process.env.REACT_APP_SERVER_URL}/api/students/${student.roll_number}`,
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
    <Box
      backgroundImage={bg2}
      backgroundSize={"cover"}
      height={"100vh"}
      style={styles.container}
    >
      <VStack
        style={{ backdropFilter: "blur(6px)" }}
        overflowY={"auto"}
        height={"100vh"}
        width={'100%'}
      >
        <UploadStudent />
        <Heading m={5}>
          {" "}
          View All Students
        </Heading>
        {studentData.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <div style={styles.grid}>
            {studentData["students"].map((student, idx) => (
              <VStack
                key={student.roll_number ?? idx}
                borderRadius={"25"}
                p={5}
                m={5}
                backgroundColor={"#4545d28c"}
                shadow={"xl"}
              >
                <Text fontWeight={"bold"}>{student.name || "Unnamed"} </Text>
                <Text color={"#2b15f0ff"}>
                  Roll No: {student.roll_number ?? "N/A"}
                </Text>
                <Button
                  size={"sm"}
                  colorScheme={"red"}
                  onClick={() => onDelete(student)}
                >
                  Delete
                </Button>
              </VStack>
            ))}
          </div>
        )}
      </VStack>
    </Box>
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
