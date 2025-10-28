"""
Flask server for face recognition attendance system.
"""

import os
from flask import Flask, send_from_directory, request, jsonify
from firebase_admin import credentials, firestore, initialize_app
from flask_cors import CORS

from utils.deepface import (
    bytes_to_cv2_image,
    get_embedding_from_cv2_image,
    detect_faces,
    get_embedding_from_face,
    find_distance,
    get_threshold,
)

# ==================== Flask Setup ====================
app = Flask(__name__, static_folder="../client/build", static_url_path="/static-disabled-xyz")
CORS(app)

# ==================== Firebase Setup ====================
cred = credentials.Certificate("./utils/firebase-key.json")
initialize_app(cred)
db = firestore.client()

# ==================== Configuration ====================
MODEL_NAME = "ArcFace"
DISTANCE_METRIC = "cosine"  # Options: "cosine", "euclidean", "euclidean_l2"
THRESHOLD = get_threshold(MODEL_NAME, DISTANCE_METRIC)

# ==================== Routes ====================


@app.route("/api/students", methods=["POST"])
def add_student():
    """Register a new student with their face embedding."""
    name = request.form.get("name")
    roll_number = request.form.get("roll_number")
    image = request.files.get("image")

    if not name or not roll_number or not image:
        return (
            jsonify({"error": "Missing required fields: name, roll_number, image"}),
            400,
        )

    try:
        # Convert image to cv2 format
        img_bytes = image.read()
        img_cv2 = bytes_to_cv2_image(img_bytes)

        if img_cv2 is None:
            return jsonify({"error": "Invalid image format"}), 400

        # Extract face embedding
        embedding = get_embedding_from_cv2_image(img_cv2)

        # Store in Firestore
        db.collection("students").document(roll_number).set(
            {"name": name, "roll_number": roll_number, "embedding": embedding}
        )

        return (
            jsonify(
                {
                    "message": "Student registered successfully",
                    "roll_number": roll_number,
                    "name": name,
                }
            ),
            200,
        )

    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/students", methods=["GET"])
