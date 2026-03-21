import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# LOAD DATASET
df = pd.read_csv("expense_priority_1000.csv")

X = df["text"]
y = df["priority"]

# TEXT VECTORIZE
vectorizer = TfidfVectorizer()

X_vec = vectorizer.fit_transform(X)

# MODEL
model = LogisticRegression()
model.fit(X_vec, y)

# SAVE MODEL + VECTORIZER
joblib.dump(model, "priority_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("✅ Expense Priority Model Trained")