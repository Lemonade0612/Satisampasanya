import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Impact from "./pages/Impact";
import Help from "./pages/Help";
import Policies from "./pages/Policies";
const Feedback = lazy(() => import("./pages/Feedback"));
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/feedback" element={<Suspense fallback={null}><Feedback /></Suspense>} />
        <Route path="/policies" element={<Policies />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
