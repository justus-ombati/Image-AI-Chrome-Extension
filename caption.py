from requests import get
from flask import Flask, request, jsonify
from PIL import Image
import torch
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
import urllib.parse
from io import BytesIO
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

model = VisionEncoderDecoderModel.from_pretrained(
    "nlpconnect/vit-gpt2-image-captioning")
feature_extractor = ViTImageProcessor.from_pretrained(
    "nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained(
    "nlpconnect/vit-gpt2-image-captioning")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

max_length = 20
num_beams = 8
gen_kwargs = {"max_length": max_length, "num_beams": num_beams}


def download_image(url_or_path):
    parsed = urllib.parse.urlparse(url_or_path)
    if parsed.scheme == '':
        # Open local image
        return Image.open(url_or_path)
    else:
        # Download remote image
        response = get(url_or_path)
        if response.status_code != 200:
            return None
        img = Image.open(BytesIO(response.content))
        return img


@app.route('/generate_caption', methods=['POST'])
def generate_caption():
    data = request.get_json()
    image_url = data.get('image_url')

    if image_url is None:
        return jsonify({'error': 'No image URL provided'})

    image = download_image(image_url)
    if image is None:
        return jsonify({'error': 'Unsupported image format'})

    pixel_values = feature_extractor(
        images=image, return_tensors="pt").pixel_values
    pixel_values = pixel_values.to(device)

    output_ids = model.generate(pixel_values, **gen_kwargs)

    preds = tokenizer.batch_decode(output_ids, skip_special_tokens=True)
    preds = [pred.strip() for pred in preds]
    return jsonify({'caption': preds[0]})


if __name__ == '__main__':
    app.run(port=5001)
