import { useEffect, useState } from "react";
import { Box, Button, Text, VStack, Heading } from "@chakra-ui/react";
import UploadStudent from "./UploadStudent";
import bg3 from "../resources/bg3.jpg";

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
      backgroundImage={bg3}
      backgroundSize={"cover"}
      height={"100vh"}  width={'100%'}
    >
      <VStack
        style={{ backdropFilter: "blur(8px)", backgroundColor:'#ffffff67' }}
        overflowY={"auto"}
        height={"100vh"}
        width={'100%'}
      >
        <UploadStudent />
        <Heading m={5} color={"black"}>
          {" "}
          View All Students
        </Heading>
        {studentData.length === 0 ? (
          <p color={"black"}>No students found.</p>
        ) : (
          <div style={styles.grid}>
            {studentData["students"].map((student, idx) => (
              <VStack
                key={student.roll_number ?? idx}
                borderRadius={"25"}
                p={5}
                m={5}
                backgroundColor={"#8aa1a6a5"}
                shadow={"3xl"}
              >
                <Text fontWeight={700} fontSize={"1.2rem"} textAlign={"center"} >{student.name || "Unnamed"} </Text>
                <Text color={"grey.800"}>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    width: "100%",
    padding: 16,
    boxSizing: "border-box",
    maxWidth: 1000,
  },
};
