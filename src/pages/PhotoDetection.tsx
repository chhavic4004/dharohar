import { useState } from "react";

export default function PhotoDetection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [information, setInformation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setInformation("");
  };

  const detectPhoto = async () => {
    if (!file) {
      alert("Please select a photo first!");
      return;
    }

    setLoading(true);
    setInformation("Analyzing your heritage image...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setInformation(data.information);
      } else {
        setInformation("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);

      setInformation(
        "Could not connect to the photo detection server."
      );
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "50px 20px",
        background: "#f8f1df",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Heading */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "10px",
            }}
          >
            📸
          </div>

          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#7d1f35",
              marginBottom: "12px",
            }}
          >
            Discover Your Heritage
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "#5f5147",
              maxWidth: "650px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Upload a photo of a monument, craft, artwork or cultural
            object and let AI help you discover its story.
          </p>
        </div>

        {/* Upload Card */}
        <div
          style={{
            background: "#fffaf0",
            border: "1px solid #e3d4b8",
            borderRadius: "20px",
            padding: "35px",
            boxShadow: "0 8px 30px rgba(80, 50, 30, 0.08)",
          }}
        >
          {/* Upload */}
          <div
            style={{
              textAlign: "center",
              padding: "25px",
              border: "2px dashed #c9a66b",
              borderRadius: "16px",
              background: "#fcf6e9",
            }}
          >
            <div
              style={{
                fontSize: "35px",
                marginBottom: "10px",
              }}
            >
              🏛️
            </div>

            <h2
              style={{
                color: "#7d1f35",
                fontSize: "22px",
                marginBottom: "8px",
              }}
            >
              Upload a Heritage Photo
            </h2>

            <p
              style={{
                color: "#6b6258",
                marginBottom: "20px",
              }}
            >
              JPG, PNG or WEBP images
            </p>

            <label
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "#7d1f35",
                color: "white",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Choose Photo

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>

            {file && (
              <p
                style={{
                  marginTop: "15px",
                  color: "#5f5147",
                }}
              >
                Selected: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div
              style={{
                marginTop: "30px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  color: "#7d1f35",
                  marginBottom: "15px",
                  fontSize: "20px",
                }}
              >
                Your Photo
              </h3>

              <img
                src={preview}
                alt="Selected heritage"
                style={{
                  width: "100%",
                  maxWidth: "550px",
                  maxHeight: "450px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  border: "1px solid #dcc8a5",
                  boxShadow: "0 5px 20px rgba(0,0,0,0.12)",
                }}
              />

              <br />

              {/* Detect Button */}
              <button
                onClick={detectPhoto}
                disabled={loading}
                style={{
                  marginTop: "25px",
                  padding: "14px 32px",
                  background: loading ? "#b98d98" : "#7d1f35",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 5px 15px rgba(125, 31, 53, 0.2)",
                }}
              >
                {loading
                  ? "🔍 Discovering..."
                  : "✨ Discover Heritage"}
              </button>
            </div>
          )}

          {/* Information */}
          {information && (
            <div
              style={{
                marginTop: "35px",
                padding: "25px",
                background: "#f7efdc",
                border: "1px solid #dfcda9",
                borderRadius: "16px",
              }}
            >
              <h2
                style={{
                  color: "#7d1f35",
                  fontSize: "22px",
                  marginBottom: "15px",
                }}
              >
                📖 Heritage Information
              </h2>

              <p
                style={{
                  whiteSpace: "pre-line",
                  color: "#403a34",
                  lineHeight: "1.7",
                  fontSize: "16px",
                }}
              >
                {information}
              </p>
            </div>
          )}
        </div>

        {/* Small feature section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginTop: "25px",
          }}
        >
          <div
            style={{
              background: "#fffaf0",
              padding: "20px",
              borderRadius: "14px",
              textAlign: "center",
              border: "1px solid #e3d4b8",
            }}
          >
            <div style={{ fontSize: "25px" }}>🤖</div>
            <strong style={{ color: "#7d1f35" }}>
              AI Powered
            </strong>
            <p style={{ color: "#6b6258", fontSize: "14px" }}>
              AI identifies and explains cultural objects.
            </p>
          </div>

          <div
            style={{
              background: "#fffaf0",
              padding: "20px",
              borderRadius: "14px",
              textAlign: "center",
              border: "1px solid #e3d4b8",
            }}
          >
            <div style={{ fontSize: "25px" }}>🌍</div>
            <strong style={{ color: "#7d1f35" }}>
              Discover Culture
            </strong>
            <p style={{ color: "#6b6258", fontSize: "14px" }}>
              Learn the history behind heritage.
            </p>
          </div>

          <div
            style={{
              background: "#fffaf0",
              padding: "20px",
              borderRadius: "14px",
              textAlign: "center",
              border: "1px solid #e3d4b8",
            }}
          >
            <div style={{ fontSize: "25px" }}>❤️</div>
            <strong style={{ color: "#7d1f35" }}>
              Preserve Heritage
            </strong>
            <p style={{ color: "#6b6258", fontSize: "14px" }}>
              Make cultural knowledge easier to discover.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}