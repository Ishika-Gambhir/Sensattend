import { Box,Heading,VStack } from "@chakra-ui/react";
export default function List({text, items}) {
  return (
    <VStack
      width={"50%"}
      shadow={"2xl"}
      p="10"
      m="10"
      borderRadius={"25"}
      backgroundColor={"#8aa1a6a5"}
      style={{ backdropFilter: "blur(150px)" }}
    >
      <Heading>{text}</Heading>
      {items.map((s, key) => (
        <Box shadow={"md"} width={"100%"} fontSize={"1.2rem"} borderRadius={"15"} p="2" key={key} backgroundColor={"#ffffff83"} textAlign={"center"} fontWeight={"bold"}>
          {s}
        </Box>
      ))}
    </VStack>
  );
}
