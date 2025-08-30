import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  return React.createElement("div", {
    style: { padding: "20px", color: "white", backgroundColor: "black", minHeight: "100vh" }
  }, [
    React.createElement("h1", { key: "title" }, "Test App - React is Working!"),
    React.createElement("p", { key: "desc" }, "If you can see this, React is mounting correctly."),
    React.createElement("p", { key: "status" }, "Status: All systems operational")
  ]);
};

// Mount the app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(App));
} else {
  console.error("Root container not found");
}
