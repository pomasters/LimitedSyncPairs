function screenshot() {

	var capture = document.getElementById('capture');

	if(parseInt(Array.from(document.getElementsByClassName("syncpair")).length) != parseInt(Array.from(document.getElementsByClassName("selected")).length)) {
		document.getElementById('linkTool').classList.remove("hide");
		document.getElementById('credits').classList.add("hide");
	} else {
		document.getElementById('count').classList.add("hide");
	}

	html2canvas(capture,{backgroundColor:null,windowWidth:1920,windowHeight:1080,allowTaint:true,useCORS:true}).then(canvas => {

		canvas.toBlob((blob) => {
			var newImg = document.createElement('img');
			var url = URL.createObjectURL(blob);

			newImg.src = url;

			var link = document.createElement("a");
			link.download = "limitedSyncPairs.png";
			link.href = url;
			link.target = '_blank';
			link.innerHTML = "Download";

			document.getElementById("screenshot").classList.remove("hide");
			document.getElementById("screenshot").innerHTML = "<p>Your image :</p>";
			document.getElementById("screenshot").appendChild(link);
			document.getElementById("screenshot").appendChild(newImg);
		});

		if(parseInt(Array.from(document.getElementsByClassName("syncpair")).length) != parseInt(Array.from(document.getElementsByClassName("selected")).length)) {
			document.getElementById('linkTool').classList.add("hide");
			document.getElementById('credits').classList.remove("hide");
		} else {
			document.getElementById('count').classList.remove("hide");
		}
	});
}



function saveCurrentSelection() {
	var selected = [];

	Array.from(document.getElementsByClassName("selected")).forEach(e => selected.push(e.src));

	localStorage.setItem("selectedLimitedSyncPairs", selected.join(",,,"));
}


function loadCurrentSelection() {
	var selected = [];

	if(localStorage.getItem("selectedLimitedSyncPairs") !== null) {

		selected = localStorage.getItem("selectedLimitedSyncPairs").split(",,,");

		Array.from(document.getElementsByClassName("syncpair")).forEach(function(e) {
			if(selected.includes(e.src)) {
				e.classList.add("selected");
			}
		});
	}

	countSelection();
}


function countSelection() {
	var totalSyncPairs = parseInt(Array.from(document.getElementsByClassName("syncpair")).length);
	var allSelected = parseInt(Array.from(document.getElementsByClassName("selected")).length);

	document.getElementById("count").innerHTML = `${allSelected} / ${totalSyncPairs} &nbsp; (${((allSelected/totalSyncPairs)*100).toFixed(1)}%)`
}


function invertSelection() {
	Array.from(document.getElementsByClassName("syncpair")).forEach(e => e.classList.toggle("selected"));
	saveCurrentSelection();
	countSelection();
}


function resetSelection() {
	Array.from(document.getElementsByClassName("syncpair")).forEach(e => e.classList.remove("selected"));
	localStorage.removeItem("selectedLimitedSyncPairs");
	saveCurrentSelection();
	countSelection()
}


Array.from(document.getElementsByClassName("syncpair")).forEach(e => e.addEventListener("click", function() {
	e.classList.toggle("selected");
	saveCurrentSelection();
	countSelection();
}));


Array.from(document.getElementsByTagName("img")).forEach(e => e.draggable = false);

Array.from(document.getElementsByTagName("img")).forEach(e => e.addEventListener("contextmenu", function(e) { e.preventDefault(); }));


document.getElementById("btn_screenshot").addEventListener("click", screenshot)

document.getElementById("btn_invertSelection").addEventListener("click", invertSelection)

document.getElementById("btn_resetSelection").addEventListener("click", resetSelection)


window.onload = loadCurrentSelection;