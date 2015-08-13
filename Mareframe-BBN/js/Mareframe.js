var MareFrame = MareFrame || {};
MareFrame.DST = MareFrame.DST || {};

MareFrame.DST.Handler = function() {
	var modelArr = [];
	var activeModel;
	this.fileHandler = new MareFrame.DST.FileIO();

	console.log("javascript handler");
	this.init = function() {
		console.log("handler init running");
		var loadModel = "scotland";
		//getUrlParameter('model');
		if (loadModel !== null) {
			h.fileHandler.QuickLoad(loadModel);
		} else {
			this.addNewModel();
		}
	}

	this.reset = function() {
		var loadModel = "scotland"//getUrlParameter('model');
		h.fileHandler.QuickLoad(loadModel);
	};

	this.getGUI = function() {
		return gui;
	};
	this.setGUI = function(g) {
		this.gui = g;
	}

	this.getFileIO = function() {
		return fileHandler;
	}

	this.addNewModel = function() {
		var mdl = new MareFrame.DST.Model()
		//modelArr.push(mdl);
		this.setActiveModel(mdl);
		h.gui.clear();
		//console.log(mdl)
		return mdl;
	}

	this.addModel = function(m) {
		modelArr.push(m);
	}

	this.closeModel = function(e) {

	}

	this.setActiveModel = function(m) {
		activeModel = m;
	}

	this.getActiveModel = function() {
		return activeModel;
	}
}

MareFrame.DST.FileIO = function() {
	var LastPath = "";
	this.SaveModel = function(m) {

	}

	this.QuickSave = function() {
		var m = h.getActiveModel();
		var json = JSON.stringify(m);
		localStorage.setItem("temp", json);
	}

	this.QuickLoad = function(model) {
		var path = "";
		switch(model) {
		case "baltic":
			path = "JSON/baltic.json";
			break;
		case "blackSea":
			path = "JSON/blackSea.json";
			break;
		case "cadiz":
			path = "JSON/cadiz.json";
			break;
		case "iceland":
			path = "JSON/iceland.json";
			break;
		case "northSea":
			path = "JSON/northSea.json";
			break;
		case "scotland":
			path = "JSON/scotland.json";
			break;
		case "sicily":
			path = "JSON/sicily.json";
			break;
		default:
			break;
		}
		console.log("localstorage empty");
		console.log(path);
		jQuery.getJSON(path, function(data) {

			console.log(data);
			var mdl = h.addNewModel();
			mdl.fromJSON(data);
		});
	}
}
function pause(milliseconds) {
	var dt = new Date();
	while ((new Date()) - dt <= milliseconds) {/* Do nothing */
	}
}//borrowed code

function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
}//borrowed code


