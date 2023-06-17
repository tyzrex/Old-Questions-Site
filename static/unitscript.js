const filename = window.location.pathname.split("/").pop();

const createButton = (text, className, clickHandler) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.classList.add(...className.split(" "));
  button.addEventListener("click", clickHandler);
  return button;
};

const createListItem = (question, asked) => {
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

  // Copy button
  const copyButton = createButton(
    "Copy",
    "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50",
    () => {
      navigator.clipboard.writeText(questionText);
    }
  );

  // Save to confusions button
  const markButton = createButton(
    "Save to confusions",
    "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50",
    () => {
      const data = {
        question: questionText,
        asked: askedLine.textContent,
        subject: filename,
      };

      let localStorageData = localStorage.getItem("confusions");

      localStorageData = localStorageData ? JSON.parse(localStorageData) : [];
      localStorageData.push(data);

      localStorage.setItem("confusions", JSON.stringify(localStorageData));
    }
  );

  listItem.appendChild(copyButton);
  listItem.appendChild(markButton);

  return listItem;
};

const createChapterHeading = (chapter) => {
  const chapterHeading = document.createElement("h2");
  chapterHeading.classList.add("text-2xl", "font-bold", "py-6");
  chapterHeading.textContent = `Chapter: ${chapter}`;
  return chapterHeading;
};

const createSubjectName = (subject) => {
  const subjectName = document.createElement("h1");
  subjectName.classList.add("text-3xl", "font-bold", "py-2");
  subjectName.textContent = "Subject: " + subject;
  return subjectName;
};

const createQuestionsList = (questions, askedList) => {
  const questionsList = document.createElement("ul");
  questionsList.classList.add("p-4", "bg-gray-900", "rounded-md");

  const localStorageData = localStorage.getItem("completed");

  questions.forEach((question, index) => {
    const listItem = createListItem(question, askedList[index]);

    const completeButton = createButton(
      "Complete",
      "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50",
      () => {
        const data = {
          question: question,
          asked: askedList[index],
          subject: filename,
        };

        let localStorageData = localStorage.getItem("completed");
        let exists = false;

        if (localStorageData) {
          const parsedData = JSON.parse(localStorageData);
          parsedData.forEach((data) => {
            if (data.question === question) {
              parsedData.splice(parsedData.indexOf(data), 1);
              console.log(parsedData);
              localStorage.setItem("completed", JSON.stringify(parsedData));
              exists = true;
            }
          });
        }

        if (!exists) {
          localStorageData = localStorageData
            ? JSON.parse(localStorageData)
            : [];
          localStorageData.push(data);
          localStorage.setItem("completed", JSON.stringify(localStorageData));
        }
      }
    );

    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      parsedData.forEach((data) => {
        if (data.question === question && data.asked === askedList[index]) {
          listItem.classList.add("line-through", "bg-green-500");
          listItem.classList.remove("hover:bg-gray-800");
        }
      });
    }

    if (listItem) {
      listItem.classList.add(
        "border-b",
        "border-gray-700",
        "hover:bg-gray-800",
        "transition",
        "duration-200",
        "px-4",
        "rounded-md",
        "cursor-pointer",
        "my-2"
      );

      completeButton.addEventListener("click", () => {
        listItem.classList.toggle("line-through");
        listItem.classList.toggle("bg-green-500");
        listItem.classList.remove("hover:bg-gray-800");
      });
      listItem.appendChild(completeButton);
      questionsList.appendChild(listItem);
    }
  });

  return questionsList;
};

const renderQuestionsContainer = (data) => {
  const questionsContainer = document.getElementById("questions-container");

  const subjectName = createSubjectName(data.subject);
  questionsContainer.appendChild(subjectName);

  data.questions.forEach((chapterData) => {
    const chapterHeading = createChapterHeading(chapterData.Chapter.trim());
    questionsContainer.appendChild(chapterHeading);

    const numberOfQuestions = document.createElement("p");
    numberOfQuestions.classList.add("text-xl", "font-bold", "py-2");
    numberOfQuestions.textContent = `Number of questions: ${chapterData.Question.length}`;
    questionsContainer.appendChild(numberOfQuestions);

    const questionsList = createQuestionsList(
      chapterData.Question,
      chapterData.Asked
    );
    questionsContainer.appendChild(questionsList);
  });
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

const fetchQuestions = async () => {
  try {
    const response = await fetch(`/unitwisequestions/${filename}`);
    const data = await response.json();
    renderQuestionsContainer(data);
  } catch (error) {
    console.log("Error fetching questions:", error);
  }
};

fetchQuestions();
