import { SYNCPAIRS, VERSION } from "https://pomasters.github.io/SyncPairsTracker/js/syncpairs.js";


const tableContainer = document.getElementById("table-container");
const tableTitle = document.getElementById("table-title");
const counter = document.getElementById("counter");
document.getElementById("version").textContent = VERSION;

const ACQUISITIONORDER = {"spotlight scout / general pool":"01","poké fair scout":"02","master fair scout":"03","seasonal scout":"04","special costume scout":"05","variety scout":"06","main story: pml arc":"07","legendary adventures":"08","event reward":"09","battle points exchange":"10","trainer lodge exchange":"11","mix scout":"12","training ticket exchange":"13","arc suit fair scout":"14","gym scout":"15","ex master fair scout":"16","ex fair scout":"17"};
const ROLEORDER = ["Strike", "Tech", "Support", "Sprint", "Field"];
const savedState = JSON.parse(localStorage.getItem("acquiredPairs") || "{}");


const getKey = p  =>  decodeURIComponent(p.images?.[0]?.split("/").pop() || `${p.trainerName}_${p.pokemonName}`);


function updateCounter() {
    const icons = tableContainer.querySelectorAll(".icon");
    const acquired = tableContainer.querySelectorAll(".icon:not(.not-acquired)").length;
    counter.textContent = `${acquired} / ${icons.length} (${((acquired/icons.length)*100).toFixed(1)}%)`;
}

function normalizeRoles(p) {
    let role = p.syncPairRole;
    if(role?.toLowerCase() === "multi" && p.syncPairRoleEX) role = p.syncPairRoleEX;
    if(role?.toLowerCase().startsWith("strike")) role = "Strike";
    else role = role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : "";
    p.syncPairRole = role;
}

function createTable(pairs) {
    pairs.forEach(normalizeRoles);
    tableContainer.innerHTML = "";

    const table = document.createElement("div");
    table.className = "table";

    const headerRow = document.createElement("div");
    headerRow.className = "row";

    const corner = document.createElement("div");
    corner.className = "label header";
    corner.textContent = "";

    headerRow.appendChild(corner);

    ROLEORDER.forEach(role => {
        const cell=document.createElement("div");
        cell.className = `cell header ${role.toLowerCase()}`;
        cell.innerHTML = `<img src="https://pomasters.github.io/SyncPairsTracker/images/role_${role.toLowerCase()}.png">`;
        headerRow.appendChild(cell);
    });

    table.appendChild(headerRow);

    const acquisitions = [...new Set(pairs.map(p => p.syncPairAcquisition))]
    .sort((a,b) => (ACQUISITIONORDER[a.toLowerCase()]||"99")-(ACQUISITIONORDER[b.toLowerCase()]||"99"));

    acquisitions.forEach(acq => {
        const row = document.createElement("div");
        row.className = "row";

        const label = document.createElement("div");
        label.className = "label";
        label.textContent = acq.replace(" / General Pool", "").replace("Scout","");

        row.appendChild(label);

        ROLEORDER.forEach(role => {
            const cell = document.createElement("div");
            cell.className = `cell ${role.toLowerCase()}`;

            const cellPairs = pairs
            .filter(p => p.syncPairAcquisition===acq && p.syncPairRole===role)
            .sort((a,b) =>  new Date(a.releaseDate) - new Date(b.releaseDate));

            cellPairs.forEach(p => {
                if(p.images?.[0]) {
                    const img = document.createElement("img");
                    img.src = "https://pomasters.github.io/SyncPairsTracker/"+p.images[0];
                    img.alt = img.title = `${p.trainerName} & ${p.pokemonName}`;
                    img.className = "icon";

                    const key = getKey(p);
                    if(!savedState[key]) img.classList.add("not-acquired");

                    img.addEventListener("click", () => {
                        const acquired = !img.classList.toggle("not-acquired");
                        savedState[key] = acquired;
                        localStorage.setItem("acquiredPairs", JSON.stringify(savedState));
                        updateCounter();
                    });
                    cell.appendChild(img);
                }
            });
            row.appendChild(cell);
        });
        table.appendChild(row);
    });
    tableContainer.appendChild(table);
    updateCounter();
}


const tabs = document.querySelectorAll(".tab");
function showTab(tab) {
    tabs.forEach(t => t.classList.remove("active"));

    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add("active");
    const filteredPairs = tab==="limited" ? SYNCPAIRS.filter(p => p.tags?.includes("Limited")) 
    : SYNCPAIRS.filter(p => !p.tags?.includes("Limited"));
    createTable(filteredPairs);

    tableTitle.textContent = tab==="limited" ? "Limited Sync Pairs" : "Non Limited Sync Pairs";
}
tabs.forEach(t => t.addEventListener("click", () => showTab(t.dataset.tab)));
showTab("limited");


function setAllAcquired(acquired) {
    tableContainer.querySelectorAll(".icon").forEach(img => {
        if(acquired) img.classList.remove("not-acquired");
        else img.classList.add("not-acquired");
        const key = decodeURIComponent(img.src.split("/").pop());
        savedState[key] = acquired;
    });
    localStorage.setItem("acquiredPairs", JSON.stringify(savedState));
    updateCounter();
}


document.getElementById("selectAll").addEventListener("click", () => setAllAcquired(true));
document.getElementById("resetAll").addEventListener("click", () => setAllAcquired(false));

document.getElementById("screenshot").addEventListener("click", () => {
    html2canvas(document.getElementById("main"), {width:Math.floor(2500),windowWidth:2500,windowHeight:1000,scrollX:0,scrollY:0}).then(canvas => {
        const link = document.createElement("a");
        link.download = "syncpairs.png";
        link.href = canvas.toDataURL();
        link.click();
    });
});
