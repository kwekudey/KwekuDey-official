const { createClient } = window.supabase;
const sb = createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.publishableKey);
const bucket = window.SUPABASE_CONFIG.bucket;
const $ = id => document.getElementById(id);
const esc = (v='') => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const firstKey=(obj,keys)=>keys.find(k=>Object.prototype.hasOwnProperty.call(obj||{},k));
const valueFrom=(obj,keys)=>{const k=firstKey(obj,keys); return k ? (obj[k] ?? '') : '';};
function msg(t,ok=false){$('status').textContent=t;$('status').className='status '+(ok?'ok':'err');}
async function settings(){const r=await sb.from('site_settings').select('*').limit(1).maybeSingle();if(r.error)throw r.error;return r.data;}
async function requireAuth(){const {data}=await sb.auth.getSession();if(data.session)showDashboard();}
function showDashboard(){$('login-card').hidden=true;$('dashboard').hidden=false;loadAll().catch(e=>msg(e.message||String(e)));}
$('login-form').addEventListener('submit',async e=>{e.preventDefault();$('login-msg').textContent='Signing in…';const {error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){$('login-msg').textContent=error.message;return}showDashboard();});
$('logout').onclick=async()=>{await sb.auth.signOut();location.reload()};
async function loadAll(){
 const [s,m,v,sh,so]=await Promise.all([settings(),sb.from('music').select('*').order('id',{ascending:true}),sb.from('videos').select('*').order('id',{ascending:true}),sb.from('shows').select('*').order('id',{ascending:true}),sb.from('social_links').select('*').order('id',{ascending:true})]);
 for(const r of [m,v,sh,so])if(r.error)throw r.error;
 $('artist').value=valueFrom(s,['artist','artist_name','name'])||'KwekuDey';
 $('tagline').value=valueFrom(s,['tagline','tag_line'])||'';
 $('bio').value=valueFrom(s,['bio','about','description'])||'';
 $('booking-email').value=valueFrom(s,['email','booking_email','contact_email'])||'bookkwekudey@gmail.com';
 $('profile-url').textContent=valueFrom(s,['profile_image_url','image_url','artist_image_url','profile_image'])||'';
 renderMusic(m.data||[]);renderVideos(v.data||[]);renderShows(sh.data||[]);renderSocials(so.data||[]);msg('Dashboard ready.',true);
}
function rowInputs(kind,item={}){
 if(kind==='music')return `<div class="row"><input data-k="title" value="${esc(valueFrom(item,['title','song_title','name']))}" placeholder="Song title"><input data-k="type" value="${esc(valueFrom(item,['type','release_type']))}" placeholder="Type"><input data-k="link" value="${esc(valueFrom(item,['link','url','music_link','streaming_link']))}" placeholder="Streaming URL"><input data-k="image_url" value="${esc(valueFrom(item,['image_url','cover_url','artwork_url','cover_image']))}" placeholder="Cover image URL"><button class="remove" data-remove="1">Remove</button></div>`;
 if(kind==='video')return `<div class="row"><input data-k="title" value="${esc(valueFrom(item,['title','video_title','name']))}" placeholder="Video title"><input data-k="link" value="${esc(valueFrom(item,['link','url','video_url']))}" placeholder="YouTube URL"><button class="remove" data-remove="1">Remove</button></div>`;
 if(kind==='show')return `<div class="row"><input data-k="date" value="${esc(valueFrom(item,['date','show_date']))}" placeholder="Date"><input data-k="title" value="${esc(valueFrom(item,['title','show_title','name']))}" placeholder="Show title"><input data-k="location" value="${esc(valueFrom(item,['location','venue']))}" placeholder="Location"><input data-k="link" value="${esc(valueFrom(item,['link','url','info_url']))}" placeholder="Info/ticket URL"><button class="remove" data-remove="1">Remove</button></div>`;
 return `<div class="row"><input data-k="platform" value="${esc(valueFrom(item,['platform','name']))}" placeholder="Platform"><input data-k="url" value="${esc(valueFrom(item,['url','link','social_url']))}" placeholder="Profile URL"><button class="remove" data-remove="1">Remove</button></div>`;
}
function renderList(id,kind,items){$(id).innerHTML=items.map(x=>rowInputs(kind,x)).join('');wireRemove($(id));}
function collect(id){return [...$(id).querySelectorAll('.row')].map(r=>{const o={};r.querySelectorAll('[data-k]').forEach(i=>o[i.dataset.k]=i.value.trim());return o;});}
function renderMusic(x){renderList('music-list','music',x)}function renderVideos(x){renderList('video-list','video',x)}function renderShows(x){renderList('show-list','show',x)}function renderSocials(x){renderList('social-list','social',x)}
function wireRemove(root){root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>b.closest('.row').remove())}
$('add-music').onclick=()=>{$('music-list').insertAdjacentHTML('beforeend',rowInputs('music',{}));wireRemove($('music-list'))};
$('add-video').onclick=()=>{$('video-list').insertAdjacentHTML('beforeend',rowInputs('video',{}));wireRemove($('video-list'))};
$('add-show').onclick=()=>{$('show-list').insertAdjacentHTML('beforeend',rowInputs('show',{}));wireRemove($('show-list'))};
$('add-social').onclick=()=>{$('social-list').insertAdjacentHTML('beforeend',rowInputs('social',{}));wireRemove($('social-list'))};
function mapRow(ui, existing, kind){
 const map={
  music:{title:['title','song_title','name'],type:['type','release_type'],link:['link','url','music_link','streaming_link'],image_url:['image_url','cover_url','artwork_url','cover_image']},
  video:{title:['title','video_title','name'],link:['link','url','video_url']},
  show:{date:['date','show_date'],title:['title','show_title','name'],location:['location','venue'],link:['link','url','info_url']},
  social:{platform:['platform','name'],url:['url','link','social_url']}
 }[kind];
 const out={};
 for(const [uiKey, candidates] of Object.entries(map)){const real=firstKey(existing,candidates);if(real)out[real]=ui[uiKey]||'';}
 return out;
}
async function replaceRows(table,items,kind){
 const existing=await sb.from(table).select('*').limit(1);if(existing.error)throw existing.error;
 const sample=existing.data?.[0]||{};
 const del=await sb.from(table).delete().not('id','is',null);if(del.error)throw del.error;
 if(items.length){
  if(!Object.keys(sample).length) throw new Error(`The ${table} table has no existing row to detect its column names. Add one item manually in Supabase Table Editor once, then use this dashboard.`);
  const rows=items.map(x=>mapRow(x,sample,kind));
  const ins=await sb.from(table).insert(rows);if(ins.error)throw ins.error;
 }
}
$('save-profile').onclick=async()=>{try{const s=await settings();if(!s)throw new Error('No site_settings row found.');const patch={};const keys={artist:['artist','artist_name','name'],tagline:['tagline','tag_line'],bio:['bio','about','description'],email:['email','booking_email','contact_email'],profile_image_url:['profile_image_url','image_url','artist_image_url','profile_image']};for(const [ui,candidates] of Object.entries(keys)){const real=firstKey(s,candidates);if(real)patch[real]=ui==='artist'?$('artist').value.trim():ui==='tagline'?$('tagline').value.trim():ui==='bio'?$('bio').value.trim():ui==='email'?$('booking-email').value.trim():$('profile-url').textContent.trim();}if(!Object.keys(patch).length)throw new Error('Could not match the site_settings columns.');const r=await sb.from('site_settings').update(patch).eq('id',s.id);if(r.error)throw r.error;msg('Profile saved successfully.',true)}catch(e){msg(e.message||String(e))}};
$('save-music').onclick=async()=>saveTable('music','music-list','music');$('save-videos').onclick=async()=>saveTable('videos','video-list','video');$('save-shows').onclick=async()=>saveTable('shows','show-list','show');$('save-socials').onclick=async()=>saveTable('social_links','social-list','social');
async function saveTable(table,id,kind){try{await replaceRows(table,collect(id),kind);msg(`${table} saved successfully.`,true)}catch(e){msg(e.message||String(e))}}
$('upload-profile').onclick=async()=>{const file=$('profile-file').files[0];if(!file){msg('Choose an image first.');return}try{const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=`profile/profile-${Date.now()}.${ext}`;const up=await sb.storage.from(bucket).upload(path,file,{upsert:true,contentType:file.type,cacheControl:'3600'});if(up.error)throw up.error;const pub=sb.storage.from(bucket).getPublicUrl(path);$('profile-url').textContent=pub.data.publicUrl;msg('Profile image uploaded. Now click Save profile.',true)}catch(e){msg(e.message||String(e))}};
sb.auth.onAuthStateChange((event,session)=>{if(session && $('dashboard').hidden)showDashboard()});
requireAuth().catch(e=>console.error(e));
