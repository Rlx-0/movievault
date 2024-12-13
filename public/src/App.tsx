import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Home } from "./pages/Home/Home";
import { Search } from "./pages/Search/Search";
import { Login } from "./pages/Login/Login";
import { CreateEvent } from "./pages/CreateEvent/CreateEvent";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-event" element={<CreateEvent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
