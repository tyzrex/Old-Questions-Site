const createButton = (text, className, clickHandler) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = className;
  button.addEventListener("click", clickHandler);
  return button;
};

const createListItem = (question, asked) => {
  const listItem = document.createElement("li");
  listItem.className = "text-lg py-3 text-gray-200 font-medium";

  if (question.includes("\t")) {
    listItem.classList.add("ml-10");
  }

  question = question.replace(/\s+/g, " ").trim();
  if (question.length === 0) return null;

  const askedLine = document.createElement("strong");
  askedLine.textContent = asked.trim();
  askedLine.className = "text-green-400 bg-gray-700 px-2 py-1 rounded-md";
  listItem.appendChild(askedLine);

  const indicator = document.createElement("span");
  indicator.className =
    "bg-purple-700 text-white rounded-md px-2 py-1 hidden ml-2 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50";
  indicator.textContent = "Confusion 😕";
  listItem.appendChild(indicator);

  listItem.appendChild(document.createElement("br"));

  const questionText = question.trim();
  listItem.appendChild(document.createTextNode(questionText));

  const lineBreak = document.createElement("br");
  listItem.appendChild(lineBreak);

  const copyButton = createButton(
    "Copy",
    "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50",
    () => {
      navigator.clipboard.writeText(questionText);
    }
  );

  const localStorageData = getItemFromLocalStorage("confusions");
  if (localStorageData) {
    localStorageData.forEach((data) => {
      if (data.question === question) {
        listItem.classList.add("bg-red-700");
        indicator.classList.remove("hidden");
      }
    });
  }

  const markButton = createButton(
    "Save to confusions",
    "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50",
    () => {
      const data = {
        question: questionText,
        asked: askedLine.textContent,
        subject: filename,
      };

      indicator.classList.remove("hidden");

      if (checkIfQuestionExistsInLocalStorage("confusions", question)) {
        removeFromLocalStorage("confusions", data);
        indicator.classList.add("hidden");
        listItem.classList.remove("bg-red-700");
      } else {
        markAsConfusion("confusions", listItem, data);
      }
    }
  );

  listItem.appendChild(copyButton);
  listItem.appendChild(markButton);

  return listItem;
};

const createChapterHeading = (chapter) => {
  const chapterHeading = document.createElement("h2");
  chapterHeading.className = "text-2xl font-bold py-6";
  chapterHeading.textContent = `Chapter: ${chapter}`;
  return chapterHeading;
};

const createSubjectName = (subject) => {
  const subjectName = document.createElement("h1");
  subjectName.className = "text-3xl font-bold py-2";
  subjectName.textContent = "Subject: " + subject;
  return subjectName;
};

const createQuestionsList = (questions, askedList) => {
  const questionsList = document.createElement("ul");
  questionsList.className = "p-4 bg-gray-900 rounded-md";

  const completedKey = "completed";
  const confusionsKey = "confusions";

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

        if (checkIfQuestionExistsInLocalStorage("completed", question)) {
          removeFromLocalStorage("completed", data);
          listItem.classList.remove("line-through", "bg-green-700");
        } else {
          markAsCompleted("completed", listItem, data);
        }
      }
    );

    if (
      getItemFromLocalStorage("completed").some(
        (data) => data.question === question
      )
    ) {
      listItem.classList.add("line-through", "bg-green-700");
    }

    if (listItem) {
      listItem.classList.add(
        "border-b",
        "border-gray-700",
        "transition",
        "duration-200",
        "px-4",
        "rounded-md",
        "cursor-pointer",
        "my-2"
      );

      const ongoingbutton = document.createElement("button");
      ongoingbutton.textContent = "Ongoing";
      ongoingbutton.className =
        "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50";
      ongoingbutton.addEventListener("click", () => {
        listItem.classList.toggle("bg-yellow-500");
        listItem.classList.remove("bg-green-700");
      });

      listItem.appendChild(ongoingbutton);
      listItem.appendChild(completeButton);
      questionsList.appendChild(listItem);
    }
  });

  return questionsList;
};

