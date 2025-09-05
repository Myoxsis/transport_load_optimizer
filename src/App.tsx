import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import OptiPlan from "./pages/OptiPlan";
import OptiContainer from "./pages/OptiContainer";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <div>
      <nav className="nav" style={{ padding: "1rem", display: "flex", gap: "1rem" }}>
        <NavLink to="/plan">OptiPlan</NavLink>
        <NavLink to="/container">OptiContainer</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
      <Routes>
        <Route path="/plan" element={<OptiPlan />} />
        <Route path="/container" element={<OptiContainer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<OptiPlan />} />
      </Routes>
    </div>
  );
}
