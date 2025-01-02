import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Home } from "./pages/Home/Home";
import { Search } from "./pages/Search/Search";
import { Login } from "./pages/Login/Login";
import { CreateEvent } from "./pages/CreateEvent/CreateEvent";
import { Events } from "./pages/Events/Events";
import { EventDetails } from "./pages/EventDetails/EventDetails";
import { About } from "./pages/Footer/About";
import { Contact } from "./pages/Footer/Contact";
import { Legal } from "./pages/Footer/Legal";
import { MovieDetails } from "./pages/MovieDetails/MovieDetails";
import { AnimatePresence } from "framer-motion";
import { Register } from "./pages/Register/Register";
import { Tutorial } from "./components/Tutorial/Tutorial";
import "./styles/tutorial.css";
import { TutorialProvider } from "./context/TutorialContext";

function App() {
  return (
    <AnimatePresence mode="wait">
      <AuthProvider>
        <TutorialProvider>
          <Router>
            <Tutorial />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Router>
        </TutorialProvider>
      </AuthProvider>
    </AnimatePresence>
  );
}

export default App;
