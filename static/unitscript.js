const filename = window.location.pathname.split("/").pop();
console.log(filename);

// Renders the subject name
const renderSubjectName = (subject) => {
  const subjectName = document.createElement("h1");
  subjectName.classList.add("text-3xl", "font-bold", "py-2");
  subjectName.textContent = "Subject: " + subject;
  return subjectName;
};

// Renders a chapter heading
const renderChapterHeading = (chapter) => {
  const chapterHeading = document.createElement("h2");
  chapterHeading.classList.add("text-2xl", "font-bold", "py-6");
  chapterHeading.textContent = `Chapter: ${chapter}`;
  return chapterHeading;
};

// Renders a list item
const renderListItem = (question, asked) => {
  const listItem = document.createElement("li");
  listItem.classList.add("text-lg", "py-3", "text-gray-200", "font-medium");

  if (question.includes("\t")) {
    listItem.classList.add("ml-10");
  }

  question = question.replace(/\s+/g, " ").trim();
  if (question.length === 0) return null;

  const askedLine = document.createElement("strong");
  askedLine.textContent = asked.trim();
  askedLine.classList.add(
    "text-green-400",
    "bg-gray-700",
    "px-2",
    "py-1",
    "rounded-md"
  );
  listItem.appendChild(askedLine);

  const questionLine = document.createElement("br");
  listItem.appendChild(questionLine);

  const questionText = question.trim();
  listItem.appendChild(document.createTextNode(questionText));

  return listItem;
};

// Renders a list of questions
const renderQuestionsList = (questions, askedList) => {
  const questionsList = document.createElement("ul");
  questionsList.classList.add("p-4", "bg-gray-900", "rounded-md");

  questions.forEach((question, index) => {
    const listItem = renderListItem(question, askedList[index]);
    questionsList.appendChild(listItem);
  });

  return questionsList;
};

// Renders the questions container with all the data
const renderQuestionsContainer = (data) => {
  const questionsContainer = document.getElementById("questions-container");

  const subjectName = renderSubjectName(data.subject);
  questionsContainer.appendChild(subjectName);

  data.questions.forEach((chapterData, index) => {
    const chapterHeading = renderChapterHeading(chapterData.Chapter.trim());
    questionsContainer.appendChild(chapterHeading);

    const questionsList = renderQuestionsList(
      chapterData.Question,
      chapterData.Asked
    );
    questionsContainer.appendChild(questionsList);
  });
};

const fetchQuestions = async () => {
  try {
    const response = await fetch("/unitwisequestions/" + filename);
    const data = await response.json();
    renderQuestionsContainer(data);
  } catch (error) {
    console.log("Error fetching questions:", error);
  }
};

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
