import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import AppProviders from "./app/AppProviders.jsx";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);
