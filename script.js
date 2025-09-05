// Your Firebase configuration
const firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "PLACEHOLDER_AUTH_DOMAIN",
  projectId: "PLACEHOLDER_PROJECT_ID",
  storageBucket: "PLACEHOLDER_STORAGE_BUCKET",
  messagingSenderId: "PLACEHOLDER_MESSAGING_SENDER_ID",
  appId: "PLACEHOLDER_APP_ID",
  measurementId: "PLACEHOLDER_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM elements
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addButton = document.getElementById("add-btn");

// Firestore collection reference
const tasksRef = db.collection("shared-tasks").doc("todo-list").collection("tasks");

// Add task
addButton.addEventListener("click", function () {
  const taskText = inputBox.value.trim();
  if (taskText === "") {
    alert("Add an adventure first!");
    return;
  }

  tasksRef.add({
    task: taskText,
    completed: false
  }).then(() => {
    inputBox.value = "";
  }).catch((error) => {
    console.error("Error adding task:", error);
  });
});

inputBox.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addButton.click();
  }
});

// Real-time listener
tasksRef.onSnapshot((snapshot) => {
  listContainer.innerHTML = "";
  
  snapshot.forEach((doc) => {
    const taskData = doc.data();
    const li = document.createElement("li");
    const taskTextSpan = document.createElement("span");
    taskTextSpan.classList.add("task-text");
    taskTextSpan.textContent = taskData.task;
    li.appendChild(taskTextSpan);

    li.setAttribute("data-id", doc.id);

    if (taskData.completed) {
      li.classList.add("checked");
    }

    const editSpan = document.createElement("span");
    editSpan.innerHTML = "✏️";
    editSpan.classList.add("edit-btn");
    li.appendChild(editSpan);

    const deleteSpan = document.createElement("span");
    deleteSpan.innerHTML = "❌";
    deleteSpan.classList.add("delete-btn");
    li.appendChild(deleteSpan);

    listContainer.appendChild(li);
  });
});


// Task interaction handler
listContainer.addEventListener("click", function (e) {
  const li = e.target.closest("li");
  if (!li) return;

  const taskId = li.getAttribute("data-id");
  const taskDoc = tasksRef.doc(taskId);

  if (e.target.classList.contains("edit-btn")) {
    const currentText = li.querySelector(".task-text").textContent;
    const newTaskText = prompt("Edit the task:", currentText);
    if (newTaskText && newTaskText.trim() !== "") {
      taskDoc.update({ task: newTaskText }).catch(console.error);
    }

  } else if (e.target.classList.contains("delete-btn")) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;
    taskDoc.delete().catch(console.error);

  } else if (e.target.tagName === "LI") {
    const isChecked = li.classList.contains("checked");
    taskDoc.update({ completed: !isChecked }).catch(console.error);
  }
});