MareFrame.DST.Model = function() {
	var elementArr = [];
	var connectionArr = [];
	var modelName = "untitled";
	var modelPath = "./";
	var modelChanged = true;

	this.update = function() {
		elementArr.forEach(function(elmt) {
			if (true) {//}!elmt.isUpdated()) { Not working yet
				elmt.update();
			}
		})
	}
	this.CreateNewElement = function() {
		var e = new MareFrame.DST.Element();
		elementArr.push(e);
		return e;

	}

	this.getElement = function(id) {
		return elementArr[getElementIndex(id)];
	}
	function getElementIndex(id) {
		var key = 0;
		elementArr.every(function(elm) {
			if (elm.getID() === id)
				return false;
			else {
				key = key + 1;
				return true;
			}
		});
		return key;
	}


	this.getElementByName = function(name) {
		var element;
		elementArr.forEach(function(elm) {
			if (elm.getName() === name) {
				// console.log("found " + elm)
				element = elm;
			}
		});
		return element;
	}

	this.getConnections = function() {
		return connectionArr;
	}

	this.getConnection = function(id) {
		return connectionArr[getConnectionIndex(id)];
	}
	function getConnectionIndex(id) {
		var key = 0;
		connectionArr.every(function(conn) {
			if (conn.getID() === id)
				return false;
			else {
				key = key + 1;
				return true;
			}
		});
		return key;
	}


	this.getElementArr = function() {
		return elementArr;
	}

	this.deleteElement = function(id) {

		h.getActiveModel().getElement(id).deleteAllConnections();

		elementArr.splice(getElementIndex(id), 1);
	}

	this.setName = function(n) {
		modelName = n;
	}

	this.getName = function() {
		return modelName;
	}

	this.addConnection = function(c) {
		var validConn = true;
		connectionArr.forEach(function(conn) {

			if (conn === c) {
				validConn = false;
			} else if ((c.getOutput().getID() === conn.getOutput().getID() && c.getInput().getID() === conn.getInput().getID()) || (c.getOutput().getID() === conn.getInput().getID() && c.getInput().getID() === conn.getOutput().getID())) {
				validConn = false;
			}
		});
		if (validConn) {
			connectionArr.push(c);

			c.getInput().addConnection(c);
			c.getOutput().addConnection(c);
			return true;
		} else {
			return false;
		}
	}

	this.toJSON = function() {
		return {
			elements : elementArr,
			connections : connectionArr,
			mdlName : modelName
		};
	}

	this.fromJSON = function(jsonElmt) {
		console.log("fromJSON");
		$("#modelHeader").html(jsonElmt.mdlName);

		console.log($("#model_header").html());
		var header = $("#model_header").html();
		//Only append if model name has not been added
		if (header.indexOf(">", header.length - 1) !== -1) {
			$("#model_header").append(jsonElmt.mdlName);
		}

		modelName = jsonElmt.mdlName;

		var maxX = 0;
		var maxY = 0;

		jsonElmt.elements.forEach(function(elmt) {
			var e = h.gui.addElementToStage();
			e.fromJSON(elmt);

			h.gui.updateElement(e);
			if (elmt.posX > maxX)
				maxX = elmt.posX;

			if (elmt.posY > maxY)
				maxY = elmt.posY;

		});

		jsonElmt.connections.forEach(function(conn) {
			var inpt = h.getActiveModel().getElement(conn.connInput);
			var c = new MareFrame.DST.Connection(inpt, h.getActiveModel().getElement(conn.connOutput));
			c.fromJSON(conn);
			if (h.getActiveModel().addConnection(c)) {
				h.gui.addConnectionToStage(c);
			}
		});

		//Update data
		this.getElementArr().forEach(function(elmt) {
			elmt.update();
		})

		h.gui.setSize(maxX + 80, maxY + 20);
	}
}

