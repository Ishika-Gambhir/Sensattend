import { Box,Heading,VStack } from "@chakra-ui/react";
export default function List({text, items}) {
  return (
    <VStack
      width={"50%"}
      shadow={"2xl"}
      p="10"
      m="10"
      borderRadius={"25"}
      backgroundColor={"rgba(191, 185, 235, 0.67)"}
      style={{ backdropFilter: "blur(150px)" }}
    >
      <Heading>{text}</Heading>
      {items.map((s, key) => (
        <Box shadow={"md"} width={"100%"} borderRadius={"15"} p="7" key={key}>
          {s}
        </Box>
      ))}
    </VStack>
  );
}
