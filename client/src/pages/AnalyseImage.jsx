import { useState } from "react";
import { Box, Button, Heading, Image, List, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import bg1 from "../resources/bg1.png";

export default function AnalyseImage() {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setstudents] = useState([]);
  const handleSubmit = async () => {
    // e.preventDefault();

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

      if (res.ok) { // res.status===200
        setstudents(data['matched_roll_numbers']);
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
    <Box backgroundImage={bg1} backgroundSize={"cover"} height={"100vh"}
>
      <VStack style={{ backdropFilter: "blur(6px)" }} overflowY={'auto'} height={"100vh"}>
        <Heading fontSize={60} color={"rgba(106, 86, 254, 0.67)"}>
          SENSATTEND
        </Heading>
        <VStack>
          {/*  Name: -----------  */}
          <label>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setImage(e.target.files[0])}
            />
            <Button as="span" colorScheme="teal" variant="solid" size="md">
              Upload Image
            </Button>
          </label>
          {
            // write JS
            // if(image) {perform an action}
            // function abc() {return <></>}
            // abc()
            // AND OR Ternary
            image && (
              <>
              <Image src={URL.createObjectURL(image)} alt="submitted image"
                    objectFit="contain"
                    // width="100%"
                    height="20vh"
                    borderRadius="md"
                    boxShadow="md" />
              <Button isLoading={loading} loadingText="Analyzing..." onClick={handleSubmit}>Analyze Image</Button>
              </>
            )
          }
        </VStack>
        {students.length && (
          <VStack
            width={"50%"}
            shadow={"2xl"}
            p="10"
            m="10"
            borderRadius={"25"}
            backgroundColor={"rgba(191, 185, 235, 0.67)"}
            style={{ backdropFilter: "blur(150px)" }}
          >
            <Heading>List of present students</Heading>
            {students.map((s, key) => (
              <Box
                shadow={"md"}
                width={"100%"}
                borderRadius={"15"}
                p="7"
                key={key}
              >
                {s}
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
