from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from services.landmark_extractor import extract_landmarks_from_video
import os
from pathlib import Path
import json
from datetime import datetime

asl_bp = Blueprint('asl', __name__)

UPLOAD_FOLDER = 'uploads'
USER_LANDMARKS_FOLDER = 'user_landmarks'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'webm'}

# Create directories if they don't exist
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)
Path(USER_LANDMARKS_FOLDER).mkdir(exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@asl_bp.route('/process-user-video', methods=['POST'])
def process_user_video():
    """
    Receive user video from frontend
    Extract landmarks
    Save as JSON file
    Return only success message
    """
    
    # Check if video file is present
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    file = request.files['video']
    word = request.form.get('word', 'unknown')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed: mp4, avi, mov, webm'}), 400
    
    # Save uploaded video temporarily
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = secure_filename(f"user_{word}_{timestamp}.mp4")
    user_video_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(user_video_path)
    
    try:
        # Extract landmarks from user video
        print(f"📹 Processing video: {user_video_path}")
        user_landmarks = extract_landmarks_from_video(user_video_path, word)
        
        # Save landmarks as JSON file
        json_filename = f"{word}_{timestamp}.json"
        json_path = os.path.join(USER_LANDMARKS_FOLDER, json_filename)
        
        with open(json_path, 'w') as f:
            json.dump(user_landmarks, f, indent=2)
        
        print(f"✅ Saved landmarks to: {json_path}")
        
        # Optional: Delete uploaded video after processing to save space
        # os.remove(user_video_path)
        
        return jsonify({
            'success': True,
            'message': 'Video processed and saved successfully',
            'json_file': json_filename
        }), 200
        
    except Exception as e:
        # Clean up on error
        if os.path.exists(user_video_path):
            os.remove(user_video_path)
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500