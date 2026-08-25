// Add your Google Apps Script Web App URL here after creating the Google Sheet backend.
const API_URL = "https://script.google.com/macros/s/AKfycbwVSoRVxjpRxz5U89v_2YvvwdnM8ckVwQDVMRQOrjVVjmOgLsClhiTKSPVsV_zJY5gwKQ/exec";

const demoStudents = {
  "1VB23PH001": {
    password:"1234",
    name:"Demo Student",
    roll:"01",
    attendance:"92%",
    internal:24,
    assignment:18,
    subjects:[
      {subject:"Pharmacy Practice",internal:24,assignment:18},
      {subject:"Pharmacology",internal:22,assignment:19},
      {subject:"Pharmaceutics",internal:23,assignment:20}
    ],
    tasks:[
      {subject:"Pharmacy Practice",title:"Prescription Audit",due:"30 Aug 2026",instruction:"Complete the assigned prescription audit and submit the report.",url:"#"},
      {subject:"Clinical Pharmacy",title:"ADR Case Assignment",due:"05 Sep 2026",instruction:"Prepare one ADR case report.",url:"#"}
    ],
    announcements:["Check assignment deadlines regularly.","Submit all assignments before the due date."]
  }
};

async function login(usn,password){
  if(API_URL.startsWith("http")){
    const r=await fetch(API_URL+"?action=login&usn="+encodeURIComponent(usn)+"&password="+encodeURIComponent(password));
    if(!r.ok) throw new Error("Unable to connect to server.");
    return await r.json();
  }
  const s=demoStudents[usn];
  return s && s.password===password ? s : null;
}

function safe(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function show(data,usn){
  document.getElementById("studentName").textContent=data.name;
  document.getElementById("studentInfo").textContent="USN: "+usn+" | Roll No: "+(data.roll||"—");
  document.getElementById("internal").textContent=data.internal??"—";
  document.getElementById("assignment").textContent=data.assignment??"—";
  document.getElementById("attendance").textContent=data.attendance??"—";
  document.getElementById("total").textContent=data.total??((Number(data.internal)||0)+(Number(data.assignment)||0));

  document.getElementById("marksBody").innerHTML=(data.subjects||[]).map(s=>
    `<tr><td>${safe(s.subject)}</td><td>${safe(s.internal)}</td><td>${safe(s.assignment)}</td><td>${(Number(s.internal)||0)+(Number(s.assignment)||0)}</td></tr>`
  ).join("");

  document.getElementById("tasks").innerHTML=(data.tasks||[]).map(t=>
    `<div class="task"><h3>${safe(t.title)}</h3><p><b>Subject:</b> ${safe(t.subject)}</p><p><b>Due:</b> ${safe(t.due)}</p><p>${safe(t.instruction)}</p>${t.url?`<a class="submit" href="${safe(t.url)}" target="_blank">Submit Assignment</a>`:""}</div>`
  ).join("");

  document.getElementById("announcements").innerHTML=(data.announcements||[]).map(a=>`<div class="announcement">${safe(a)}</div>`).join("");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("message").textContent="";
}

document.getElementById("loginBtn").onclick=async()=>{
  const usn=document.getElementById("usn").value.trim().toUpperCase();
  const password=document.getElementById("password").value.trim();
  if(!usn||!password){document.getElementById("message").textContent="Please enter both USN and password.";return}
  document.getElementById("message").textContent="Checking...";
  try{
    const data=await login(usn,password);
    if(!data){document.getElementById("message").textContent="Invalid USN or password.";return}
    show(data,usn);
  }catch(e){document.getElementById("message").textContent=e.message}
};

document.getElementById("logoutBtn").onclick=()=>{
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("usn").value="";
  document.getElementById("password").value="";
};
