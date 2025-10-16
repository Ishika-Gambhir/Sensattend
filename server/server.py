import os
from flask import Flask, request, jsonify, send_from_directory
from firebase_admin import credentials, firestore, initialize_app
import cv2
import numpy as np
from flask_cors import CORS
from utils.deepface_script import face_matched

# --------------------
# Flask setup
# --------------------
app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --------------------
# Firebase setup
# --------------------
cred = credentials.Certificate("./utils/firebase-key.json")  # your service account key
initialize_app(cred)
db = firestore.client()

# --------------------
# Routes
# --------------------

# 1️⃣ Upload student
@app.route('/students', methods=['POST'])
def add_student():
    name = request.form.get('name')
    roll_number = request.form.get('roll_number')
    image = request.files.get('image')

    if not name or not roll_number or not image:
        return jsonify({'error': 'Missing fields'}), 400

    # Save image with roll_number as filename
    ext = os.path.splitext(image.filename)[1]  # preserve extension
    filename = f"{roll_number}{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    image.save(filepath)

    # Save metadata to Firestore
    student_ref = db.collection('students').document(roll_number)
    student_ref.set({
        'name': name,
        'roll_number': roll_number,
        'image_path': filename  # store filename
    })

    return jsonify({'message': 'Student added successfully', 'image_url': f'/uploads/{filename}'}), 200

# 2️⃣ Serve uploaded images
@app.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# 3️⃣ Get all students
@app.route('/students', methods=['GET'])
def get_all_students():
    students = []
    docs = db.collection('students').stream()
    for doc in docs:
        data = doc.to_dict()
        students.append({
            'name': data['name'],
            'roll_number': data['roll_number'],
            'image_url': f"/uploads/{data['image_path']}"
        })
    return jsonify(students), 200

# 4️⃣ Get single student by roll number
@app.route('/students/<roll_number>', methods=['GET'])
def get_student(roll_number):
    doc = db.collection('students').document(roll_number).get()
    if not doc.exists:
        return jsonify({'error': 'Student not found'}), 404
    data = doc.to_dict()
    return jsonify({
        'name': data['name'],
        'roll_number': data['roll_number'],
        'image_url': f"/uploads/{data['image_path']}"
    }), 200
    
# Delete student by roll number
@app.route('/students/<roll_number>', methods=['DELETE'])
def delete_student(roll_number):
    doc_ref = db.collection('students').document(roll_number)
    doc = doc_ref.get()
    
    if not doc.exists:
        return jsonify({'error': 'Student not found'}), 404
    
    # Delete image file if exists
    data = doc.to_dict()
    image_path = os.path.join(UPLOAD_FOLDER, data['image_path'])
    if os.path.exists(image_path):
        os.remove(image_path)
    
    # Delete Firestore document
    doc_ref.delete()
    
    return jsonify({'message': f'Student {roll_number} deleted successfully'}), 200

@app.route('/analyse', methods=['POST'])
def analyse_image():
    image_file = request.files.get('image')

    if not image_file:
        return jsonify({'error': 'No image provided'}), 400

    try:
        # Convert uploaded image to cv2 format
        in_memory_file = image_file.read()
        np_arr = np.frombuffer(in_memory_file, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Invalid image format'}), 400

        # Fetch all students and compare
        students = []
        docs = db.collection('students').stream()

        for doc in docs:
            data = doc.to_dict()
            image_path = os.path.join(app.root_path, UPLOAD_FOLDER, data['image_path'])
            
            if not os.path.exists(image_path):
                print(f"⚠️ Missing image for {data['roll_number']} at {image_path}")
                continue

            student_img = cv2.imread(image_path)
            if student_img is None:
                print(f"⚠️ Could not read image for {data['roll_number']}")
                continue

            students.append({
                'name': data['name'],
                'roll_number': data['roll_number'],
                'image': student_img
            })

        matched_rnos = []
        for student in students:
            try:
                if face_matched(student['image'], img):
                    matched_rnos.append(student['roll_number'])
            except Exception as fe:
                print(f"⚠️ Face match failed for {student['roll_number']}: {fe}")

        print("Matched roll numbers:", matched_rnos)

        return jsonify({
            'message': 'Image received and processed successfully',
            'matched': matched_rnos
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()  # ✅ this shows the real cause in your terminal
        return jsonify({'error': str(e)}), 500


# --------------------
# Run Flask
# --------------------
if __name__ == '__main__':
    app.run(debug=True)