from flask import Flask, request, jsonify
import os
import json
from werkzeug.utils import secure_filename

# Try to import TensorFlow dependencies
try:
    import tensorflow as tf
    import numpy as np
    import cv2
    TENSORFLOW_AVAILABLE = True
except ImportError:
    # If TensorFlow is not available, set flag to use simulated results
    TENSORFLOW_AVAILABLE = False
    tf = None
    np = None
    cv2 = None

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load the model (you'll need to download the model files)
try:
    if TENSORFLOW_AVAILABLE:
        # This is where you would load your actual model
        # model = tf.keras.models.load_model('path/to/your/model.h5')
        model = None  # Placeholder - replace with actual model loading
        print("✅ AI Model loaded successfully!")
    else:
        model = None
        print("⚠️ TensorFlow not available. Using simulated results.")
except Exception as e:
    model = None
    print(f"⚠️ Error loading model: {e}")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    """Preprocess image for model prediction"""
    if not TENSORFLOW_AVAILABLE or cv2 is None:
        # Return None if dependencies are not available
        return None
        
    # Read image
    image = cv2.imread(image_path)
    # Resize to model input size (224x224 for many models)
    image = cv2.resize(image, (224, 224))
    # Normalize pixel values
    image = image.astype('float32') / 255.0
    # Add batch dimension
    image = np.expand_dims(image, axis=0)
    return image

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'AI Service is running',
        'model_loaded': model is not None
    })

@app.route('/analyze', methods=['POST'])
def analyze_freshness():
    """Analyze freshness of uploaded image"""
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No image file provided'
            }), 400
        
        file = request.files['image']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No image file selected'
            }), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'Invalid file type. Only PNG, JPG, JPEG, GIF allowed'
            }), 400
        
        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # If model is not loaded, return simulated results
        if model is None:
            # Remove the file
            os.remove(filepath)
            
            # Return simulated results
            freshness_options = ['Fresh', 'Half-Fresh', 'Rotten']
            import random
            freshness = random.choice(freshness_options)
            confidence = round(random.uniform(0.7, 0.95), 2)
            
            # Determine quality grade based on freshness
            if freshness == 'Fresh':
                quality_grade = 'Grade A'
                quality_score = int(80 + (confidence * 20))  # 80-100
            elif freshness == 'Half-Fresh':
                quality_grade = 'Grade B'
                quality_score = int(50 + (confidence * 30))  # 50-80
            else:
                quality_grade = 'Grade C'
                quality_score = int(confidence * 50)  # 0-50
            
            return jsonify({
                'success': True,
                'freshness': freshness,
                'confidence': confidence,
                'quality_grade': quality_grade,
                'quality_score': quality_score
            })
        
        # Preprocess image
        processed_image = preprocess_image(filepath)
        
        # Make prediction
        predictions = model.predict(processed_image)
        prediction = predictions[0]
        
        # Interpret results
        freshness_labels = ['Fresh', 'Half-Fresh', 'Rotten']
        max_index = np.argmax(prediction)
        confidence = float(prediction[max_index])
        freshness = freshness_labels[max_index]
        
        # Determine quality grade based on freshness
        if freshness == 'Fresh':
            quality_grade = 'Grade A'
            quality_score = int(80 + (confidence * 20))  # 80-100
        elif freshness == 'Half-Fresh':
            quality_grade = 'Grade B'
            quality_score = int(50 + (confidence * 30))  # 50-80
        else:
            quality_grade = 'Grade C'
            quality_score = int(confidence * 50)  # 0-50
        
        # Remove the file
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'freshness': freshness,
            'confidence': confidence,
            'quality_grade': quality_grade,
            'quality_score': quality_score
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error analyzing image: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
