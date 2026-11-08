// 網站行為：語言切換、手機選單、輪播。文字請改 content.js。
(() => {
  const $ = (s) => document.querySelector(s);
  const links = ['index.html#research','people.html','gallery.html','index.html#contact'];
  const isPeople = location.pathname.endsWith('/people.html');
  const isGallery = location.pathname.endsWith('/gallery.html');
  let language = 'zh';
  try { language = localStorage.getItem('lab-language') === 'en' ? 'en' : 'zh'; } catch (_) {}
  let current = 0, paused = matchMedia('(prefers-reduced-motion: reduce)').matches, timer;
  const slides = [...document.querySelectorAll('.slide')];
  function element(tag, text, cls) { const el=document.createElement(tag); el.textContent=text; if(cls) el.className=cls; return el; }
  let mediaLanguage;
  let featuredIndex = 0;
  let videoIndex = 0;
  let renderedVideoIndex;
  function localized(value) {
    if (typeof value === 'string') return value;
    return value?.[language] || value?.zh || value?.en || '';
  }
  function youtubeId(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || !['youtu.be', 'youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) return null;
      const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) :
        (url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]);
      return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
    } catch (_) {
      return null;
    }
  }
  function renderFeatured() {
    const container = $('#featured-carousel');
    if (!container) return;
    const settings = window.LAB_SETTINGS;
    const photos = settings.featuredProjects || settings.featuredPhotos || (settings.featuredPhoto ? [settings.featuredPhoto] : []);
    container.hidden = photos.length === 0;
    if (!photos.length) {
      $('#featured-title').textContent = '';
      $('#featured-description').textContent = '';
      return;
    }
    featuredIndex = (featuredIndex + photos.length) % photos.length;
    const photo = photos[featuredIndex];
    const t = window.LAB_CONTENT[language];
    $('#featured-image').src = photo.src;
    $('#featured-image').alt = localized(photo.alt || photo.title || photo.caption);
    $('#featured-caption').textContent = localized(photo.caption);
    $('#featured-title').textContent = localized(photo.title) || t.projectText;
    $('#featured-description').textContent = localized(photo.description) || t.projectDesc;
    $('#featured-status').textContent = (featuredIndex + 1) + ' / ' + photos.length;
    $('#featured-prev').setAttribute('aria-label', t.prevProject);
    $('#featured-next').setAttribute('aria-label', t.nextProject);
    $('#featured-controls').hidden = photos.length < 2;
  }
  function renderMedia(settings, t) {
    const list = $('#video-list');
    if (!list) return;
    // Support content files from the earlier single-video version.
    const videos = (settings.videos || (settings.videoUrl ? [{ url: settings.videoUrl, title: t.videoTitle, description: t.videoDesc }] : []))
      .filter(video => youtubeId(video.url));
    $('#video-empty').hidden = videos.length > 0;
    $('#video-controls').hidden = videos.length < 2;
    if (!videos.length) {
      list.replaceChildren();
      renderedVideoIndex = undefined;
      return;
    }
    videoIndex = (videoIndex + videos.length) % videos.length;
    $('#video-status').textContent = (videoIndex + 1) + ' / ' + videos.length;
    $('#video-prev').setAttribute('aria-label', t.prevVideo);
    $('#video-next').setAttribute('aria-label', t.nextVideo);
    if (mediaLanguage === language && renderedVideoIndex === videoIndex) return;
    mediaLanguage = language;
    renderedVideoIndex = videoIndex;
    const video = videos[videoIndex];
    const id = youtubeId(video.url);
    const card = element('article', '', 'video-card');
    const title = localized(video.title) || t.videoTitle;
    const player = element('div', '', 'video-player');
    const button = element('button', '', 'video-load');
    button.type = 'button';
    button.setAttribute('aria-label', t.loadVideo + ' — ' + title);
    const icon = element('span', '▶', 'play-icon');
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon, element('span', t.loadVideo));
    button.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
      frame.title = title;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      player.replaceChildren(frame);
    });
    player.append(button);
    const link = element('a', t.watch, 'text-link');
    link.href = 'https://www.youtube.com/watch?v=' + id;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    card.append(player, element('h3', title), element('p', localized(video.description)), link);
    // Removing the old iframe stops its playback when changing videos.
    list.replaceChildren(card);
  }
  function renderHero() {
    if (!slides.length) return;
    const t = window.LAB_CONTENT[language];
    const items = t.heroSlides || [];
    const item = items[current] || {};
    $('.hero-content [data-t="eyebrow"]').textContent = item.eyebrow ?? t.eyebrow;
    $('.hero-content [data-t="title"]').textContent = item.title ?? t.title;
    $('.hero-content [data-t="intro"]').textContent = item.intro ?? t.intro;
    $('.hero-content [data-nav]').textContent = item.button ?? t.nav[0];
    $('.hero-content .button').setAttribute('href', item.link || '#research');
    // Keep the five image elements in index.html and apply their configured paths.
    slides.forEach((slide, index) => {
      if (items[index]?.src) slide.setAttribute('src', items[index].src);
    });
  }
  function renderPeople(t, settings) {
    const members = $('#members');
    if (members) {
      // Earlier content files still render as plain text when loaded with this script.
      const groups = t.memberGroups || [{ title: t.people, members: (t.members || []).map(row => ({ name: row[0], detail: row[1] })) }];
      members.replaceChildren(...groups.map(group => {
        const section = element('section', '', 'member-group');
        section.append(element('h3', group.title));
        const list = element('ul', '', 'member-list');
        list.append(...group.members.map(member => {
          const item = element('li', '', 'member-row');
          item.append(element('span', member.name, 'member-name'));
          if (member.detail) item.append(element('span', member.detail, 'member-detail'));
          return item;
        }));
        if (group.members.length) section.append(list);
        else section.append(element('p', t.membersEmpty, 'people-empty'));
        return section;
      }));
    }
    const awards = $('#awards-list');
    if (awards) {
      const records = t.awards || [];
      const categories = [...(t.awardCategories || [])];
      const knownCategories = new Set(categories.map(category => category.key));
      // Keep records from older content files visible until they are categorized.
      if (records.some(record => !knownCategories.has(record.category))) {
        categories.push({ key: 'other', title: t.awardsOther || t.awardsTitle });
      }
      awards.replaceChildren(...categories.map(category => {
        const entries = records.filter(record => category.key === 'other' ? !knownCategories.has(record.category) : record.category === category.key);
        const group = element('details', '', 'award-category');
        const summary = element('summary');
        summary.append(element('span', category.title), element('span', String(entries.length), 'award-count'));
        group.append(summary);
        if (!entries.length) {
          group.append(element('p', t.awardsEmpty, 'people-empty'));
          return group;
        }
        const undergraduate = category.key === 'undergraduate';
        const table = element('table', '', 'awards-table');
        table.append(element('caption', category.title, 'visually-hidden'));
        const head = element('thead');
        const headings = element('tr');
        const labels = undergraduate ? [t.awardYear, t.awardStudent] : [t.awardYear, t.awardStudent, t.awardName];
        labels.forEach(label => {
          const cell = element('th', label);
          cell.setAttribute('scope', 'col');
          headings.append(cell);
        });
        head.append(headings);
        const body = element('tbody');
        entries.forEach(record => {
          const row = element('tr');
          row.append(element('td', record.year || '', 'award-year'));
          const student = element('td', record.name || '');
          row.append(student);
          const detail = undergraduate ? student : element('td');
          if (record.award && (!undergraduate || record.award !== category.title)) {
            detail.append(element('span', record.award));
          }
          if (record.event) detail.append(element('small', record.event, 'award-event'));
          if (!undergraduate) row.append(detail);
          body.append(row);
        });
        table.append(head, body);
        const scroll = element('div', '', 'awards-table-wrap');
        scroll.append(table);
        group.append(scroll);
        return group;
      }));
    }
    const gallery = $('#gallery-grid');
    if (gallery) {
      const photos = settings.galleryPhotos || [];
      gallery.replaceChildren(...(t.gallerySections || []).map(group => {
        const section = element('section', '', 'gallery-section');
        section.append(element('h3', group.title));
        if (group.category === 'workshops') {
          section.append(element('h4', t.conferencesTitle, 'conference-heading'));
          const conferences = settings.conferences || [];
          const list = element('ul', '', 'conference-list');
          list.append(...conferences.map(conference => {
            const item = element('li', '', 'conference-item');
            const heading = element('h5');
            let website;
            try {
              const url = new URL(conference.url);
              if (url.protocol === 'https:' || url.protocol === 'http:') website = url.href;
            } catch (_) {}
            const title = localized(conference.title);
            if (website) {
              const link = element('a', title + ' ↗');
              link.href = website;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              heading.append(link);
            } else heading.textContent = title;
            item.append(heading);
            const details = [localized(conference.date), localized(conference.location)].filter(Boolean);
            if (details.length) item.append(element('p', details.join(' · '), 'conference-meta'));
            const description = localized(conference.description);
            if (description) item.append(element('p', description, 'conference-description'));
            return item;
          }));
          section.append(conferences.length ? list : element('p', t.conferencesEmpty, 'people-empty'));
        }
        const grid = element('div', '', 'gallery-photo-grid');
        const items = photos.filter(photo => photo.category === group.category);
        grid.append(...items.map(photo => {
          const figure = element('figure', '', 'gallery-card');
          const image = document.createElement('img');
          image.src = photo.src;
          image.alt = localized(photo.alt || photo.caption);
          image.loading = 'lazy';
          const caption = element('figcaption', localized(photo.caption));
          const description = localized(photo.description);
          if (description) caption.append(element('p', description, 'photo-description'));
          figure.append(image, caption);
          return figure;
        }));
        section.append(items.length ? grid : element('p', t.galleryEmpty, 'people-empty'));
        return section;
      }));
    }
  }
  function render() {
    const t=window.LAB_CONTENT[language];
    const settings=window.LAB_SETTINGS;
    renderFeatured();
    renderMedia(settings, t);
    renderPeople(t, settings);
    const email = (settings.email || '').trim();
    const actualEmail = email.replace(/\s+AT\s+/i, '@');
    document.querySelectorAll('.contact-email').forEach(link => {
      link.hidden = !email;
      if (email) link.href = 'mailto:' + actualEmail;
    });
    const contact = $('#contact-email');
    if (contact) {
      contact.replaceChildren();
      contact.hidden = !email;
      if (email) {
        const link = element('a', email + ' ↗');
        link.href = 'mailto:' + actualEmail;
        contact.append(link);
      }
    }
    const phoneContact = $('#contact-phone');
    if (phoneContact) {
      const phone = (settings.phone || '').trim();
      const extension = (settings.phoneExtension || '').trim();
      const number = phone.replace(/[^+0-9]/g, '');
      phoneContact.replaceChildren();
      phoneContact.hidden = !number;
      if (number) {
        const label = language === 'zh' ? '電話 ' : 'Tel ';
        const suffix = extension ? (language === 'zh' ? ' 分機 ' : ' ext. ') + extension : '';
        const link = element('a', label + phone + suffix);
        link.href = 'tel:' + number + (extension ? ';ext=' + extension.replace(/[^0-9]/g, '') : '');
        phoneContact.append(link);
      }
    }
    document.documentElement.lang=language==='zh'?'zh-Hant':'en';
    document.title=(isPeople?'People | ':isGallery?'Gallery | ':'')+t.name+' | '+t.affiliation;
    document.querySelector('meta[name="description"]').content=isGallery?t.gallerySub:isPeople?t.peopleIntro:t.intro;
    document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t[el.dataset.t]);
    document.querySelectorAll('[data-nav]').forEach(el=>el.textContent=t.nav[Number(el.dataset.nav)]);
    $('#language').textContent=language==='zh'?'EN':'中文';
    $('#language').setAttribute('aria-label',language==='zh'?'Switch to English':'切換為中文');
    $('#menu').setAttribute('aria-label',t.menu);
    $('#navigation').replaceChildren(...links.map((href,i)=>{const a=element('a',t.nav[i]);a.href=href;if((isPeople&&i===1)||(isGallery&&i===2))a.setAttribute('aria-current','page');return a;}));
    if ($('#topics')) $('#topics').replaceChildren(...t.topics.map(row=>{const a=element('article','','topic');a.append(element('h3',row[1]),element('p',row[2]));return a;}));

    if (slides.length) {
    $('#prev').setAttribute('aria-label',t.prev); $('#next').setAttribute('aria-label',t.next);
    $('#pause').setAttribute('aria-label',paused?t.play:t.pause);
    $('#pause').textContent=paused?'▶':'Ⅱ';
    $('#pause').setAttribute('aria-pressed',String(paused));
    }
    renderHero();
  }
  function show(n) {
    if (!slides.length) return;
    current = (n + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle('active', index === current));
    $('#slide-status').textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    renderHero();
  }
  function restart(){clearInterval(timer);if(slides.length&&!paused&&!document.hidden)timer=setInterval(()=>show(current+1),6000);}
  function closeMenu(){ $('#navigation').classList.remove('open');$('#menu').setAttribute('aria-expanded','false'); }
  $('#language').addEventListener('click',()=>{language=language==='zh'?'en':'zh';try{localStorage.setItem('lab-language',language);}catch(_){}render();});
  $('#menu').addEventListener('click',()=>{const open=$('#navigation').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));});
  $('#navigation').addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});
  if(slides.length) {
  $('#prev').addEventListener('click',()=>{show(current-1);restart();});
  $('#next').addEventListener('click',()=>{show(current+1);restart();});
  $('#pause').addEventListener('click',()=>{paused=!paused;render();restart();});
  $('.hero').addEventListener('mouseenter',()=>clearInterval(timer));
  $('.hero').addEventListener('mouseleave',restart);
  $('.hero').addEventListener('focusin',()=>clearInterval(timer));
  $('.hero').addEventListener('focusout',e=>{if(!$('.hero').contains(e.relatedTarget))restart();});
  document.addEventListener('visibilitychange',restart);
  }
  if ($('#featured-prev')) {
    $('#featured-prev').addEventListener('click', () => { featuredIndex--; renderFeatured(); });
    $('#featured-next').addEventListener('click', () => { featuredIndex++; renderFeatured(); });
  }
  if ($('#video-prev')) {
    $('#video-prev').addEventListener('click', () => { videoIndex--; renderMedia(window.LAB_SETTINGS, window.LAB_CONTENT[language]); });
    $('#video-next').addEventListener('click', () => { videoIndex++; renderMedia(window.LAB_SETTINGS, window.LAB_CONTENT[language]); });
  }
  render();if(slides.length){show(0);restart();}
})();
