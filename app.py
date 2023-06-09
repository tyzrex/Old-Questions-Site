from flask import Flask, render_template, jsonify
import json
app = Flask(__name__)


@app.route('/')
def home():
    return render_template('./index.html')


@app.route("/toc")
def toc():
    return render_template('./toc.html')


@app.route("/os")
def os():
    return render_template('./os.html')


@app.route("/dbms")
def dbms():
    return render_template('./dbms.html')


@app.route("/cn")
def cn():
    return render_template('./cn.html')


@app.route('/ai')
def ai():
    return render_template('./ai.html')


@app.route('/questions/<subject>')
def get_questions(subject):
    print(subject)
    with open('./json/' + subject + '.json') as file:
        questions_data = json.load(file)
    return jsonify(questions_data)


@app.route("/scrape", methods=['GET'])
def scrape():
    # scraper = WebScraper()
    # scraper.scrape_options()
    return "Scraping done!"


if __name__ == '__main__':
    app.run()
