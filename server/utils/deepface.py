"""
DeepFace utility functions for face recognition.
All face processing, embedding extraction, and distance calculations.
"""

import cv2
import numpy as np
from deepface import DeepFace

# Preload model at module level
arcface_model = DeepFace.build_model("ArcFace")


# ==================== Image Processing ====================

def bytes_to_cv2_image(image_bytes):
    """Convert uploaded file bytes to cv2 BGR image."""
    np_arr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)


def get_embedding_from_cv2_image(img):
    """
    Extract ArcFace embedding from cv2 image.
    Returns raw (unnormalized) embedding as list.
    """
    embedding_obj = DeepFace.represent(
        img_path=img,
        model_name="ArcFace",
        detector_backend="retinaface",
        enforce_detection=True
    )
    return embedding_obj[0]['embedding']


def detect_faces(img):
    """
    Detect all faces in an image.
    Returns list of face detections with facial areas and face images.
    """
    return DeepFace.extract_faces(
        img_path=img,
        detector_backend='retinaface',
        enforce_detection=False
    )


def get_embedding_from_face(face_img):
    """
    Extract embedding from already-detected face image.
    Skips face detection for speed.
    """
    embedding_obj = DeepFace.represent(
        img_path=face_img,
        model_name="ArcFace",
        detector_backend="skip",
        enforce_detection=False
    )[0]
    return embedding_obj["embedding"]


# ==================== Distance Calculations (DeepFace's Exact Implementation) ====================

def find_cosine_distance(source_representation, test_representation):
    """
    Calculate cosine distance between two embeddings.
    Exact implementation from DeepFace verification.py
    Distance = 1 - cosine_similarity
    Range: [0, 2] where 0 = identical, 2 = opposite
    """
    if isinstance(source_representation, list):
        source_representation = np.array(source_representation)
    if isinstance(test_representation, list):
        test_representation = np.array(test_representation)
    
    a = np.dot(source_representation, test_representation)
    b = np.linalg.norm(source_representation) * np.linalg.norm(test_representation)
    return 1 - (a / b)


def find_euclidean_distance(source_representation, test_representation):
    """
    Calculate Euclidean (L2) distance between two embeddings.
    Exact implementation from DeepFace verification.py
    """
    if isinstance(source_representation, list):
        source_representation = np.array(source_representation)
    if isinstance(test_representation, list):
        test_representation = np.array(test_representation)
    
    return float(np.linalg.norm(source_representation - test_representation))


def l2_normalize(x, axis=None):
    """L2 normalize embeddings."""
    return x / np.linalg.norm(x, axis=axis, keepdims=True)


def find_distance(alpha_embedding, beta_embedding, distance_metric="cosine"):
    """
    Calculate distance between embeddings using specified metric.
    
    Args:
        alpha_embedding: First embedding
        beta_embedding: Second embedding
        distance_metric: "cosine", "euclidean", or "euclidean_l2"
    
    Returns:
        float: Distance value (lower = more similar)
    """
    if isinstance(alpha_embedding, list):
        alpha_embedding = np.array(alpha_embedding)
    if isinstance(beta_embedding, list):
        beta_embedding = np.array(beta_embedding)
    
    if distance_metric == "cosine":
        distance = find_cosine_distance(alpha_embedding, beta_embedding)
    elif distance_metric == "euclidean":
        distance = find_euclidean_distance(alpha_embedding, beta_embedding)
    elif distance_metric == "euclidean_l2":
        axis = None if alpha_embedding.ndim == 1 else 1
        normalized_alpha = l2_normalize(alpha_embedding, axis=axis)
        normalized_beta = l2_normalize(beta_embedding, axis=axis)
        distance = find_euclidean_distance(normalized_alpha, normalized_beta)
    else:
        raise ValueError(f"Invalid distance_metric: {distance_metric}")
    
    return float(np.round(distance, 6))


# ==================== Thresholds (DeepFace's Official Values) ====================

def get_threshold(model_name="ArcFace", distance_metric="cosine"):
    """
    Get verification threshold for model and distance metric.
    These are official thresholds tuned on LFW dataset by DeepFace.
    """
    thresholds = {
        "VGG-Face": {"cosine": 0.68, "euclidean": 1.17, "euclidean_l2": 1.17},
        "Facenet": {"cosine": 0.40, "euclidean": 10, "euclidean_l2": 0.80},
        "Facenet512": {"cosine": 0.30, "euclidean": 23.56, "euclidean_l2": 1.04},
        "ArcFace": {"cosine": 0.68, "euclidean": 4.15, "euclidean_l2": 1.13},
        "Dlib": {"cosine": 0.07, "euclidean": 0.6, "euclidean_l2": 0.4},
        "SFace": {"cosine": 0.593, "euclidean": 10.734, "euclidean_l2": 1.055},
        "OpenFace": {"cosine": 0.10, "euclidean": 0.55, "euclidean_l2": 0.55},
        "DeepFace": {"cosine": 0.23, "euclidean": 64, "euclidean_l2": 0.64},
        "DeepID": {"cosine": 0.015, "euclidean": 45, "euclidean_l2": 0.17},
        "GhostFaceNet": {"cosine": 0.65, "euclidean": 35.71, "euclidean_l2": 1.10},
    }
    
    base_threshold = {"cosine": 0.40, "euclidean": 0.55, "euclidean_l2": 0.75}
    
    return thresholds.get(model_name, {}).get(distance_metric, base_threshold.get(distance_metric, 0.40))


# ==================== Face Matching ====================

def find_best_match(query_embedding, stored_embeddings_dict, distance_metric="cosine", threshold=None):
    """
    Find best matching face from stored embeddings.
    
    Args:
        query_embedding: Embedding to match
        stored_embeddings_dict: Dict with format {roll_number: {"name": name, "embedding": emb}}
        distance_metric: Distance metric to use
        threshold: Verification threshold (auto-calculated if None)
    
    Returns:
        dict: Best match info or None if no match above threshold
    """
    if threshold is None:
        threshold = get_threshold("ArcFace", distance_metric)
    
    matches = []
    
    for roll_number, student_data in stored_embeddings_dict.items():
        stored_embedding = student_data.get("embedding")
        if stored_embedding is None:
            continue
        
        distance = find_distance(query_embedding, stored_embedding, distance_metric)
        
        matches.append({
            "roll_number": roll_number,
            "name": student_data.get("name"),
            "distance": distance,
            "verified": distance <= threshold
        })
    
    # Sort by distance (closest first)
    matches.sort(key=lambda x: x["distance"])
    
    # Return best match if verified
    if matches and matches[0]["verified"]:
        return {
            "best_match": matches[0],
            "all_matches": matches[:5]
        }
    
    return {
        "best_match": None,
        "all_matches": matches[:5]
    }