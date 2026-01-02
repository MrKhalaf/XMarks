// XMarks Options Page

const usernameInput = document.getElementById("username");
const saveButton = document.getElementById("save");
const savedMessage = document.getElementById("saved");

// Load saved settings
browser.storage.local.get("username").then((result) => {
  if (result.username) {
    usernameInput.value = result.username;
  }
});

// Save settings
saveButton.addEventListener("click", () => {
  let username = usernameInput.value.trim();

  // Remove @ if present
  if (username.startsWith("@")) {
    username = username.slice(1);
  }

  browser.storage.local.set({ username }).then(() => {
    savedMessage.classList.add("show");
    setTimeout(() => {
      savedMessage.classList.remove("show");
    }, 2000);
  });
});
