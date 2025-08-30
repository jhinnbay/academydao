console.log("JavaScript is executing!");

// Try to update DOM immediately when script loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM Content Loaded");
  updateDOM();
});

// Also try updating immediately
updateDOM();

function updateDOM() {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: white; background: black; min-height: 100vh;">
        <h1>✅ Basic JavaScript Working!</h1>
        <p>This means the script is loading and executing.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Ready to add React back!</p>
      </div>
    `;
    console.log("DOM updated successfully!");
  } else {
    console.error("Root element not found!");
    // Try to create the content anyway
    document.body.innerHTML += `
      <div style="padding: 20px; color: white; background: red;">
        <h1>⚠️ Root element not found!</h1>
        <p>Script is running but can't find #root</p>
      </div>
    `;
  }
}
