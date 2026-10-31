(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const config = typeof LOVE_CONFIG === 'undefined' ? {} : LOVE_CONFIG;
  const STORAGE_KEY = 'our-first-anniversary-letter-draft-v1';
  const inputs = {title:$('#letterTitle'), body:$('#letterContent'), signature:$('#letterSignature')};
  const publishConfig = {...config};

  function splitParagraphs(body) {
    return body.replace(/\r\n?/g,'\n').trim().split(/\n\s*\n/g).map(s=>s.trim()).filter(Boolean);
  }
  const published = {
    title:String(config.letterTitle || '親愛的妳：'),
    body:(Array.isArray(config.letterParagraphs) ? config.letterParagraphs : []).join('\n\n'),
    signature:String(config.letterSignature || '一直喜歡妳的人 ♡')
  };
  function readDraft() {
    try {
      const raw=localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed=JSON.parse(raw);
      if (typeof parsed.title !== 'string' || typeof parsed.body !== 'string' || typeof parsed.signature !== 'string') return null;
      return parsed;
    } catch (_) { return null; }
  }
  function getDraft() {return {title:inputs.title.value,body:inputs.body.value,signature:inputs.signature.value};}
  function fill(draft) {
    inputs.title.value=draft.title.slice(0,80);
    inputs.body.value=draft.body.slice(0,15000);
    inputs.signature.value=draft.signature.slice(0,100);
    render();
  }
  function render() {
    const draft=getDraft();
    $('#previewTitle').textContent=draft.title || '親愛的妳：';
    $('#previewSignature').textContent=draft.signature || '♡';
    const content=$('#previewBody');
    content.replaceChildren();
    const paragraphs=splitParagraphs(draft.body);
    if (!paragraphs.length) {
      const p=document.createElement('p');p.textContent='想對妳說的話，會出現在這裡……';p.style.color='#b5a0a7';content.appendChild(p);
    } else {
      paragraphs.forEach(value=>{const p=document.createElement('p');p.textContent=value;content.appendChild(p);});
    }
    $('#characterCount').textContent=`${[...draft.body].length.toLocaleString('zh-TW')} 字`;
  }
  let saveAllowed=true;
  function save() {
    render();
    try {
      localStorage.setItem(STORAGE_KEY,JSON.stringify(getDraft()));
      $('#saveStatus').textContent='草稿已儲存在這台裝置';
    } catch (_) {
      saveAllowed=false;
      $('#saveStatus').textContent='瀏覽器禁止儲存草稿，請先複製或下載檔案';
    }
  }
  function exportSource() {
    const draft=getDraft();
    if (!draft.body.trim()) {inputs.body.focus(); $('#saveStatus').textContent='請先寫下情書內容，再複製或下載'; return null;}
    const output={
      ...publishConfig,
      letterTitle:draft.title.trim()||published.title,
      letterParagraphs:splitParagraphs(draft.body),
      letterSignature:draft.signature.trim()||published.signature
    };
    return `/* 2025/10/31 在一起 · 2026/01/14 陪她過生日 · 一週年情書 */\nconst LOVE_CONFIG = ${JSON.stringify(output,null,2)};\n`;
  }
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {await navigator.clipboard.writeText(text);return true;} catch (_) { /* use selection fallback */ }
    }
    const area=document.createElement('textarea');
    area.value=text;area.setAttribute('readonly','');area.style.cssText='position:fixed;left:-9999px;top:0;opacity:0;';
    document.body.appendChild(area);area.focus();area.select();area.setSelectionRange(0,area.value.length);
    let ok=false;
    try {ok=document.execCommand('copy');} catch (_) { /* no access */ }
    area.remove();return ok;
  }
  const lastDraft=readDraft();
  fill(lastDraft || published);
  $('#saveStatus').textContent=lastDraft ? '已載入上次在這台裝置儲存的草稿' : '已載入網站目前的情書內容';
  Object.values(inputs).forEach(element=>element.addEventListener('input',save));
  $('#copyButton').addEventListener('click', async () => {
    const source=exportSource(); if (!source) return;
    const ok=await copyText(source);
    if (ok) {
      $('#saveStatus').textContent='已複製！到 GitHub 編輯 config.js 後貼上並提交';
      $('#copyButton').textContent='✓ 已複製，可前往 GitHub';
      setTimeout(()=>{$('#copyButton').innerHTML='複製發布內容 <span aria-hidden="true">⧉</span>';},3800);
    } else {
      $('#saveStatus').textContent='此瀏覽器無法自動複製，請改用「下載 config.js」';
    }
  });
  $('#downloadButton').addEventListener('click', () => {
    const source=exportSource();if (!source) return;
    const blob=new Blob([source],{type:'text/javascript;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='config.js';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    $('#saveStatus').textContent='config.js 已下載，還要上傳到 GitHub 才會正式發布';
  });
  $('#resetButton').addEventListener('click',()=>{
    if (!confirm('確定清除這台裝置的草稿，回到網站目前已發布的情書嗎？清除後無法復原。')) return;
    try {localStorage.removeItem(STORAGE_KEY);} catch (_) {/* no local storage */}
    fill(published);
    $('#saveStatus').textContent='已回到網站目前的情書版本';
  });
})();
