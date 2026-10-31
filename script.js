(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const config = typeof LOVE_CONFIG === 'undefined' ? {} : LOVE_CONFIG;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 時間計算以「當地日曆日期」為準，避免夏令時間/時區造成跳日
  if (/^\d{4}-\d{2}-\d{2}$/.test(config.startDate || '')) {
    const parts = config.startDate.split('-').map(Number);
    const start = new Date(parts[0],parts[1]-1,parts[2]);
    if (start.getFullYear() === parts[0] && start.getMonth() === parts[1]-1 && start.getDate() === parts[2]) {
      const today = new Date();
      const dayDiff = Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(...[parts[0], parts[1]-1, parts[2]])) / 86400000);
      if (dayDiff >= 0) {
        $('#daysCount').textContent = `一起走過 ${dayDiff.toLocaleString('zh-TW')} 天`;
        const isFirstAnniversary = today.getFullYear() === 2026 && today.getMonth() === 9 && today.getDate() === 31;
        $('#daysCaption').textContent = isFirstAnniversary
          ? '今天剛好一週年！第一年的 365 天，謝謝妳一直都在 ♡'
          : '從 2025 年 10 月 31 日在一起那天開始，每一天都很珍貴。';
      }
    }
  }

  const revealNodes = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, {threshold: 0.08, rootMargin: '0px 0px -18px 0px'});
    revealNodes.forEach(el => io.observe(el));
  } else revealNodes.forEach(el => el.classList.add('visible'));

  $('#enterButton').addEventListener('click', () => {
    $('#story').scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth'});
    spawnHearts(8);
  });

  const photoDialog = $('#photoDialog');
  const zoomImage = $('#zoomImage');
  const zoomCaption = $('#zoomCaption');
  $$('.polaroid').forEach(button => button.addEventListener('click', () => {
    zoomImage.src = button.dataset.full;
    zoomImage.alt = button.getAttribute('aria-label').replace('放大照片：','');
    zoomCaption.textContent = button.dataset.caption;
    photoDialog.showModal();
  }));
  $('#closePhoto').addEventListener('click', () => photoDialog.close());
  photoDialog.addEventListener('click', e => {if (e.target === photoDialog) photoDialog.close();});
  photoDialog.addEventListener('close', () => { zoomImage.removeAttribute('src'); });

  const letterDialog = $('#letterDialog');
  $('#letterTitle').textContent = config.letterTitle || '親愛的妳：';
  $('#letterSign').textContent = config.letterSignature || '一直喜歡妳的人 ♡';
  (Array.isArray(config.letterParagraphs) ? config.letterParagraphs : []).forEach(s => {
    const p = document.createElement('p'); p.textContent = s; $('#letterBody').appendChild(p);
  });
  const openLetter = () => {
    letterDialog.showModal();
    spawnHearts(14);
  };
  $('#openLetter').addEventListener('click', openLetter);
  $('#envelope').addEventListener('click', openLetter);
  $('#envelope').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); openLetter();} });
  $('#closeLetter').addEventListener('click', () => letterDialog.close());
  letterDialog.addEventListener('click', e => {if (e.target === letterDialog) letterDialog.close();});

  $('#surpriseButton').addEventListener('click', () => {
    $('#finalHeart').textContent = '♥';
    $('#finalHeart').classList.remove('heartbeat');
    void $('#finalHeart').offsetWidth;
    $('#finalHeart').classList.add('heartbeat');
    spawnHearts(24);
  });

  function spawnHearts(count) {
    if (reduceMotion) return;
    const layer = $('#heartsLayer');
    const symbols = ['♥', '♡', '✦', '✿'];
    for (let i=0; i<count; i++) {
      const heart=document.createElement('span');
      heart.className='floating-heart';
      heart.textContent=symbols[Math.floor(Math.random()*symbols.length)];
      heart.style.left=`${8+Math.random()*84}%`;
      heart.style.bottom=`${-10+Math.random()*30}%`;
      heart.style.fontSize=`${17+Math.random()*19}px`;
      heart.style.animationDelay=`${Math.random()*0.7}s`;
      heart.style.animationDuration=`${2.8+Math.random()*2}s`;
      layer.appendChild(heart);
      heart.addEventListener('animationend', () => heart.remove(), {once:true});
    }
  }
  // 同時間只播放一段影片，避免手機兩段音訊重疊
  $$('video').forEach(video => video.addEventListener('play', () => $$('video').forEach(other => { if (other !== video) other.pause(); })));
})();
