from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

model = joblib.load("priority_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

@app.route("/predict-priority", methods=["POST"])
def predict_priority():
    text = request.json["text"]
    vec = vectorizer.transform([text])
    pred = model.predict(vec)[0]
    return jsonify({"priority": pred})

app.run(port=5002)