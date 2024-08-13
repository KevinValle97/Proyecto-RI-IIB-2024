from flask import Flask, request, render_template, jsonify, send_file
from sklearn.neighbors import KNeighborsClassifier
from PIL import Image
import numpy as np
import pickle
import io
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
from flask_cors import CORS
from werkzeug.utils import secure_filename
from io import BytesIO
import os
import base64

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

UPLOAD_FOLDER = 'uploads/'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

from config import Config
app.config.from_object(Config)

# Cargar el modelo ResNet50 preentrenado en ImageNet
model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3), pooling='max')

# Ruta al dataset de Caltech101
dataset_path = 'D:/Kevin/Documents/EPN/2024A/Recuperación de Información/Proyecto-RI-IIB-2024A/data_caltech/101_ObjectCategories'

# Cargar las características de las imágenes desde el archivo .pkl
with open('D:/Kevin/Documents/EPN/2024A/Recuperación de Información/Proyecto-RI-IIB-2024A/backend/image-upload-and-predict/model/caltech101_features_new1.pkl', 'rb') as f:
    image_paths = pickle.load(f)

#print(features_data.keys())

# Función para extraer características usando ResNet50
def extract_features(img_array):
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    features = model.predict(img_array)
    return features.flatten()

# Extraer características para todas las imágenes
X = np.array(list(image_paths.values()))
y = [path.split('\\')[-2] for path in image_paths]  # Extraer la etiqueta del path

# Entrenar el modelo KNN
knn = KNeighborsClassifier(n_neighbors=5, algorithm='brute', metric='euclidean')
knn.fit(X, y)


@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    
    try:
        # Procesar la imagen
        img = Image.open(file).convert('RGB')
        img = img.resize((224, 224))
        img_array = np.array(img)
        
        # Extraer características de la imagen recibida
        features = extract_features(img_array)

        # Obtener las 5 mejores coincidencias usando KNN
        distances, indices = knn.kneighbors([features])
        best_matches = [list(image_paths.keys())[i] for i in indices[0]]
        
        # Convertir la imagen subida a base64
        buffered = BytesIO()
        img.save(buffered, format="JPEG")
        uploaded_image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        uploaded_image_base64 = f"data:image/jpeg;base64,{uploaded_image_base64}"

        # Convertir las imágenes a base64 para enviarlas al frontend
        images_base64 = []
        matches_info = []
        for i, match in enumerate(best_matches):
            with open(match, "rb") as img_file:
                b64_string = base64.b64encode(img_file.read()).decode('utf-8')
                images_base64.append(f"data:image/jpeg;base64,{b64_string}")
                matches_info.append({
                    'image': f"data:image/jpeg;base64,{b64_string}",
                    'distance': float(distances[0][i]),  # Convertir a tipo float
                    'index': int(indices[0][i])  # Convertir a tipo int
                })
        
        return jsonify({
            'uploaded_image': uploaded_image_base64,  # Incluir la imagen subida
            'matches': matches_info
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
