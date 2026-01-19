import ForecastPage from "./pages/ForecastPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import { Routes, Route } from "react-router-dom";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ForecastPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
    </Routes>
  );
}
