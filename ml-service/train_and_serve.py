import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from transformers import pipeline
from PIL import Image

app = Flask(__name__)

# Initialize Hugging Face Pipelines
print("Loading Deep Learning Models... (This may take a minute on first run)")

try:
    # Text Classification Model (Fine-tuned BERT for Phishing/Spam)
    print("Loading Text Model: mrm8488/bert-tiny-finetuned-sms-spam-detection")
    text_classifier = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-sms-spam-detection")
    print("✅ Text model loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load text model: {e}")
    text_classifier = None

try:
    # Image Classification Model (Vision Transformer / CNN for Deepfake Detection)
    print("Loading Image Model: prithivMLmods/Deep-Fake-Detector-v2-Model")
    image_classifier = pipeline("image-classification", model="prithivMLmods/Deep-Fake-Detector-v2-Model")
    print("✅ Image model loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load image model: {e}")
    image_classifier = None

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route("/predict", methods=["POST"])
def predict():
    url = request.json.get("url", "")
    if not url:
        return jsonify({"error": "No URL/Text provided"}), 400
    
    if text_classifier is None:
         return jsonify({"error": "Text AI model is not available"}), 500

    try:
        # Prediction
        result = text_classifier(url)[0]
        # Label usually 'LABEL_1' for spam or 'spam'
        label = result['label'].lower()
        score = result['score']
        
        # Determine if it's phishing/spam
        is_phishing = ('spam' in label) or ('label_1' in label) or ('phishing' in label)
        
        return jsonify({"phishing": is_phishing, "score": float(score)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/detect_image_deepfake', methods=['POST'])
def detect_image_deepfake():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400
    
    if image_classifier is None:
        return jsonify({'error': 'Image AI model is not available'}), 500

    file = request.files['image']
    filename = secure_filename(file.filename)
    temp_path = f'temp_{filename}'
    file.save(temp_path)
    
    try:
        # Load image with Pillow for the Transformer pipeline
        img = Image.open(temp_path).convert('RGB')
        
        # Prediction
        results = image_classifier(img)
        # results is usually a list of dicts like: [{'label': 'Fake', 'score': 0.98}, {'label': 'Real', 'score': 0.02}]
        top_prediction = results[0]
        label = top_prediction['label'].lower()
        score = top_prediction['score']
        
        # Typically deepfake models output 'fake', 'artificial', 'spoof', etc
        is_fake = 'fake' in label or 'artificial' in label or 'spoof' in label or 'altered' in label

        return_label = 'fake' if is_fake else 'real'
        return jsonify({'deepfake': return_label, 'score': float(score)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5005))
    app.run(host="0.0.0.0", port=port)
