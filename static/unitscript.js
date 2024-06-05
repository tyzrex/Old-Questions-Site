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
    "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50",
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
    "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50",
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
  chapterHeading.className =
    "text-2xl font-bold py-6 text-white cursor-pointer rounded-md transition duration-200";
  chapterHeading.textContent = `Chapter: ${chapter} `;
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
  questionsList.className = "p-4 bg-zinc-900 rounded-md";

  const completedKey = "completed";
  const confusionsKey = "confusions";

  questions.forEach((question, index) => {
    const listItem = createListItem(question, askedList[index]);

    const completeButton = createButton(
      "Complete",
      "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50",
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
        "border-gray-600",
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
        "bg-gray-700 text-gray-200 rounded-md px-2 py-1 ml-2 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50";
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
  let totalQuestions = 0;

  data.questions.forEach((chapterData) => {
    const chapterHeading = createChapterHeading(chapterData.Chapter.trim());
    questionsContainer.appendChild(chapterHeading);

    //make such that it folds the chapter and its questions when clicked

    chapterHeading.addEventListener("click", () => {
      const questionsList =
        chapterHeading.nextElementSibling.nextElementSibling;
      questionsList.classList.toggle("hidden");
      chapterHeading.classList.toggle("bg-orange-600");
      if (questionsList.classList.contains("hidden")) {
        chapterHeading.textContent += " (Click to expand)";
      } else {
        chapterHeading.textContent = chapterHeading.textContent.replace(
          " (Click to expand)",
          ""
        );
      }
    });

    const numberOfQuestions = document.createElement("p");
    numberOfQuestions.className = "text-xl font-bold py-2";
    numberOfQuestions.textContent = `Number of questions: ${chapterData.Question.length}`;
    totalQuestions += chapterData.Question.length;
    updateStatCounter(totalQuestions);
    questionsContainer.appendChild(numberOfQuestions);

    const questionsList = createQuestionsList(
      chapterData.Question,
      chapterData.Asked
    );
    questionsContainer.appendChild(questionsList);
  });

  const chapters = document.querySelectorAll("h2");

  const chapterList = document.createElement("ul");
  chapterList.className = "flex flex-col p-5 bg-zinc-900 rounded-md mb-10";
  const chapterListHeading = document.createElement("h2");
  chapterListHeading.className = "text-2xl font-bold py-2";
  chapterListHeading.textContent = `Chapters: ${chapters.length} (Click to scroll to the chapter)`;
  chapterList.appendChild(chapterListHeading);
  chapters.forEach((chapter) => {
    // just put the element in the list and when the user clicks on it, scroll to that element
    const chapterListItem = document.createElement("li");
    chapterListItem.className =
      "cursor-pointer hover:bg-gray-800 hover:rounded-lg font-medium border-b border-gray-600 px-2 py-2";
    chapterListItem.textContent = chapter.textContent.split("Chapter: ")[1];
    chapterListItem.addEventListener("click", () => {
      chapter.scrollIntoView({ behavior: "smooth" });
    });
    chapterList.appendChild(chapterListItem);
  });

  questionsContainer.prepend(chapterList);
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
  updateStatCounter();
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

const clearAllMarkings = () => {
  localStorage.clear();
  window.location.reload();
};

const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getConfusionQuestions = () => {
  const questions = Array.from(document.querySelectorAll("li"));
  const confusionQuestions = questions.filter((question) =>
    question.classList.contains("bg-red-700")
  );

  if (confusionQuestions?.length > 0) {
    const randomQuestion = getRandomElement(confusionQuestions);
    const copyOfRandomQuestion = randomQuestion.cloneNode(true);

    if (confusionsContainer) {
      confusionsContainer.innerHTML = "";
      confusionsContainer.appendChild(copyOfRandomQuestion);
    }

    copyOfRandomQuestion.classList.add("text-white", "w-full");
  } else {
    alert("No Confusion Questions Found!");
  }
};

const getRandomQuestion = () => {
  const questions = Array.from(document.querySelectorAll("li"));
  const randomQuestion = getRandomElement(questions);
  const copyOfRandomQuestion = randomQuestion.cloneNode(true);
  const chapterName =
    randomQuestion.parentNode.previousSibling.previousSibling.textContent;

  if (randomQuestionContainer) {
    randomQuestionContainer.innerHTML = "";
    const chapterHeading = document.createElement("h2");
    chapterHeading.textContent = chapterName;
    chapterHeading.className = "text-xl font-bold text-left w-full";
    randomQuestionContainer.appendChild(chapterHeading);
    randomQuestionContainer.appendChild(copyOfRandomQuestion);
  }

  copyOfRandomQuestion.classList.add("bg-purple-500", "text-white", "w-full");
};

const questionsContainer = document.getElementById("questions-container");

const heading = document.createElement("h1");
heading.textContent = "Get a Random Question to Solve";
heading.className = "text-2xl font-bold text-left w-full";
questionsContainer.appendChild(heading);

const clearButton = createButton(
  "Clear All Markings",
  "bg-red-700 text-gray-200 rounded-md mr-5 px-2 py-2 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
);
clearButton.addEventListener("click", clearAllMarkings);
questionsContainer.appendChild(clearButton);

const confusionsButton = createButton(
  "Get Confusions",
  "bg-gray-800 text-gray-200 rounded-md px-2 py-2 mr-4 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
);
confusionsButton.style.marginTop = "1rem";
questionsContainer.appendChild(confusionsButton);

const randomQuestionButton = createButton(
  "Get Random Question",
  "bg-gray-800 text-gray-200 rounded-md px-2 py-2 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
);

randomQuestionButton.style.marginTop = "1rem";
randomQuestionButton.style.marginBottom = "1rem";
questionsContainer.appendChild(randomQuestionButton);

const randomQuestionContainer = document.createElement("div");
randomQuestionContainer.className = "flex justify-center flex-col gap-2";
questionsContainer.appendChild(randomQuestionContainer);

const confusionsContainer = document.createElement("div");
confusionsContainer.className = "flex flex-col gap-2";
questionsContainer.appendChild(confusionsContainer);

questionsContainer.addEventListener("click", (event) => {
  if (event.target === randomQuestionButton) {
    getRandomQuestion();
  } else if (event.target === confusionsButton) {
    getConfusionQuestions();
  }
});

// Function to get the count of completed questions
const getCompletedQuestionsCount = () => {
  const completedQuestions = getItemFromLocalStorage("completed");
  return completedQuestions.length;
};

// Function to get the count of confused questions
const getConfusedQuestionsCount = () => {
  const confusedQuestions = getItemFromLocalStorage("confusions");
  return confusedQuestions.length;
};

// Function to update the stat counter
const updateStatCounter = (totalQuestions) => {
  const completedCount = document.getElementById("completed-count");
  const confusionCount = document.getElementById("confusion-count");
  // Get the count of completed and confused questions
  const completedCountValue = getCompletedQuestionsCount();
  const confusionCountValue = getConfusedQuestionsCount();

  completedCount.textContent = completedCountValue;
  confusionCount.textContent = confusionCountValue;
};

// Update the stat counter initially
updateStatCounter();

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
console.log(filename);

fetchQuestions();

const scrollButton = document.querySelector("#scroll-button");

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    scrollButton.classList.remove("hidden");
  } else {
    scrollButton.classList.add("hidden");
  }
});

scrollButton.onclick = () => {
  const scrollDuration =
    Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ) / 2;
  const scrollStep = -window.scrollY / (scrollDuration / 500);
  const scrollInterval = setInterval(() => {
    if (window.scrollY !== 0) {
      window.scrollBy(0, scrollStep);
    } else {
      clearInterval(scrollInterval);
    }
  }, 5);
};

const search = document.querySelector("#search-container");
console.log(search);

window.addEventListener("scroll", () => {
  if (window.scrollY > 5) {
    search.classList.add(
      "bg-black",
      "shadow-md",
      "border-b",
      "border-gray-600"
    );
  } else {
    search.classList.remove(
      "bg-black",
      "shadow-md",
      "border-b",
      "border-gray-600"
    );
  }
});
