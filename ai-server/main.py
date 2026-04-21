"""
FastAPI AI Server — Sawit Monitoring System
Model: MobileNetV2 (Binary: Matang vs Mentah)
Port: 8001
"""

import os
import glob
import json
import random
import time
from pathlib import Path
from datetime import datetime

import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io
import tensorflow as tf

# ============================================================
# PATH CONFIGURATION
# ============================================================
BASE_DIR = Path(__file__).parent

MODEL_PATH  = Path(r"C:\Users\user\Nata\magang\Capstone-Klasifikasi\Klasifikasi-Sawit\models\mobilenetv2_sawit_baseline.keras")
CLASS_MAP_PATH = Path(r"C:\Users\user\Nata\magang\Capstone-Klasifikasi\Klasifikasi-Sawit\models\class_mapping.json")
DATASET_PATH   = Path(r"C:\Users\user\Nata\magang\Capstone-Klasifikasi\Klasifikasi-Sawit\Dataset\train")

INPUT_SIZE = (224, 224)

# ============================================================
# MODEL LOADING (sekali saat startup)
# ============================================================
print("[AI Server] Memuat model MobileNetV2...")
model = tf.keras.models.load_model(str(MODEL_PATH))
print(f"[AI Server] Model berhasil dimuat: {MODEL_PATH.name}")

with open(CLASS_MAP_PATH, "r") as f:
    CLASS_MAP = json.load(f)  # {"0": "Matang", "1": "Mentah"}

# Pre-index dataset images agar simulate cepat tanpa glob berulang
_dataset_index = {
    "Matang": glob.glob(str(DATASET_PATH / "Matang" / "*.jpg")),
    "Mentah": glob.glob(str(DATASET_PATH / "Mentah" / "*.jpg")),
}
_all_images = _dataset_index["Matang"] + _dataset_index["Mentah"]
print(f"[AI Server] Dataset: {len(_dataset_index['Matang'])} Matang | {len(_dataset_index['Mentah'])} Mentah")

# ============================================================
# FASTAPI SETUP
# ============================================================
app = FastAPI(
    title="Sawit AI Server",
    description="Prediksi kematangan buah sawit menggunakan MobileNetV2",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # GCS React (localhost:5173) + Laravel (localhost:8000)
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# HELPERS
# ============================================================
def preprocess_image(img: Image.Image) -> np.ndarray:
    """Resize + normalize gambar ke format input model."""
    img = img.convert("RGB")
    img = img.resize(INPUT_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)


def predict_from_array(arr: np.ndarray) -> dict:
    """Jalankan inferensi dan return dict hasil."""
    pred = model.predict(arr, verbose=0)
    score = float(pred[0][0])  # sigmoid output

    # score >= 0.5 → Mentah (class 1), score < 0.5 → Matang (class 0)
    label_idx = "1" if score >= 0.5 else "0"
    label = CLASS_MAP[label_idx]
    confidence = round(score if label == "Mentah" else (1.0 - score), 4)

    return {
        "prediction": label,
        "confidence": confidence,
        "raw_score": round(score, 4),
        "captured_at": datetime.now().isoformat(),
    }


def predict_from_path(image_path: str) -> dict:
    """Load gambar dari path lalu predict."""
    img = Image.open(image_path)
    arr = preprocess_image(img)
    result = predict_from_array(arr)
    result["image_path"] = image_path
    result["filename"] = Path(image_path).name
    return result

# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/health")
def health_check():
    """Cek status server dan model."""
    return {
        "status": "ok",
        "model_loaded": True,
        "model_name": MODEL_PATH.name,
        "dataset_matang": len(_dataset_index["Matang"]),
        "dataset_mentah": len(_dataset_index["Mentah"]),
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/simulate")
def simulate_trad():
    """
    TRAD Mode — Ambil 1 gambar random dari dataset dan predict.
    Dipakai oleh GCS saat drone scan 360° di setiap pohon.
    """
    if not _all_images:
        raise HTTPException(status_code=500, detail="Dataset kosong")

    image_path = random.choice(_all_images)
    result = predict_from_path(image_path)
    result["mode"] = "traditional"
    return result


@app.get("/simulate/dual")
def simulate_qlv():
    """
    QLV Mode — Ambil 2 gambar BERBEDA random dari dataset dan predict.
    Dipakai oleh GCS saat drone berhenti di lorong antara 2 pohon.
    Returns: { left: {...}, right: {...} }
    """
    if len(_all_images) < 2:
        raise HTTPException(status_code=500, detail="Dataset kurang dari 2 gambar")

    # Pilih 2 gambar berbeda
    left_path, right_path = random.sample(_all_images, 2)

    left_result  = predict_from_path(left_path)
    right_result = predict_from_path(right_path)

    left_result["cam_position"]  = "left"
    right_result["cam_position"] = "right"

    return {
        "mode": "qlv",
        "left":  left_result,
        "right": right_result,
        "captured_at": datetime.now().isoformat(),
    }


@app.post("/predict")
async def predict_upload(file: UploadFile = File(...)):
    """
    TRAD Mode Production — Upload 1 gambar dari kamera drone → predict.
    Dipakai oleh Laravel LaporanController.sendSample()
    """
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        arr = preprocess_image(img)
        result = predict_from_array(arr)
        result["filename"] = file.filename
        result["mode"] = "traditional"
        return result
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Gagal proses gambar: {str(e)}")


@app.post("/predict/dual")
async def predict_dual_upload(
    file_left:  UploadFile = File(...),
    file_right: UploadFile = File(...),
):
    """
    QLV Mode Production — Upload 2 gambar (kiri & kanan) → 2 prediksi.
    Dipakai saat drone real dengan 2 kamera.
    """
    try:
        left_bytes  = await file_left.read()
        right_bytes = await file_right.read()

        arr_left  = preprocess_image(Image.open(io.BytesIO(left_bytes)))
        arr_right = preprocess_image(Image.open(io.BytesIO(right_bytes)))

        left_result  = predict_from_array(arr_left)
        right_result = predict_from_array(arr_right)

        left_result["cam_position"]  = "left"
        left_result["filename"]      = file_left.filename
        right_result["cam_position"] = "right"
        right_result["filename"]     = file_right.filename

        return {
            "mode": "qlv",
            "left":  left_result,
            "right": right_result,
            "captured_at": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Gagal proses gambar: {str(e)}")
