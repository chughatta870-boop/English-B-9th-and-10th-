// English B 9th & 10th - App Logic
// M Ijaz GHS 124/NB

const CATEGORY_LABELS = {
  applications: "Applications",
  letters: "Letters",
  essays: "Essays",
  stories: "Stories",
  dialogues: "Dialogues"
};

let state = {
  view: "home",   // home | list | detail
  category: null,
  itemId: null
};

const homeView = document.getElementById("homeView");
const listView = document.getElementById("listView");
const detailView = document.getElementById("detailView");
const listContainer = document.getElementById("listContainer");
const detailTitle = document.getElementById("detailTitle");
const detailBody = document.getElementById("detailBody");
const headerTitle = document.getElementById("headerTitle");
const backBtn = document.getElementById("backBtn");
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");

function showView(name){
  homeView.hidden = name !== "home";
  listView.hidden = name !== "list";
  detailView.hidden = name !== "detail";
  backBtn.hidden = name === "home";
  window.scrollTo(0,0);
}

function goHome(){
  state = { view:"home", category:null, itemId:null };
  headerTitle.innerHTML = "English B <span>9th &amp; 10th</span>";
  closeSearch();
  showView("home");
}

function openCategory(cat){
  state.view = "list";
  state.category = cat;
  state.itemId = null;
  headerTitle.textContent = CATEGORY_LABELS[cat];
  renderList(CONTENT_DATA[cat]);
  showView("list");
}

function renderList(items){
  listContainer.innerHTML = "";
  if(!items.length){
    listContainer.innerHTML = '<li class="no-results">No matching topics found.</li>';
    return;
  }
  items.forEach(item=>{
    const li = document.createElement("li");
    li.textContent = item.title;
    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "\u203A";
    li.appendChild(arrow);
    li.addEventListener("click", ()=> openDetail(state.category, item.id));
    listContainer.appendChild(li);
  });
}

function openDetail(cat, id){
  const item = CONTENT_DATA[cat].find(i=>i.id===id);
  if(!item) return;
  state.view = "detail";
  state.category = cat;
  state.itemId = id;
  headerTitle.textContent = item.title;
  detailTitle.textContent = item.title;
  detailBody.textContent = item.body;
  closeSearch();
  showView("detail");
}

backBtn.addEventListener("click", ()=>{
  if(state.view === "detail"){
    openCategory(state.category);
  } else if(state.view === "list"){
    goHome();
  }
});

document.querySelectorAll(".cat-card").forEach(card=>{
  card.addEventListener("click", ()=> openCategory(card.dataset.cat));
});

// SEARCH
function closeSearch(){
  searchBar.hidden = true;
  searchInput.value = "";
}
searchToggle.addEventListener("click", ()=>{
  searchBar.hidden = !searchBar.hidden;
  if(!searchBar.hidden){
    searchInput.focus();
  }
});
searchInput.addEventListener("input", ()=>{
  const q = searchInput.value.trim().toLowerCase();
  if(!q){
    goHome();
    return;
  }
  // search across all categories
  let results = [];
  Object.keys(CONTENT_DATA).forEach(cat=>{
    CONTENT_DATA[cat].forEach(item=>{
      if(item.title.toLowerCase().includes(q)){
        results.push({...item, category:cat});
      }
    });
  });
  state.view = "list";
  state.category = null;
  headerTitle.textContent = "Search Results";
  listContainer.innerHTML = "";
  if(!results.length){
    listContainer.innerHTML = '<li class="no-results">No matching topics found.</li>';
  } else {
    results.forEach(item=>{
      const li = document.createElement("li");
      li.textContent = item.title + "  \u2014  " + CATEGORY_LABELS[item.category];
      li.addEventListener("click", ()=> openDetail(item.category, item.id));
      listContainer.appendChild(li);
    });
  }
  showView("list");
});

// TOAST
function showToast(msg){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"), 1800);
}

// DOWNLOAD as text file with watermark
document.getElementById("downloadBtn").addEventListener("click", ()=>{
  const item = CONTENT_DATA[state.category]?.find(i=>i.id===state.itemId);
  if(!item) return;
  const content = `${item.title}\n${"=".repeat(item.title.length)}\n\n${item.body}\n\n----------------------------------------\nEnglish B - Class 9th & 10th | Punjab Textbook Board\nM Ijaz - GHS 124/NB\n----------------------------------------`;
  const blob = new Blob([content], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = item.title.replace(/[^a-z0-9]+/gi,"_") + ".txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Downloaded successfully");
});

// COPY
document.getElementById("copyBtn").addEventListener("click", ()=>{
  const item = CONTENT_DATA[state.category]?.find(i=>i.id===state.itemId);
  if(!item) return;
  const content = `${item.title}\n\n${item.body}`;
  navigator.clipboard.writeText(content).then(()=>{
    showToast("Copied to clipboard");
  }).catch(()=>{
    showToast("Copy failed");
  });
});

// INSTALL PROMPT
let deferredPrompt = null;
const installBanner = document.getElementById("installBanner");
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBanner.hidden = false;
});

installBtn?.addEventListener("click", async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBanner.hidden = true;
});

window.addEventListener("appinstalled", ()=>{
  installBanner.hidden = true;
});

// SERVICE WORKER
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("sw.js").catch(err=>{
      console.log("SW registration failed:", err);
    });
  });
}

// INIT
goHome();
