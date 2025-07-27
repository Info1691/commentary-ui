document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.querySelector('select');
  const jurisdiction = document.getElementById('jurisdiction');
  const reference = document.getElementById('reference');
  const source = document.getElementById('source');
  const commentaryBox = document.querySelector('textarea');
  const exportButton = document.getElementById('exportButton');
  const errorBox = document.getElementById('errorBox');

  fetch('commentary.txt') // Now reads from renamed .txt to bypass CORS
    .then(response => response.text())
    .then(text => {
      try {
        const data = JSON.parse(text);
        data.forEach((item, index) => {
          const option = document.createElement('option');
          option.value = index;
          option.textContent = item.title;
          dropdown.appendChild(option);
        });

        dropdown.addEventListener('change', () => {
          const selected = data[dropdown.value];
          if (selected) {
            jurisdiction.textContent = selected.jurisdiction || '—';
            reference.textContent = selected.reference || '—';
            source.textContent = selected.source || '—';

            fetch(selected.reference_url)
              .then(res => res.text())
              .then(content => {
                commentaryBox.value = content;
              })
              .catch(() => {
                commentaryBox.value = 'Error loading commentary text.';
              });
          }
        });

        errorBox.style.display = 'none';
      } catch (e) {
        errorBox.textContent = 'Error parsing commentary file.';
      }
    })
    .catch(error => {
      console.error('Error loading JSON:', error);
      errorBox.textContent = 'Error loading commentary list.';
    });

  exportButton.addEventListener('click', () => {
    const blob = new Blob([commentaryBox.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'commentary.txt';
    a.click();
  });
});
