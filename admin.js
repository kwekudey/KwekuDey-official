const PIN="2468";let data=JSON.parse(JSON.stringify(SITE_DATA));
function login(){if(document.getElementById('pin').value===PIN){document.getElementById('login').hidden=true;document.getElementById('dashboard').hidden=false;render()}else document.getElementById('login-msg').textContent='Incorrect PIN.'}
function render(){
document.getElementById('tagline').value=data.tagline;document.getElementById('email').value=data.email;
document.getElementById('music-edit').innerHTML=data.music.map((x,i)=>`<div class="edit"><input value="${x.title}" oninput="data.music[${i}].title=this.value"><input value="${x.type}" oninput="data.music[${i}].type=this.value"><input value="${x.link}" oninput="data.music[${i}].link=this.value"><button onclick="data.music.splice(${i},1);render()">Remove</button></div>`).join('');
document.getElementById('shows-edit').innerHTML=data.shows.map((x,i)=>`<div class="edit"><input value="${x.date}" oninput="data.shows[${i}].date=this.value"><input value="${x.title}" oninput="data.shows[${i}].title=this.value"><input value="${x.location}" oninput="data.shows[${i}].location=this.value"><button onclick="data.shows.splice(${i},1);render()">Remove</button></div>`).join('');
document.getElementById('videos-edit').innerHTML=data.videos.map((x,i)=>`<div class="edit"><input value="${x.title}" oninput="data.videos[${i}].title=this.value"><input value="${x.link}" oninput="data.videos[${i}].link=this.value"><button onclick="data.videos.splice(${i},1);render()">Remove</button></div>`).join('');
document.getElementById('tagline').oninput=e=>data.tagline=e.target.value;document.getElementById('email').oninput=e=>data.email=e.target.value;
}
function addMusic(){data.music.push({title:"New song",type:"Single",link:"#"});render()}function addShow(){data.shows.push({date:"Date",title:"New show",location:"Location"});render()}function addVideo(){data.videos.push({title:"New video",link:"#"});render()}
function downloadData(){const js="const SITE_DATA = "+JSON.stringify(data,null,2)+";";const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([js],{type:'text/javascript'}));a.download='site-data.js';a.click()}
