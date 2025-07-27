document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("commentarySelect");
  const textArea = document.getElementById("commentaryText");
  const error = document.getElementById("error");
  const exportBtn = document.getElementById("exportBtn");

  const jurisdictionField = document.getElementById("jurisdiction");
  const referenceField = document.getElementById("reference");
  const sourceField = document.getElementById("source");

  let currentText = "";
  let currentReference = "commentary";

  fetch("data/commentary/commentary.json")
    .then(response => {
      if (!response.ok) throw new Error("Failed to load JSON");
      return response.json();
    })
    .then(data => {
      data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.reference_url;
        option.textContent = item.title;
        option.dataset.jurisdiction = item.jurisdiction;
        option.dataset.reference = item.reference;
        option.dataset.source = item.source;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        const selectedOption = select.options[select.selectedIndex];
        const url = selectedOption.value;
        jurisdictionField.textContent = selectedOption.dataset.jurisdiction || "—";
        referenceField.textContent = selectedOption.dataset.reference || "—";
        sourceField.textContent = selectedOption.dataset.source || "—";
        currentReference = selectedOption.dataset.reference || "commentary";

        if (url === "Select a Commentary") return;

        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error("Failed to load commentary text");
            return response.text();
          })
          .then(text => {
            textArea.value = text;
            currentText = text;
            error.textContent = "";
          })
          .catch(() => {
            error.textContent = "Error loading commentary text.";
            textArea.value = "";
            currentText = "";
          });
      });
    })
    .catch(() => {
      error.textContent = "Error loading commentary list.";
    });

  exportBtn.addEventListener("click", () => {
    if (!currentText) return;
    const blob = new Blob([currentText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${currentReference}.txt`;
    a.click();
  });
});
