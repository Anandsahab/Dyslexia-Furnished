// js/upload.js

document.addEventListener('DOMContentLoaded', () => {
  // Protect page: require login
  if (typeof ReadXAuth !== 'undefined' && !ReadXAuth.protectPage()) {
    return;
  }

  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('uploadInput');
  const browseBtn = document.getElementById('uploadBrowseBtn');
  const list = document.getElementById('uploadList');
  const empty = document.getElementById('uploadEmpty');

  function renderUploads() {
    const uploads = ReadXData.getUploads();
    list.innerHTML = '';

    if (uploads.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    uploads.forEach(item => {
      const el = document.createElement('div');
      el.className = 'upload-item';
      el.innerHTML = `
        <div class="upload-item-info">
          <h4>${item.title}</h4>
          <span>Uploaded ${item.date} · ${item.wordCount} words</span>
        </div>
        <div class="upload-item-actions">
          <a href="reader.html?article=${item.id}" class="btn btn-primary btn-sm">Read →</a>
          <button class="btn-ghost" data-delete="${item.id}">Remove</button>
        </div>
      `;
      list.appendChild(el);
    });

    list.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.delete;
        const updated = ReadXData.getUploads().filter(u => u.id !== id);
        ReadXData.saveUploads(updated);
        renderUploads();
      });
    });
  }

  function processFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result.trim();
      if (!content) return;

      const words = content.split(/\s+/).length;
      const id = 'upload-' + Date.now();
      const title = file.name.replace(/\.(txt|md)$/i, '');

      const uploads = ReadXData.getUploads();
      uploads.unshift({
        id,
        title,
        content,
        desc: `Uploaded document — ${words} words.`,
        excerpt: content.substring(0, 120) + '…',
        readTime: Math.max(3, Math.ceil(words / 200)) + ' min',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        wordCount: words
      });
      ReadXData.saveUploads(uploads);
      renderUploads();
    };
    reader.readAsText(file);
  }

  browseBtn.addEventListener('click', () => input.click());
  zone.addEventListener('click', (e) => {
    if (e.target === browseBtn || e.target.closest('button')) return;
    input.click();
  });

  input.addEventListener('change', () => {
    processFile(input.files[0]);
    input.value = '';
  });

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && /\.(txt|md)$/i.test(file.name)) {
      processFile(file);
    }
  });

  renderUploads();
});
