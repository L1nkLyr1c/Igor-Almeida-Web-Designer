import { hydrateRoot, createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root")!;
// O HTML já vem pronto do build (pré-renderizado). Se não vier, monta do zero.
if (root.firstElementChild) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
