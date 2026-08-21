import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AvatarProvider } from "./lib/AvatarContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AvatarProvider>
      <App />
    </AvatarProvider>
  </StrictMode>,
);
