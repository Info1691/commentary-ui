document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("commentarySelect");
  const textArea = document.getElementById("commentaryText");
  const errorEl = document.getElementById("error");
  const jurisdictionEl = document.getElementById("jurisdiction");
  const referenceEl = document.getElementById("reference");
  const sourceEl = document.getElementById("source");
  const exportBtn = document.getElementById("exportBtn");
  const printBtn = document.getElementById("printBtn");

  let currentText = "";

  fetch("data/commentary.json")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((entry, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = entry.title;
        select.appendChild(option);
      });

      select.addEventListener("change", () => {
        const entry = data[select.value];
        if (!entry) return;

        jurisdictionEl.textContent = entry.jurisdiction;
        referenceEl.textContent = entry.reference;
        sourceEl.textContent = entry.source;

        fetch(entry.reference_url)
          .then((res) => res.text())
          .then((text) => {
            textArea.value = text;
            currentText = text;
            errorEl.textContent = "";
          })
          .catch((err) => {
            textArea.value = "";
            errorEl.textContent = "Error loading commentary text.";
          });
      });
    })
    .catch((err) => {
      errorEl.textContent = "Error loading commentary list.";
    });

  exportBtn.addEventListener("click", () => {
    if (!currentText) return;
    const blob = new Blob([currentText], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = "commentary.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
  });

  printBtn.addEventListener("click", () => {
    window.print();
  });
});
