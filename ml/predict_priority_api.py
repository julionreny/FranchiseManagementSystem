from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

model = joblib.load("priority_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

@app.route("/predict-priority", methods=["POST"])
def predict():

    data = request.json
    text = data.get("text")

    vec = vectorizer.transform([text])

    pred = model.predict(vec)[0]

    return jsonify({
        "priority": pred
    })

if __name__ == "__main__":
    app.run(port=5002)