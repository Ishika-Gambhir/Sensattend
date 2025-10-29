import { Box, Button, Heading, VStack } from "@chakra-ui/react";
import bg1 from "../resources/bg1.png";
import { useEffect, useState } from "react";
import List from "../components/List";

export default function ShowResults() {
  const [resData, setResData] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/results`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response) {
        const data = await response.json();
        if (data) {
          // sort descending by timestamp (latest first)
          const sorted = data.data.sort(
            (a, b) => new Date(b.timeStamp) - new Date(a.timeStamp)
          );
          setResData(sorted);
        }
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  function formatDate(dateString) {
    const d = new Date(dateString);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" }); // e.g. Oct
    const year = d.getFullYear();
    return `${hours}:${minutes}, ${day}${getDaySuffix(day)} ${month} ${year}`;
  }

  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  return (
    <Box backgroundImage={bg1} backgroundSize={"cover"} height={"100vh"}  width={'100%'} >
      <VStack backgroundColor={"#ffffff67"}
        style={{ backdropFilter: "blur(8px)" }}
        overflowY={"auto"}
        height={"100vh"}
      >
        <Heading fontSize={60} color={"rgba(43, 18, 230, 0.82)"}>
          RESULTS
        </Heading>
        <Box><Button colorScheme={'green'} onClick={fetchResults}>Refresh</Button></Box>
        {resData &&
          resData.map((item, key) => (
            <List
              key={key}
              items={item.matched_roll_numbers}
              text={formatDate(item.timeStamp)}
            />
          ))}
      </VStack>
    </Box>
  );
}
