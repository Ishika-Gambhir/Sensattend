import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShowAllStudents from "./pages/ShowAllStudents";
import AnalyseImage from "./pages/AnalyseImage";
import ShowResults from "./pages/ShowResults";
import SubmitImage from "./pages/SubmitImage";
import { HStack, VStack } from "@chakra-ui/react";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <div style={styles.appContainer}>
        <HStack height={"100vh"} width={"100%"} borderWidth={1} >
          <Navbar />
          <Routes>
            <Route path="/students" element={<ShowAllStudents />} />
            <Route path="/" element={<AnalyseImage />} />
            <Route path="/results" element={<ShowResults />} />
            <Route path="/submitimage" element={<SubmitImage />} />
          </Routes>
        </HStack>
      </div>
    </BrowserRouter>
  );
}

export default App;

const styles = {
  appContainer: {
    height: "100%",
    width: "100%",
  },
};
