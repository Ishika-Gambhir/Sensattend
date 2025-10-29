import { Box, VStack, Heading, Button, Image, Text } from "@chakra-ui/react";
import { useState } from "react";
import bg1 from "../resources/bg1.png";
export default function SubmitImage() {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
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
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/upload_for_analyse`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // res.status===200
        // setstudents(data["matched_roll_numbers"]);
        setResponse(data['message'])
      } else {
        setResponse(data['error'])
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
    <Box backgroundImage={bg1} backgroundSize={"cover"} height={"100vh"} width={'100%'}>
      <VStack
       backgroundColor={"#ffffff55"}
        style={{ backdropFilter: "blur(8px)" }}
        overflowY={"auto"}
        height={"100vh"}
      >
        <Heading fontSize={80} color={"rgba(43, 18, 230, 0.82)"}>
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
                <Image
                  src={URL.createObjectURL(image)}
                  alt="submitted image"
                  objectFit="contain"
                  // width="100%"
                  height="20vh"
                  borderRadius="md"
                  boxShadow="md"
                />
                <Button
                  isLoading={loading}
                  loadingText="Analyzing..."
                  onClick={handleSubmit}
                >
                  Analyze Image
                </Button>
              </>
            )
          }
          {response && <Text>{response}</Text>}
        </VStack>
      </VStack>
    </Box>
  );
}