MareFrame.DST.Element = function() {
	var data = [];
	var id = "elmt" + new Date().getTime();
	var name = "Element";
	var description = "write description here";
	var type = 0
	var connections = [];
	var values = [];
	var updated = false;

	this.getData = function() {
		return data;
	}
	this.setData = function(d) {
		data = d;
	}

	this.getID = function() {
		return id;
	}
	this.setId = function(i) {
		id = i;
	}
	this.getName = function() {
		return name;
	}
	this.setName = function(n) {
		name = n;
	}
	this.getDescription = function() {
		return description;
	}
	this.setDescription = function(d) {
		description = d;
	}
	this.getType = function() {
		return type;
	}
	this.setType = function(t) {
		type = t;
	}
	this.getValues = function() {
		return values;
	}
	this.setValues = function(v) {
		values = v;
	}
	this.isUpdated = function() {
		return updated;
	}
	this.setUpdated = function(b) {
		updated = b;
	}

	this.deleteConnection = function(id) {
		var key = 0;
		this.connections.every(function(elm) {
			if (elm.getID() === id)
				return false;
			else {
				key = key + 1;
				return true;
			}
		});
		connections[key];

		connections.splice(key, 1);

	}
	this.deleteAllConnections = function() {
		connections.forEach(function(c) {
			c.deleteThis(this.id);
		});

		connections = [];
	}
	this.addConnection = function(e) {
		connections.push(e);
	}
	this.getConnections = function() {
		return connections;
	}
	this.update = function() {
		if (this.getType() !== 1) {//Definition table in decision nodes does not rely on parents
			this.updateData();
		}
		this.calculateValues();
		this.setUpdated(true);
	}
	this.getParentElements = function() {
		var elmt = this;
		var parents = [];
		this.getConnections().forEach(function(c) {
			if (c.getOutput().getName() === elmt.getName()) {
				parents.push(c.getInput());
			}
		})
		//console.log(elmt.getName() + " parents: " + parents);
		return parents;

	}
	this.getHighest = function(array) {
		// console.log("finding highest in " + array)
		highest = Number.NEGATIVE_INFINITY;
		array.forEach(function(v) {
			if (v > highest) {
				highest = v;
			}
		})
		// console.log("higest " + highest)
		return highest;
	}
	this.numOfDecisions = function() {
		var values = this.getValues();
		var counter = 0;
		for (var i = 0; i < values.length; i++) {
			//if the cell in column 2 contains text it is a header row and must be a decision
			if (isNaN(values[i][1])) {
				counter++;
			}
		}
		return counter;
	}
	this.copyDefArray = function() {
		var data = this.getData();
		var valueArray = [];

		for (var i = 0; i < data.length; i++) {
			valueArray[i] = [];
			for (var j = 0; j < data[0].length; j++) {
				valueArray[i].push(data[i][j]);
			}
		}
		return valueArray;
	}
	this.getValueWithCondition = function(rowElmt, conditionArray) {
		// console.log("getting value " + rowElmt + " with condition " + conditionArray + " from " + this.getName());
		var values = this.getValues();
		// console.log("values table : \n " + values);
		var valuesFound = [];
		//First find the right row
		for (var i = 0; i < values.length; i++) {
			// console.log("comparing " + values[i][0] + " against " + rowElmt)
			if (values[i][0] === rowElmt) {
				// console.log("row found")
				//Then find the right column
				for (var j = 1; j < values[0].length; j++) {
					var rightColumn = true;
					var decArray = math.flatten(getColumn(values, j));
					// console.log("looking in " + decArray)
					conditionArray.forEach(function(condition) {
						//If condition is not found in the column, this is not the right column
						if (decArray.indexOf(condition) === -1) {
							rightColumn = false;
						}
					})
					//If all elements are found in the column return the value
					if (rightColumn) {
						valuesFound.push(values[i][j]);
					}
				}
			}
		}
		// console.log("returned " + valuesFound);
		return valuesFound;
	}
	this.addNewHeaderRow = function(headerRow, table) {
		// console.log("Adding array: " + headerRow)
		var array = headerRow.slice();
		//Convert the array to only contain one of each element
		var newArray = [array[0]];
		for (var i = 1; i < array.length; i++) {
			if (newArray.indexOf(array[i]) === -1) {
				newArray.push(array[i]);
			}
		}
		array = newArray;
		// console.log("to " + table);
		// console.log("number of header rows: " + numOfHeaderRows);
		var newTable = [];
		var numOfDiffValues = array.length - 1;
		// console.log("numOfDiffValues " + numOfDiffValues)
		if (table[0] !== undefined) {
			var rowLength = table[0].length - 1;
			//For each row
			for (var i = 0; i < table.length; i++) {
				//For each different value in new header row
				for (var n = 0; n < numOfDiffValues - 1; n++) {
					var newRow = table[i];
					//For each column
					for (var j = 1; j <= rowLength; j++) {
						//Add the value
						newRow.push(table[i][j]);
						// console.log("adding " + table[i][j]);
					}
				}
				// console.log("new row number " + i + ": " + newRow)
				newTable.push(newRow);
			}
		} else {//This is the first row to be added
			rowLength = 1;
		}
		//Add the new row of variables
		var newRow = [array[0]];
		array.splice(0, 1);
		for (var j = 0; j < numOfDiffValues; j++) {
			for (var i = 0; i < rowLength; i++) {
				newRow.push(array[j]);
			}
		}
		// console.log("new header row: " + newRow);
		//Add the new row to the table
		newTable.splice(this.numOfHeaderRows() - 1, 0, newRow);
		// console.log("new table: " + newTable)
		return newTable;
	}
	this.updateData = function() {
		console.log("updateData " + this.getName());
		var originalData = this.getData();
		var newData = this.updateHeaderRows(originalData);
		this.setData(newData);
	}
	this.updateHeaderRows = function(originalData) {
		// console.log("updating header rows")
		var element = this;
		var data = []
		this.getParentElements().forEach(function(elmt) {
			console.log("Parent: " + elmt.getName());
			data = element.addNewHeaderRow(elmt.getMainValues(), data);
		})
		//Add original values to the table
		for (var i = this.numOfHeaderRows(); i < originalData.length; i++) {
			// console.log("i: " + i);
			// console.log("new data: " + originalData[i]);
			data.push(originalData[i]);
		}
		return data;
	}
	this.calculateValues = function() {
		var model = h.getActiveModel();
		if (this.getType() !== 1) {//If its a chance or value node
			// console.log("calculate valeus for " + this.getName());
			var element = this;
			var data = this.getData();
			var headerRows = [];
			var takenIntoAccount = [];
			var newValues = getMatrixWithoutHeader(data);
			this.getParentElements().forEach(function(elmt) {
				if (elmt.getType() === 0) {//If Parent is a chance
					takenIntoAccount.push(elmt) //The parents which already have been evaluated
					var submatrices = element.createSubMatrices(newValues, takenIntoAccount);
					//Parent must be updated
					if (!elmt.isUpdated()) {
						elmt.update();
					}
					var parentValuesMatrix = getMatrixWithoutHeader(elmt.getValues());
					//For each submatrix calculate new values
					var result = makeSureItsAnArray([math.multiply(submatrices[0], parentValuesMatrix)]);
					for (var i = 1; i < submatrices.length; i++) {
						result.push(makeSureItsAnArray(math.multiply(submatrices[i], parentValuesMatrix)));
					}
					newValues = concatMatrices(result);
				} else if (elmt.getType() === 1) {//If Parent is a decision
					headerRows = element.addNewHeaderRow(elmt.getMainValues(), headerRows)
				}
			})
			newValues = convertToArray(newValues);
			// console.log(newValues)
			if (newValues[0][0] === undefined) {//It's one dimensional
				// console.log("one-dimensional")
				newValues.unshift(data[this.numOfHeaderRows()][0]);
			} else {
				for (var i = 0; i < newValues.length; i++) {
					// console.log("unshifting " + newValues[i])
					newValues[i].unshift(data[i + this.numOfHeaderRows()][0]);
				}
			}
			if (headerRows.length > 0) {//If there have been added header rows
				headerRows.push(newValues);
				newValues = headerRows;
			}
			// console.log("new values: " + newValues)
			this.setValues(newValues);
		} else {//If it is a decision node
			this.setValues(this.updateHeaderRows(this.copyDefArray()));
			var values = this.getValues();
			//Number of header rows is equal to number of rows in values minus number of rows in deftinition
			var numOfHeaderRows = values.length - this.getData().length;
			//If there are no header rows add an empty column for the values
			if (numOfHeaderRows === 0) {
				for (var i = 0; i < values.length; i++) {
					values[i].push([]);
				}
			}
			//For each value row
			for (var i = numOfHeaderRows; i < values.length; i++) {
				//For each values column
				for (var j = 1; j < values[0].length; j++) {
					if (numOfHeaderRows !== 0) {
						//Get the conditions for this value
						var conditions = math.flatten(getColumn(values, j));
						var range = math.range(0, numOfHeaderRows - 1);
						conditions = math.subset(conditions, math.squeeze(range))
					} else {
						conditions = [];
					}
					conditions.push(values[i][0]);
					var value = 0;
					//For each value node in the model
					model.getElementArr().forEach(function(elmt) {
						if (elmt.getType() === 2) {
							//If the node is not updated, update
							if (!elmt.isUpdated()) {
								elmt.update();
							}
							//Sum values that meet the conditions
							var valueArray = elmt.getValueWithCondition("Value", conditions);
							//If there are several values that meet the condition, use the highest
							value += elmt.getHighest(valueArray);
						}
					})
					values[i][j] = value;
				}
			}
		}
	}
	concatMatrices = function(list) {
		var matrix = list[0];
		for (var i = 1; i < list.length; i++) {
			matrix = math.concat(matrix, list[i]);
		}
		return matrix;
	}
	makeSureItsAnArray = function(value) {
		if (math.size(value).valueOf()[1] === undefined) {
			value = [value];
		}
		return value;
	}
	convertToArray = function(matrix) {
		// console.log("converting to array: " + matrix)
		var rows = math.size(matrix).valueOf()[0];
		var columns = math.size(matrix).valueOf()[1];
		var array = [];
		var newRow = [];
		//For each row
		for (var i = 0; i < rows; i++) {
			if (columns === undefined) {//Its one-dimensional
				array.push(math.subset(matrix, math.index(i)));
			} else {
				//For each column
				for (var j = 0; j < columns; j++) {
					newRow.push(math.subset(matrix, math.index(i, j)));
				}
				array.push(newRow);
				newRow = [];
			}
		}
		return array;
	}
	this.createSubMatrices = function(matrix, takenIntoAccount) {
		// console.log("create sub matrix from " + matrix + " for values " + takenIntoAccount[takenIntoAccount.length - 1].getMainValues())
		var data = this.getData();
		// console.log("data: " + data)
		var subMatrices = [];
		var columns = math.size(matrix).valueOf()[1];
		var added = [];
		//For each column
		for (var n = 1; n < columns; n++) {
			//If column has not already been added
			if (added.indexOf(n) === -1) {
				var currentColumn = math.flatten(getColumn(data, n));
				// console.log("current column: " + currentColumn)
				var newMatrix = makeSureItsAnArray(getColumn(matrix, n - 1));
				var matchingColumn = true;
				//Look through the rest of the columns
				for (var i = n + 1; i <= columns; i++) {
					var columnValues = math.flatten(getColumn(data, i));
					//For each header value in column
					for (var j = 0; j < this.numOfHeaderRows(); j++) {
						//If the value is not found this is not a matching column
						if (currentColumn.indexOf(data[j][i]) === -1) {
							// console.log(data[j][i] + " was not found in " + currentColumn)
							matchingColumn = false;
							//But if the value has already been taken into account the column might be a matching column
							takenIntoAccount.forEach(function(elmt) {
								if (elmt.getMainValues()[0] === data[j][0]) {
									matchingColumn = true;
								}
							})
						}
						//If the element was not found in current column nor in takenIntoAccount break out of the loop
						if (!matchingColumn) {
							break;
						}
					}
					//If this column is right, add it to the matrix
					if (matchingColumn) {
						added.push(i);
						var column = makeSureItsAnArray(getColumn(matrix, i - 1));
						newMatrix = math.concat(newMatrix, column)
						// console.log("new matrix:" + newMatrix);
					}
				}
				subMatrices.push(newMatrix);
			}
		}
		// console.log("returned " + subMatrices)
		return subMatrices;
	}
	function getMatrixWithoutHeader(matrix) {
		// console.log("get matrix without header from " + matrix)
		var numOfColumns = math.size(matrix)[1];
		var numOfRows = math.size(matrix)[0];
		// console.log("numOfRows: " + numOfRows + " numOfColumns: " + numOfColumns);
		var newMatrix = [];
		//For each row
		for (var i = 0; i < numOfRows; i++) {
			//If there is a number in column 2 in this row, this is not a header row
			// console.log("i: " + i)
			// console.log("subset: " + math.subset(matrix, math.index(i, 1)));
			if (!(isNaN(math.subset(matrix, math.index(i, 1))))) {
				var row = math.squeeze(getRow(matrix, i));
				// console.log("row " + i+ ": " + row + " length " + row.length)
				range = math.range(1, row.length)
				row = math.subset(row, math.index(math.squeeze(range)))
				if (row.length === undefined) {
					row = [row];
				}
				// console.log(row)
				newMatrix.push(row);
				// console.log("newMatrix: "+ newMatrix)
			}
		}
		// console.log("returned: " + newMatrix)
		return newMatrix;
	}

	function getColumn(matrix, index) {
		console.log("get column " + index + " from " + matrix)
		console.log(matrix)
		var rows = math.size(matrix).valueOf()[0];
		var range = math.range(0, rows);
		// console.log("returned: " + math.subset(matrix, math.index(range, index)))
		return math.subset(matrix, math.index(range, index));
	}

	function getRow(matrix, index) {
		// console.log("get row " + index + " from " + matrix)
		var columns = math.size(matrix).valueOf()[1];
		var range = [];
		for ( n = 0; n < columns; n++) {
			range.push(n);
		}
		return math.subset(matrix, math.index(index, range));
	}

	//returns the different variables (conditions or choices) that belong to the element
	this.getMainValues = function() {
		var row = [];
		var data = this.getData();
		row.push(this.getName());
		for (var i = 0; i < data.length; i++) {
			// console.log("i: " + i);
			// console.log("check data: " + data[i][1]);
			if (!isNaN(parseFloat(data[i][1])) || data[i][1] === undefined) {
				row.push(data[i][0]);
				//console.log("push data " + data[i][0]);
			}
		}
		//console.log("new row: " + row);
		return row;
	}

	this.numOfHeaderRows = function() {
		var data = this.getData();
		var counter = 0;
		for (var i = 0; i < data.length; i++) {
			//if the cell in column 2 contains text or is undefined it is a header row
			if (isNaN(data[i][1]) && data[i][1] !== undefined) {
				counter++;
			}
		}
		return counter;
	}
	this.toJSON = function() {

		return {
			posX : this.easelElmt.x,
			posY : this.easelElmt.y,
			elmtID : this.getID(),
			elmtName : name,
			elmtDesc : this.getDescription(),
			elmtType : this.getType(),
			elmtData : this.getData()
		};
	}
	this.fromJSON = function(jsonElmt) {
		this.easelElmt.x = jsonElmt.posX;
		this.easelElmt.y = jsonElmt.posY;
		this.setID(jsonElmt.elmtID);
		name = jsonElmt.elmtName;
		this.setName(jsonElmt.elmtName);
		this.setDescription(jsonElmt.elmtDesc);
		this.setType(jsonElmt.elmtType);
		this.setData(jsonElmt.defData);
	}
}

