import { useState } from "react";
import{Box, Button, Heading, List, VStack}from "@chakra-ui/react"
import { Link } from "react-router-dom";
import bg1 from "../resources/bg1.png"


export default function AnalyseImage() {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const[students,setstudents]=useState([])
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/analyse`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.log(err);
      alert("Failed to send image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box backgroundImage={bg1} backgroundSize={"cover"} height={"100vh"} >
    <VStack style={{backdropFilter:"blur(6px)"}} height={"100vh"}  >
        <Heading fontSize={60} color={"rgba(106, 86, 254, 0.67)"}>
          SENSATTEND
        </Heading>
        <VStack>
          <Button>Choose file</Button>
          <Button>upload file</Button> 
        </VStack>
        {
          students.length &&
        <VStack width={"50%"} shadow={"2xl"} p="10" m="10" borderRadius={"25"} backgroundColor={"rgba(191, 185, 235, 0.67)"} style={{backdropFilter:"blur(150px)"}}>

           <Heading>List of present students</Heading>
            {
          
            students.map((s,key)=>(
              <Box shadow={"md"} width={"100%"} borderRadius={"15"} p="7" key={key}>
                {s}

              </Box>
            ))
          }
   
        </VStack>
        }

    </VStack>
    </Box>

 
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         minHeight: "100vh",
//         backgroundColor: "#f5f5f5",
//         padding: 20,
//       }}
//     >
//       <form
//         onSubmit={handleSubmit}
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           gap: 10,
//           backgroundColor: "#fff",
//           padding: 20,
//           borderRadius: 10,
//           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           width: 300,
//         }}
//       >
//         <h2 style={{ textAlign: "center" }}>Analyse Image</h2>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => setImage(e.target.files[0])}
//         />
//         <button
//           type="submit"
//           style={{
//             padding: 10,
//             backgroundColor: "#007bff",
//             color: "#fff",
//             border: "none",
//             borderRadius: 5,
//             cursor: "pointer",
//           }}
//         >
//           {loading ? "Processing..." : "Upload & Analyse"}
//         </button>
//       </form>

//       {response && (
//         <div
//           style={{
//             marginTop: 20,
//             padding: 20,
//             backgroundColor: "#fff",
//             borderRadius: 10,
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//             textAlign: "center",
//           }}
//         >
//           <h3>Analysis Result:</h3>
//           {response.message && <p>{response.message}</p>}
//           {response.matched && <p>Matched Rnos: {(response.matched).join(", ")}</p>}
//         </div>
//       )}
//       <div
//         style={{
//           marginTop: 20,
//           padding: 20,
//           backgroundColor: "#fff",
//           borderRadius: 10,
//           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           textAlign: "center",
//         }}
//       >
//         <h3>Want to add/remove students from the database ?</h3>
//         <Link to={'/students'}>
//         <button
//           style={{
//             padding: 10,
//             backgroundColor: "#007bff",
//             color: "#fff",
//             border: "none",
//             borderRadius: 5,
//             cursor: "pointer",
//           }}
//         >
//           Student Dashboard
//         </button>
//         </Link>
//       </div>
//     </div>
  );
}
