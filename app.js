const { createClient } = window.supabase;
const sb = createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.publishableKey);
const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val = (obj, ...keys) => { for (const k of keys) if (obj && obj[k] != null) return obj[k]; return ''; };
function youtubeId(url='') { const m=String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/); return m?m[1]:''; }
async function firstSettings(){ const r=await sb.from('site_settings').select('*').limit(1).maybeSingle(); return r.data||{}; }
async function load(){
  const [settings,music,videos,shows,socials]=await Promise.all([
    firstSettings(),
    sb.from('music').select('*').order('id',{ascending:false}),
    sb.from('videos').select('*').order('id',{ascending:false}),
    sb.from('shows').select('*').order('id',{ascending:false}),
    sb.from('social_links').select('*').order('id',{ascending:true})
  ]);
  const s=settings||{};
  document.title=`${esc(val(s,'artist')||'KwekuDey')} — Official Website`;
  document.getElementById('hero-name').textContent=val(s,'artist')||'KwekuDey';
  document.getElementById('hero-tagline').textContent=val(s,'tagline')||'Music. Energy. Truth.';
  document.getElementById('bio').textContent=val(s,'bio')||'Music, energy and a story that keeps moving.';
  const email=val(s,'email')||'bookkwekudey@gmail.com'; const el=document.getElementById('email-link'); el.textContent=email; el.href=`mailto:${email}`;
  const image=val(s,'profile_image_url','image_url','artist_image_url'); if(image){document.getElementById('hero-image').src=image;document.getElementById('hero-image-wrap').classList.remove('hidden');}
  renderMusic(music.data||[]); renderVideos(videos.data||[]); renderShows(shows.data||[]); renderSocials(socials.data||[]);
  document.getElementById('year').textContent=new Date().getFullYear();
}
function renderMusic(items){const grid=document.getElementById('music-grid'); if(!items.length){grid.innerHTML='<div class="empty card">New music is coming soon.</div>';return;} grid.innerHTML=items.map(x=>{const title=esc(val(x,'title')||'Untitled');const type=esc(val(x,'type')||'Release');const link=val(x,'link','url');const art=val(x,'image_url','cover_url','artwork_url');return `<article class="card music-card">${art?`<img class="cover" src="${esc(art)}" alt="${title} cover">`:''}<div class="card-body"><span class="tag">${type}</span><h3>${title}</h3><a class="btn small" href="${esc(link||'#')}" target="_blank" rel="noopener">Listen</a></div></article>`}).join('');}
function renderVideos(items){const grid=document.getElementById('video-grid'); if(!items.length){grid.innerHTML='<div class="empty card">Videos will appear here soon.</div>';return;} grid.innerHTML=items.map(x=>{const title=esc(val(x,'title')||'Video');const link=val(x,'link','url');const id=youtubeId(link);return `<article class="card video-card">${id?`<div class="video"><iframe src="https://www.youtube.com/embed/${encodeURIComponent(id)}" title="${title}" loading="lazy" allowfullscreen></iframe></div>`:''}<div class="card-body"><h3>${title}</h3>${link?`<a class="btn small ghost" href="${esc(link)}" target="_blank" rel="noopener">Open video</a>`:''}</div></article>`}).join('');}
function renderShows(items){const grid=document.getElementById('shows-list'); if(!items.length){grid.innerHTML='<div class="empty card">No upcoming shows announced yet.</div>';return;} grid.innerHTML=items.map(x=>{const date=esc(val(x,'date')||'Coming soon');const title=esc(val(x,'title')||'Show');const location=esc(val(x,'location')||'Ghana');const link=val(x,'link','url');return `<article class="card show-card"><span class="tag">${date}</span><h3>${title}</h3><p>${location}</p>${link?`<a class="btn small ghost" href="${esc(link)}" target="_blank" rel="noopener">More info</a>`:''}</article>`}).join('');}
function renderSocials(items){const box=document.getElementById('socials');box.innerHTML=items.map(x=>{const p=esc(val(x,'platform')||'Social');const u=val(x,'url','link');return u?`<a href="${esc(u)}" target="_blank" rel="noopener">${p}</a>`:''}).join('');}
load().catch(err=>{console.error(err);document.getElementById('music-grid').innerHTML='<div class="card empty">The site is online, but the content connection needs one final setup check in Supabase.</div>';document.getElementById('year').textContent=new Date().getFullYear();});
