import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./client/index.css";
import App from "./client/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
