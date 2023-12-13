import subprocess
from bs4 import BeautifulSoup as soup
import requests
from simple_term_menu import TerminalMenu
from tqdm import tqdm
import json


class WebScraper:
    def get_all_questions_collegenote(self, url):
        results = []
        batches = []

        try:
            data_html = requests.get(url)
            data_html.raise_for_status()
        except requests.exceptions.RequestException as e:
            print("Error occurred while fetching the data:", e)
            return None

        data_soup = soup(data_html.text, "html.parser")
        question_container = data_soup.find_all('a', class_='card-link')

        for question in question_container:
            question = question.get('href')
            results.append(question)

        view_links = [link for link in results if link.endswith('/view/')]

        for link in tqdm(view_links, desc="Scraping questions", unit="link"):
            url = f"https://www.collegenote.net{link}"
            year = url.split('/')[-4]
            batch = {'year': year, 'questions': []}

            data_html = requests.get(url)
            data_soup = soup(data_html.text, "html.parser")
            question_container = data_soup.find_all('div', class_='col-7')

            for question in question_container:
                questions = question.find_all('p')
                batch['questions'].extend([q.text for q in questions])

            batches.append(batch)

        return batches

    def get_all_questions_hamrocsit(self, url):
        results = []
        data_html = requests.get(url)
        data_soup = soup(data_html.text, "html.parser")
        question_container = data_soup.find_all('div', class_='qnbank_content')
        for question in tqdm(question_container, desc="Scraping questions", unit="question"):
            question = question.find_all('p')
            for q in question:
                results.append(q.text)

        return results

    def write_to_file_hamrocsit(self, questions, selected_subject):
        with open(f"{selected_subject}.md", "w") as question_file:
            question_file.write("# Questions\n\n")
            for question in questions:
                question_file.write(question + "\n\n")

    def write_to_file_collegenote(self, batches, selected_subject):
        json_data = {
            "subject": selected_subject,
            "questions": []
        }

        for batch in tqdm(batches, desc="Writing questions", unit="batch"):
            year = batch['year']
            questions = batch['questions']
            year_data = {
                "year": year,
                "paragraphs": []
            }
            subQuestions = ['a', 'b', 'c', 'd', 'e']
            for question in questions:
                if question.startswith(tuple(subQuestions)):
                    year_data["paragraphs"].append("\t" + question)
                else:
                    year_data["paragraphs"].append(question)

            json_data["questions"].append(year_data)

        json_str = json.dumps(json_data, indent=4)

        with open('questions.json', 'w') as file:
            file.write(json_str)

    def scrape_options(self):
        site_options = {
            "Hamro csit": "https://www.hamrocsit.com/",
            "College Note": "https://www.collegenote.net/"
        }

        site = TerminalMenu(list(site_options.keys())).show()
        site = list(site_options.keys())[site]

        if (site == "Hamro csit"):
            subjects = {
                "Theory of Computation": "toc",
                "Computer Networks": "cn",
                "Operating Systems": "os",
                "Database Management System": "dbms",
                "Artificial Intelligence": "ai"
            }

            print("Enter the subject which you want to scrape: ")
            terminal_menu = TerminalMenu(list(subjects.keys()))
            selected_subject = list(subjects.keys())[terminal_menu.show()]
            selected_subject = subjects[selected_subject]

            print("Enter the year: ")
            options = ["2079", "2078", "2076"]
            year = TerminalMenu(options).show()
            year = options[year]

            url = f"https://hamrocsit.com/semester/fourth/{selected_subject}/question-bank/{year}/"
            return url, site, selected_subject

        else:
            subjects = {
                "Theory of Computation": "pastpapers/TU/CSIT/34/theory-of-computation",
                "Computer Networks": "pastpapers/TU/CSIT/31/computer-networks",
                "Operating Systems": "pastpapers/TU/CSIT/33/operating-systems",
                "Database Management System": "pastpapers/TU/CSIT/32/database-management-system",
                "Artificial Intelligence": "pastpapers/TU/CSIT/30/artificial-intelligence"
            }

            # Display the menu and get user's choice
            terminal_menu = TerminalMenu(list(subjects.keys()))
            selected_subject = list(subjects.keys())[terminal_menu.show()]

            # Get the selected subject's URL
            selected_url = subjects[selected_subject]
            url = f"https://www.collegenote.net/{selected_url}/"
            return url, site, selected_subject

    def scrape_questions(self):
        url, site, selected_subject = self.scrape_options()
        print(url)
        print("Scraping questions from", url)
        if (site == "Hamro csit"):
            questions = self.get_all_questions_hamrocsit(url)
            self.write_to_file_hamrocsit(questions, selected_subject)
            return selected_subject

        else:
            batches = self.get_all_questions_collegenote(url)
            self.write_to_file_collegenote(batches, selected_subject)
            return selected_subject


# scraper = WebScraper()
# selected_subject = scraper.scrape_questions()
