const localStorageData = localStorage.getItem("confusions");

const confusions = JSON.parse(localStorageData) || [];

const confusionsList = document.getElementById("questions-container");

const renderConfusionsList = (confusions) => {
  const confusionsList = document.getElementById("questions-container");

  const renderListItem = (confusion) => {
    const listItem = document.createElement("ul");
    listItem.classList.add(
      "border-b",
      "border-gray-700",
      "hover:bg-gray-800",
      "transition",
      "duration-200",
      "px-4",
      "py-2",
      "rounded-md",
      "cursor-pointer",
      "my-2"
    );

    const subjectName = document.createElement("h2");
    subjectName.classList.add("text-gray-200", "text-xl", "font-bold");
    subjectName.textContent = confusion.subject;
    listItem.appendChild(subjectName);

    const paragraph = document.createElement("p");
    paragraph.classList.add("text-gray-200", "my-2");
    paragraph.textContent = confusion.question;

    listItem.appendChild(paragraph);

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

    const deleteButton = document.createElement("button");
    deleteButton.classList.add(
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

    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const index = confusions.indexOf(confusion);
      confusions.splice(index, 1);
      localStorage.setItem("confusions", JSON.stringify(confusions));
      location.reload();
    });

    listItem.appendChild(deleteButton);

    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(confusion.question);
    });

    listItem.appendChild(copyButton);

    return listItem;
  };

  confusions.forEach((confusion) => {
    const listItem = renderListItem(confusion);

    if (listItem) {
      confusionsList.appendChild(listItem);
    }
  });
};

renderConfusionsList(confusions);
