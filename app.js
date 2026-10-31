const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const today = new Date();
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const plusDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate()+n); return d; };
const greekDate = d => new Intl.DateTimeFormat('el-GR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d);
const greekShort = d => new Intl.DateTimeFormat('el-GR',{day:'numeric',month:'short'}).format(d);
const uid = () => Math.random().toString(36).slice(2,10);
const seed = () => ({
  tasks:[
    {id:uid(),title:'Ολοκλήρωση πρότασης Project Apollo',date:iso(today),time:'10:00',priority:'high',category:'Εργασία',description:'Οριστικοποίηση της παρουσίασης.',done:false,status:'today',reminder:'10'},
    {id:uid(),title:'Συνάντηση με ομάδα',date:iso(today),time:'11:30',priority:'medium',category:'Συνάντηση',description:'Συζήτηση προόδου και επόμενων βημάτων.',done:false,status:'today',reminder:'30'},
    {id:uid(),title:'Προετοιμασία παρουσίασης',date:iso(today),time:'13:00',priority:'high',category:'Εργασία',description:'',done:true,status:'today',reminder:'none'},
    {id:uid(),title:'Έλεγχος προσφορών',date:iso(today),time:'14:00',priority:'medium',category:'Οικονομικά',description:'',done:false,status:'today',reminder:'none'},
    {id:uid(),title:'Απάντηση σε emails',date:iso(today),time:'16:00',priority:'low',category:'Εργασία',description:'',done:false,status:'today',reminder:'none'},
    {id:uid(),title:'Γυμναστήριο',date:iso(today),time:'18:30',priority:'low',category:'Υγεία',description:'',done:false,status:'today',reminder:'none'},
    {id:uid(),title:'Αποστολή τελικού brief',date:iso(plusDays(today,1)),time:'12:00',priority:'medium',category:'Εργασία',description:'',done:false,status:'progress',reminder:'none'}
  ],
  events:[
    {id:uid(),title:'Συνάντηση με πελάτη',date:iso(today),time:'09:00',category:'Συνάντηση',place:'Elite Consulting'},
    {id:uid(),title:'Προετοιμασία παρουσίασης',date:iso(today),time:'11:30',category:'Εργασία',place:'Project Apollo'},
    {id:uid(),title:'Έλεγχος προσφορών',date:iso(today),time:'14:00',category:'Οικονομικά',place:'Γραφείο'},
    {id:uid(),title:'Κλήση με πελάτη',date:iso(today),time:'16:30',category:'Συνάντηση',place:'Nexora'},
    {id:uid(),title:'Σχεδιασμός εβδομάδας',date:iso(plusDays(today,1)),time:'10:00',category:'Προσωπικά',place:'Ημερήσιος προγραμματισμός'}
  ],
  clients:[
    {id:uid(),name:'Elite Consulting',initial:'E',status:'active',meetings:5,tasks:3,email:'info@eliteconsulting.gr',phone:'+30 210 123 4667'},
    {id:uid(),name:'Nexora',initial:'N',status:'active',meetings:3,tasks:2,email:'hello@nexora.gr',phone:'+30 210 555 0123'},
    {id:uid(),name:'Aurora Studio',initial:'A',status:'prospect',meetings:1,tasks:1,email:'hello@aurora.gr',phone:'+30 2310 123 456'},
    {id:uid(),name:'Horizon Group',initial:'H',status:'active',meetings:4,tasks:1,email:'contact@horizon.gr',phone:'+30 210 777 1122'}
  ],
  projects:[
    {id:uid(),name:'Project Apollo',client:'Elite Consulting',done:4,total:8,date:iso(plusDays(today,15)),color:'sage'},
    {id:uid(),name:'Rebrand Nexora',client:'Nexora',done:2,total:5,date:iso(plusDays(today,30)),color:'lilac'},
    {id:uid(),name:'Marketing Plan',client:'Aurora Studio',done:6,total:6,date:iso(plusDays(today,20)),color:'green'},
    {id:uid(),name:'New Website',client:'Horizon Group',done:3,total:7,date:iso(plusDays(today,45)),color:'peach'}
  ]
});
let data;
try { data=JSON.parse(localStorage.getItem('dayflow-v2-data')) || seed(); } catch { data=seed(); }
let selectedDate = new Date(today.getFullYear(),today.getMonth(),today.getDate());
let calendarMode='day', taskFilter='all', clientFilter='all', projectFilter='all';
const save=()=>localStorage.setItem('dayflow-v2-data',JSON.stringify(data));
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const timeLabel=t=>t||'—';
const priorityLabel=p=>({high:'Υψηλή',medium:'Μεσαία',low:'Χαμηλή'}[p]||'Μεσαία');
const dateFromIso=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2500)}
function go(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view)); if(view==='calendar')renderCalendar(); if(view==='tasks')renderTasks(); if(view==='clients')renderClients();if(view==='projects')renderProjects();window.scrollTo({top:0,behavior:'smooth'})}
function sortedItems(items){return [...items].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))}
function renderHome(){
  $('#todayLabel').textContent=greekDate(today);
  const done=data.tasks.filter(t=>t.done).length, total=data.tasks.length;
  $('#progressCount').textContent=`${done}/${total}`;
  $('.progress-ring').style.setProperty('--progress',`${total?done/total*100:0}%`);
  $('#taskStat').textContent=data.tasks.filter(t=>!t.done).length;
  $('#meetingStat').textContent=data.events.filter(e=>e.date===iso(today)).length;
  $('#projectStat').textContent=data.projects.filter(p=>p.done<p.total).length;
  const events=sortedItems(data.events.filter(e=>e.date===iso(today))).slice(0,5);
  $('#homeSchedule').innerHTML=events.length?events.map((e,i)=>`<div class="timeline-row"><span class="time">${escapeHtml(e.time)}</span><span class="timeline-line"></span><div><div class="timeline-title">${escapeHtml(e.title)}</div><div class="timeline-sub">${escapeHtml(e.place||e.category)}</div></div><span class="timeline-symbol">${['♟','▤','☑','♧'][i%4]}</span></div>`).join(''):'<div class="empty-state"><strong>Η μέρα είναι ανοιχτή.</strong>Πρόσθεσε το πρώτο σου ραντεβού.</div>';
  const percent=total?Math.round(done/total*100):0;$('#goalProgress').style.width=percent+'%';$('#goalPercent').textContent=percent+'%';
}
function renderCalendar(){
 const y=selectedDate.getFullYear(),m=selectedDate.getMonth(),first=new Date(y,m,1),offset=(first.getDay()+6)%7;
 $('#monthTitle').textContent=new Intl.DateTimeFormat('el-GR',{month:'long',year:'numeric'}).format(selectedDate);
 const daysInMonth=new Date(y,m+1,0).getDate(), prevDays=new Date(y,m,0).getDate();
 let html='';
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
 else if(calendarMode==='month')items=[...data.events,...data.tasks].filter(x=>x.date.slice(0,7)===iso(selectedDate).slice(0,7));
 else items=[...data.events,...data.tasks].filter(x=>x.date===iso(selectedDate));
 items=sortedItems(items);
 $('#calendarAgenda').innerHTML=items.length?items.map((e,i)=>`<div class="agenda-item"><span class="agenda-time">${escapeHtml(e.time)}</span><span class="agenda-bar"></span><div><div class="agenda-title">${escapeHtml(e.title)}</div><div class="agenda-sub">${e.place?escapeHtml(e.place):escapeHtml(e.category||'Εργασία')}${calendarMode!=='day'?' · '+escapeHtml(greekShort(dateFromIso(e.date))):''}</div></div><span class="agenda-tag">${e.priority?priorityLabel(e.priority):'Πρόγραμμα'}</span></div>`).join(''):'<div class="empty-state"><strong>Δεν υπάρχει κάτι προγραμματισμένο.</strong>Χώρος για κάτι σημαντικό.</div>';
}
function renderTasks(){
 const q=$('#taskSearch').value.toLowerCase();
 let tasks=data.tasks.filter(t=>(!q||`${t.title} ${t.category} ${t.description}`.toLowerCase().includes(q))&&(taskFilter==='all'||taskFilter==='today'&&t.date===iso(today)||taskFilter==='progress'&&!t.done||taskFilter==='done'&&t.done));
 const groups=[['high','Υψηλή προτεραιότητα','♧'],['medium','Μεσαία προτεραιότητα','▣'],['low','Χαμηλή προτεραιότητα','✦']];
 let html='';
 for(const [p,title,icon] of groups){const list=sortedItems(tasks.filter(t=>t.priority===p));if(!list.length)continue;html+=`<div><h3 class="task-group-title"><span class="group-dot ${p}">${icon}</span>${title}</h3>${list.map(t=>`<article class="task-card ${t.done?'done':''}"><button class="check-button" data-check="${t.id}" aria-label="Ολοκλήρωση">${t.done?'✓':''}</button><div><div class="task-name">${escapeHtml(t.title)}</div><div class="task-meta"><span>◷ ${escapeHtml(greekShort(dateFromIso(t.date)))} · ${escapeHtml(t.time||'—')}</span><span class="priority ${t.priority}">${priorityLabel(t.priority)}</span></div></div><button class="more-button" data-delete-task="${t.id}" aria-label="Διαγραφή">⋮</button></article>`).join('')}</div>`}
 $('#taskList').innerHTML=html||'<div class="empty-state"><strong>Όλα τακτοποιημένα.</strong>Δεν βρέθηκαν εργασίες για αυτό το φίλτρο.</div>';
 $$('[data-check]').forEach(b=>b.onclick=()=>{const t=data.tasks.find(x=>x.id===b.dataset.check);if(t){t.done=!t.done;save();renderTasks();renderHome();toast(t.done?'Η εργασία ολοκληρώθηκε.':'Η εργασία επανήλθε.')}});
 $$('[data-delete-task]').forEach(b=>b.onclick=()=>{if(confirm('Να διαγραφεί αυτή η εργασία;')){data.tasks=data.tasks.filter(t=>t.id!==b.dataset.deleteTask);save();renderTasks();renderHome();toast('Η εργασία διαγράφηκε.')}});
}
function renderClients(){
 const q=$('#clientSearch').value.toLowerCase();
 const list=data.clients.filter(c=>(clientFilter==='all'||c.status===clientFilter)&&`${c.name} ${c.email}`.toLowerCase().includes(q));
 $('#clientList').innerHTML=list.length?list.map(c=>`<article class="client-card"><div class="client-monogram">${escapeHtml(c.initial||c.name[0])}</div><div class="client-info"><strong>${escapeHtml(c.name)}</strong><small>Συναντήσεις: ${c.meetings||0} &nbsp; · &nbsp; Εκκρεμότητες: ${c.tasks||0}</small><small>${escapeHtml(c.email||'')}</small></div><span class="status-pill ${c.status==='prospect'?'prospect':''}">${c.status==='prospect'?'Προοπτικός':'Ενεργός'}</span></article>`).join(''):'<div class="empty-state"><strong>Δεν βρέθηκαν πελάτες.</strong>Πρόσθεσε μια νέα επαφή.</div>';
}
function renderProjects(){
 const list=data.projects.filter(p=>projectFilter==='all'||projectFilter==='progress'&&p.done<p.total||projectFilter==='done'&&p.done===p.total);
 $('#projectList').innerHTML=list.length?list.map((p,i)=>{const percent=Math.round(p.done/p.total*100);return `<article class="project-card"><div class="project-top"><div class="project-icon">${['▧','✦','▤','↗'][i%4]}</div><div><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.client)}</small></div><span class="project-count">${p.done}/${p.total}</span></div><div class="project-progress-meta"><span>Πρόοδος έργου</span><strong>${percent}%</strong></div><div class="project-progress"><span style="width:${percent}%"></span></div><div class="project-progress-meta"><span>◷ ${escapeHtml(greekShort(dateFromIso(p.date)))}</span><span>${percent===100?'Ολοκληρώθηκε':'Σε εξέλιξη'}</span></div></article>`}).join(''):'<div class="empty-state"><strong>Κανένα project σε αυτή την κατηγορία.</strong></div>';
}
function openModal(type){
 const labels={task:'Νέα εργασία',event:'Νέο ραντεβού',client:'Νέος πελάτης',project:'Νέο project'};
 $('#entryType').value=type;$('#modalTitle').textContent=labels[type]||'Νέα καταχώριση';
 $('#modalEyebrow').textContent='DAYFLOW · ΝΕΑ ΚΑΤΑΧΩΡΙΣΗ';
 $('#entryForm').reset();$('#entryDate').value=iso(selectedDate||today);$('#entryTime').value='10:00';
 $('#entryCategory').innerHTML=(type==='event'?['Συνάντηση','Εργασία','Οικονομικά','Προσωπικά']:['Εργασία','Προσωπικά','Συνάντηση','Οικονομικά','Υγεία']).map(x=>`<option>${x}</option>`).join('');
 $('#modalBackdrop').classList.add('open');setTimeout(()=>$('#entryTitle').focus(),120);
}
function closeModal(){$('#modalBackdrop').classList.remove('open')}
$('#entryForm').addEventListener('submit',e=>{
 e.preventDefault();const type=$('#entryType').value,title=$('#entryTitle').value.trim(),date=$('#entryDate').value,time=$('#entryTime').value,description=$('#entryDescription').value.trim();
 if(!title||!date)return;
 if(type==='task')data.tasks.push({id:uid(),title,date,time,priority:$('#entryPriority').value,category:$('#entryCategory').value,description,done:false,status:'today',reminder:$('#entryReminder').value});
 else if(type==='event')data.events.push({id:uid(),title,date,time,category:$('#entryCategory').value,place:description});
 else if(type==='client')data.clients.push({id:uid(),name:title,initial:title[0].toUpperCase(),status:'active',meetings:0,tasks:0,email:description,phone:''});
 else if(type==='project')data.projects.push({id:uid(),name:title,client:description||'Χωρίς πελάτη',done:0,total:1,date,color:'sage'});
 save();closeModal();renderAll();toast('Η καταχώριση αποθηκεύτηκε στη συσκευή σου.');
});
function renderAll(){renderHome();renderCalendar();renderTasks();renderClients();renderProjects()}
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
$$('#clientFilters button').forEach(b=>b.addEventListener('click',()=>{clientFilter=b.dataset.filter;$$('#clientFilters button').forEach(x=>x.classList.toggle('selected',x===b));renderClients()}));
$$('#projectFilters button').forEach(b=>b.addEventListener('click',()=>{projectFilter=b.dataset.filter;$$('#projectFilters button').forEach(x=>x.classList.toggle('selected',x===b));renderProjects()}));
$('#taskSearch').addEventListener('input',renderTasks);$('#clientSearch').addEventListener('input',renderClients);$('#clearSearch').addEventListener('click',()=>{$('#taskSearch').value='';renderTasks()});
$('#themeSelect').addEventListener('change',e=>{document.body.classList.remove('theme-olive','theme-burgundy');if(e.target.value!=='forest')document.body.classList.add('theme-'+e.target.value);localStorage.setItem('dayflow-theme',e.target.value)});
$('#compactToggle').addEventListener('change',e=>document.body.classList.toggle('compact-mode',e.target.checked));
$('#exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='dayflow-backup.json';a.click();URL.revokeObjectURL(url);toast('Το αντίγραφο ετοιμάστηκε.')});
$('#importInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const incoming=JSON.parse(await f.text());if(!incoming.tasks||!incoming.events||!incoming.clients||!incoming.projects)throw Error();data=incoming;save();renderAll();toast('Τα δεδομένα εισήχθησαν.')}catch{toast('Το αρχείο δεν είναι έγκυρο αντίγραφο DayFlow.')}e.target.value=''});
$('#resetBtn').addEventListener('click',()=>{if(confirm('Να επανέλθουν τα αρχικά demo δεδομένα;')){data=seed();save();renderAll();toast('Τα demo δεδομένα επανήλθαν.')}});
$('#notificationsBtn').addEventListener('click',()=>toast('Οι υπενθυμίσεις ρυθμίζονται από τη συσκευή σου.'));
$('#profileBtn').addEventListener('click',()=>toast('Το προσωπικό προφίλ θα προστεθεί σε επόμενη έκδοση.'));
const savedTheme=localStorage.getItem('dayflow-theme');if(savedTheme){$('#themeSelect').value=savedTheme;if(savedTheme!=='forest')document.body.classList.add('theme-'+savedTheme)}
renderAll();
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
