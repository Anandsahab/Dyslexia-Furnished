// js/reader.js

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  let currentId = params.get('article') || 'binary-search';

  const select = document.getElementById('studioDocSelect');
  const toc = document.getElementById('studioToc');
  const titleEl = document.getElementById('articleTitle');
  const categoryEl = document.getElementById('articleCategory');
  const descEl = document.getElementById('articleDesc');
  const contentEl = document.getElementById('articleContent');

  const allItems = ReadXData.getAllLibraryItems();
  allItems.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.title;
    if (item.id === currentId) opt.selected = true;
    select.appendChild(opt);
  });

  function loadArticle(id) {
    const article = ReadXData.getArticle(id);
    if (!article) return;

    currentId = id;
    titleEl.textContent = article.title;
    categoryEl.textContent = article.category;
    descEl.textContent = article.desc;
    contentEl.innerHTML = article.content;
    contentEl.dataset.chunked = 'false';

    toc.innerHTML = '';
    (article.sections || []).forEach(section => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#${section.id}">${section.title}</a>`;
      toc.appendChild(li);
    });

    toc.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    history.replaceState(null, '', `?article=${id}`);
    if (ReadingAssist.tts) ReadingAssist.tts.stop();
    ReadingAssist.chunkText();
    ReadingAssist.sentences = Array.from(document.querySelectorAll('.reading-content .sentence'));
  }

  select.addEventListener('change', () => loadArticle(select.value));
  loadArticle(currentId);

  // Track reading progress
  const readTime = allItems.find(i => i.id === currentId)?.readTime;
  const readMin = parseInt(readTime) || 8;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = totalHeight > 0 ? Math.min(100, Math.round((window.scrollY / totalHeight) * 100)) : 0;
    ReadXData.setReadingProgress(currentId, pct);

    if (pct >= 90) {
      ReadXData.markArticleRead(currentId, readMin);
    }
  }, { passive: true });
});
