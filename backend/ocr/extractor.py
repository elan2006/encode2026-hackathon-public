from paddleocr import PaddleOCR
import cv2
import numpy as np
from PIL import Image
import io
import requests
import os

def extract_text(img_bytes):
    pil_image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img_np = np.array(pil_image)
    img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    ocr = PaddleOCR(use_angle_cls=True, lang="en")

    result = ocr.ocr(img_np)

    # NEW PaddleOCR result format
    texts = result[0]["rec_texts"]
    scores = result[0]["rec_scores"]

    # Optional: filter by confidence
    filtered = [
        text for text, score in zip(texts, scores) if score > 0.6
    ]

    extracted_text = " ".join(filtered)
    print("Extracted text:", extracted_text)

    return extracted_text

def extract_text_api(img_bytes):
    API_KEY = os.getenv("OCR_API_KEY")
    OCR_URL = "https://api.ocr.space/parse/image"
    payload = {
        "apikey": API_KEY,
        "language": "eng"
    }
    # files = {"file": img_bytes}
    files = {
        "file": ("image.png", img_bytes, "image/png")
    }
    response = requests.post(OCR_URL, data=payload, files=files)
    result = response.json()
    if result.get("IsErroredOnProcessing"):
        print("OCR Error:", result.get("ErrorMessage"))
        return "OCR Error"
    else:
        text = result["ParsedResults"][0]["ParsedText"]
        print("----- EXTRACTED TEXT -----")
        print(text)
    return text
