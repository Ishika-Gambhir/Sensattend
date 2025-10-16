import os
from flask import Flask, request, jsonify, send_from_directory
from firebase_admin import credentials, firestore, initialize_app
from flask_cors import CORS

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

# --------------------
# Run Flask
# --------------------
if __name__ == '__main__':
    app.run(debug=True)