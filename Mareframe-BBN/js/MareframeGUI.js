MareFrame.DST.GUIHandler = function() {
	var editorMode = false;
	var canvas = new createjs.Stage("MCATool");
	var stage = new createjs.Container();
	var googleColors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"];
	var hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, canvas.canvas.width, canvas.canvas.height));

	hitArea.name = "hitarea";
	if (editorMode)
		hitArea.addEventListener("pressmove", pressMove);

	hitArea.addEventListener("mousedown", mouseDown);


	canvas.addChild(hitArea);
	canvas.addChild(stage);
	h.setGUI(this);

	var update = true;
	var chartsLoaded = false;
	var oldX = 0;
	var oldY = 0;
	var selectedItems = [];

	var finalScoreChart = new google.visualization.ColumnChart(document.getElementById('finalScore_div'));
	var finalScoreChartOptions = {
		width : 1024,
		height : 400,
		vAxis : {
			minValue : 0
		},
		legend : {
			position : 'top',
			maxLines : 3
		},
		bar : {
			groupWidth : '75%'
		},
		animation : {
			duration : 500,
			easing : "out",
		},
		isStacked : true,
		focusTarget : 'category',

	};

	if (!editorMode) {
		$(".header-bar").hide();
		$("#reset").hide();
	}
	if (editorMode) {
		$(".header-bar").show();
	}
	var elementColors = [["#efefff", "#15729b", "#dfdfff"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#fff6e0", "#f6a604", "#fef4c6"], ["#efffef", "#2fc433", "#dfffdf"]];

	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(60);

	//modify element and connection classes to contain createjs.Container object
	MareFrame.DST.Element.easelElmt = 0;
	MareFrame.DST.Element.prototype.setID = function(i) {
		this.setId(i);
		this.easelElmt.name = i;
		update = true;
	}

	this.setSize = function(x, y) {
		canvas.canvas.width = x;
		canvas.canvas.height = y;
	}

	this.updateElement = function(elmt) {
		elmt.easelElmt.removeAllChildren();

		var shape = new createjs.Shape();
		var mshape = shape.graphics.f(elementColors[elmt.getType()][0]).s(elementColors[elmt.getType()][1]);
		switch (elmt.getType()) {
		case 0:
			//Chance
			mshape.drawEllipse(0, 0, 150, 30);
			break;
		case 1:
			//Decision
			mshape.drawRect(0, 0, 150, 30)
			break;
		case 2:
			//Value
			mshape.drawRoundRect(0, 0, 150, 30, 4);
			break;
		default:
			break;
		}

		var label = new createjs.Text(elmt.getName().substr(0, 24), "1em trebuchet", elementColors[elmt.getType()][1]);
		label.textAlign = "center";
		label.textBaseline = "middle";
		label.maxWidth = 145;
		label.x = 75;
		label.y = 15;

		elmt.easelElmt.addChild(shape);
		elmt.easelElmt.addChild(label);
	}

	this.updateEditorMode = function() {
		if (editorMode) {
			$(".header-bar").show();
			$("#reset").show();
			hitArea.addEventListener("pressmove", pressMove);
		} else {
			$(".header-bar").hide();
			$("#reset").hide();
			$("#cnctTool").attr("checked", false);
			hitArea.removeEventListener("pressmove", pressMove);
		}
		var elementArr = h.getActiveModel().getElementArr();
		for (var i = 0; i < elementArr.length; i++) {
			if (editorMode) {
				elementArr[i].easelElmt.addEventListener("pressmove", pressMove);
			} else {
				elementArr[i].easelElmt.removeEventListener("pressmove", pressMove);
			}
		}

	}

	this.setEditorMode = function(cb) {
		editorMode = cb.checked;
		this.updateEditorMode();
		console.log("editormode: " + editorMode);
	}

	this.addElementToStage = function() {

		console.log("adding element to stage");
		var elmt = h.getActiveModel().CreateNewElement();

		elmt.easelElmt = new createjs.Container();

		this.updateElement(elmt);

		elmt.easelElmt.regX = 75;
		elmt.easelElmt.regY = 15;
		elmt.easelElmt.x = 225;
		elmt.easelElmt.y = 125;
		if (editorMode) {
			elmt.easelElmt.addEventListener("pressmove", pressMove);
		}
		elmt.easelElmt.addEventListener("mousedown", mouseDown);
		elmt.easelElmt.on("dblclick", dblClick);
		elmt.easelElmt.mouseChildren = false;
		elmt.easelElmt.name = elmt.getID();

		stage.addChild(elmt.easelElmt);

		pause(1);
		update = true;
		return elmt;
	}
	function dblClick(e) {
		if (e.target.name.substr(0, 4) === "elmt") {
			h.gui.populateElmtDetails(e.target.name);
			if (editorMode) {
				$("#submit").show();
			} else {
				$("#submit").hide();
			}
			$("#detailsDialog").dialog("open");

		}
	}


	this.populateElmtDetails = function(elmtID) {

		var elmt = h.getActiveModel().getElement(elmtID);

		//console.log(elmt)
		//set dialog title
		$("#detailsDialog").dialog({
			title : elmt.getName()
		});

		//Store element that opened the dialog
		$("#detailsDialog").data("element", elmt);

		// console.log("data: " + elmt.getData());
		// console.log("string: " + this.htmlTableFromArray("Definition", elmt.getData()));

		var s = this.htmlTableFromArray("Definition", elmt);
		$("#defTable_div").html(s);
		$("#defTable_div").show();
		if (editorMode) {
			this.addEditFunction();
		}

		//set description
		document.getElementById("description_div").innerHTML = elmt.getDescription();
		$("#description_div").show();
		if (elmt.isUpdated()) {
			$("#values").prop('disabled', false);
		} else {
			$("#values").prop('disabled', true);
		}

	}

	this.addEditFunction = function() {
		$(function() {

			$("td").dblclick(function() {
				var originalValue = $(this).text();
				$(this).addClass("editable");
				$(this).html("<input type='text' value='" + originalValue + "' />");
				$(this).children().first().focus();
				$(this).children().first().keypress(function(e) {
					if (e.which == 13) {
						var newText = $(this).val();
						if (isNaN(newText)) {
							alert("Value must be a number");
							//TODO find better solution than alert

							$(this).parent().text(originalValue);
						} else {
							$(this).parent().text(newText);
						}

						$(this).parent().removeClass("editable");
					}
				});
				$(this).children().first().blur(function() {
					var newText = $(this).val();
					$(this).parent().text(newText);
					if (isNaN(newText)) {
						alert("Value must be a number");
						//TODO find better solution than alert

						$(this).parent().text(originalValue);
					} else {
						$(this).parent().text(newText);
					}
					$(this).parent().removeClass("editable");
				});
			});
			//TODO Prevent user from editing the top rows. That data should come from the child elements
			$("th").dblclick(function() {
				var originalText = $(this).text();
				$(this).addClass("editable");
				$(this).html("<input type='text' value='" + originalText + "' />");
				$(this).children().first().focus();
				$(this).children().first().keypress(function(e) {
					if (e.which == 13) {
						var newText = $(this).val();
						$(this).parent().text(newText);
						$(this).parent().removeClass("editable");
					}
				});
				$(this).children().first().blur(function() {
					var newText = $(this).val();
					$(this).parent().text(newText);
					$(this).parent().removeClass("editable");
				});
			});
		});
	}
	this.showValues = function() {
		var elmt = $("#detailsDialog").data("element");
		$("#valuesTable_div").html(this.htmlTableFromArray("Values", elmt));
		$("#valuesTable_div").show();
		$("#values").prop('disabled', true);
	}

	$("#detailsDialog").on('dialogclose', function(event) {
		$("#valuesTable_div").hide();
	});

	this.saveDefTable = function() {
		var elmt = $("#detailsDialog").data("element");
		var table = $("#defTable_div");
		var newTable = [];
		var newRow = [];
		table.find("tr").each(function() {
			$(this).find("th,td").each(function() {
				// console.log("text to be added: " + $(this).text());
				// console.log("does it exsist: " + $.inArray($(this).text(), newRow) === -1)
				var value = $(this).text();
				//Don't add the same value twice if it is in one of the header cells
				//(Better solution: check before the text is saved in the cell)
				if ($.inArray(value, newRow) === -1 || !isNaN(value)) {	
					//Convert to number
					if (!isNaN(value)) {
						value = Number(value);
					}
					newRow.push(value);
				}
			});
			newTable.push(newRow);
			newRow = [];
		});
		//Remove header row with title the "Definition"
		newTable.splice(0, 1);
		if (!this.columnSumsAreValid(newTable, elmt.numOfHeaderRows()) && elmt.getType() == 0) {
			//Should also show which row is unvalid (maybe right after the user has changed the value)
			alert("The values in each column must add up to 1");
		} else {
			elmt.setData(newTable);
			elmt.setUpdated(false);
			//TODO set all elements which are affected by this change to updated = false
		}
		console.log("new table after submit:");
		console.log(elmt.getData());

	}

	this.columnSumsAreValid = function(data, numOfHeaderRows) {
		var sum = 0;
		for (var i = 1; i < data[data.length - 1].length; i++) {
			for (var j = numOfHeaderRows; j < data.length; j++) {
				sum += parseFloat(data[j][i]);
			}
			if (sum < 0.9999 || sum > 1.0001) {
				return false;
			}
			sum = 0;
		}
		return true;
	}

	function downValFnCP(e) {
		oldX = e.stageX;
		oldY = e.stageY;
	}

	function mouseDown(e) {
		//console.log("mouse down at: ("+e.stageX+","+e.stageY+")");
		oldX = e.stageX;
		oldY = e.stageY;
		//console.log("target is: " + e.target);
		//console.log("cnctool options: "+$("#cnctTool").button("option","checked"));
		if (e.target.name.substr(0, 4) === "elmt") {
			if (document.getElementById("cnctTool").checked)//check if connect tool is enabled
			{
				//console.log("cnctTool enabled");
				h.gui.connectTo(e);
			} else {
				h.gui.select(e);
			}
		} else {
			h.gui.clearSelection();
		}
	}


	this.select = function(e) {
		//console.log("ctrl key: " + e.nativeEvent.ctrlKey);
		if (!e.nativeEvent.ctrlKey && selectedItems.indexOf(e.target) === -1) {
			h.gui.clearSelection();
		}
		//console.log("adding to selection");
		h.gui.addToSelection(e.target);
	}
	function pressMove(e) {
		//console.log("press move");

		if (e.target.name === "hitarea") {
			//console.log("panning");
			stage.x += e.stageX - oldX;
			stage.y += e.stageY - oldY;
		} else if (e.target.name.substr(0, 4) === "elmt") {
			selectedItems.forEach(function(elmt) {
				elmt.x += e.stageX - oldX;
				elmt.y += e.stageY - oldY;
				h.getActiveModel().getElement(elmt.name).getConnections().forEach(function(c) {
					h.gui.updateConnection(c)
				});
			});

		}
		oldX = e.stageX;
		oldY = e.stageY;
		update = true;
	}

	function tick() {
		if (update) {
			update = false;
			canvas.update();
		}
	}


	this.clear = function() {
		stage.removeAllChildren();
		update = true;
	}

	this.importStage = function() {
		stage.removeAllChildren();
		this.importStageElements();
		this.importStageConnections();
	}
	this.importStageElements = function() {
		h.getActiveModel().getElementArr().forEach(function(e) {
			stage.addChild(e.easelElmt);
		});
		update = true;
	}
	this.importStageConnections = function() {
		//TODO: make this.
		update = true;
	}

	this.connectTo = function(evt) {
		var elmtIdent = evt.target.name;
		var connected = false;
		//console.log("attempting connection "+elmtIdent);
		h.gui.getSelected().forEach(function(e) {
			if (e.name.substr(0, 4) === "elmt" && e.name !== elmtIdent) {
				var outputElmt = h.getActiveModel().getElement(elmtIdent);
				var c = new MareFrame.DST.Connection(h.getActiveModel().getElement(e.name), outputElmt);
				if (h.getActiveModel().addConnection(c)) {
					h.gui.addConnectionToStage(c);
					connected = true;
				}
				if (outputElmt.getType() !== 1){
					outputElmt.updateData();
				}
				//console.log("connection: " + c);
				pause(1);

			}
		});
		if (!connected) {
			h.gui.select(evt);
		}
		//this.select(elmtIdent);
	}

	this.addConnectionToStage = function(c) {
		
		var line = new createjs.Graphics().beginStroke(c.getColor()).mt(c.getInput().easelElmt.x, c.getInput().easelElmt.y).lt(c.getOutput().easelElmt.x, c.getOutput().easelElmt.y);
		var conn = new createjs.Shape(line);
		var arrow = new createjs.Graphics().beginFill(c.getColor()).mt(-5, 0).lt(5, 5).lt(5, -5).cp();
		var arrowCont = new createjs.Shape(arrow);
		var cont = new createjs.Container();
		//console.log(arrowCont);
		arrowCont.x = ((c.getInput().easelElmt.x - c.getOutput().easelElmt.x) / 2) + c.getOutput().easelElmt.x;
		arrowCont.y = ((c.getInput().easelElmt.y - c.getOutput().easelElmt.y) / 2) + c.getOutput().easelElmt.y;
		arrowCont.rotation = (180 / Math.PI) * Math.atan((c.getInput().easelElmt.y - c.getOutput().easelElmt.y) / (c.getInput().easelElmt.x - c.getOutput().easelElmt.x));
		if (c.getInput().easelElmt.x < c.getOutput().easelElmt.x) {
			arrowCont.rotation = 180 + arrowCont.rotation;
		}
		cont.hitArea = new createjs.Graphics().setStrokeStyle(10).beginStroke("#0f0f0f").mt(c.getInput().easelElmt.x, c.getInput().easelElmt.y).lt(c.getOutput().easelElmt.x, c.getOutput().easelElmt.y);
		cont.name = c.getID();
		//conn.addEventListener("pressmove", pressMove);
		//cont.addEventListener("mousedown", mouseDown);
		cont.addChild(arrowCont);
		cont.addChild(conn);

		stage.addChildAt(cont, 0);
		c.easelElmt = cont;
		update = true;

	}

	this.updateConnection = function(c) {
		//stage.removeChild(c.easelElmt);
		c.easelElmt.getChildAt(1).graphics.clear().beginStroke(c.getColor()).mt(c.getInput().easelElmt.x, c.getInput().easelElmt.y).lt(c.getOutput().easelElmt.x, c.getOutput().easelElmt.y);
		c.easelElmt.getChildAt(0).x = ((c.getInput().easelElmt.x - c.getOutput().easelElmt.x) / 2) + c.getOutput().easelElmt.x;
		c.easelElmt.getChildAt(0).y = ((c.getInput().easelElmt.y - c.getOutput().easelElmt.y) / 2) + c.getOutput().easelElmt.y;
		c.easelElmt.getChildAt(0).rotation = (180 / Math.PI) * Math.atan((c.getInput().easelElmt.y - c.getOutput().easelElmt.y) / (c.getInput().easelElmt.x - c.getOutput().easelElmt.x));
		if (c.getInput().easelElmt.x < c.getOutput().easelElmt.x) {
			c.easelElmt.getChildAt(0).rotation = 180 + c.easelElmt.getChildAt(0).rotation;
		}
		//stage.addChildAt(c.easelElmt, 0);
		update = true;
	}

	this.addToSelection = function(e) {
		if (selectedItems.indexOf(e) === -1 && e.name.substr(0, 4) === "elmt") {
			selectedItems.push(e);
			var type = h.getActiveModel().getElement(e.name).getType();
			//console.log(e);
			var shape = e.getChildAt(0).graphics.clear().f(elementColors[type][2]).s(elementColors[type][1]);
			update = true;

			switch (type) {
			case 0:
				//Chance
				shape.drawEllipse(0, 0, 150, 30);
				break;
			case 1:
				//Decision
				shape.drawRect(0, 0, 150, 30)
				break;
			case 2:
				//Value
				shape.drawRoundRect(0, 0, 150, 30, 4);
				break;
			}
		}
	}
	this.setSelection = function(e) {
		clearSelection();
		addToSelection(e);
	}

	this.getSelected = function() {
		return selectedItems;
	}

	this.clearSelection = function() {
		console.log(selectedItems);
		selectedItems.forEach(function(e) {

			var type = h.getActiveModel().getElement(e.name).getType();
			var shape = e.getChildAt(0).graphics.clear().f(elementColors[type][0]).s(elementColors[type][1]);
			switch (type) {
			case 0:
				//Chance
				shape.drawEllipse(0, 0, 150, 30);
				break;
			case 1:
				//Decision
				shape.drawRect(0, 0, 150, 30)
				break;
			case 2:
				//Value
				shape.drawRoundRect(0, 0, 150, 30, 4);
				break;
			}

		});
		selectedItems = [];
		update = true;
	}
	this.htmlTableFromArray = function(header, elmt) {
		if (header === "Definition") {
			var data = elmt.getData();
			var numOfHeaderRows = elmt.numOfHeaderRows();
		} else if (header === "Values") {
			var data = elmt.getValues();
			var numOfHeaderRows = elmt.numOfDecisions();
		}
		console.log("data for html for " + header + " in " + elmt.getName());
		console.log(data);
		
		var htmlString = "";
		if (data[0] !== undefined) {
			htmlString += "<tr><th style='text-align:center' colspan=\"" + data[0].length + "\">" + header + " </th></tr>";
		} else {
			htmlString += "<tr><th style='text-align:center'>" + header + " </th></tr>";
		}
		for (var i = 0; i < numOfHeaderRows; i++) {
			htmlString += "<tr>";
			for (var j = 0; j < (data[0].length); j++) {
				htmlString += "<th>" + data[i][j] + "</th>";
			}
			htmlString += "</tr>";
		}
		for (var i = numOfHeaderRows; i < data.length; i++) {
			htmlString += "<tr>";
			for (var j = 0; j < (data[0].length); j++) {
				if (j === 0) {
					htmlString += "<th>" + data[i][j] + "</th>";
				} else {
					htmlString += "<td>" + this.round((data[i][j])) + "</td>";
				}

			}
			htmlString += "</tr>";
		}
		console.log("html table: " + htmlString);
		return htmlString;
	}

	this.round = function(numb) {
		return Number(Math.round(numb + "e3")+"e-3");
	}
}