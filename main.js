document.addEventListener("DOMContentLoaded", () => {
  fetch("data/commentary.json")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("commentarySelect");

      data.forEach(entry => {
        const option = document.createElement("option");
        option.value = entry.reference_url;
        option.textContent = entry.title;
        option.dataset.jurisdiction = entry.jurisdiction;
        option.dataset.reference = entry.reference;
        option.dataset.source = entry.source;
        select.appendChild(option);
      });

      select.addEventListener("change", function () {
        const url = this.value;
        const jurisdiction = this.selectedOptions[0].dataset.jurisdiction;
        const reference = this.selectedOptions[0].dataset.reference;
        const source = this.selectedOptions[0].dataset.source;

        const flagMap = {
          jersey: "🇯🇪",
          uk: "🇬🇧",
          iom: "🇮🇲"
        };

        document.getElementById("jurisdiction").textContent =
          `${flagMap[jurisdiction] || ""} ${jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1)}`;
        document.getElementById("reference").textContent = reference;
        document.getElementById("source").textContent = source;

        fetch(url)
          .then(res => res.text())
          .then(text => {
            document.getElementById("commentaryText").textContent = text;
          });
      });
    })
    .catch(err => {
      document.getElementById("error").textContent = "Error loading commentary list.";
      console.error("Error loading JSON:", err);
    });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const text = document.getElementById("commentaryText").textContent;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "commentary-export.txt";
    link.click();
  });
});
