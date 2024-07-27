# server.py
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os

app = Flask(__name__)

# Define the paths to your saved model and tokenizer files
model_save_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'bert-finetuned-model'))
tokenizer_save_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'bert-finetuned-tokenizer'))


# Load model and tokenizer
model = AutoModelForSequenceClassification.from_pretrained(model_save_path)
tokenizer = AutoTokenizer.from_pretrained(tokenizer_save_path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    text = data['text']

    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    
    logits = outputs.logits
    probabilities = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
    predicted_class = torch.argmax(logits, dim=1).item()

    labels = ["left-leaning", "right-leaning", "neutral"]  # Replace with your actual class labels

    # Convert the probabilities to Python native float
    predicted_labels_with_percentages = [
        (labels[i], float(probability * 100)) for i, probability in enumerate(probabilities)
    ]



    # Debug prints
    print("Predicted labels with percentages (before conversion):", predicted_labels_with_percentages)

    # Convert the entire response to ensure all values are serializable
    serializable_response = []
    for label, prob in predicted_labels_with_percentages:
        print(f"Label: {label}, Probability: {prob}, Type: {type(prob)}")
        serializable_response.append((label, float(prob)))

    print("Serializable response:", serializable_response)

    return jsonify(serializable_response)

if __name__ == '__main__':
    app.run(debug=True)