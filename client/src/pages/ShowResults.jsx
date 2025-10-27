import { Box, Heading, VStack } from "@chakra-ui/react";
import bg1 from "../resources/bg1.png";
import { useEffect, useState } from "react";
import List from "../components/List";

export default function ShowResults() {

    const [resData, setResData] = useState([])

    // useEffect(callback,[dependecies])
    useEffect(()=>{
        fetchResults()
    },[])

  async function fetchResults() {
    try {
        const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/results`, {
                method: "GET",
                headers: {
                    'Content-Type':"application/json"
                }
            }
        )
        if(response) {
            const data = await response.json()
            if(data) {
                // console.log(data)
                setResData(data.data)
            }
        }
    } catch(e) {
        console.log(e.message)
    }
  }
  
  return (
    <Box backgroundImage={bg1} backgroundSize={"cover"} height={"100vh"}>
      <VStack
        style={{ backdropFilter: "blur(6px)" }}
        overflowY={"auto"}
        height={"100vh"}
      >
        <Heading fontSize={60} color={"rgba(106, 86, 254, 0.67)"}>
          RESULTS
        </Heading>
        {
            resData &&
            resData.map((item, key)=>(
                <List items={item.matched_roll_numbers} text={item.timeStamp} />
            ))
        }
      </VStack>
    </Box>
  );
}
