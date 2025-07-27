document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("commentarySelect");
  const jurisdictionDisplay = document.getElementById("jurisdiction");
  const referenceDisplay = document.getElementById("reference");
  const sourceDisplay = document.getElementById("source");
  const textDisplay = document.getElementById("commentaryText");
  const errorDisplay = document.getElementById("error");

  const flagMap = {
    jersey: "🇯🇪",
    uk: "🇬🇧",
    iom: "🇮🇲"
  };

  fetch("data/commentary.json")
    .then(res => {
      if (!res.ok) throw new Error("Unable to load commentary list.");
      return res.json();
    })
    .then(data => {
      data.forEach(entry => {
        const option = document.createElement("option");
        option.value = entry.reference_url;
        option.textContent = entry.title;
        option.dataset.jurisdiction = entry.jurisdiction;
        option.dataset.reference = entry.reference;
        option.dataset.source = entry.source;
        select.appendChild(option);
      });

      errorDisplay.textContent = ""; // clear any error
    })
    .catch(err => {
      errorDisplay.textContent = "Error loading commentary list.";
      console.error("Error loading JSON:", err);
    });

  select.addEventListener("change", function () {
    const selected = this.selectedOptions[0];
    const url = selected.value;
    const jurisdiction = selected.dataset.jurisdiction;
    const reference = selected.dataset.reference;
    const source = selected.dataset.source;

    jurisdictionDisplay.textContent = `${flagMap[jurisdiction] || ""} ${jurisdiction}`;
    referenceDisplay.textContent = reference;
    sourceDisplay.textContent = source;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Commentary text could not be loaded.");
        return res.text();
      })
      .then(text => {
        textDisplay.value = text;
        errorDisplay.textContent = "";
      })
      .catch(err => {
        textDisplay.value = "";
        errorDisplay.textContent = "Error loading commentary text.";
        console.error(err);
      });
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([textDisplay.value], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "commentary-export.txt";
    link.click();
  });
});
