import { BrowserRouter, Routes, Route } from "react-router-dom";
  import ShowAllStudents from "./pages/ShowAllStudents";
import AnalyseImage from "./pages/AnalyseImage";
import ShowResults from "./pages/ShowResults";
import SubmitImage from "./pages/SubmitImage";

function App() {
  return (
    <BrowserRouter>
      <div style={styles.appContainer}>
      <Routes>
        <Route path="/students" element={<ShowAllStudents />} />
        <Route path="/" element={<AnalyseImage />} />
        <Route path="/results" element={<ShowResults/>} />
        <Route path="/submitimage"element={<SubmitImage/>} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

const styles = {
  appContainer: {
    height: '100%',
    width: '100%',
  }
}