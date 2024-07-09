from flask import Flask, request, jsonify
from flask_cors import CORS
import scraper 

app = Flask(__name__)
CORS(app)

@app.route('/scrape', methods=['GET'])
def scrape(): 
    url = request.args.get('url')
    print(url)
    if not url: 
        return jsonify({"error": "URL parameter is required"}), 400

    try: 
        content = scraper.scrape_article(url)
        return jsonify({"content": content})
    except Exception as e: 
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__": 
    app.run(port=5000, debug=True)