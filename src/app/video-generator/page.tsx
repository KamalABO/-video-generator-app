/** @format */

export default function VideoGeneratorPage() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left side: Prompt input */}
      <div style={{ flex: 1, padding: "20px", borderRight: "1px solid #eee" }}>
        <h1>AI Video Generator</h1>
        <textarea
          placeholder="Enter your prompt here..."
          rows={10}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        ></textarea>
        <button
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Generate Video
        </button>
      </div>

      {/* Right side: Video result */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
        }}
      >
        <p style={{ fontSize: "18px", color: "#555" }}>
          Your generated video will appear here.
        </p>
      </div>
    </div>
  );
}
