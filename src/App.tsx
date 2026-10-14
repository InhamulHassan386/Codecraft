import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar, Footer, QuoteProvider, ScrollToTop, BackToTop } from "./components/layout";
import Home from "./pages/Home";
import About from "./pages/About";
import ServicesPage from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Technologies from "./pages/Technologies";
import TeamPage from "./pages/Team";
import Careers from "./pages/Careers";
import BlogPage from "./pages/Blog";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

function AnimatedRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <div className="min-h-screen bg-white">
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/technologies" element={<Technologies />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTop />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <QuoteProvider>
        <ScrollToTop />
        <AnimatedRoutes />
      </QuoteProvider>
    </HashRouter>
  );
}
