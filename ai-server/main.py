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
import base64
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

# Coba gunakan absolute path di laptop developer, jika tidak ada fallback ke folder internal
DEV_MODEL_PATH = Path(r"C:\Users\user\Nata\magang\Capstone-Klasifikasi\Klasifikasi-Sawit\models\mobilenetv2_sawit_baseline.h5")
DEV_CLASS_MAP_PATH = Path(r"C:\Users\user\Nata\magang\Capstone-Klasifikasi\Klasifikasi-Sawit\models\class_mapping.json")
DEV_DATASET_PATH   = Path(r"C:\Users\user\Nata\magang\Capstone-Klasifikasi\Klasifikasi-Sawit\Dataset\train")

if DEV_MODEL_PATH.exists():
    MODEL_PATH = DEV_MODEL_PATH
    CLASS_MAP_PATH = DEV_CLASS_MAP_PATH
    DATASET_PATH = DEV_DATASET_PATH
else:
    MODEL_PATH = BASE_DIR / "models" / "mobilenetv2_sawit_baseline.h5"
    CLASS_MAP_PATH = BASE_DIR / "models" / "class_mapping.json"
    DATASET_PATH = BASE_DIR / "Dataset" / "train"

INPUT_SIZE = (224, 224)

# ============================================================
# MODEL LOADING (Custom weight loader to bypass version conflicts)
# ============================================================
import h5py

print("[AI Server] Membangun model MobileNetV2 secara manual...")
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights=None
)

inputs = tf.keras.Input(shape=(224, 224, 3), name='input_layer_1')
x = base_model(inputs)
x = tf.keras.layers.GlobalAveragePooling2D(name='global_average_pooling2d')(x)
x = tf.keras.layers.BatchNormalization(name='batch_normalization')(x)
x = tf.keras.layers.Dropout(0.3, name='dropout')(x)
outputs = tf.keras.layers.Dense(1, activation='sigmoid', name='output')(x)

model = tf.keras.Model(inputs=inputs, outputs=outputs)

print(f"[AI Server] Memuat bobot model dari {MODEL_PATH.name}...")
try:
    with h5py.File(str(MODEL_PATH), 'r') as f:
        # 1. Load output layer weights
        output_kernel = f['model_weights/output/output/kernel'][:]
        output_bias = f['model_weights/output/output/bias'][:]
        model.get_layer('output').set_weights([output_kernel, output_bias])
        
        # 2. Load top-level BatchNormalization weights
        bn_beta = f['model_weights/batch_normalization/batch_normalization/beta'][:]
        bn_gamma = f['model_weights/batch_normalization/batch_normalization/gamma'][:]
        bn_mean = f['model_weights/batch_normalization/batch_normalization/moving_mean'][:]
        bn_var = f['model_weights/batch_normalization/batch_normalization/moving_variance'][:]
        model.get_layer('batch_normalization').set_weights([bn_gamma, bn_beta, bn_mean, bn_var])
        
        # 3. Load base model layers
        base_model_layer = model.get_layer('mobilenetv2_1.00_224')
        for layer in base_model_layer.layers:
            layer_group_name = f'model_weights/mobilenetv2_1.00_224/{layer.name}'
            if layer_group_name in f:
                g = f[layer_group_name]
                weights = []
                for w in layer.weights:
                    w_var_name = w.name.split('/')[-1].split(':')[0]
                    # Fix mapping: depthwise_kernel -> kernel (newer Keras stores it as 'kernel' in H5)
                    h5_var_name = w_var_name
                    if w_var_name == 'depthwise_kernel' and 'kernel' in g:
                        h5_var_name = 'kernel'
                    if h5_var_name in g:
                        weights.append(g[h5_var_name][:])
                if weights:
                    layer.set_weights(weights)
                    
    print("[AI Server] Model MobileNetV2 dan bobot berhasil dimuat!")
except Exception as e:
    print(f"[AI Server] [ERROR] Gagal memuat bobot model: {e}")

with open(CLASS_MAP_PATH, "r") as f:
    CLASS_MAP = json.load(f)  # {"0": "Matang", "1": "Mentah"}

# Pre-index dataset images agar simulate cepat tanpa glob berulang (jika folder dataset ada)
_dataset_index = {"Matang": [], "Mentah": []}
_all_images = []

if DATASET_PATH.exists():
    _dataset_index = {
        "Matang": glob.glob(str(DATASET_PATH / "Matang" / "*.jpg")),
        "Mentah": glob.glob(str(DATASET_PATH / "Mentah" / "*.jpg")),
    }
    _all_images = _dataset_index["Matang"] + _dataset_index["Mentah"]
    print(f"[AI Server] Dataset: {len(_dataset_index['Matang'])} Matang | {len(_dataset_index['Mentah'])} Mentah")
else:
    print("[AI Server] [WARNING] Dataset path tidak ditemukan atau sudah dihapus. Mode simulasi dinonaktifkan.")

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
    arr = np.array(img, dtype=np.float32)
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
    """Load gambar dari path lalu predict. Sertakan base64 untuk display di GCS."""
    img = Image.open(image_path)
    arr = preprocess_image(img)
    result = predict_from_array(arr)
    result["image_path"] = image_path
    result["filename"] = Path(image_path).name

    # Encode gambar asli ke base64 agar bisa ditampilkan di kamera feed GCS
    try:
        with open(image_path, "rb") as f:
            ext = Path(image_path).suffix.lower().lstrip('.')
            mime = "jpeg" if ext in ('jpg', 'jpeg') else ext
            result["image_base64"] = f"data:image/{mime};base64," + base64.b64encode(f.read()).decode("utf-8")
    except Exception:
        result["image_base64"] = None

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
