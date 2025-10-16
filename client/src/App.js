import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadStudent from "./pages/UploadStudent";
import ShowAllStudents from "./pages/ShowAllStudents";

function App() {
  return (
    <BrowserRouter>
      <div style={styles.appContainer}>
      <Routes>
        <Route path="/upload" element={<UploadStudent />} />
        <Route path="/students" element={<ShowAllStudents />} />
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