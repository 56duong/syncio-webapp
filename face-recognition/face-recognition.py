from flask import Flask, request, jsonify
import face_recognition
import numpy as np
import requests
from PIL import Image
from io import BytesIO
import json


app = Flask(__name__)


@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Face Recognition API from SYNCIO!"


# Function to load an image from a URL
def load_image_from_url(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        # Load the image with PIL
        image = Image.open(BytesIO(response.content))
        # Convert the image to RGB if it's not already in that format
        if image.mode != 'RGB':
            image = image.convert('RGB')
        # Convert the PIL image to a NumPy array
        image_array = np.array(image)
        return image_array
    except requests.exceptions.RequestException as e:
        print(f"Error fetching image from {url}: {e}")
        return None
    except IOError as e:
        print(f"Error loading image from {url}: {e}")
        return None


@app.route('/process_images', methods=['GET', 'POST'])
def process_images():
    try:
        if request.method == 'POST':
            # Get the known images directly as a JSON dictionary
            known_images = json.loads(request.form.get('known_images', '[]'))

            # Check if a file is part of the request
            if 'person_image' not in request.files:
                return jsonify({"error": "No file part"}), 400
            file = request.files['person_image']
            
            # If the user does not select a file, the browser submits an empty file without a filename.
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400
        elif request.method == 'GET':
            # Example of handling a simple GET request
            # This is not practical for the actual use case but demonstrates handling GET requests
            known_images = [{
                "id": request.args.get('id'),
                "url": request.args.get('url')
            }]
        
        known_face_encodings = []
        known_face_ids = []

        # Process known images
        for image_info in known_images:
            try:
                image_id = image_info.get('id')
                image_url = image_info.get('url')
                image = load_image_from_url(image_url)
            except Exception as e:
                print(f"Error loading image {image_url}: {str(e)}")
                continue
            if image is None:
                print(f"Skipping image {image_url} due to loading error.")
                continue
            try:
                face_encoding = face_recognition.face_encodings(image)[0]
                known_face_encodings.append(face_encoding)
                known_face_ids.append(image_id)
            except IndexError:
                print(f"No face found in {image_url}, skipping.")

        # Process person's image
        person_image = face_recognition.load_image_file(file)
        try:
            person_face_encoding = face_recognition.face_encodings(person_image)[0]
        except IndexError:
            return jsonify({"error": "No face found in the image you uploaded"}), 400

        # Compare person's face with known faces
        matches = face_recognition.compare_faces(known_face_encodings, person_face_encoding)

        # Find all matches
        matching_indices = [i for i, match in enumerate(matches) if match]
        matching_ids = [known_face_ids[i] for i in matching_indices]

        if matching_ids:
            return jsonify({"matching_ids": matching_ids}), 200
        else:
            return jsonify({"error": "No matching images found"}), 404

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
