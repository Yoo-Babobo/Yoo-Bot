$(() => {
  $("#minimize-btn").on("click", () => ipcRenderer.send("hide"));
  $("#close-btn").on("click", () => ipcRenderer.send("close"));
});