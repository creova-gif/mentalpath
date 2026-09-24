import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { initTelemetry } from "./app/lib/telemetry";
import "./styles/index.css";

initTelemetry();

createRoot(document.getElementById("root")!).render(<App />);
