const { createClient } = window.supabase;
const sb = createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.publishableKey);
const bucket=window.SUPABASE_CONFIG.bucket;
const $=id=>document.getElementById(id);
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=(o,...keys)=>{for(const k of keys)if(o?.[k]!=null)return o[k];return '';};
function msg(t,ok=false){$('status').textContent=t;$('status').className='status '+(ok?'ok':'err');}
async function settings(){const r=await sb.from('site_settings').select('*').limit(1).maybeSingle();if(r.error)throw r.error;return r.data;}
async function requireAuth(){const {data}=await sb.auth.getSession();if(data.session)showDashboard();}
function showDashboard(){$('login-card').hidden=true;$('dashboard').hidden=false;loadAll().catch(e=>msg(e.message||String(e)));}
$('login-form').addEventListener('submit',async e=>{e.preventDefault();$('login-msg').textContent='Signing in…';const {error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){$('login-msg').textContent=error.message;return}showDashboard();});
$('logout').onclick=async()=>{await sb.auth.signOut();location.reload()};
async function loadAll(){
 const [s,m,v,sh,so]=await Promise.all([settings(),sb.from('music').select('*').order('id',{ascending:true}),sb.from('videos').select('*').order('id',{ascending:true}),sb.from('shows').select('*').order('id',{ascending:true}),sb.from('social_links').select('*').order('id',{ascending:true})]);
 for(const r of [m,v,sh,so])if(r.error)throw r.error;
 $('artist').value=pick(s,'artist')||'KwekuDey';$('tagline').value=pick(s,'tagline')||'';$('bio').value=pick(s,'bio')||'';$('booking-email').value=pick(s,'email')||'bookkwekudey@gmail.com';$('profile-url').textContent=pick(s,'profile_image_url','image_url','artist_image_url')||'';
 renderMusic(m.data||[]);renderVideos(v.data||[]);renderShows(sh.data||[]);renderSocials(so.data||[]);msg('Dashboard ready.',true);
}
function rowInputs(kind,item={},idx){if(kind==='music')return `<div class="row"><input data-k="title" value="${esc(pick(item,'title'))}" placeholder="Song title"><input data-k="type" value="${esc(pick(item,'type'))}" placeholder="Type"><input data-k="link" value="${esc(pick(item,'link','url'))}" placeholder="Streaming URL"><input data-k="image_url" value="${esc(pick(item,'image_url','cover_url','artwork_url'))}" placeholder="Cover image URL"><button class="remove" data-remove="1">Remove</button></div>`;
if(kind==='video')return `<div class="row"><input data-k="title" value="${esc(pick(item,'title'))}" placeholder="Video title"><input data-k="link" value="${esc(pick(item,'link','url'))}" placeholder="YouTube URL"><button class="remove" data-remove="1">Remove</button></div>`;
if(kind==='show')return `<div class="row"><input data-k="date" value="${esc(pick(item,'date'))}" placeholder="Date"><input data-k="title" value="${esc(pick(item,'title'))}" placeholder="Show title"><input data-k="location" value="${esc(pick(item,'location'))}" placeholder="Location"><input data-k="link" value="${esc(pick(item,'link','url'))}" placeholder="Info/ticket URL"><button class="remove" data-remove="1">Remove</button></div>`;
return `<div class="row"><input data-k="platform" value="${esc(pick(item,'platform'))}" placeholder="Platform"><input data-k="url" value="${esc(pick(item,'url','link'))}" placeholder="Profile URL"><button class="remove" data-remove="1">Remove</button></div>`;}
function renderList(id,kind,items){$(id).innerHTML=items.map((x,i)=>rowInputs(kind,x,i)).join('');$(id).querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>b.closest('.row').remove());}
function collect(id){return [...$(id).querySelectorAll('.row')].map(r=>{const o={};r.querySelectorAll('[data-k]').forEach(i=>o[i.dataset.k]=i.value.trim());return o;});}
function renderMusic(x){renderList('music-list','music',x)}function renderVideos(x){renderList('video-list','video',x)}function renderShows(x){renderList('show-list','show',x)}function renderSocials(x){renderList('social-list','social',x)}
$('add-music').onclick=()=>{const r=$('music-list');r.insertAdjacentHTML('beforeend',rowInputs('music',{}));wireRemove(r)};
$('add-video').onclick=()=>{$('video-list').insertAdjacentHTML('beforeend',rowInputs('video',{}));wireRemove($('video-list'))};
$('add-show').onclick=()=>{$('show-list').insertAdjacentHTML('beforeend',rowInputs('show',{}));wireRemove($('show-list'))};
$('add-social').onclick=()=>{$('social-list').insertAdjacentHTML('beforeend',rowInputs('social',{}));wireRemove($('social-list'))};
function wireRemove(root){root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>b.closest('.row').remove())}
async function replaceRows(table,items){const del=await sb.from(table).delete().not('id','is',null);if(del.error)throw del.error;if(items.length){const ins=await sb.from(table).insert(items.map(x=>{const y={...x};delete y.id;return y;}));if(ins.error)throw ins.error;}}
$('save-profile').onclick=async()=>{try{const s=await settings();const patch={artist:$('artist').value.trim(),tagline:$('tagline').value.trim(),bio:$('bio').value.trim(),email:$('booking-email').value.trim(),profile_image_url:$('profile-url').textContent.trim()};const r=await sb.from('site_settings').update(patch).eq('id',s.id);if(r.error)throw r.error;msg('Profile saved.',true)}catch(e){msg(e.message||String(e))}};
$('save-music').onclick=async()=>saveTable('music','music-list');$('save-videos').onclick=async()=>saveTable('videos','video-list');$('save-shows').onclick=async()=>saveTable('shows','show-list');$('save-socials').onclick=async()=>saveTable('social_links','social-list');
async function saveTable(table,id){try{await replaceRows(table,collect(id));msg(`${table} saved.`,true)}catch(e){msg(e.message||String(e))}}
$('upload-profile').onclick=async()=>{const file=$('profile-file').files[0];if(!file){msg('Choose an image first.');return}try{const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=`profile/profile-${Date.now()}.${ext}`;const up=await sb.storage.from(bucket).upload(path,file,{upsert:true,contentType:file.type,cacheControl:'3600'});if(up.error)throw up.error;const pub=sb.storage.from(bucket).getPublicUrl(path);$('profile-url').textContent=pub.data.publicUrl;msg('Profile image uploaded. Click Save profile.',true)}catch(e){msg(e.message||String(e))}};
sb.auth.onAuthStateChange((event,session)=>{if(session && $('dashboard').hidden)showDashboard()});
requireAuth().catch(e=>console.error(e));
