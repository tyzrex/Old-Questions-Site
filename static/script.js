const filename = window.location.pathname.split("/").pop();
console.log(filename);

// Renders the subject name
const renderSubjectName = (subject) => {
  const subjectName = document.createElement("h1");
  subjectName.classList.add("text-3xl", "font-bold", "py-2");
  subjectName.textContent = "Subject: " + subject;
  return subjectName;
};

// Renders a year heading
const renderYearHeading = (year) => {
  const yearHeading = document.createElement("h2");
  yearHeading.classList.add("text-2xl", "font-bold", "py-6");
  yearHeading.textContent = `Year: ${year}`;
  return yearHeading;
};

// Renders a list item
const renderListItem = (paragraph) => {
  const listItem = document.createElement("li");
  listItem.classList.add("text-lg", "py-2", "text-gray-200", "font-medium");

  if (paragraph.includes("\t")) {
    console.log("tab found");
    listItem.classList.add("ml-10");
  }

  paragraph = paragraph.replace(/\s+/g, " ").trim();
  if (paragraph.length === 0) return null;

  listItem.textContent = paragraph;

  //copy button
  const copyButton = document.createElement("button");
  copyButton.classList.add(
    "bg-gray-800",
    "text-gray-200",
    "rounded-md",
    "px-2",
    "py-1",
    "ml-2",
    "hover:bg-gray-700",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-gray-400",
    "focus:ring-opacity-50"
  );

  copyButton.textContent = "Copy";
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(paragraph);
  });

  listItem.appendChild(copyButton);

  return listItem;
};

// Renders a list of paragraphs
const renderParagraphsList = (paragraphs) => {
  const paragraphsList = document.createElement("ul");
  paragraphsList.classList.add("p-4", "bg-zinc-900", "rounded-md");

  paragraphs.forEach((paragraph) => {
    // until a new number starts, add the paragraph to the previous list item

    const listItem = renderListItem(paragraph);
    if (listItem) {
      paragraphsList.appendChild(listItem);
    }
  });

  return paragraphsList;
};

// Renders the questions container with all the data
const renderQuestionsContainer = (data) => {
  const questionsContainer = document.getElementById("questions-container");

  const subjectName = renderSubjectName(data.subject);
  questionsContainer.appendChild(subjectName);

  data.questions.forEach((yearData) => {
    const yearHeading = renderYearHeading(yearData.year);
    questionsContainer.appendChild(yearHeading);

    const paragraphsList = renderParagraphsList(yearData.paragraphs);
    questionsContainer.appendChild(paragraphsList);
  });
};

const fetchQuestions = async () => {
  try {
    const response = await fetch("/questions/" + filename);
    const data = await response.json();
    renderQuestionsContainer(data);
  } catch (error) {
    console.log("Error fetching questions:", error);
  }
};

// Event listener for the filter input
const handleFilterInput = (e) => {
  const filterValue = e.target.value.toLowerCase();
  const questions = document.querySelectorAll("li");

  questions.forEach((question) => {
    const questionText = question.textContent.toLowerCase();
    question.classList.toggle("hidden", !questionText.includes(filterValue));
  });
};

const filter = document.getElementById("filter");
filter.addEventListener("input", handleFilterInput);

fetchQuestions();
