import {
  Box,
  Button,
  FormLabel,
  HStack,
  Input,
  VStack,
  Image,
  Text,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react";

export default function UploadStudent() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    // e.preventDefault();

    if (!name || !rollNumber || !image) {
      setMessage("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("roll_number", rollNumber);
    formData.append("image", image);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/students`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Student uploaded successfully!");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // 1-> make a Vstack, HStack,
  // Start using Chakra UI components, Input, Button
  // start linking function onClick

  return (
    <>
      <VStack gap={5}>
        <Heading >Add a new Student</Heading>
        <VStack
          backgroundColor={"#4545d28c"}
          p={10}
          m={10}
          borderRadius={"25"}
          shadow={"2xl"}
        >
          <HStack>
            <FormLabel whiteSpace={"nowrap"}>Name : </FormLabel>
            <Input
              type="string"
              placeholder="Student Name"
              onChange={(e) => setName(e.target.value)}
            />
          </HStack>
          <HStack>
            <FormLabel whiteSpace={"nowrap"}>Roll No : </FormLabel>
            <Input
              type="number"
              placeholder="Roll No"
              onChange={(e) => setRollNumber(e.target.value)}
            />
          </HStack>
        </VStack>
        <label>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => setImage(e.target.files[0])}
          />
          <Button as="span" colorScheme="teal" variant="solid" size="md">
            Select Image
          </Button>
        </label>
        {image && (
          <>
            <Image
              src={URL.createObjectURL(image)}
              alt="submitted image"
              objectFit="contain"
              height="20vh"
              borderRadius="md"
              boxShadow="md"
            />
            <Button
              isLoading={loading}
              loadingText="Saving..."
              onClick={handleSubmit}
            >
              Save
            </Button>
          </>
        )}
        {message && <Text>{message}</Text>}
      </VStack>
    </>
  );
}
