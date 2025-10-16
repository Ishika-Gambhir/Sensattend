from deepface import DeepFace

def face_matched(img1, img2):
    
    response = DeepFace.verify(
        img1_path=img1,
        img2_path=img2,
        model_name='ArcFace', # can also use VGG-Face
        detector_backend='retinaface',
    )
    return response['verified']