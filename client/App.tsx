import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ padding: "20px", color: "white", backgroundColor: "black" }}>
      <h1>Test App - React is Working!</h1>
      <p>If you can see this, React is mounting correctly.</p>
    </div>
  );
}

// Ensure root is only created once
const container = document.getElementById("root")!;
let root = (container as any).__reactRoot;

if (!root) {
  root = createRoot(container);
  (container as any).__reactRoot = root;
}

root.render(<App />);
