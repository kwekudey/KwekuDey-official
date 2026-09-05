const d=SITE_DATA;
document.querySelector('.lead').textContent=d.tagline;
document.getElementById('year').textContent=new Date().getFullYear();
document.querySelector('.contact .btn').href='mailto:'+d.email;
document.getElementById('music-grid').innerHTML=d.music.map(x=>`<a class="card" href="${x.link}" target="_blank"><small>${x.type}</small><h3>${x.title}</h3><span>Listen →</span></a>`).join('');
document.getElementById('video-grid').innerHTML=d.videos.map(x=>`<a class="card" href="${x.link}" target="_blank"><small>VIDEO</small><h3>${x.title}</h3><span>Watch →</span></a>`).join('');
document.getElementById('shows-list').innerHTML=d.shows.map(x=>`<div class="show"><div><small>${x.date}</small><h3>${x.title}</h3></div><span>${x.location}</span></div>`).join('');
