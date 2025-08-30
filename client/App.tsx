console.log("JavaScript is executing!");

const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = `
    <div style="padding: 20px; color: white; background: black; min-height: 100vh;">
      <h1>Basic JavaScript Working!</h1>
      <p>This means the script is loading and executing.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;
  console.log("DOM updated successfully!");
} else {
  console.error("Root element not found!");
}
