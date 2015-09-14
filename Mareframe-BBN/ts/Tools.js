var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var Tools = (function () {
            function Tools() {
            }
            Tools.getValueFn = function (p_xVal, p_posX, p_posY) {
                //var y = 0;
                //var a = posY / ((posX -0.1) * (posX - 100.1)) + 100.1 / ((100.1 - 0.1) * (100.1 - posX));
                //var b = - posY * (0.1 + 100.1) / ((posX - 0.1) * (posX - 100.1)) - 100.1 * (0.1 + posX) / ((100.1 - 0.1) * (100.1 - posX));
                ////y = 0 * (xVal - posX) * (xVal - 1) / ((0 - posX) * (0 - 1)) + posY * (xVal - 0) * (xVal - 1) / ((posX - 0) * (posX - 1)) + 1 * (xVal - 0) * (xVal - posX) / ((1 - 0) * (1 - posX))
                //y =a*(xVal*xVal)+b*xVal+0
                //////console.log("y=" + y);
                //return y;
                var A = 1 - 3 * p_posX + 3 * p_posX;
                var B = 3 * p_posX - 6 * p_posX;
                var C = 3 * p_posX;
                var E = 1 - 3 * p_posY + 3 * p_posY;
                var F = 3 * p_posY - 6 * p_posY;
                var G = 3 * p_posY;
                // Solve for t given x (using Newton-Raphelson), then solve for y given t.
                // Assume for the first guess that t = x.
                var currentT = p_xVal;
                var nRefinementIterations = 50;
                for (var i = 0; i < nRefinementIterations; i++) {
                    var currentX = xFromT(currentT, A, B, C);
                    var currentSlope = slopeFromT(currentT, A, B, C);
                    currentT -= (currentX - p_xVal) * (currentSlope);
                    currentT = Math.max(0, Math.min(currentT, 1));
                }
                var y = yFromT(currentT, E, F, G);
                return y;
                // Helper functions:
                function slopeFromT(t, A, B, C) {
                    var dtdx = 1.0 / (3.0 * A * t * t + 2.0 * B * t + C);
                    return dtdx;
                }
                function xFromT(t, A, B, C) {
                    var x = A * (t * t * t) + B * (t * t) + C * t;
                    return x;
                }
                function yFromT(t, E, F, G) {
                    var y = E * (t * t * t) + F * (t * t) + G * t;
                    return y;
                }
            };
            Tools.getUrlParameter = function (p_sParam) {
                var sPageURL = window.location.search.substring(1);
                var sURLVariables = sPageURL.split('&');
                for (var i = 0; i < sURLVariables.length; i++) {
                    var sParameterName = sURLVariables[i].split('=');
                    if (sParameterName[0] === p_sParam) {
                        //console.log("returning " + sParameterName[1] + " to handler");
                        return sParameterName[1];
                    }
                }
            }; //borrowed code
            Tools.columnSumsAreValid = function (data, numOfHeaderRows) {
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
            };
            Tools.getWeights = function (p_elmt, p_model) {
                var weightsArr = [];
                if (p_elmt.getType() != 0 && p_elmt.getType() != 2) {
                    var total = 0.0;
                    p_elmt.getData(1).forEach(function (val) { total += val; });
                    for (var i = 0; i < p_elmt.getData()[0].length; i++) {
                        var childWeights = this.getWeights(p_model.getConnection(p_elmt.getData(0, i)).getInputElement(), p_model);
                        for (var j = 0; j < childWeights.length; j++) {
                            childWeights[j][1] *= (p_elmt.getData()[1][i] / total);
                        }
                        weightsArr = weightsArr.concat(childWeights);
                    }
                }
                else {
                    weightsArr.push([p_elmt.getData[0], 1]);
                }
                return weightsArr;
            };
            Tools.getHighest = function (array) {
                // //console.log("finding highest in " + array)
                var highest = Number.NEGATIVE_INFINITY;
                array.forEach(function (numb) {
                    if (numb > highest) {
                        highest = numb;
                    }
                });
                // //console.log("higest " + highest)
                return highest;
            };
            Tools.numOfHeaderRows = function (p_valuesArray) {
                var counter = 0;
                if (p_valuesArray[p_valuesArray.length - 1][1] !== undefined) {
                    for (var i = 0; i < p_valuesArray.length; i++) {
                        //if the cell in column 2 contains text it is a header row and must be a decision
                        if (isNaN(p_valuesArray[i][1]) && p_valuesArray[i][1] !== undefined) {
                            counter++;
                        }
                    }
                }
                return counter;
            };
            Tools.htmlTableFromArray = function (p_header, p_matrix) {
                var data = p_matrix;
                var numOfHeaderRows = Tools.numOfHeaderRows(p_matrix);
                var htmlString = "";
                if (data[0] !== undefined) {
                    htmlString += "<tr><th style='text-align:center' colspan=\"" + data[0].length + "\">" + p_header + " </th></tr>";
                }
                else {
                    htmlString += "<tr><th style='text-align:center'>" + p_header + " </th></tr>";
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
                        }
                        else {
                            htmlString += "<td>" + Tools.round((data[i][j])) + "</td>";
                        }
                    }
                    htmlString += "</tr>";
                }
                //console.log("html table: " + htmlString);
                return htmlString;
            };
            Tools.round = function (numb) {
                return Number(Math.round(numb * 1000) / 1000);
            };
            Tools.getColumn = function (p_matrix, index) {
                //console.log("get column " + index + " from " + p_matrix)
                //console.log(p_matrix)
                var rows = math.size(p_matrix).valueOf()[0];
                var range = math.range(0, rows);
                // //console.log("returned: " + math.subset(matrix, math.index(range, index)))
                return math.subset(p_matrix, math.index(range, index));
            };
            Tools.getRow = function (p_matrix, p_index) {
                console.log("get row " + p_index + " from " + p_matrix);
                var columns = math.size(p_matrix).valueOf()[1];
                var range = [];
                var oneDimensional;
                if (columns === undefined) {
                    return p_matrix;
                }
                console.log("columns: " + columns);
                for (var n = 0; n < columns; n++) {
                    range.push(n);
                }
                return math.subset(p_matrix, math.index(p_index, range));
            };
            Tools.concatMatrices = function (p_list) {
                var matrix = p_list[0];
                for (var i = 1; i < p_list.length; i++) {
                    matrix = math.concat(matrix, p_list[i]);
                }
                return matrix;
            };
            Tools.makeSureItsAnArray = function (p_value) {
                if (math.size(p_value).valueOf()[1] === undefined) {
                    p_value = [p_value];
                }
                return p_value;
            };
            Tools.getMatrixWithoutHeader = function (p_matrix) {
                console.log("get matrix without header from " + p_matrix);
                var numOfColumns;
                var numOfRows;
                console.log("size: " + math.size(p_matrix));
                if (math.size(p_matrix).length > 1) {
                    numOfColumns = math.size(p_matrix)[1];
                    numOfRows = math.size(p_matrix)[0];
                }
                else {
                    numOfColumns = math.size(p_matrix)[0];
                    numOfRows = 1;
                }
                console.log("numOfRows: " + numOfRows + " numOfColumns: " + numOfColumns);
                var newMatrix = [];
                //For each row
                for (var i = 0; i < numOfRows; i++) {
                    //If there is a number in column 2 in this row, this is not a header row
                    console.log("i: " + i);
                    var secondColumnValue;
                    if (numOfRows === 1) {
                        secondColumnValue = math.subset(p_matrix, math.index(1));
                    }
                    else {
                        secondColumnValue = math.subset(p_matrix, math.index(i, 1));
                    }
                    console.log("subset: " + secondColumnValue);
                    if (!(isNaN(secondColumnValue))) {
                        var row = math.squeeze(Tools.getRow(p_matrix, i));
                        console.log("row " + i + ": " + row + " length " + row.length);
                        var range = math.range(1, row.length);
                        row = math.subset(row, math.index(math.squeeze(range)));
                        if (row.length === undefined) {
                            row = [row];
                        }
                        newMatrix.push(row);
                        console.log("newMatrix: " + newMatrix);
                    }
                }
                console.log("returned: " + Tools.arrayToString(newMatrix));
                return newMatrix;
            };
            Tools.getValueWithCondition = function (p_values, p_rowElmt, p_conditionArray) {
                // //console.log("getting value " + rowElmt + " with condition " + conditionArray + " from " + this.getName());
                var values = p_values;
                // //console.log("values table : \n " + values);
                var valuesFound = [];
                //First find the correct row
                for (var i = 0; i < values.length; i++) {
                    // //console.log("comparing " + values[i][0] + " against " + rowElmt)
                    if (values[i][0] === p_rowElmt) {
                        // //console.log("row found")
                        //Then find the correct column
                        for (var j = 1; j < values[0].length; j++) {
                            var rightColumn = true;
                            var decArray = math.flatten(Tools.getColumn(values, j));
                            // //console.log("looking in " + decArray)
                            p_conditionArray.forEach(function (condition) {
                                //If condition is not found in the column, this is not the correct column
                                if (decArray.indexOf(condition) === -1) {
                                    rightColumn = false;
                                }
                            });
                            //If all elements are found in the column return the value
                            if (rightColumn) {
                                valuesFound.push(values[i][j]);
                            }
                        }
                    }
                }
                // //console.log("returned " + valuesFound);
                return valuesFound;
            };
            Tools.createSubMatrices = function (p_matrix, p_takenIntoAccount, p_data) {
                // //console.log("create sub matrix from " + matrix + " for values " + takenIntoAccount[takenIntoAccount.length - 1].getMainValues())
                var data = p_data;
                // //console.log("data: " + data)
                var subMatrices = [];
                var columns = math.size(p_matrix).valueOf()[1];
                var added = [];
                //For each column
                for (var n = 1; n < columns; n++) {
                    //If column has not already been added
                    if (added.indexOf(n) === -1) {
                        var currentColumn = math.flatten(Tools.getColumn(data, n));
                        // //console.log("current column: " + currentColumn)
                        var newMatrix = Tools.makeSureItsAnArray(Tools.getColumn(p_matrix, n - 1));
                        var matchingColumn = true;
                        //Look through the rest of the columns
                        for (var i = n + 1; i <= columns; i++) {
                            var columnValues = math.flatten(Tools.getColumn(data, i));
                            //For each header value in column
                            for (var j = 0; j < Tools.numOfHeaderRows(data); j++) {
                                //If the value is not found this is not a matching column
                                if (currentColumn.indexOf(data[j][i]) === -1) {
                                    // //console.log(data[j][i] + " was not found in " + currentColumn)
                                    matchingColumn = false;
                                    //But if the value has already been taken into account the column might be a matching column
                                    p_takenIntoAccount.forEach(function (elmt) {
                                        if (elmt.getMainValues()[0] === data[j][0]) {
                                            matchingColumn = true;
                                        }
                                    });
                                }
                                //If the element was not found in current column nor in takenIntoAccount break out of the loop
                                if (!matchingColumn) {
                                    break;
                                }
                            }
                            //If this column is right, add it to the matrix
                            if (matchingColumn) {
                                added.push(i);
                                var column = Tools.makeSureItsAnArray(Tools.getColumn(p_matrix, i - 1));
                                newMatrix = math.concat(newMatrix, column);
                            }
                        }
                        subMatrices.push(newMatrix);
                    }
                }
                // //console.log("returned " + subMatrices)
                return subMatrices;
            };
            Tools.convertToArray = function (p_matrix) {
                // //console.log("converting to array: " + matrix)
                var rows = math.size(p_matrix).valueOf()[0];
                var columns = math.size(p_matrix).valueOf()[1];
                var array = [];
                var newRow = [];
                //For each row
                for (var i = 0; i < rows; i++) {
                    if (columns === undefined) {
                        array.push(math.subset(p_matrix, math.index(i)));
                    }
                    else {
                        //For each column
                        for (var j = 0; j < columns; j++) {
                            newRow.push(math.subset(p_matrix, math.index(i, j)));
                        }
                        array.push(newRow);
                        newRow = [];
                    }
                }
                return array;
            };
            Tools.calculateValues = function (p_model, p_element) {
                var model = p_model;
                var element = p_element;
                console.log("calculate valeus for " + p_element.getName());
                if (element.getType() !== 1) {
                    var data = element.getData();
                    var headerRows = [];
                    var takenIntoAccount = [];
                    var newValues = Tools.getMatrixWithoutHeader(data);
                    console.log("data: " + Tools.arrayToString(newValues));
                    element.getParentElements().forEach(function (elmt) {
                        if (elmt.getType() === 0) {
                            takenIntoAccount.push(elmt); //The parents which already have been evaluated
                            var submatrices = Tools.createSubMatrices(newValues, takenIntoAccount, element.getData());
                            //Parent must be updated
                            if (!elmt.isUpdated()) {
                                elmt.update();
                            }
                            var parentValuesMatrix = Tools.getMatrixWithoutHeader(elmt.getValues());
                            //For each submatrix calculate new values
                            console.log("multiplying " + submatrices[0] + " and " + parentValuesMatrix);
                            var result = Tools.makeSureItsAnArray([math.multiply(submatrices[0], parentValuesMatrix)]);
                            for (var i = 1; i < submatrices.length; i++) {
                                console.log("multiplying " + submatrices[i] + " and " + parentValuesMatrix);
                                result.push(Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentValuesMatrix)));
                            }
                            newValues = Tools.concatMatrices(result);
                        }
                        else if (elmt.getType() === 1) {
                            headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows, element.getData());
                        }
                    });
                    newValues = Tools.convertToArray(newValues);
                    console.log(Tools.arrayToString(newValues));
                    console.log("checking for dimension: " + Tools.isOneDimensional(newValues));
                    if (Tools.isOneDimensional(newValues)) {
                        console.log("one-dimensional");
                        newValues.unshift(data[Tools.numOfHeaderRows(element.getData())][0]);
                    }
                    else {
                        for (var i = 0; i < newValues.length; i++) {
                            console.log("unshifting " + data[i + Tools.numOfHeaderRows(element.getData())][0]);
                            newValues[i].unshift(data[i + Tools.numOfHeaderRows(element.getData())][0]);
                        }
                    }
                    console.log("new values: \n" + Tools.arrayToString(newValues));
                    if (headerRows.length > 0) {
                        if (newValues[newValues.length - 1][1] === undefined) {
                            console.log("pushing " + newValues + " into " + headerRows);
                            headerRows.push(newValues);
                        }
                        else {
                            for (var i = 0; i < newValues.length; i++) {
                                headerRows.push(newValues[i]);
                            }
                        }
                        newValues = headerRows;
                    }
                    console.log(Tools.arrayToString(newValues));
                    p_element.setValues(newValues);
                }
                else {
                    console.log("decisions node begin");
                    element.setValues(Tools.fillEmptySpaces(element.updateHeaderRows(element.copyDefArray())));
                    var values = element.getValues();
                    //Number of header rows is equal to number of rows in values minus number of rows in definition
                    var numOfHeaderRows = values.length - element.getData().length;
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
                                // console.log("Trying to get column " + j);
                                //console.log(values);
                                var conditions = math.flatten(Tools.getColumn(values, j));
                                var range = math.range(0, numOfHeaderRows); // - 1);
                                // console.log("trying to get subset from " + conditions + " with range " + range);
                                //console.log(conditions);
                                //console.log(math.index(0, math.squeeze(range)));
                                conditions = Tools.makeSureItsAnArray(math.subset(conditions, math.index(math.squeeze(range))));
                            }
                            else {
                                conditions = [];
                            }
                            conditions.push(values[i][0]);
                            var value = 0;
                            //For each value node in the model
                            model.getElementArr().forEach(function (elmt) {
                                if (elmt.getType() === 2) {
                                    //If the node is not updated, update
                                    if (!elmt.isUpdated()) {
                                        elmt.update();
                                    }
                                    //Sum values that meet the conditions
                                    var valueArray = Tools.getValueWithCondition(elmt.getValues(), "Value", conditions);
                                    //If there are several values that meet the condition, use the highest
                                    value += Tools.getHighest(valueArray);
                                }
                            });
                            //console.log("i: " + i + "  j: " + j + "  Value: " + value);
                            values[i][j] = value;
                        }
                    }
                    console.log("decisions end");
                    //p_element.setData(values);
                    p_element.setValues(values);
                }
            };
            Tools.isOneDimensional = function (p_array) {
                console.log(p_array[0]);
                return (p_array.length === 1 || !($.isArray((p_array)[0])));
            };
            Tools.arrayToString = function (p_array) {
                var newString = "[";
                if (p_array[p_array.length - 1][1] === undefined) {
                    //console.log("in arrayToString its one dimensional");
                    newString += "[";
                    for (var i = 0; i < p_array.length; i++) {
                        newString += ", " + p_array[i];
                    }
                    newString += "]";
                }
                else {
                    for (var i = 0; i < p_array.length; i++) {
                        newString += "[";
                        for (var j = 0; j < p_array[0].length; j++) {
                            newString += (", " + p_array[i][j]);
                        }
                        newString += "]\n";
                    }
                }
                return newString + "]";
            };
            Tools.fillEmptySpaces = function (p_table) {
                console.log("Filling empty spaces in: " + p_table);
                for (var i = 0; i < p_table.length; i++) {
                    for (var j = 0; j < p_table[0].length; j++) {
                        console.log(p_table[i][j]);
                        if (p_table[i][j] === undefined) {
                            p_table[i][j] = 0;
                        }
                    }
                }
                console.log("result: " + p_table);
                return p_table;
            };
            Tools.addNewHeaderRow = function (p_headerRow, p_table, p_data) {
                // //console.log("Adding array: " + headerRow)
                var array = p_headerRow.slice();
                //Convert the array to only contain one of each element
                var newArray = [array[0]];
                for (var i = 1; i < array.length; i++) {
                    if (newArray.indexOf(array[i]) === -1) {
                        newArray.push(array[i]);
                    }
                }
                array = newArray;
                // //console.log("to " + table);
                // //console.log("number of header rows: " + numOfHeaderRows);
                var newTable = [];
                var numOfDiffValues = array.length - 1;
                // //console.log("numOfDiffValues " + numOfDiffValues)
                if (p_table[0] !== undefined) {
                    var rowLength = p_table[0].length - 1;
                    //For each row
                    for (var i = 0; i < p_table.length; i++) {
                        //For each different value in new header row
                        for (var n = 0; n < numOfDiffValues - 1; n++) {
                            var newRow = p_table[i];
                            //For each column
                            for (var j = 1; j <= rowLength; j++) {
                                //Add the value
                                newRow.push(p_table[i][j]);
                            }
                        }
                        // //console.log("new row number " + i + ": " + newRow)
                        newTable.push(newRow);
                    }
                }
                else {
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
                // //console.log("new header row: " + newRow);
                //Add the new row to the table
                newTable.splice(Tools.numOfHeaderRows(p_data) - 1, 0, newRow);
                // //console.log("new table: " + newTable)
                return newTable;
            };
            Tools.getRowNumber = function (values, decisionElement) {
                for (var i = 0; i < values.length; i++) {
                    if (values[i][0] === decisionElement.getName()) {
                        return i;
                    }
                }
            };
            Tools.updateConcerningDecisions = function (element) {
                console.log("updating concerning decisions " + element.getName());
                var rowsToDelete = [];
                element.getParentElements().forEach(function (elmt) {
                    if (elmt.getType() === 1 && elmt.getDecision() !== undefined) {
                        var values = element.getValues();
                        var decision = elmt.getData()[elmt.getDecision()][0];
                        console.log("choice is made: " + decision + " in elemnent " + elmt.getName());
                        var newValues = [];
                        var rowNumber = Tools.getRowNumber(element.getValues(), elmt);
                        for (var i = 0; i < values.length; i++) {
                            var newRow = [];
                            for (var j = 0; j < values[0].length; j++) {
                                if (values[rowNumber][j] === decision || j === 0)
                                    newRow.push(values[i][j]);
                            }
                            newValues.push(newRow);
                        }
                        rowsToDelete.push(rowNumber);
                        element.setValues(newValues);
                    }
                });
                //element.setValues(Tools.deleteRows(element.getValues(), rowsToDelete));
            };
            Tools.deleteRows = function (array, rows) {
                console.log("deleting " + rows + " from " + array);
                var newArray = [];
                for (var i = 0; i < array.length; i++) {
                    if (rows.indexOf(i) === -1) {
                        console.log("pushing row " + i + " " + rows.indexOf(i));
                        newArray.push(array[i]);
                    }
                }
                return newArray;
            };
            Tools.strengthOfInfluence = function (p_table, p_dims) {
                var strength = [];
                var underDim = [];
                var overDim = [];
                for (var init = 0; init < p_dims.length; init++) {
                    underDim[init] = 1;
                    overDim[init] = 1;
                }
                for (var ix in p_dims) {
                    for (var iy in p_dims) {
                        if (ix < iy) {
                            underDim[ix] *= p_dims[ix];
                        }
                        if (p_dims[ix]) {
                            overDim[ix] *= p_dims[ix];
                        }
                    }
                }
                console.log("underDim: " + underDim);
                console.log("overDim: " + overDim);
                return strength;
            };
            Tools.fillDataTable = function (p_dataTable) {
                console.log("filling table: " + p_dataTable);
                var headerRows = [];
                var data = [];
                var numOfHeaderRows = Tools.numOfHeaderRows(p_dataTable);
                for (var i = 0; i < numOfHeaderRows; i++) {
                    var newRow = [];
                    for (var j = 0; j < p_dataTable[0].length; j++) {
                        newRow.push(p_dataTable[i][j]);
                    }
                    headerRows.push(newRow);
                }
                console.log("header rows: " + headerRows);
                for (var i = numOfHeaderRows; i < p_dataTable.length; i++) {
                    var newRow = [];
                    for (var j = 1; j < p_dataTable[0].length; j++) {
                        var value = p_dataTable[i][j];
                        if (!isNaN(value)) {
                            newRow.push(value);
                        }
                    }
                    data.push(newRow);
                }
                console.log("before concat: " + data);
                data = math.concat(data, data);
                console.log("after concat: " + data);
                var newDataTable = headerRows;
                for (var i = 0; i < data.length; i++) {
                    data[i].unshift(p_dataTable[numOfHeaderRows + i][0]);
                    newDataTable.push(data[i]);
                }
                console.log("new table after filling: " + newDataTable);
                return newDataTable;
            };
            return Tools;
        })();
        DST.Tools = Tools;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Tools.js.map