import { BrowserRouter, Routes, Route } from "react-router-dom";
  import ShowAllStudents from "./pages/ShowAllStudents";
import AnalyseImage from "./pages/AnalyseImage";

function App() {
  return (
    <BrowserRouter>
      <div style={styles.appContainer}>
      <Routes>
        <Route path="/students" element={<ShowAllStudents />} />
        <Route path="/" element={<AnalyseImage />} />
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