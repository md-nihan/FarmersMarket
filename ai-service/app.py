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

# Initialize a simple TensorFlow model (no external downloads)
model = None
if TENSORFLOW_AVAILABLE:
    try:
        def build_simple_freshness_model():
            inp = tf.keras.Input(shape=(224, 224, 3), name='image')
            x = tf.cast(inp, tf.float32) / 255.0
            g = x[..., 1]
            mean_g = tf.reduce_mean(g, axis=[1, 2])  # (batch,)
            std_all = tf.math.reduce_std(x, axis=[1, 2, 3])  # (batch,)
            score = tf.clip_by_value(0.6 * mean_g + 0.4 * (1.0 - std_all), 0.0, 1.0)
            fresh_logit = (score - 0.33) * 6.0
            half_logit = -tf.abs(score - 0.5) * 6.0 + 3.0
            rotten_logit = (0.33 - score) * 6.0
            logits = tf.stack([fresh_logit, half_logit, rotten_logit], axis=-1)
            probs = tf.nn.softmax(logits)
            return tf.keras.Model(inp, probs, name='simple_freshness_model')
        model = build_simple_freshness_model()
        print("✅ TensorFlow model initialized (simple freshness heuristic).")
    except Exception as e:
        model = None
        print(f"⚠️ Error initializing TensorFlow model: {e}")
else:
    print("❌ TensorFlow not available. AI endpoints will return an error.")

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
    # Convert to float32 (model handles normalization)
    image = image.astype('float32')
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
        
        # Enforce TensorFlow usage (no simulation)
        if not TENSORFLOW_AVAILABLE or model is None:
            os.remove(filepath)
            return jsonify({
                'success': False,
                'message': 'TensorFlow not available on server. Ensure tensorflow is installed and imports successfully.'
            }), 500
        
        # Preprocess image
        processed_image = preprocess_image(filepath)
        
        # If OpenCV is unavailable, try TensorFlow decoding
        if processed_image is None and TENSORFLOW_AVAILABLE:
            img_bytes = tf.io.read_file(filepath)
            img = tf.image.decode_image(img_bytes, channels=3)
            img = tf.image.resize(img, [224, 224])
            img = tf.expand_dims(img, 0)
            processed_image = img.numpy()
        
        # Make prediction
        predictions = model.predict(processed_image)
        prediction = predictions[0]
        
        # Interpret results
        freshness_labels = ['Fresh', 'Half-Fresh', 'Rotten']
        max_index = int(np.argmax(prediction))
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
