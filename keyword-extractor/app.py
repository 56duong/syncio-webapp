from flask import Flask, request, jsonify
import yake

app = Flask(__name__)

# Initialize the YAKE Keyword Extractor
kw_extractor = yake.KeywordExtractor()

@app.route('/')
def hello_world():
    return 'Hello from Flask!'



@app.route('/extract-keywords', methods=['POST', 'GET'])
def extract_keywords():
    try:
        if request.method == 'POST':
            data = request.json
            text = data.get('text', '')
        else:
            text = request.args.get('text', '')

        if not text:
            return jsonify({"error": "No text provided"}), 400

        keywords = kw_extractor.extract_keywords(text)
        sorted_keywords = sorted(keywords, key=lambda x: x[1])

        keywords_length_3 = [kw for kw in sorted_keywords if len(kw[0].split()) == 3][:10]
        keywords_length_2 = [kw for kw in sorted_keywords if len(kw[0].split()) == 2][:10]
        keywords_length_1 = [kw for kw in sorted_keywords if len(kw[0].split()) == 1][:10]

        response = {
            "keywords_length_1": [{"keyword": kw[0], "score": kw[1]} for kw in keywords_length_1][:10],
            "keywords_length_2": [{"keyword": kw[0], "score": kw[1]} for kw in keywords_length_2][:10],
            "keywords_length_3": [{"keyword": kw[0], "score": kw[1]} for kw in keywords_length_3][:10],
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run()