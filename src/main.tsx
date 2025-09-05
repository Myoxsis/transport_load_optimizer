import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import { HUsProvider } from "./HUsContext";
import { ContainersProvider } from "./ContainersContext";
import { AutoAllocateRulesProvider } from "./AutoAllocateRulesContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ContainersProvider>
        <HUsProvider>
          <AutoAllocateRulesProvider>
            <App />
          </AutoAllocateRulesProvider>
        </HUsProvider>
      </ContainersProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
