import { useState } from "react";
import { Link } from "react-router-dom";

export default function AnalyseImage() {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/analyse`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.log(err);
      alert("Failed to send image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          width: 300,
        }}
      >
        <h2 style={{ textAlign: "center" }}>Analyse Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button
          type="submit"
          style={{
            padding: 10,
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Upload & Analyse"}
        </button>
      </form>

      {response && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            backgroundColor: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h3>Analysis Result:</h3>
          {response.message && <p>{response.message}</p>}
          {response.matched && <p>Matched Rnos: {(response.matched).join(", ")}</p>}
        </div>
      )}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h3>Want to add/remove students from the database ?</h3>
        <Link to={'/students'}>
        <button
          style={{
            padding: 10,
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Student Dashboard
        </button>
        </Link>
      </div>
    </div>
  );
}
