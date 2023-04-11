import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initializeIcons } from '@fluentui/react/lib/Icons';

initializeIcons(/* optional base url */);

const container = document.getElementById("app");
const root = createRoot(container)
root.render(<App />);