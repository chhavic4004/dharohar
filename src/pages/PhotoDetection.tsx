import { useState } from "react";
import { usePageText } from "../i18n/page";
import { photoDetectionText } from "../i18n/pages/photoDetection";

type StatusKey = "analyzing" | "errorGeneric" | "errorConnect";

export default function PhotoDetection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const { t, lang, dir } = usePageText(photoDetectionText);
  const [information, setInformation] = useState("");
  // Local status messages are kept as keys so they follow language changes.
  const [status, setStatus] = useState<StatusKey | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setInformation("");
    setStatus(null);
  };

  const detectPhoto = async () => {
    if (!file) {
      alert(t("alertNoPhoto"));
      return;
    }

    setLoading(true);
    setInformation("");
    setStatus("analyzing");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", lang);

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(null);
        setInformation(data.information);
      } else {
        setStatus("errorGeneric");
      }
    } catch (error) {
      console.error(error);

      setStatus("errorConnect");
    }

    setLoading(false);
  };

  return (
    <div
      dir={dir}
      lang={lang}
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
            {t("title")}
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
            {t("subtitle")}
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
              {t("uploadTitle")}
            </h2>

            <p
              style={{
                color: "#6b6258",
                marginBottom: "20px",
              }}
            >
              {t("formats")}
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
              {t("choosePhoto")}

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
                {t("selected")} <strong>{file.name}</strong>
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
                {t("yourPhoto")}
              </h3>

              <img
                src={preview}
                alt={t("previewAlt")}
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
                  ? t("discovering")
                  : t("discover")}
              </button>
            </div>
          )}

          {/* Information */}
          {(information || status) && (
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
                {t("infoTitle")}
              </h2>

              <p
                style={{
                  whiteSpace: "pre-line",
                  color: "#403a34",
                  lineHeight: "1.7",
                  fontSize: "16px",
                }}
              >
                {status ? t(status) : information}
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
              {t("featAiTitle")}
            </strong>
            <p style={{ color: "#6b6258", fontSize: "14px" }}>
              {t("featAiText")}
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
              {t("featCultureTitle")}
            </strong>
            <p style={{ color: "#6b6258", fontSize: "14px" }}>
              {t("featCultureText")}
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
              {t("featPreserveTitle")}
            </strong>
            <p style={{ color: "#6b6258", fontSize: "14px" }}>
              {t("featPreserveText")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}