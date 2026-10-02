import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/global.scss";
import App from "./app/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
