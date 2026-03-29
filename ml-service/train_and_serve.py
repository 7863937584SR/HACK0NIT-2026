import re
import joblib
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import os

import cv2
import numpy as np

# Example phishing dataset (replace with real data for production)
data = [
        # More phishing URLs
        ("http://account-update-paypal.com", 1),
        ("http://login-verify-amazon.com", 1),
        ("http://secure-icici-banking-alerts.tk", 1),
        ("http://facebook-login-alerts.ru", 1),
        ("http://win-iphone13-free.click", 1),
        ("http://claim-your-prize-now.top", 1),
        ("http://update-pan-kyc.in", 1),
        ("http://upi-support-helpdesk.ml", 1),
        ("http://reset-password-hdfc.com", 1),
        ("http://verify-epfo-account.cf", 1),
        ("http://govt-subsidy-claim.xyz", 1),
        ("http://covid19-relief-fund.in", 1),
        ("http://income-tax-refund-alert.com", 1),
        ("http://sbi-banking-support.tk", 1),
        ("http://free-crypto-giveaway.click", 1),
        ("http://whatsapp-gold-update.com", 1),
        ("http://aadhaar-update-support.ml", 1),
        ("http://upi-verification-alerts.cf", 1),
        ("http://banking-kyc-update.gq", 1),
        ("http://prize-claim-support.tk", 1),
        # More safe URLs
        ("https://www.npci.org.in/product-overview/upi-product", 0),
        ("https://www.rbi.org.in/Scripts/FAQView.aspx?Id=118", 0),
        ("https://www.sbi.co.in/web/personal-banking", 0),
        ("https://www.icicibank.com/Personal-Banking/account-deposit/savings-account/index.page", 0),
        ("https://www.hdfcbank.com/personal/products/accounts/savings-accounts", 0),
        ("https://www.axisbank.com/retail/accounts/savings-account", 0),
        ("https://www.irctc.co.in/nget/train-search", 0),
        ("https://www.mygov.in/covid-19", 0),
        ("https://www.uidai.gov.in/my-aadhaar/update-aadhaar.html", 0),
        ("https://www.microsoft.com/en-in", 0),
        ("https://www.wikipedia.org/wiki/Phishing", 0),
        ("https://www.linkedin.com/help/linkedin/answer/1367", 0),
        ("https://www.apple.com/in/iphone", 0),
        ("https://www.netflix.com/in/", 0),
        ("https://www.amazon.in/gp/help/customer/display.html", 0),
        ("https://www.facebook.com/help/", 0),
        ("https://www.paypal.com/in/smarthelp/home", 0),
        ("https://www.trustedreviews.com/", 0),
        ("https://www.gov.uk/", 0),
        ("https://www.nhs.uk/", 0),
    # Phishing URLs (1)
    ("http://secure-login.com/verify", 1),
    ("https://mybank.com/login", 1),
    ("http://free-gift.xyz/win", 1),
    ("http://paypal.com.account-security-alert.com", 1),
    ("http://appleid.apple.com-reset-password.com", 1),
    ("http://update-kyc-banking.in/", 1),
    ("http://upi-verification.com/secure", 1),
    ("http://netflix-billing-support.xyz", 1),
    ("http://amazon-prize-winner.click", 1),
    ("http://login-facebook.com-reset-password.ru", 1),
    ("http://icici-banking-alerts.cf", 1),
    ("http://win-free-money.top", 1),
    ("http://verify-wallet.com", 1),
    ("http://tinyurl.com/secure-login", 1),
    ("http://bit.ly/claim-prize", 1),
    ("http://bankofamerica.com-login-alert.ml", 1),
    ("http://giftcard-claim.xyz", 1),
    ("http://kyc-update-support.gq", 1),
    ("http://upi-support-help.ml", 1),
    ("http://reset-password-apple.com", 1),
    # Safe URLs (0)
    ("https://google.com", 0),
    ("https://github.com", 0),
    ("http://trusted-site.org", 0),
    ("https://www.rbi.org.in", 0),
    ("https://www.sbi.co.in", 0),
    ("https://www.icicibank.com", 0),
    ("https://www.amazon.in", 0),
    ("https://www.netflix.com", 0),
    ("https://www.apple.com", 0),
    ("https://www.facebook.com", 0),
    ("https://www.paypal.com", 0),
    ("https://www.hdfcbank.com", 0),
    ("https://www.axisbank.com", 0),
    ("https://www.linkedin.com", 0),
    ("https://www.microsoft.com", 0),
    ("https://www.wikipedia.org", 0),
    ("https://www.npci.org.in", 0),
    ("https://www.irctc.co.in", 0),
    ("https://www.mygov.in", 0),
    ("https://www.uidai.gov.in", 0),
]

X = [x for x, y in data]
y = [y for x, y in data]

# Simple feature: bag of words on URL
pipeline = Pipeline([
    ("vect", CountVectorizer(token_pattern=r"[\w\-\.]+")),
    ("clf", LogisticRegression()),
])

pipeline.fit(X, y)
joblib.dump(pipeline, "model.joblib")

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

model = joblib.load("model.joblib")

def extract_features(url):
    # Optionally add more features here
    return [url]

@app.route("/predict", methods=["POST"])
def predict():
    url = request.json.get("url", "")
    if not url:
        return jsonify({"error": "No URL provided"}), 400
    pred = model.predict(extract_features(url))[0]
    proba = model.predict_proba(extract_features(url))[0][1]
    return jsonify({"phishing": bool(pred), "score": float(proba)})

from werkzeug.utils import secure_filename
from sklearn.ensemble import RandomForestClassifier

def extract_image_features(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return np.zeros(6)
    img = cv2.resize(img, (256, 256))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    mean_color = cv2.mean(img)[:3]
    edges = cv2.Canny(gray, 100, 200)
    edge_density = np.sum(edges) / (256 * 256 * 255)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    noise_diff = cv2.absdiff(gray, blurred).mean()
    return np.array([laplacian_var, mean_color[0], mean_color[1], mean_color[2], edge_density, noise_diff])

def train_image_model():
    # Construct a robust synthetic dataset to train the fallback Random Forest
    np.random.seed(42)
    real_features = np.random.normal(loc=[500, 120, 120, 120, 0.05, 10], scale=[100, 30, 30, 30, 0.01, 2], size=(100, 6))
    real_labels = np.zeros(100)
    fake_features = np.random.normal(loc=[200, 130, 130, 130, 0.03, 5], scale=[50, 20, 20, 20, 0.005, 1], size=(100, 6))
    fake_labels = np.ones(100)
    X = np.vstack([real_features, fake_features])
    y = np.concatenate([real_labels, fake_labels])
    clf = RandomForestClassifier(n_estimators=50, random_state=42)
    clf.fit(X, y)
    joblib.dump(clf, "image_model.joblib")
    return clf

# Load or generate the model
if not os.path.exists("image_model.joblib"):
    image_model = train_image_model()
else:
    image_model = joblib.load("image_model.joblib")

@app.route('/detect_image_deepfake', methods=['POST'])
def detect_image_deepfake():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400
    file = request.files['image']
    filename = secure_filename(file.filename)
    temp_path = f'temp_{filename}'
    file.save(temp_path)
    
    try:
        features = extract_image_features(temp_path)
        pred = image_model.predict([features])[0]
        proba = image_model.predict_proba([features])[0][1]
        result = 'fake' if pred == 1 else 'real'
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    return jsonify({'deepfake': result, 'score': float(proba)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5005))
    app.run(host="0.0.0.0", port=port)
