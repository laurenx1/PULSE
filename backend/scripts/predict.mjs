import { AutoModelForSequenceClassification, AutoTokenizer } from '@xenova/transformers';

const modelPath = './bert-finetuned-model';
const tokenizerPath = './bert-finetuned-tokenizer';
const labels = ["left-leaning", "right-leaning", "neutral"]; 

let model, tokenizer;

export const loadModelAndTokenizer = async () => {
    model = await AutoModelForSequenceClassification.from_pretrained(modelPath);
    tokenizer = await AutoTokenizer.from_pretrained(tokenizerPath);
};

export const predict = async (text) => {
    if (!model || !tokenizer) {
        throw new Error("Model and tokenizer are not loaded.");
    }

    const inputs = await tokenizer(text, { return_tensors: 'np', truncation: true, padding: true });
    const outputs = await model(inputs);

    const logits = outputs.logits;
    const probabilities = logits.softmax(-1).dataSync();
    const predictedClass = logits.argmax(-1).dataSync()[0];

    return labels.map((label, i) => ({
        label,
        probability: parseFloat((probabilities[i] * 100).toFixed(2)),
    }));
};