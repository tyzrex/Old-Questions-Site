from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)


@app.route("/")
def home():
    with open(f"json/subjects.json") as file:
        subjects_data = json.load(file)
    return render_template("index.html", subjects_data=subjects_data)

@app.route("/unitwisequestions/<subject>")
def get_unitwise_questions(subject):
    print(subject)
    with open(f"questions_json/{subject.replace(" ",'')}.json") as file:
        questions_data = json.load(file)
    return jsonify(questions_data)


@app.route("/unitwise/<subject>")
def unitwise(subject):
    return render_template(f"unitwise.html")


@app.route("/scrape", methods=["GET"])
def scrape():
    # scraper = WebScraper()
    # scraper.scrape_options()
    return "Scraping done!"


@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("favicon.ico")


if __name__ == "__main__":
    app.run()
