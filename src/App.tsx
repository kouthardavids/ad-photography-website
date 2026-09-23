import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import About from "./pages/About";
import Footer from "./components/Footer";
import Booking from "./pages/Booking";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white font-sans text-neutral-900">
              <Home />
              <Portfolio />
              <Services />
              <About />
              <Footer />
            </div>
          }
        />

        <Route path="/booking" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
}