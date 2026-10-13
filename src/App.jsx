
import { useEffect, useState } from "react";
import Auth from "./Auth";
import "./App.css";

const API = "http://localhost:8080/api";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch(`${API}/auth/me`, {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setCheckingAuth(false));
  }, []);

  function handleFile(selectedFile) {
    if (!selectedFile) return;

    if (
      !selectedFile.type.startsWith("image/") &&
      !selectedFile.type.startsWith("video/")
    ) {
      setError("Please select an image or video file.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50 MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  }

  async function detectFile() {
    if (!file) {
      setError("Please upload an image or video first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API}/detect`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(
          "Detection failed. Check whether the backend is running and supports /api/detect."
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      setFile(null);
      setResult(null);
      setError("");
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
    }
  }

  if (checkingAuth) {
    return (
      <div className="app">
        <div className="section-heading">
          <h2>Loading DeepFakeShield...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Auth
        onSuccess={(loggedInUser) => setUser(loggedInUser)}
      />
    );
  }

  return (
    <div className={dark ? "app dark" : "app"}>
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">🛡️</span>
          DeepFakeShield
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#detector">Detector</a>
          <a href="#about">About</a>
          <a href="#how">How It Works</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="account-actions">
          <span className="account-name">
            👤 {user.name || user.email}
          </span>

          <button
            className="theme-btn"
            onClick={() => setDark(!dark)}
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button className="theme-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-badge">
            ✨ AI-POWERED MEDIA VERIFICATION
          </div>

          <h1>
            Truth in a World of
            <span> Artificial Reality</span>
          </h1>

          <p>
            Detect potentially manipulated images and videos with
            DeepFakeShield. Upload your media to begin an analysis.
          </p>

          <a className="primary-btn" href="#detector">
            Start Detection ↓
          </a>

          <div className="hero-stats">
            <div>
              <strong>AI</strong>
              <span>Powered Analysis</span>
            </div>
            <div>
              <strong>Image</strong>
              <span>Media Support</span>
            </div>
            <div>
              <strong>Real-time</strong>
              <span>Result Interface</span>
            </div>
          </div>
        </section>

        <section className="detector-section" id="detector">
          <div className="section-heading">
            <span className="eyebrow">MEDIA ANALYZER</span>
            <h2>Verify Your Media</h2>
            <p>Upload an image or video to request an analysis.</p>
          </div>

          <div className="detector-card">
            <label className="upload-box">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(event) =>
                  handleFile(event.target.files[0])
                }
              />

              <span className="upload-icon">☁️</span>
              <h3>Upload your media</h3>
              <p>Click to browse or drag a file here</p>
              <span className="file-types">
                IMAGE / VIDEO · MAX 50 MB
              </span>
            </label>

            {file && (
              <div className="preview-area">
                <h3>Selected Media</h3>

                {file.type.startsWith("image/") ? (
                  <img
                    className="media-preview"
                    src={preview}
                    alt="Uploaded preview"
                  />
                ) : (
                  <video
                    className="media-preview"
                    src={preview}
                    controls
                  />
                )}

                <p className="file-info">
                  {file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>

                <button
                  className="primary-btn detect-btn"
                  onClick={detectFile}
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "🔍 Analyze Media"}
                </button>
              </div>
            )}

            {loading && (
              <div className="loading-area">
                <div className="progress-track">
                  <div className="progress-bar" />
                </div>
                <p>Waiting for the detection service...</p>
              </div>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}

            {result && (
              <div className="result-card">
                <span className="eyebrow">ANALYSIS RESPONSE</span>

                <h3>
                  {result.label ||
                    result.prediction ||
                    result.result ||
                    "Analysis completed"}
                </h3>

                <p>
                  Confidence:{" "}
                  {typeof result.confidence === "number"
                    ? `${
                        result.confidence <= 1
                          ? result.confidence * 100
                          : result.confidence
                      .toFixed ? result.confidence : result.confidence
                      }`
                    : result.confidence ?? "Not provided"}
                  {typeof result.confidence === "number" ? "%" : ""}
                </p>

                <pre>{JSON.stringify(result, null, 2)}</pre>

                <p className="disclaimer">
                  Automated predictions can be wrong. Verify important
                  findings independently.
                </p>
                
                <p>
                  Confidence: {
                                typeof result.confidence === "number"
                                ? `${(result.confidence <= 1
                                      ? result.confidence * 100
                                      : result.confidence).toFixed(2)}%`
                                      : result.confidence ?? "Not provided"
                              }
                </p>

              </div>
            )}
          </div>
        </section>

        <section className="info-section" id="about">
          <span className="eyebrow">ABOUT THE PROJECT</span>
          <h2>Protect What Is Real</h2>
          <p>
            DeepFakeShield is a full-stack project interface designed
            to connect a web application with a media-analysis backend.
            Its actual detection capability depends on the model
            integrated with the backend service.
          </p>
        </section>

        <section className="info-section how-section" id="how">
          <span className="eyebrow">THE PROCESS</span>
          <h2>How It Works</h2>

          <div className="steps">
            <article>
              <span>01</span>
              <h3>Upload</h3>
              <p>Select an image or video from your device.</p>
            </article>

            <article>
              <span>02</span>
              <h3>Analyze</h3>
              <p>Send your file to the configured backend service.</p>
            </article>

            <article>
              <span>03</span>
              <h3>Review</h3>
              <p>Review the response returned by the detection service.</p>
            </article>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <h2>Building a Safer Digital World</h2>
          <p>DeepFakeShield · Java Full-Stack Project</p>
        </section>
      </main>

      <footer>
        © {new Date().getFullYear()} DeepFakeShield. For educational use.
      </footer>
    </div>
  );
}
