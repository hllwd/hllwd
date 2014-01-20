/**
 * Created by nicolasmondon on 20/01/14.
 */



var srts = []
	, reader = new FileReader()
	, words = {}
	, total = 0
	, tabMots = []
	, filterWords = {};
var svg = d3.select(".container").append("svg")
	.attr("id", "svg")
	.attr("width", 800)
	.attr("height", 100)
	.style("border", "solid 1px black");

svg.append("svg:rect")
	.attr("x",0)
	.attr("y",0)
	.attr("width", 800)
	.attr("height", 100)
	.style("fill", "#fff");


// Check for the various File API support.
if (window.File && window.FileReader) {
	// Great success! All the File APIs are supported.
	$('#fileinput')[0].addEventListener('change', handleFileSelect, false);
} else {
	alert('The File APIs are not supported in this browser');
}

function handleFileSelect(evt) {
	reader.onload = function(e){
		alert("file loaded");
		manageSrtFile();
	};
	var file = evt.target.files[0]; // FileList object
	// TODO Only process .srt files.
	reader.readAsText(file);
	// txt is contain in reader.result
};

/**
 *
 **/
function manageSrtFile(){
	srts = [];
	words = {};
	total = 0;
	var srtTab = reader.result.replace(/\r/g, "").split("\n");
	for(var ind = 0; ind < srtTab.length; ind++){
		var curLine = srtTab[ ind ];
		if(curLine.match(/-->/)){
			var timeTab = curLine.replace(/ /g, "").split("-->");
			if((ind+1) in srtTab){
				var dialog = srtTab[ ind + 1];
				if((ind+2) in srtTab){
					if(!srtTab[ ind + 2].match(/-->/)){
						dialog += "<br/>";
						dialog += srtTab[ ind + 2];
					}


				}
				srts.push({
					"dialog": dialog,
					"start": getSecondsByTime(timeTab[0]),
					"end": getSecondsByTime(timeTab[1])
				});

				// traitement du texte

				dialog = dialog.replace(/(<([^>]+)>)/ig, " ");
				dialog = dialog.replace(/\./ig, " ");
				dialog = dialog.replace(/\?/ig, " ");
				dialog = dialog.replace(/:/ig, " ");
				dialog = dialog.replace(/-/ig, " ");
				dialog = dialog.replace(/,/ig, " ");
				//dialog = dialog.replace(/'/ig, " ");
				dialog = dialog.replace(/"/ig, " ");
				dialog = dialog.replace("!", " ");
				dialog = dialog.toLowerCase();


				var tabDialog = dialog.split(" ");

				total += tabDialog.length;

				jQuery.each(tabDialog, function(i,d){
					if(d != ""){
						if(d in words){
							words[d]++;
						}else{
							words[d] = 1;
						}
					}
				});
			}
		}
	}
	displayData();
};

function getSecondsByTime(time){
	var timeTab = time.split(":");
	return parseInt(3600*timeTab[0])  + parseInt(60*timeTab[1]) + parseFloat(timeTab[2].replace(",","."));
};


function displayData(){

	var X = d3.scale.linear()
		.domain([0, srts[srts.length-1].end])
		.range([0,800]);

	svg.selectAll(".dialogues").data(srts)
		.enter().append("svg:rect")
		.attr("class", "dialogues")
		.attr("x", function(d){
			return X(d.start);
		})
		.attr("y", 0)
		.attr("width", function(d){
			return X(d.end - d.start);
		})
		.attr("height", 100)
		.attr("fill", "red")
		.on("mouseover", function(d){
			jQuery(".text").html(d.dialog);
		});

	svg.selectAll(".dialogues").data(srts)
		.transition()
		.duration(600)
		.attr("x", function(d){
			return X(d.start);
		})
		.attr("y", 0)
		.attr("width", function(d){
			return X(d.end - d.start);
		})
		.attr("height", 100);

	svg.selectAll(".dialogues").data(srts).exit().remove();


	tabMots = [];
	for(k in words){
		if(!(k in filterWords)){
			tabMots.push({
				mot: k,
				num: words[k]
			})
		}
	}

	tabMots.sort(function(a,b){
		return b.num - a.num;
	});

	jQuery("#totaltotalMots").html(total);
	jQuery("#totalMots").html(tabMots.length);

	var mots = ""
	for(var i=0 ; i <tabMots.length; i++){
		mots += tabMots[i].mot;
		mots += " (" + tabMots[i].num + ")";
		mots += " / ";
	}
	jQuery("#100Mots").html(mots);


	jQuery("#save").click(function(){
		svgenie.save( "svg", {
			name : "film.png"
		});
	});

};

