import subprocess
from bs4 import BeautifulSoup as soup
import requests
from simple_term_menu import TerminalMenu
from tqdm import tqdm
import json
import os


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
        card = data_soup.find_all("div", class_="card uwq-card")

        for chapters in card:
            chapter_name = chapters.find("div", class_="uwq-unit-display")
            questions = chapters.find_all("div", class_="question-text")
            asked = chapters.find_all("div", class_="uwq-question-stat")

            cleaned_asked = []
            for a in asked:
                # Remove unwanted characters and formatting
                cleaned_a = a.text.strip().replace('\n', '').replace("|", '').replace("Toggle Answer", "")
                # Extract only the numerical values for marks and the year
                marks_index = cleaned_a.find('marks')
                marks = cleaned_a[:marks_index]
                year_index = cleaned_a.find('Asked in') + len('Asked in')
                year = cleaned_a[year_index:]
                cleaned_asked.append((marks, year))


            results.append(
                {
                    "Chapter": chapter_name.text.strip(),
                    "Question": [q.text.strip() for q in questions],
                    "Asked": [a.text.strip().replace('\n', '').replace("|", '').replace("Toggle Answer", "").replace(" ", '').replace("marks", " marks ").replace("Askedin", "Asked in ") for a in asked]
                }
            )

        return results

    def write_json_file(self, data, selected_subject, directory):
        os.makedirs(directory, exist_ok=True)
        json_data = {"subject": selected_subject, "questions": []}
        for data in tqdm(data, desc="Writing questions", unit="question"):
            json_data["questions"].append(data)

        json_str = json.dumps(json_data, indent=4)

        # with open(f"{selected_subject}.json", "w") as file:
        #     file.write(json_str)
        # Write the JSON file to the directory
        with open(os.path.join(directory, f"{selected_subject}.json"), "w") as file:
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
            # all_subjects = "https://www.collegenote.net/csit-1/courses"
            # data_html = requests.get(all_subjects)
            # data_soup = soup(data_html.text, "html.parser")
            # all_subs = data_soup.find_all("li", class_="m-1")
            # subject_url = {}
            # for subject in all_subs:
            #     subject_url[subject.a.text.strip().split("\n")[0]]= subject.a["href"].split("/").pop().strip()

            # json_str = json.dumps(subject_url, indent=4)
            # with open("subjects.json", "w") as file:
            #     file.write(json_str)

            # Read the subjects from the JSON file
            with open("subjects.json", "r") as file:
                subject_url = json.load(file)


            # for selected_subject in subject_url.keys():
            #     print(selected_subject)
            #     subject_url_str = subject_url[selected_subject]  # Use a different variable here
            #     print("Scraping questions for", selected_subject)
            #     url = f"https://www.collegenote.net/old-question/{subject_url_str}/unit-wise-questions"
            #     print(url)
            #     batches = self.get_all_questions_collegenote(url)
            #     folder_path = "questions_json/"  # Replace with the desired folder path
            #     self.write_json_file(batches, selected_subject, folder_path)

            # Display the menu and get user's choice
            terminal_menu = TerminalMenu(list(subject_url.keys()))
            selected_subject = list(subject_url.keys())[terminal_menu.show()]


            subject_url = subject_url[selected_subject] 
            print(subject_url)
            # Get the selected subject's URL
            url = f"https://www.collegenote.net/old-question/{subject_url}/unit-wise-questions"
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
            self.write_json_file(batches, selected_subject, 'questions_json/')
            return selected_subject


scraper = WebScraper()
selected_subject = scraper.scrape_questions()
