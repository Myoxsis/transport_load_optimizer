import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import OptiPlan from "./pages/OptiPlan";
import OptiContainer from "./pages/OptiContainer";

export default function App() {
  return (
    <div>
      <nav className="nav" style={{ padding: "1rem", display: "flex", gap: "1rem" }}>
        <NavLink to="/plan">OptiPlan</NavLink>
        <NavLink to="/container">OptiContainer</NavLink>
      </nav>
      <Routes>
        <Route path="/plan" element={<OptiPlan />} />
        <Route path="/container" element={<OptiContainer />} />
        <Route path="*" element={<OptiPlan />} />
      </Routes>
    </div>
  );
}
