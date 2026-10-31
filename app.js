const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const today = new Date();
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const plusDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate()+n); return d; };
const greekDate = d => new Intl.DateTimeFormat('el-GR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d);
const greekShort = d => new Intl.DateTimeFormat('el-GR',{day:'numeric',month:'short'}).format(d);
const uid = () => Math.random().toString(36).slice(2,10);
const seed = () => ({tasks:[],events:[],clients:[],projects:[],profile:{name:'',role:'',email:'',bio:'',photo:''}});
const DEMO_TASKS = new Set(['Ολοκλήρωση πρότασης Project Apollo','Συνάντηση με ομάδα','Προετοιμασία παρουσίασης','Έλεγχος προσφορών','Απάντηση σε emails','Γυμναστήριο','Αποστολή τελικού brief']);
const DEMO_EVENTS = new Set(['Συνάντηση με πελάτη','Προετοιμασία παρουσίασης','Έλεγχος προσφορών','Κλήση με πελάτη','Σχεδιασμός εβδομάδας']);
const DEMO_CLIENTS = new Set(['Elite Consulting','Nexora','Aurora Studio','Horizon Group']);
const DEMO_PROJECTS = new Set(['Project Apollo','Rebrand Nexora','Marketing Plan','New Website']);
let data;
try { data=JSON.parse(localStorage.getItem('dayflow-v2-data')) || seed(); } catch { data=seed(); }
data.tasks=Array.isArray(data.tasks)?data.tasks:[];
data.events=Array.isArray(data.events)?data.events:[];
data.clients=Array.isArray(data.clients)?data.clients:[];
data.projects=Array.isArray(data.projects)?data.projects:[];
data.profile=data.profile&&typeof data.profile==='object'?data.profile:{name:'',role:'',email:'',bio:'',photo:''};
// One-time cleanup: remove only the original built-in sample entries, preserving anything the user added.
if(!localStorage.getItem('dayflow-v3-cleaned')){
  data.tasks=data.tasks.filter(x=>!DEMO_TASKS.has(x.title));
  data.events=data.events.filter(x=>!DEMO_EVENTS.has(x.title));
  data.clients=data.clients.filter(x=>!DEMO_CLIENTS.has(x.name));
  data.projects=data.projects.filter(x=>!DEMO_PROJECTS.has(x.name));
  localStorage.setItem('dayflow-v3-cleaned','1');
}
let selectedDate = new Date(today.getFullYear(),today.getMonth(),today.getDate());
let calendarMode='day', taskFilter='all', projectFilter='all';
const save=()=>localStorage.setItem('dayflow-v2-data',JSON.stringify(data));
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const timeLabel=t=>t||'—';
const priorityLabel=p=>({high:'Υψηλή',medium:'Μεσαία',low:'Χαμηλή'}[p]||'Μεσαία');
const dateFromIso=s=>{if(!s)return today;const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)}
function go(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view)); if(view==='calendar')renderCalendar(); if(view==='tasks')renderTasks();if(view==='projects')renderProjects();window.scrollTo({top:0,behavior:'smooth'})}
function sortedItems(items){return [...items].sort((a,b)=>(a.date||'').concat(a.time||'').localeCompare((b.date||'').concat(b.time||'')))}
function renderProfile(){
  const p=data.profile||{}, initial=(p.name||'D').trim().charAt(0).toUpperCase()||'D';
  const avatar=$('#profileBtn');
  avatar.innerHTML=p.photo?`<img src="${p.photo}" alt="Φωτογραφία προφίλ">`:escapeHtml(initial);
  const preview=$('#profilePhotoPreview');
  if(preview)preview.innerHTML=p.photo?`<img src="${p.photo}" alt="Προεπισκόπηση φωτογραφίας">`:escapeHtml(initial);
  $('#profileName').value=p.name||'';$('#profileRole').value=p.role||'';$('#profileEmail').value=p.email||'';$('#profileBio').value=p.bio||'';
}
function renderHome(){
  $('#todayLabel').textContent=greekDate(today);
  const done=data.tasks.filter(t=>t.done).length, total=data.tasks.length;
  $('#progressCount').textContent=`${done}/${total}`;
  $('.progress-ring').style.setProperty('--progress',`${total?done/total*100:0}%`);
  $('#taskStat').textContent=data.tasks.filter(t=>!t.done).length;
  $('#meetingStat').textContent=data.events.filter(e=>e.date===iso(today)).length;
  $('#projectStat').textContent=data.projects.filter(p=>(p.done||0)<(p.total||1)).length;
  const name=data.profile?.name?.trim();$('#welcomeTitle').innerHTML=`Καλημέρα${name?', '+escapeHtml(name):''}! <span>☀️</span>`;
  const events=sortedItems(data.events.filter(e=>e.date===iso(today))).slice(0,5);
  $('#homeSchedule').innerHTML=events.length?events.map((e,i)=>`<div class="timeline-row"><span class="time">${escapeHtml(timeLabel(e.time))}</span><span class="timeline-line"></span><div><div class="timeline-title">${escapeHtml(e.title)}</div><div class="timeline-sub">${escapeHtml(e.client||e.place||e.category||'Δραστηριότητα')}</div></div><span class="timeline-symbol">${['♟','▤','☑','♧'][i%4]}</span></div>`).join(''):'<div class="empty-state"><strong>Η μέρα είναι ανοιχτή.</strong>Πρόσθεσε την πρώτη σου δραστηριότητα.</div>';
  const percent=total?Math.round(done/total*100):0;$('#goalProgress').style.width=percent+'%';$('#goalPercent').textContent=percent+'%';
}
function renderCalendar(){
 const y=selectedDate.getFullYear(),m=selectedDate.getMonth(),first=new Date(y,m,1),offset=(first.getDay()+6)%7;
 $('#monthTitle').textContent=new Intl.DateTimeFormat('el-GR',{month:'long',year:'numeric'}).format(selectedDate);
 const daysInMonth=new Date(y,m+1,0).getDate(), prevDays=new Date(y,m,0).getDate();let html='';
 for(let i=0;i<42;i++){let day,dt,other=false;if(i<offset){day=prevDays-offset+i+1;dt=new Date(y,m-1,day);other=true}else if(i>=offset+daysInMonth){day=i-offset-daysInMonth+1;dt=new Date(y,m+1,day);other=true}else{day=i-offset+1;dt=new Date(y,m,day)}
 const key=iso(dt),has=data.events.some(e=>e.date===key)||data.tasks.some(t=>t.date===key),selected=key===iso(selectedDate),isToday=key===iso(today);
 html+=`<button class="calendar-day ${other?'muted-day':''} ${selected?'selected':''} ${isToday?'today':''} ${has?'has-events':''}" data-date="${key}">${day}</button>`;
 }
 $('#calendarGrid').innerHTML=html;
 $$('.calendar-day').forEach(b=>b.addEventListener('click',()=>{selectedDate=dateFromIso(b.dataset.date);renderCalendar()}));
 $('#selectedDateLabel').textContent=greekShort(selectedDate);
 $('#calendarAgendaTitle').textContent=calendarMode==='week'?'Πρόγραμμα εβδομάδας':calendarMode==='month'?'Πρόγραμμα μήνα':'Πρόγραμμα ημέρας';
 let items;
 if(calendarMode==='week'){const start=plusDays(selectedDate,-((selectedDate.getDay()+6)%7)),end=plusDays(start,6);items=[...data.events,...data.tasks].filter(x=>x.date>=iso(start)&&x.date<=iso(end))}
 else if(calendarMode==='month')items=[...data.events,...data.tasks].filter(x=>x.date?.slice(0,7)===iso(selectedDate).slice(0,7));
 else items=[...data.events,...data.tasks].filter(x=>x.date===iso(selectedDate));
 items=sortedItems(items);
 $('#calendarAgenda').innerHTML=items.length?items.map(e=>`<div class="agenda-item"><span class="agenda-time">${escapeHtml(timeLabel(e.time))}</span><span class="agenda-bar"></span><div><div class="agenda-title">${escapeHtml(e.title)}</div><div class="agenda-sub">${escapeHtml(e.client||e.place||e.category||'Εργασία')}${calendarMode!=='day'?' · '+escapeHtml(greekShort(dateFromIso(e.date))):''}</div></div><span class="agenda-tag">${e.priority?priorityLabel(e.priority):'Πρόγραμμα'}</span></div>`).join(''):'<div class="empty-state"><strong>Δεν υπάρχει κάτι προγραμματισμένο.</strong>Χώρος για κάτι σημαντικό.</div>';
}
function renderTasks(){
 const q=$('#taskSearch').value.toLowerCase();
 let tasks=data.tasks.filter(t=>(!q||`${t.title} ${t.category} ${t.description} ${t.client||''}`.toLowerCase().includes(q))&&(taskFilter==='all'||taskFilter==='today'&&t.date===iso(today)||taskFilter==='progress'&&!t.done||taskFilter==='done'&&t.done));
 const groups=[['high','Υψηλή προτεραιότητα','♧'],['medium','Μεσαία προτεραιότητα','▣'],['low','Χαμηλή προτεραιότητα','✦']];let html='';
 for(const [p,title,icon] of groups){const list=sortedItems(tasks.filter(t=>t.priority===p));if(!list.length)continue;html+=`<div><h3 class="task-group-title"><span class="group-dot ${p}">${icon}</span>${title}</h3>${list.map(t=>`<article class="task-card ${t.done?'done':''}"><button class="check-button" data-check="${t.id}" aria-label="Ολοκλήρωση">${t.done?'✓':''}</button><div><div class="task-name">${escapeHtml(t.title)}</div><div class="task-meta"><span>◷ ${escapeHtml(greekShort(dateFromIso(t.date)))} · ${escapeHtml(t.time||'—')}</span>${t.client?`<span>♙ ${escapeHtml(t.client)}</span>`:''}<span class="priority ${t.priority}">${priorityLabel(t.priority)}</span></div></div><button class="more-button" data-delete-task="${t.id}" aria-label="Διαγραφή">⋮</button></article>`).join('')}</div>`}
 $('#taskList').innerHTML=html||'<div class="empty-state"><strong>Όλα τακτοποιημένα.</strong>Δεν υπάρχουν εργασίες εδώ ακόμη. Πρόσθεσε την πρώτη σου.</div>';
 $$('[data-check]').forEach(b=>b.onclick=()=>{const t=data.tasks.find(x=>x.id===b.dataset.check);if(t){t.done=!t.done;save();renderTasks();renderHome();toast(t.done?'Η εργασία ολοκληρώθηκε.':'Η εργασία επανήλθε.')}});
 $$('[data-delete-task]').forEach(b=>b.onclick=()=>{if(confirm('Να διαγραφεί αυτή η εργασία;')){data.tasks=data.tasks.filter(t=>t.id!==b.dataset.deleteTask);save();renderTasks();renderHome();toast('Η εργασία διαγράφηκε.')}});
}
function renderProjects(){
 const list=data.projects.filter(p=>projectFilter==='all'||projectFilter==='progress'&&(p.done||0)<(p.total||1)||projectFilter==='done'&&(p.done||0)===(p.total||1));
 $('#projectList').innerHTML=list.length?list.map((p,i)=>{const total=Math.max(1,p.total||1),done=Math.min(total,p.done||0),percent=Math.round(done/total*100);return `<article class="project-card"><div class="project-top"><div class="project-icon">${['▧','✦','▤','↗'][i%4]}</div><div><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.client||'Χωρίς πελάτη')}</small></div><span class="project-count">${done}/${total}</span></div><div class="project-progress-meta"><span>Πρόοδος έργου</span><strong>${percent}%</strong></div><div class="project-progress"><span style="width:${percent}%"></span></div><div class="project-progress-meta"><span>◷ ${escapeHtml(p.date?greekShort(dateFromIso(p.date)):'Χωρίς προθεσμία')}</span><span>${percent===100?'Ολοκληρώθηκε':'Σε εξέλιξη'}</span></div></article>`}).join(''):'<div class="empty-state"><strong>Ο χώρος των projects είναι έτοιμος.</strong>Δημιούργησε το πρώτο σου project.</div>';
}
function clientNames(){
 const names=[...data.clients.map(c=>c.name),...data.tasks.map(x=>x.client),...data.events.map(x=>x.client),...data.projects.map(x=>x.client)].filter(Boolean);
 return [...new Set(names.map(x=>String(x).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'el'));
}
function updateClientSuggestions(){
 $('#clientSuggestions').innerHTML=clientNames().map(name=>`<option value="${escapeHtml(name)}"></option>`).join('');
}
function openModal(type){
 const labels={task:'Νέα εργασία',event:'Νέα δραστηριότητα',project:'Νέο project'};
 $('#entryType').value=type;$('#modalTitle').textContent=labels[type]||'Νέα καταχώριση';
 $('#modalEyebrow').textContent='DAYFLOW · ΝΕΑ ΚΑΤΑΧΩΡΙΣΗ';
 $('#entryForm').reset();$('#entryDate').value=iso(selectedDate||today);$('#entryTime').value='10:00';
 $('#entryCategory').innerHTML=(type==='event'?['Συνάντηση','Εργασία','Οικονομικά','Προσωπικά']:['Εργασία','Προσωπικά','Συνάντηση','Οικονομικά','Υγεία']).map(x=>`<option>${x}</option>`).join('');
 $('#entryClientWrap').hidden=false;$('#reminderWrap').hidden=type==='project';$('#entryPriority').closest('.field-label').hidden=type==='event'||type==='project';
 $('#entryCategory').closest('.field-label').hidden=type==='project';
 updateClientSuggestions();
 $('#modalBackdrop').classList.add('open');setTimeout(()=>$('#entryTitle').focus(),120);
}
function closeModal(){$('#modalBackdrop').classList.remove('open')}
$('#entryForm').addEventListener('submit',e=>{
 e.preventDefault();const type=$('#entryType').value,title=$('#entryTitle').value.trim(),date=$('#entryDate').value,time=$('#entryTime').value,description=$('#entryDescription').value.trim(),client=$('#entryClient').value.trim();
 if(!title||!date)return;
 if(type==='task')data.tasks.push({id:uid(),title,date,time,priority:$('#entryPriority').value,category:$('#entryCategory').value,description,client,done:false,status:'today',reminder:$('#entryReminder').value});
 else if(type==='event')data.events.push({id:uid(),title,date,time,category:$('#entryCategory').value,place:description,description,client,reminder:$('#entryReminder').value});
 else if(type==='project')data.projects.push({id:uid(),name:title,client:client||'Χωρίς πελάτη',description,done:0,total:1,date,color:'sage'});
 save();closeModal();renderAll();toast('Η καταχώριση αποθηκεύτηκε στη συσκευή σου.');
});
function renderAll(){renderHome();renderCalendar();renderTasks();renderProjects();renderProfile();updateClientSuggestions()}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.goto)));
$$('[data-add]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.add)));
$('#quickAdd').addEventListener('click',()=>openModal($('#view-calendar').classList.contains('active')?'event':'task'));
$('#closeModal').addEventListener('click',closeModal);
$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
$('#prevMonth').addEventListener('click',()=>{selectedDate=new Date(selectedDate.getFullYear(),selectedDate.getMonth()-1,1);renderCalendar()});
$('#nextMonth').addEventListener('click',()=>{selectedDate=new Date(selectedDate.getFullYear(),selectedDate.getMonth()+1,1);renderCalendar()});
$$('#calendarModes button').forEach(b=>b.addEventListener('click',()=>{calendarMode=b.dataset.mode;$$('#calendarModes button').forEach(x=>x.classList.toggle('selected',x===b));renderCalendar()}));
$$('#taskFilters button').forEach(b=>b.addEventListener('click',()=>{taskFilter=b.dataset.filter;$$('#taskFilters button').forEach(x=>x.classList.toggle('selected',x===b));renderTasks()}));
$$('#projectFilters button').forEach(b=>b.addEventListener('click',()=>{projectFilter=b.dataset.filter;$$('#projectFilters button').forEach(x=>x.classList.toggle('selected',x===b));renderProjects()}));
$('#taskSearch').addEventListener('input',renderTasks);$('#clearSearch').addEventListener('click',()=>{$('#taskSearch').value='';renderTasks()});
function applyTheme(theme, persist=true){
 const allowed=['forest','olive','burgundy','navy'];if(!allowed.includes(theme))theme='forest';
 document.body.classList.remove('theme-olive','theme-burgundy','theme-navy');if(theme!=='forest')document.body.classList.add('theme-'+theme);
 $('#themeSelect').value=theme;$('#themeSwatch').style.background=({forest:'#102e25',olive:'#424d2f',burgundy:'#48252e',navy:'#172a43'})[theme];
 $$('.palette-chip').forEach(b=>b.classList.toggle('selected',b.dataset.theme===theme));
 const colors={forest:'#102e25',olive:'#424d2f',burgundy:'#48252e',navy:'#172a43'};document.querySelector('meta[name="theme-color"]').content=colors[theme];
 if(persist)localStorage.setItem('dayflow-theme',theme);
}
$('#themeSelect').addEventListener('change',e=>applyTheme(e.target.value));
$$('.palette-chip').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.theme)));
$('#compactToggle').addEventListener('change',e=>{document.body.classList.toggle('compact-mode',e.target.checked);localStorage.setItem('dayflow-compact',e.target.checked?'1':'0')});
$('#profileForm').addEventListener('submit',e=>{e.preventDefault();data.profile={...data.profile,name:$('#profileName').value.trim(),role:$('#profileRole').value.trim(),email:$('#profileEmail').value.trim(),bio:$('#profileBio').value.trim()};save();renderProfile();renderHome();toast('Το προφίλ σου αποθηκεύτηκε.')});
$('#profilePhotoInput').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){toast('Επίλεξε ένα αρχείο εικόνας.');return;}
 try{const compressed=await resizeProfileImage(file);data.profile.photo=compressed;save();renderProfile();toast('Η φωτογραφία προφίλ ενημερώθηκε.');}
 catch{toast('Δεν ήταν δυνατή η φόρτωση της φωτογραφίας. Δοκίμασε άλλη εικόνα.');}
 e.target.value='';
});
function resizeProfileImage(file){
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const max=480,scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext('2d');if(!ctx){reject(new Error('Canvas unavailable'));return;}ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.78));};img.src=reader.result;};reader.readAsDataURL(file);});
}
$('#profileBtn').addEventListener('click',()=>go('settings'));
$('#exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='dayflow-backup.json';a.click();URL.revokeObjectURL(url);toast('Το αντίγραφο ετοιμάστηκε.')});
$('#importInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const incoming=JSON.parse(await f.text());if(!Array.isArray(incoming.tasks)||!Array.isArray(incoming.events)||!Array.isArray(incoming.projects))throw Error();data={...seed(),...incoming,clients:Array.isArray(incoming.clients)?incoming.clients:[],profile:{...seed().profile,...(incoming.profile||{})}};save();renderAll();renderProfile();toast('Τα δεδομένα εισήχθησαν.')}catch{toast('Το αρχείο δεν είναι έγκυρο αντίγραφο DayFlow.')}e.target.value=''});
$('#notificationsBtn').addEventListener('click',()=>toast('Οι υπενθυμίσεις ρυθμίζονται από τη συσκευή σου.'));
const savedTheme=localStorage.getItem('dayflow-theme')||'forest';applyTheme(savedTheme,false);
const compactSaved=localStorage.getItem('dayflow-compact')==='1';$('#compactToggle').checked=compactSaved;document.body.classList.toggle('compact-mode',compactSaved);
renderAll();save();
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
