import os
import sys
import joblib
import numpy as np
import pickle
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import load_model
import json

image_path = sys.argv[1]

# Chemin absolu vers le dossier modelsAI
BASE_DIR = os.path.join(os.path.dirname(__file__), '../modelsIA')

# Charger les modèles
svm = joblib.load(os.path.join(BASE_DIR, "svm_skin_model.pkl"))
base_model = load_model(os.path.join(BASE_DIR, "mobilenetv2_features_model.keras"))
le = pickle.load(open(os.path.join(BASE_DIR, "label_encoder.pkl"), "rb"))

img = image.load_img(image_path, target_size=(224, 224))
x = image.img_to_array(img)
x = np.expand_dims(x, axis=0)
x = preprocess_input(x)

feature = base_model.predict(x, verbose=0).flatten().reshape(1, -1)
pred_index = svm.predict(feature)[0]
pred_class = le.inverse_transform([pred_index])[0]

# ici tu mets une confiance fake
confidence = float(np.random.uniform(75, 95))

result = {
    "diagnosis": pred_class,
    "recommendation": "Consultez un dermatologue pour confirmer.",
    "severity": "medium"
}

print(json.dumps(result))
