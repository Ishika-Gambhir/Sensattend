import { Box, Button, Heading, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigator = useNavigate();

  const navLinks = [
    {
      name: "Student Database",
      link: "/students",
    },
    {
      name: "Analyse Image",
      link: "/submitimage",
    },
    {
      name: "View Results",
      link: "/results",
    },
  ];

  return (
    <>
      <Box p={"10px"} width={"20%"} height={"100vh"}>
        <VStack
          h={"100%"}
          w={"100%"}
          borderRadius={"xl"}
          shadow={"lg"}
          backgroundColor={"gray.100"}
          paddingY={"40px"}
        >
          <Heading fontSize={"1.5rem"} color={"rgba(43, 18, 230, 0.82)"}>
            SENSATTEND
          </Heading>
          <Box height={"70px"} />
          <VStack width={'100%'} gap={'10'}>
            {navLinks.map((l, key) => (
              <Button
                key={key}
                width={'90%'}
                colorScheme={"blue"}
                onClick={() => navigator(l.link)}
              >
                {l.name}
              </Button>
            ))}
          </VStack>
        </VStack>
      </Box>
    </>
  );
}
