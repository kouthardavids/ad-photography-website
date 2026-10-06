import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import About from "./pages/About";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import Booking from "./pages/Booking";
import Testimonials from "./pages/Testimonals";
import Dasboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function App() {
  return (
    <BrowserRouter>
      <ReactLenis root options={{ lerp: 0.09, smoothWheel: !prefersReducedMotion }}>
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-white font-sans text-neutral-900">
                <Nav />

                <div className="sticky top-0 h-screen">
                  <Home />
                </div>

                <div className="relative z-10 bg-white">
                  <Portfolio />
                  <Testimonials />
                  <Services />
                  <About />
                  <Footer />
                </div>
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/booking" element={<Booking />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Dasboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ReactLenis>
    </BrowserRouter>
  );
}