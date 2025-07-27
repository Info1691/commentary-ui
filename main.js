document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('commentarySelect');
  const jurisdiction = document.getElementById('jurisdiction');
  const reference = document.getElementById('reference');
  const source = document.getElementById('source');
  const textarea = document.getElementById('commentaryText');
  const error = document.getElementById('error');
  const exportBtn = document.getElementById('exportBtn');

  fetch('commentary.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response error');
      return response.json();
    })
    .then(data => {
      data.forEach((entry, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = entry.title;
        select.appendChild(option);
      });

      select.addEventListener('change', () => {
        const selected = data[select.value];
        if (!selected) return;

        jurisdiction.textContent = selected.jurisdiction;
        reference.textContent = selected.reference;
        source.textContent = selected.source;

        fetch(selected.reference_url)
          .then(res => res.text())
          .then(text => {
            textarea.value = text;
            error.textContent = '';
          })
          .catch(err => {
            textarea.value = '';
            error.textContent = 'Failed to load commentary text.';
            console.error(err);
          });

        exportBtn.onclick = () => {
          const blob = new Blob([textarea.value], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selected.reference}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        };
      });
    })
    .catch(err => {
      error.textContent = 'Error loading commentary list.';
      console.error('Error loading JSON:', err);
    });
});
