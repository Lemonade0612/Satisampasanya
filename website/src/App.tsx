import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Impact from "./pages/Impact";
import Help from "./pages/Help";
import Feedback from "./pages/Feedback";
import Policies from "./pages/Policies";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="*" element={<ComingSoon name="404" />} />
      </Route>
    </Routes>
  );
}