def get_all_students():
    """Get list of all registered students."""
    try:
        students = []
        docs = db.collection("students").stream()

        for doc in docs:
            data = doc.to_dict()
            students.append(
                {"name": data.get("name"), "roll_number": data.get("roll_number")}
            )

        return jsonify({"count": len(students), "students": students}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/students/<roll_number>", methods=["DELETE"])
def delete_student(roll_number):
    """Delete a student by roll number."""
    try:
        db.collection("students").document(roll_number).delete()
        return (
            jsonify(
                {"message": "Student deleted successfully", "roll_number": roll_number}
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/analyse", methods=["POST"])
def analyse_image():
    """
    Analyse an image to detect and recognize faces.
    Returns matched roll numbers for all recognized faces.
    """
    image = request.files.get("image")

    if image is None:
        return jsonify({"error": "No image provided"}), 400

    try:
        # 1. Load image
        img_bytes = image.read()
        img_cv2 = bytes_to_cv2_image(img_bytes)

        if img_cv2 is None:
            return jsonify({"error": "Invalid image format"}), 400

        # 2. Detect all faces in image
        detections = detect_faces(img_cv2)

        if not detections:
            return (
                jsonify(
                    {
                        "message": "No faces detected in image",
                        "matched_roll_numbers": [],
                        "faces": [],
                    }
                ),
                200,
            )

        # 3. Load all stored student embeddings
        stored_students = {}
        docs = db.collection("students").stream()

        for doc in docs:
            data = doc.to_dict()
            roll_number = data.get("roll_number")
            stored_students[roll_number] = {
                "name": data.get("name"),
                "embedding": data.get("embedding"),
            }

        # 4. Process each detected face
        results = []
        matched_roll_numbers = []

        for detection in detections:
            face_img = detection["face"]
            face_box = detection.get("facial_area")

            # Extract embedding for this face
            query_embedding = get_embedding_from_face(face_img)

            # Find matches
            matches = []
            for roll_number, student_data in stored_students.items():
                stored_embedding = student_data.get("embedding")

                if stored_embedding is None:
                    continue

                # Calculate distance
                distance = find_distance(
                    alpha_embedding=query_embedding,
                    beta_embedding=stored_embedding,
                    distance_metric=DISTANCE_METRIC,
                )

                matches.append(
                    {
                        "roll_number": roll_number,
                        "name": student_data.get("name"),
                        "distance": distance,
                        "verified": distance <= THRESHOLD,
                    }
                )

            # Sort by distance (best match first)
            matches.sort(key=lambda x: x["distance"])

            # Get best verified match
            best_match = None
            verified_matches = [m for m in matches if m["verified"]]

            if verified_matches:
                best_match = verified_matches[0]
                matched_roll_numbers.append(best_match["roll_number"])

            results.append(
                {
                    "face_box": face_box,
                    "best_match": best_match,
                    "top_matches": matches[:5],
                }
            )

        db.collection("results").add(
            {
                "timeStamp": firestore.SERVER_TIMESTAMP,
                "message": f"Detected {len(detections)} face(s), recognized {len(matched_roll_numbers)}",
                "matched_roll_numbers": matched_roll_numbers,
                "model": MODEL_NAME,
                "distance_metric": DISTANCE_METRIC,
                "threshold": THRESHOLD,
                "faces": results,
            }
        )

        return (
            jsonify(
                {
                    "message": f"Detected {len(detections)} face(s), recognized {len(matched_roll_numbers)}",
                    "matched_roll_numbers": matched_roll_numbers,
                    "model": MODEL_NAME,
                    "distance_metric": DISTANCE_METRIC,
                    "threshold": THRESHOLD,
                    "faces": results,
                }
            ),
            200,
        )

    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/results", methods=["GET"])
def get_all_results():
    """Get list of all saved analysis."""
    try:
        res = []
        docs = db.collection("results").stream()

        for doc in docs:
            data = doc.to_dict()
            res.append(data)

        return jsonify({"data": res}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/upload_for_analyse", methods=["POST"])
def upload_for_analyse():
    """
    Analyse an image to detect and recognize faces.
    Saves matched roll numbers for all recognized faces in firebase.
    """
    image = request.files.get("image")

    if image is None:
        return jsonify({"error": "No image provided"}), 400

    try:
        # 1. Load image
        img_bytes = image.read()
        img_cv2 = bytes_to_cv2_image(img_bytes)

        if img_cv2 is None:
            return jsonify({"error": "Invalid image format"}), 400

        # 2. Detect all faces in image
        detections = detect_faces(img_cv2)

        if not detections:
            return (
                jsonify(
                    {
                        "message": "No faces detected in image",
                        "matched_roll_numbers": [],
                        "faces": [],
                    }
                ),
                200,
            )

        # 3. Load all stored student embeddings
        stored_students = {}
        docs = db.collection("students").stream()

        for doc in docs:
            data = doc.to_dict()
            roll_number = data.get("roll_number")
            stored_students[roll_number] = {
                "name": data.get("name"),
                "embedding": data.get("embedding"),
            }

        # 4. Process each detected face
        results = []
        matched_roll_numbers = []

        for detection in detections:
            face_img = detection["face"]
            face_box = detection.get("facial_area")

            # Extract embedding for this face
            query_embedding = get_embedding_from_face(face_img)

            # Find matches
            matches = []
            for roll_number, student_data in stored_students.items():
                stored_embedding = student_data.get("embedding")

                if stored_embedding is None:
                    continue

                # Calculate distance
                distance = find_distance(
                    alpha_embedding=query_embedding,
                    beta_embedding=stored_embedding,
                    distance_metric=DISTANCE_METRIC,
                )

                matches.append(
                    {
                        "roll_number": roll_number,
                        "name": student_data.get("name"),
                        "distance": distance,
                        "verified": distance <= THRESHOLD,
                    }
                )

            # Sort by distance (best match first)
            matches.sort(key=lambda x: x["distance"])

            # Get best verified match
            best_match = None
            verified_matches = [m for m in matches if m["verified"]]

            if verified_matches:
                best_match = verified_matches[0]
                matched_roll_numbers.append(best_match["roll_number"])

            results.append(
                {
                    "face_box": face_box,
                    "best_match": best_match,
                    "top_matches": matches[:5],
                }
            )

        try:
            # save results to firebase
            db.collection("results").add(
                {
                    "timeStamp": firestore.SERVER_TIMESTAMP,
                    "message": f"Detected {len(detections)} face(s), recognized {len(matched_roll_numbers)}",
                    "matched_roll_numbers": matched_roll_numbers,
                    "model": MODEL_NAME,
                    "distance_metric": DISTANCE_METRIC,
                    "threshold": THRESHOLD,
                    "faces": results,
                }
            )
            return jsonify({"message": "Image processed successfully."})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/config", methods=["GET"])
def get_config():
    """Get current model configuration."""
    return (
        jsonify(
            {
                "model": MODEL_NAME,
                "distance_metric": DISTANCE_METRIC,
                "threshold": THRESHOLD,
            }
        ),
        200,
    )


# ==================== Link Frontend ====================


# @app.route("/", defaults={"path": ""})
# @app.route("/<path:path>")
# def serve_react(path):
#     print("THIS CASE")
#     # Don't serve index.html for api routes
#     if path.startswith("api"):
#         return jsonify({"error": "API endpoint not found"}), 404

#     # Check if it's a static file (JS, CSS, images, etc.)
#     full_path = os.path.join(app.static_folder, path)
#     if path and os.path.isfile(full_path):
#         return send_from_directory(app.static_folder, path)


#     # For everything else (React routes), serve index.html
#     return app.send_static_file("index.html")
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    print(f"THIS CASE: {path}")

    # API routes
    if path.startswith("api"):
        return jsonify({"error": "API endpoint not found"}), 404

    # Serve static files from build folder
    file_path = os.path.join(app.static_folder, path)
    if path and os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)

    # Everything else gets index.html (React Router handles it)
    return send_from_directory(app.static_folder, "index.html")


# ==================== Main ====================

if __name__ == "__main__":
    print("=" * 50)
    print("Face Recognition Server Starting...")
    print(f"Model: {MODEL_NAME}")
    print(f"Distance Metric: {DISTANCE_METRIC}")
    print(f"Threshold: {THRESHOLD}")
    print("\n=== REGISTERED ROUTES ===")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} {rule.methods}")
    print("=" * 50)

    app.run(debug=True, use_reloader=False)
