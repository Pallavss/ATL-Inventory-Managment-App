// 🔥 THEME (must be first)
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

// 🔐 MODE
let mode = "user";
let adminPassword = "admin123";

// 🔥 FIREBASE CONFIG (PUT YOURS HERE)
const firebaseConfig = {
  apiKey: "AIzaSyAxnqqWvk3yEIVypghIIigtiWX3yUllU-4",
  authDomain: "atl-inventory-managment.firebaseapp.com",
  projectId: "atl-inventory-managment"
};

// INIT
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let items = [];

// 🔄 LOAD DATA
function loadItems() {
  db.collection("inventory").get().then(snapshot => {
    items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    render();
  });
}

// ➕ ADD ITEM
function addItem() {
  let name = document.getElementById("name").value;
  let working = parseInt(document.getElementById("working").value) || 0;
  let defective = parseInt(document.getElementById("defective").value) || 0;

  if (!name) return;

  db.collection("inventory").add({ name, working, defective })
    .then(loadItems);
}

// ❌ DELETE
function deleteItem(id) {
  db.collection("inventory").doc(id).delete()
    .then(loadItems);
}

// 🔼 UPDATE
function updateQty(id, type, val) {
  let item = items.find(i => i.id === id);
  let newVal = item[type] + val;
  if (newVal < 0) newVal = 0;

  db.collection("inventory").doc(id).update({
    [type]: newVal
  }).then(loadItems);
}

// 🔐 ADMIN LOGIN
function loginAdmin() {
  let pass = prompt("Enter Admin Password:");
  if (pass === adminPassword) {
    mode = "admin";
    document.getElementById("adminPanel").classList.remove("hidden");
    document.getElementById("actionsHeader").classList.remove("hidden");
    render();
  } else {
    alert("Wrong password");
  }
}

// 👤 USER MODE
function switchMode(m) {
  mode = m;
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("actionsHeader").classList.add("hidden");
  render();
}

// 🎨 STATUS COLOR
function getStatusClass(w, d) {
  if (d === 0) return "good";
  if (d < w) return "warn";
  return "bad";
}

// 🧠 RENDER
function render() {
  let table = document.getElementById("inventory");
  let search = document.getElementById("search").value.toLowerCase();

  table.innerHTML = "";

  let totalW = 0, totalD = 0, grand = 0;

  items
    .filter(i => i.name.toLowerCase().includes(search))
    .forEach(item => {
      let total = item.working + item.defective;
      let status = getStatusClass(item.working, item.defective);

      totalW += item.working;
      totalD += item.defective;
      grand += total;

      let row = `<tr class="${status}">
        <td>${item.name}</td>
        <td>${item.working}</td>
        <td>${item.defective}</td>
        <td>${total}</td>`;

      if (mode === "admin") {
        row += `<td>
          <button onclick="updateQty('${item.id}','working',1)">+W</button>
          <button onclick="updateQty('${item.id}','working',-1)">-W</button>
          <button onclick="updateQty('${item.id}','defective',1)">+D</button>
          <button onclick="updateQty('${item.id}','defective',-1)">-D</button>
          <button onclick="deleteItem('${item.id}')">🗑</button>
        </td>`;
      }

      row += "</tr>";
      table.innerHTML += row;
    });

  document.getElementById("totalWorking").innerText = totalW;
  document.getElementById("totalDefective").innerText = totalD;
  document.getElementById("grandTotal").innerText = grand;
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js")
    .then(() => console.log("SW Registered"));
}
// 🚀 START
loadItems();