MareFrame.DST.Connection = function(eIn, eOut) {
	var inputElement = eIn;
	var outputElement = eOut;
	var id = "conn" + new Date().getTime();
	if (eIn.getType() === 1 && eOut.getType() === 1) {
		var color = "gray";
	} else {
		var color = "black";
	}

	this.getColor = function() {
		return color;
	}
	this.deleteThis = function(calledElement) {
		if (inputElement.getID() === calledElement) {
			outputElement.deleteConnection(id);
		} else {
			inputElement.deleteConnection(id);
		}
	}

	this.getID = function() {
		return id;
	}

	this.setID = function(i) {
		id = i;
	}

	this.setInput = function(e) {
		inputElement = e;
	}

	this.setOutput = function(e) {
		outputElement = e;
	}

	this.getInput = function() {
		return inputElement;
	}

	this.getOutput = function() {
		return outputElement;
	}

	this.toJSON = function() {
		return {
			connInput : inputElement.getID(),
			connOutput : outputElement.getID(),
			connID : id
		};
	}

	this.fromJSON = function(jsonElmt) {
		id = jsonElmt.connID;
	}
}

$(document).ready(function() {
	h = new MareFrame.DST.Handler();

	if (MareFrame.DST.GUIHandler) {
		console.log("guihandler found");
		MareFrame.DST.GUIHandler();
		h.init();
	}

	$("#button").bind("click", function(e) {
	});
});
