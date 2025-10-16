import { useState } from "react";

export default function UploadStudent() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !rollNumber || !image) {
      setMessage("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("roll_number", rollNumber);
    formData.append("image", image);

    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/students`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Student uploaded successfully!");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-80 space-y-3"
      >
        <h2 className="text-xl font-bold text-center mb-3">Upload Student</h2>
        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full rounded"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Roll Number"
          className="border p-2 w-full rounded"
          onChange={(e) => setRollNumber(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="border p-2 w-full rounded"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700"
        >
          Upload
        </button>
        {message && (
          <p className="text-center text-sm mt-2 text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
