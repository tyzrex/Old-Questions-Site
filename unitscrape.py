import subprocess
from bs4 import BeautifulSoup as soup
import requests
from simple_term_menu import TerminalMenu
from tqdm import tqdm
import json


class WebScraper:
    def get_all_questions_collegenote(self, url):
        results = []

        try:
            data_html = requests.get(url)
            data_html.raise_for_status()
        except requests.exceptions.RequestException as e:
            print("Error occurred while fetching the data:", e)
            return None

        data_soup = soup(data_html.text, "html.parser")
        card = data_soup.find_all("div", class_="card")

        for question in card:
            questions = question.find_all("div", class_="col-10")
            asked = question.find_all("div", class_="col-2")
            buttons = question.find("button", class_="btn btn-link")
            results.append(
                {
                    "Chapter": buttons.text,
                    "Question": [q.text for q in questions],
                    "Asked": [a.text for a in asked],
                }
            )

        return results

    def write_json_file(self, data, selected_subject):
        json_data = {"subject": selected_subject, "questions": []}
        for data in tqdm(data, desc="Writing questions", unit="question"):
            json_data["questions"].append(data)

        json_str = json.dumps(json_data, indent=4)

        with open(f"{selected_subject}.json", "w") as file:
            file.write(json_str)

    def get_all_questions_hamrocsit(self, url):
        results = []
        data_html = requests.get(url)
        data_soup = soup(data_html.text, "html.parser")
        question_container = data_soup.find_all("div", class_="qnbank_content")
        for question in tqdm(
            question_container, desc="Scraping questions", unit="question"
        ):
            question = question.find_all("p")
            for q in question:
                results.append(q.text)

        return results

    def write_to_file_hamrocsit(self, questions, selected_subject):
        json_data = {"subject": selected_subject, "questions": []}

        for question in tqdm(questions, desc="Writing questions", unit="question"):
            json_data["questions"].append(question)

        json_str = json.dumps(json_data, indent=4)

        with open("questions.json", "w") as file:
            file.write(json_str)

    def scrape_options(self):
        site_options = {
            "Hamro csit": "https://www.hamrocsit.com/",
            "College Note": "https://www.collegenote.net/",
        }

        site = TerminalMenu(list(site_options.keys())).show()
        site = list(site_options.keys())[site]

        if site == "Hamro csit":
            subjects = {
                "Design and analysis of algorithms": "daa",
                "Simulation and Modeling": "sm",
                "Multimedia Computing": "multimedia",
                "Sytem Analysis and design": "sad",
                "Web Tech": "web-tech",
                "Cryptography": "cryptography",
            }

            print("Enter the subject which you want to scrape: ")
            terminal_menu = TerminalMenu(list(subjects.keys()))
            selected_subject = list(subjects.keys())[terminal_menu.show()]
            selected_subject = subjects[selected_subject]

            print("Enter the year: ")
            options = ["2079", "2078", "2076"]
            year = TerminalMenu(options).show()
            year = options[year]

            url = f"https://hamrocsit.com/semester/fifth/{selected_subject}/question-bank/{year}/"
            return url, site, selected_subject

        else:
            subjects = {
                "Design and analysis of algorithms": "pastpapers/unit-wise-questions/TU/CSIT/design-and-analysis-of-algorithms/4",
                "Cryptography": "pastpapers/unit-wise-questions/TU/CSIT/cryptography/6",
                "Simulation and Modeling": "pastpapers/unit-wise-questions/TU/CSIT/simulation-and-modelling/7",
                "Multimedia Computing": "pastpapers/unit-wise-questions/TU/CSIT/multimedia-computing/9",
                "Sytem Analysis and design": "pastpapers/unit-wise-questions/TU/CSIT/system-analysis-and-design/5",
                "Web Tech": "pastpapers/unit-wise-questions/TU/CSIT/web-technology/8",
            }

            # Display the menu and get user's choice
            terminal_menu = TerminalMenu(list(subjects.keys()))
            selected_subject = list(subjects.keys())[terminal_menu.show()]

            # Get the selected subject's URL
            selected_url = subjects[selected_subject]
            url = f"https://www.collegenote.net/{selected_url}"
            return url, site, selected_subject

    def scrape_questions(self):
        url, site, selected_subject = self.scrape_options()
        print(url)
        print("Scraping questions from", url)
        if site == "Hamro csit":
            questions = self.get_all_questions_hamrocsit(url)
            self.write_to_file_hamrocsit(questions, selected_subject)
            return selected_subject

        else:
            batches = self.get_all_questions_collegenote(url)
            self.write_json_file(batches, selected_subject)
            return selected_subject


scraper = WebScraper()
selected_subject = scraper.scrape_questions()
