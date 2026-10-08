import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { obtenerToken } from "./api";
import Login from "./Login";
import Tickets from "./Tickets";

function Protegida({ children }) {
  return obtenerToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protegida><Tickets /></Protegida>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}