import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<ComingSoon name="About" />} />
        <Route path="/impact" element={<ComingSoon name="Impact" />} />
        <Route path="/help" element={<ComingSoon name="Help" />} />
        <Route path="/feedback" element={<ComingSoon name="Feedback" />} />
        <Route path="/policies" element={<ComingSoon name="Policies" />} />
        <Route path="*" element={<ComingSoon name="404" />} />
      </Route>
    </Routes>
  );
}
