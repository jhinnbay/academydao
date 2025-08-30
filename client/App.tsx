import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return <div>Hello World - React is working!</div>;
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