const renderQuestionsContainer = (data) => {
  const questionsContainer = document.getElementById("questions-container");

  data.questions.forEach((chapterData) => {
    const chapterHeading = createChapterHeading(chapterData.Chapter.trim());
    questionsContainer.appendChild(chapterHeading);

    const numberOfQuestions = document.createElement("p");
    numberOfQuestions.className = "text-xl font-bold py-2";
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

const getItemFromLocalStorage = (key) => {
  const localStorageData = localStorage.getItem(key);
  return localStorageData ? JSON.parse(localStorageData) : [];
};

const setItemInLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const removeFromLocalStorage = (key, dataToRemove) => {
  const localStorageData = getItemFromLocalStorage(key);
  const updatedData = localStorageData.filter(
    (data) => data.question !== dataToRemove.question
  );
  setItemInLocalStorage(key, updatedData);
};

const checkIfQuestionExistsInLocalStorage = (key, question) => {
  const localStorageData = getItemFromLocalStorage(key);
  return localStorageData.some((data) => data.question === question);
};

const markAsCompleted = (key, listItem, data) => {
  const localStorageData = getItemFromLocalStorage(key);
  const exists = checkIfQuestionExistsInLocalStorage(key, data.question);

  if (exists) {
    removeFromLocalStorage(key, data);
  } else {
    localStorageData.push(data);
    setItemInLocalStorage(key, localStorageData);
  }

  listItem.classList.toggle("line-through");
  listItem.classList.toggle("bg-green-700");
  listItem.classList.remove("bg-yellow-500");
};

const markAsConfusion = (key, listItem, data) => {
  const localStorageData = getItemFromLocalStorage(key);
  const exists = checkIfQuestionExistsInLocalStorage(key, data.question);

  if (exists) {
    removeFromLocalStorage(key, data);
    listItem.classList.remove("bg-red-700");
  } else {
    localStorageData.push(data);

    setItemInLocalStorage(key, localStorageData);
    listItem.classList.add("bg-red-700");
  }
};

//random question suggestion for practice

const randomQuestion = () => {
  const questions = document.querySelectorAll("li");

  const randomQuestion =
    questions[Math.floor(Math.random() * questions.length)];

  const copyofRandomQuestion = randomQuestion.cloneNode(true);
  if (randomQuestionContainer) {
    randomQuestionContainer.innerHTML = "";
    randomQuestionContainer.appendChild(copyofRandomQuestion);
  }
  copyofRandomQuestion.classList.add("bg-purple-500", "text-white", "w-full");
  copyofRandomQuestion.classList.remove(
    "transition-all",
    "duration-200",
    "ease-in-out"
  );
};

const randomQuestionButton = document.createElement("button");
const heading = document.createElement("h1");
heading.textContent = "Get a Random Question to Solve";

randomQuestionButton.textContent = "Get Random Question";
randomQuestionButton.className = `bg-gray-800 text-gray-200 rounded-md px-2 py-2 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50`;
randomQuestionButton.style.marginTop = "1rem";
randomQuestionButton.style.marginBottom = "1rem";
const randomQuestionContainer = document.createElement("div");
randomQuestionContainer.className = "flex justify-center";

const questionsContainer = document.getElementById("questions-container");
questionsContainer.appendChild(randomQuestionContainer);
heading.className = "text-2xl font-bold text-left w-full";
questionsContainer.appendChild(heading);
const clear = createButton(
  "Clear All Markings",
  "bg-red-700 text-gray-200 rounded-md mr-5 px-2 py-2 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
);
clear.addEventListener("click", () => {
  localStorage.clear();
  window.location.reload();
});
questionsContainer.appendChild(clear);

questionsContainer.appendChild(randomQuestionButton);

randomQuestionButton.addEventListener("click", randomQuestion);

const fetchQuestions = async () => {
  try {
    const response = await fetch(`/unitwisequestions/${filename}`);
    const data = await response.json();
    renderQuestionsContainer(data);
  } catch (error) {
    console.log("Error fetching questions:", error);
  }
};

const filename = window.location.pathname.split("/").pop();

fetchQuestions();
