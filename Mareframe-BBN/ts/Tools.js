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
                //y = 0 * (xVal - posX) * (xVal - 1) / ((0 - posX) * (0 - 1)) + posY * (xVal - 0) * (xVal - 1) / ((posX - 0) * (posX - 1)) + 1 * (xVal - 0) * (xVal - posX) / ((1 - 0) * (1 - posX))
                //y =a*(xVal*xVal)+b*xVal+0
                //console.log("y=" + y);
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
                console.log("Checking if sum is valid");
                console.log("numOfHeaderRows: " + numOfHeaderRows);
                console.log("data: " + data);
                var sum = 0;
                for (var i = 1; i < data[data.length - 1].length; i++) {
                    for (var j = numOfHeaderRows; j < data.length; j++) {
                        sum += parseFloat(data[j][i]);
                        console.log("number: " + parseFloat(data[j][i]));
                    }
                    console.log("sum: " + sum);
                    if (sum < 0.999 || sum > 1.01) {
                        console.log("invalid sum");
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
                        //console.log("Element: " + p_elmt.getID());
                        //console.log("ElementData: " + p_elmt.getData(0, i) );
                        //console.log("a connection " + p_model.getConnection(p_elmt.getData(0, i)).getID());
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
            Tools.numOfHeaderRows = function (p_valuesArray, p_elmt) {
                //console.log("number of headerrows in " + p_valuesArray);
                var counter = 0;
                Tools.makeSureItsAnArray(p_valuesArray);
                /* if (p_elmt !== undefined && p_elmt.getType() === 3) {//In super value nodes headerrows are not defined the same way as in other nodes
                     //  console.log("super value node");
                     var rows: number = math.size(p_valuesArray)[0];
                     if (p_valuesArray[rows - 1][0] === "Value") {//If the value row is part of the table then number of header rows is no. of rows minus 1
                         counter = rows - 1;
                         // console.log("value row is present");
                     }
                     else {//Otherwise all rows are headerrows
                         counter = rows;
                     }
                 }
                 else*/ {
                    //console.log("p_valuesArray.length: " + p_valuesArray.length);
                    //console.log(p_valuesArray);
                    for (var i = 0; i < p_valuesArray.length; i++) {
                        //if the cell in column 2 contains text it is a header row and must be a decision
                        if (isNaN(p_valuesArray[i][1]) && p_valuesArray[i][1] !== undefined) {
                            counter++;
                        }
                    }
                }
                //console.log("returned : " + counter);
                return counter;
            };
            Tools.round = function (numb) {
                //return numb.toFixed(2);
                return Number(Math.round(numb * 1000) / 1000);
            };
            Tools.round2 = function (numb) {
                //return numb.toFixed(2);
                return Number(Math.round(numb * 100) / 100);
            };
            Tools.getColumn = function (p_matrix, index) {
                //console.log("get column " + index + " from " + p_matrix + " size " + math.size(p_matrix));
                var rows = math.size(p_matrix).valueOf()[0];
                var range = math.range(0, rows);
                //console.log("returned: " + math.subset(matrix, math.index(range, index)))
                return math.subset(p_matrix, math.index(range, index));
            };
            Tools.getRow = function (p_matrix, p_index) {
                // console.log("get row " + p_index + " from " + p_matrix)
                var columns = math.size(p_matrix).valueOf()[1];
                var range = [];
                var oneDimensional;
                if (columns === undefined) {
                    return p_matrix;
                }
                //console.log("columns: " + columns);
                for (var n = 0; n < columns; n++) {
                    range.push(n);
                }
                return math.subset(p_matrix, math.index(p_index, range));
            };
            Tools.addDataRow = function (p_elmt, p_matrix) {
                var oldData = [];
                oldData = p_matrix;
                var newData = [];
                //Copy every row to new data
                for (var i = 0; i < oldData.length; i++) {
                    //console.log(i + "  " + oldData[i]);
                    newData[i] = oldData[i];
                }
                newData[oldData.length] = []; //add empty row at bottom
                // console.log("oldDataLenght: " + oldData.length);
                //Add new state
                var newStateName;
                if (p_elmt.getType() === 0) {
                    newStateName = "State" + (oldData.length - Tools.numOfHeaderRows(oldData));
                }
                else if (p_elmt.getType() === 1) {
                    newStateName = "Choice" + (oldData.length - Tools.numOfHeaderRows(oldData));
                }
                newData[oldData.length][0] = newStateName;
                //Add 0 in every cell in new row (In decisions nothing is done here)
                for (var i = 1; i < oldData[0].length; i++) {
                    newData[oldData.length][i] = 0;
                }
                return newData;
            };
            Tools.removeRow = function (p_matrix, p_index) {
                var matrix = Tools.makeSureItsAnArray(Tools.copy(p_matrix));
                var headerRows = Tools.numOfHeaderRows(matrix);
                var rows = math.size(matrix)[0];
                if (p_index < headerRows) {
                    throw "ERROR Can not delete headerrows";
                }
                if (rows < headerRows + 2) {
                    //console.log("matrix is now empty");
                    matrix = [];
                }
                else {
                    matrix.splice(p_index, 1);
                }
                return matrix;
            };
            //Returns a copy of the given matrix/array
            Tools.copy = function (p_matrix) {
                var matrix = Tools.makeSureItsTwoDimensional(p_matrix);
                var newMatrix = [];
                for (var i = 0; i < matrix.length; i++) {
                    var row = [];
                    for (var j = 0; j < matrix[0].length; j++) {
                        row.push(matrix[i][j]);
                    }
                    newMatrix.push(row);
                }
                return newMatrix;
            };
            //This method concats all matrixes in a list one by one
            Tools.concatMatrices = function (p_list) {
                var matrix = p_list[0];
                for (var i = 1; i < p_list.length; i++) {
                    //console.log("concatting " + matrix + " size " + math.size(matrix) + " and " + p_list[i] + " size: " + math.size(p_list[i]));
                    matrix = math.concat(matrix, p_list[i]);
                }
                //console.log((matrix));
                return matrix;
            };
            //This method converts an element, which is not an array, to a singleton list
            Tools.makeSureItsAnArray = function (p_value) {
                if (p_value === undefined || math.size(p_value).valueOf()[1] === undefined) {
                    p_value = [p_value];
                }
                return p_value;
            };
            //If a list is one dimensional this method adds extra brackets around the list to make it a two dimensional list with one row
            Tools.makeSureItsTwoDimensional = function (p_array) {
                if (math.size(p_array).length < 2) {
                    p_array = [p_array];
                }
                return p_array;
            };
            //This returns a table withot its headerrows
            Tools.getMatrixWithoutHeader = function (p_matrix) {
                // console.log("get matrix without header from " + p_matrix)
                p_matrix = Tools.makeSureItsTwoDimensional(p_matrix);
                var numOfColumns;
                var numOfRows;
                //    console.log("size: " + math.size(p_matrix));
                numOfColumns = math.size(p_matrix)[1];
                numOfRows = math.size(p_matrix)[0];
                // console.log("numOfRows: " + numOfRows + " numOfColumns: " + numOfColumns);
                var newMatrix = [];
                //For each row
                for (var i = 0; i < numOfRows; i++) {
                    //If there is a number in column 2 in this row, this is not a header row         
                    var secondColumnValue = math.subset(p_matrix, math.index(i, 1));
                    // console.log("subset: " + secondColumnValue);
                    if (!(isNaN(secondColumnValue))) {
                        var row = math.squeeze(Tools.getRow(p_matrix, i));
                        // console.log("row " + i+ ": " + row + " length " + row.length)
                        var range = math.range(1, row.length);
                        row = math.subset(row, math.index(math.squeeze(range)));
                        if (row.length === undefined) {
                            row = [row];
                        }
                        newMatrix.push(row);
                    }
                }
                //console.log("returned: " + newMatrix);
                // console.log(newMatrix);
                return newMatrix;
            };
            Tools.getValueWithCondition = function (p_values, p_elmt, p_condition) {
                console.log("getting value with condition " + p_condition + " elmt: " + p_elmt.getName() + " from " + p_values);
                var values = Tools.makeSureItsTwoDimensional(p_values);
                // //console.log("values table : \n " + values);
                var valuesFound = [];
                var size = math.size(values);
                var rows = size[0];
                var columns = size[1];
                //Find the right row
                for (var i = 0; i < rows; i++) {
                    if (values[i][0] === p_elmt.getID() || i === rows - 1) {
                        //Find the correct column
                        //console.log("correct row");
                        for (var j = 1; j < columns; j++) {
                            if (values[i][j] === p_condition || i === rows - 1) {
                                valuesFound.push(values[rows - 1][j]);
                            }
                        }
                        return valuesFound;
                    }
                }
                //console.log("returned " + valuesFound);
                return valuesFound;
            };
            Tools.getValueWithConditions = function (p_values, p_elmts, p_conditions) {
                //console.log("get value with condtions: " + p_conditions + " in: " + p_values + " for elements: " + p_elmts);
                var values = Tools.makeSureItsTwoDimensional(p_values);
                var rows = math.size(values)[0];
                var columns = math.size(values)[1];
                var valuesFound = [];
                for (var i = 1; i < columns; i++) {
                    var matchingColumn = true;
                    for (var j = 0; j < Tools.numOfHeaderRows(values); j++) {
                        for (var n = 0; n < p_elmts.length; n++) {
                            if (values[j][0] === p_elmts[n] && values[j][i] !== p_conditions[n]) {
                                matchingColumn = false;
                                break;
                            }
                        }
                    }
                    if (matchingColumn) {
                        // console.log("returned " + values[Tools.numOfHeaderRows(values)][i]);
                        valuesFound.push(values[Tools.numOfHeaderRows(values)][i]);
                    }
                }
                return valuesFound;
            };
            Tools.createSubMatrices = function (p_currentElement, p_matrix, p_makeSubmatrixElmt, p_dataHeaders) {
                if (p_makeSubmatrixElmt !== undefined) {
                }
                var data = Tools.makeSureItsTwoDimensional(p_dataHeaders);
                p_matrix = Tools.makeSureItsTwoDimensional(p_matrix);
                //console.log("data: " + (data) + " size " + math.size(data));
                // console.log(data);
                var subMatrices = [];
                var columns = math.size(p_matrix).valueOf()[1];
                var newDataHeaders = [];
                //   console.log("columns: " + columns);
                var added = [];
                //    console.log("size of data: " + math.size(data));
                if (p_currentElement.getType() !== 3) {
                    //For each column
                    for (var n = 1; n <= columns; n++) {
                        //  console.log("n: " + n);
                        //If column has not already been added
                        if (added.indexOf(n) === -1) {
                            // console.log(data);
                            var currentColumn = math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(data, n)));
                            //console.log("current column: " + currentColumn + " num: "+ n);
                            //Add column to new data headers¨
                            if (newDataHeaders.length < 1) {
                                newDataHeaders = Tools.makeSureItsAnArray(Tools.getColumn(data, n));
                            }
                            else {
                                // console.log("adding " + Tools.getColumn(data, n) + " to data headers");
                                newDataHeaders = math.concat(newDataHeaders, Tools.makeSureItsAnArray(Tools.getColumn(data, n)));
                            }
                            //console.log("new data headers: " + newDataHeaders);
                            var newMatrix = Tools.makeSureItsAnArray(Tools.getColumn(p_matrix, n - 1));
                            //Look through the rest of the columns
                            for (var i = n + 1; i <= columns; i++) {
                                var matchingColumn = true;
                                var columnValues = math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(data, i)));
                                //console.log("checking column " + columnValues);
                                //For each header value in column
                                for (var j = 0; j < Tools.numOfHeaderRows(data); j++) {
                                    //If the value is does not match the corrisponding value in current column, this is not a matching column
                                    //console.log("checking value: " + data[j][i]);
                                    if (currentColumn[j] !== data[j][i]) {
                                        //console.log(data[j][i] + " does not match " + currentColumn[j])
                                        matchingColumn = false;
                                        //  But if the value is part of the make-submatrix-element the column might be a matching column
                                        if (p_makeSubmatrixElmt !== undefined && p_makeSubmatrixElmt.getID() === data[j][0]) {
                                            //console.log("element is the make-submatrix-element");
                                            matchingColumn = true;
                                        }
                                    }
                                    //If the element was not found in current column and is not the make-submatrix-element break out of the loop
                                    if (!matchingColumn) {
                                        //console.log("not a matching column");
                                        break;
                                    }
                                }
                                //If this column is right, add it to the matrix
                                if (matchingColumn) {
                                    //console.log("matching column");
                                    added.push(i);
                                    var column = Tools.makeSureItsAnArray(Tools.getColumn(p_matrix, i - 1));
                                    newMatrix = math.concat(newMatrix, column);
                                }
                            }
                            // console.log("adding matrix: " + newMatrix);
                            subMatrices.push(Tools.makeSureItsTwoDimensional(newMatrix));
                        }
                    }
                    if (math.size(newDataHeaders).length < 2) {
                        newDataHeaders = [newDataHeaders];
                    }
                    //Add element id to each row in new data headers
                    for (var i = 0; i < newDataHeaders.length; i++) {
                        newDataHeaders[i].unshift(data[i][0]);
                    }
                    //delete row for make-submatrix-elmt
                    if (p_makeSubmatrixElmt !== undefined) {
                        //Delete the row that was used to make the submatrices
                        for (var i = 0; i < newDataHeaders.length; i++) {
                            if (p_makeSubmatrixElmt.getID() === newDataHeaders[i][0]) {
                                newDataHeaders.splice(i, 1);
                            }
                        }
                    }
                }
                else {
                    //console.log("super value node");
                    for (var i = 0; i < p_matrix.length; i++) {
                        subMatrices.push(Tools.makeSureItsTwoDimensional([p_matrix[i][0]]));
                    }
                    newDataHeaders = p_dataHeaders; //Because data headers do not get updated in super value nodes
                }
                // console.log("new data headers: " + newDataHeaders);
                // console.log("returned " + subMatrices + " size of submatrix " + math.size(subMatrices[0]) + " number of submatrices " + subMatrices.length);
                return [subMatrices, Tools.makeSureItsTwoDimensional(newDataHeaders)];
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
            //This method removes p_element from p_dataheader and addds the new row p_newRow
            //While also making sure the number of columns match
            Tools.updateDataHeader = function (p_dataHeader, p_newRow, p_element) {
                //    console.log("inserting " + Tools.arrayToString(p_newRow) + " size: " + math.size(p_newRow) + " into " +p_dataHeader + " size " + math.size(p_dataHeader));
                var rowsInDataHeader = math.size(p_dataHeader)[0];
                var columnsInDataHeader = math.size(p_dataHeader)[1];
                //Delete p_element row from data header
                //   console.log("deleting " + p_element.getName());
                for (var i = 0; i < rowsInDataHeader; i++) {
                    //      console.log("comaparing " + p_dataHeader[i][0] + " and " + p_element.getID());
                    if (p_dataHeader[i][0] === p_element.getID()) {
                        //      console.log("match");
                        p_dataHeader.splice(i, 1);
                        rowsInDataHeader--;
                    }
                }
                //  console.log("data headers: " + p_dataHeader);
                if (math.size(p_newRow).length < 2) {
                    p_newRow = [p_newRow];
                }
                var columnsInNewRow = math.size(p_newRow)[1];
                //Convert the new row to only contain one of each element
                var newRow = Tools.removeDuplicates(p_newRow);
                //console.log("new row with one of each: " + newRow);
                columnsInNewRow = math.size(newRow)[1]; //newRow.length;
                // console.log("data headers size: " + p_dataHeader.length);
                //If p_dataheader is empty just set p_dataHeader equal to newRow
                if (p_dataHeader.length < 1) {
                    //console.log(" data header was one empty");
                    p_dataHeader = newRow;
                }
                else {
                    //Count same value columns in data header
                    //Same value columns are columns which have the same value in each row
                    var sameValueColumns = 1;
                    //console.log("columnsInDataHeader " + columnsInDataHeader);
                    for (var i = 2; i < columnsInDataHeader; i++) {
                        var matchingColumn = true;
                        for (var j = 0; j < rowsInDataHeader; j++) {
                            //console.log("comparing " + p_dataHeader[j][1] + " and " + p_dataHeader[j][i]);
                            if (p_dataHeader[j][1] !== p_dataHeader[j][i]) {
                                //If some row does not match, it is not a matching column
                                matchingColumn = false;
                            }
                        }
                        if (matchingColumn) {
                            sameValueColumns++;
                        }
                    }
                    //        console.log("same value columns: " + sameValueColumns);
                    //if there are fewer same value columns than coulmns in new row copy columns until there are the same amount
                    //console.log("dataHeader: " + p_dataHeader);
                    while (sameValueColumns < columnsInNewRow - 1) {
                        //           console.log("fewer same value columns that columns in new row");
                        //  console.log("sameValueColumns " + sameValueColumns);
                        for (var i = 1; i < columnsInDataHeader; i += sameValueColumns) {
                            //console.log(" i :" + i + " columnsInDataHeader: " + columnsInDataHeader);
                            for (var j = 0; j < rowsInDataHeader; j++) {
                                //console.log("j: " + j + " i: " + i);
                                //console.log("inserting " + p_dataHeader[j][i]);
                                p_dataHeader[j].splice(i, 0, p_dataHeader[j][i]);
                            }
                            i++;
                            columnsInDataHeader++;
                        }
                        sameValueColumns++;
                    }
                    //If there are more same value columns in dataHeader than there are columns in newRow
                    //delete columns until there are the same amount
                    while (sameValueColumns > columnsInNewRow - 1) {
                        //          console.log("fewer columns in new row than same value columns");
                        for (var i = 1; i < columnsInDataHeader; i += sameValueColumns) {
                            //               console.log("i: " + i + " columns in data header: " + columnsInDataHeader);
                            for (var j = 0; j < rowsInDataHeader; j++) {
                                //                   console.log("deleting: " + p_dataHeader[j][i]);
                                p_dataHeader[j].splice(i, 1);
                            }
                            i--;
                            columnsInDataHeader--;
                        }
                        sameValueColumns--;
                    }
                    //        console.log("data header: " + p_dataHeader);
                    //Insert new row
                    p_dataHeader.push(newRow);
                    var columnsInOriginalNewRow = columnsInNewRow - 1;
                    // console.log("columnsInOriginalNewRow: " + columnsInOriginalNewRow);
                    //insert into the table until it is full
                    while (columnsInNewRow < columnsInDataHeader) {
                        //             console.log("columnsInNewRows: " + columnsInNewRow + " columnsInDataHeader: " + columnsInDataHeader);
                        //Add the new row
                        for (var i = 1; i <= columnsInOriginalNewRow; i++) {
                            p_dataHeader[rowsInDataHeader].push(newRow[i]);
                        }
                        columnsInNewRow += columnsInOriginalNewRow;
                    }
                }
                //         console.log("dataHeader: " + p_dataHeader);
                return p_dataHeader;
            };
            Tools.insertNewHeaderRowAtBottom = function (p_newRow, p_table) {
                var tempTable = p_newRow.slice();
                var table = Tools.makeSureItsTwoDimensional(p_table);
                // console.log("inserting " + p_newRow + " into " + table + " size " + math.size(table));
                // console.log("temp table: " + tempTable);
                // console.log("p_table empty: " + !(math.size(table)[1] !== 0));
                if (math.size(table)[1] !== 0) {
                    if (Tools.isOneDimensional(table)) {
                        //      console.log("one dimensional");
                        tempTable = Tools.addNewHeaderRow(table, tempTable);
                    }
                    else {
                        //  console.log("length of p_table: " + p_table.length);
                        //Add each row from the bottom up
                        for (var i = table.length - 1; i >= 0; i--) {
                            tempTable = Tools.addNewHeaderRow(table[i], tempTable);
                        }
                    }
                }
                //console.log("returned: " + tempTable);
                return tempTable;
            };
            Tools.updateValuesHeaders = function (p_model, p_elmt) {
                var headerRows = [];
                var added = []; //Used to make sure no element is added twice into headers
                if (p_elmt.getType() === 1) {
                    p_elmt.getParentElements().forEach(function (parent) {
                        if (parent.isInfluencing()) {
                            headerRows = Tools.addNewHeaderRow(parent.getMainValues(), headerRows);
                        }
                    });
                    p_elmt.setUpdated(true);
                }
                else if (p_elmt.getType() === 2 || p_elmt.getType() === 0) {
                    p_elmt.getAllInfluencingAncestors().forEach(function (ancestor) {
                        if (ancestor.getType() === 0) {
                            var isInformative = false;
                            ancestor.getChildrenElements().forEach(function (child) {
                                if (child.getType() === 1) {
                                    isInformative = true;
                                }
                            });
                            if (isInformative && added.indexOf(ancestor.getID()) === -1) {
                                added.push(ancestor.getID());
                                headerRows = Tools.addNewHeaderRow(ancestor.getMainValues(), headerRows);
                            }
                            //If ancestor has an informative decsendant this should be added too
                            ancestor.getAllDescendants().forEach(function (descendant) {
                                var isInformative = false;
                                descendant.getChildrenElements().forEach(function (child) {
                                    if (child.getType() === 1) {
                                        isInformative = true;
                                    }
                                });
                                if (isInformative && added.indexOf(descendant.getID()) === -1 && descendant.getID() !== p_elmt.getID()) {
                                    added.push(descendant.getID());
                                    headerRows = Tools.addNewHeaderRow(descendant.getMainValues(), headerRows);
                                }
                            });
                        }
                        else if (ancestor.getType() === 1 && added.indexOf(ancestor.getID()) === -1) {
                            headerRows = Tools.addNewHeaderRow(ancestor.getMainValues(), headerRows);
                            added.push(ancestor.getID());
                        }
                    });
                    p_elmt.getAllDescendants().forEach(function (descendant) {
                        if (descendant.getType() === 0) {
                            var isInformative = false;
                            descendant.getChildrenElements().forEach(function (child) {
                                if (child.getType() === 1) {
                                    isInformative = true;
                                }
                            });
                            if (isInformative && added.indexOf(descendant.getID()) === -1) {
                                headerRows = Tools.addNewHeaderRow(descendant.getMainValues(), headerRows);
                                added.push(descendant.getID());
                            }
                        }
                    });
                    p_elmt.setUpdated(true);
                }
                p_elmt.setValues(headerRows);
                Tools.addMainValues(p_model, p_elmt);
            };
            Tools.addMainValues = function (p_model, p_elmt) {
                var valueHeaders = p_elmt.getValues();
                var mainValues = p_elmt.getMainValues();
                for (var i = 1; i < mainValues.length; i++) {
                    valueHeaders.push([mainValues[i]]);
                }
                for (var col = 1; col < Math.max(valueHeaders[0].length, 2); col++) {
                    for (var row = Tools.numOfHeaderRows(valueHeaders); row < valueHeaders.length; row++) {
                        valueHeaders[row].push(0);
                    }
                }
            };
            Tools.calculateValues = function (p_model, p_element) {
                var model = p_model;
                var element = p_element;
                //console.log("calculate values for " + p_element.getName());
                var dataHeaders = []; //the header rows from data
                var data = element.getData();
                var newValues;
                //console.log("data: " + data + " size " + math.size(data));
                //console.log(data);
                //copy headerrows to dataHeaders to be updated
                for (var i = 0; i < Tools.numOfHeaderRows(data); i++) {
                    var newRow = [];
                    for (var j = 0; j < data[0].length; j++) {
                        newRow.push(data[i][j]);
                    }
                    dataHeaders.push(newRow);
                }
                //console.log("data headers: " + dataHeaders);
                if (element.getType() === 3 && math.size(data)[1] < 1) {
                    newValues = [0];
                }
                else if (element.getType() !== 1) {
                    var headerRows = []; //Used to add decisions to value matrix
                    newValues = Tools.getMatrixWithoutHeader(data);
                    //console.log(newValues);
                    element.getParentElements().forEach(function (elmt) {
                        //console.log("parent: " + elmt.getName());
                        if (elmt.getType() === 0 || elmt.getType() === 2) {
                            //  console.log("dataheaders: " + dataHeaders);
                            //Parent must be updated
                            if (!elmt.isUpdated()) {
                                //console.log("updating " + elmt.getName());
                                elmt.update();
                            }
                            var parentValuesMatrix = Tools.getMatrixWithoutHeader(elmt.getValues());
                            // console.log("current element: " + element.getName());
                            //console.log("parent: " + elmt.getName());
                            //console.log("new values: " + newValues);
                            var temp = Tools.createSubMatrices(element, newValues, elmt, dataHeaders);
                            //console.log("newValues: " + newValues);
                            var submatrices = temp[0];
                            // console.log("submatrices have size: " + math.size(submatrices));
                            //console.log(submatrices);
                            dataHeaders = temp[1];
                            //console.log("data headers: " + dataHeaders);
                            var result = [];
                            var decRows = [];
                            var newRow = [];
                            //If parent has dec in values table these are added to dataHeaders or parent submatrices are created
                            // console.log("parent values: " + elmt.getValues());
                            // console.log("number of header rows: " + Tools.numOfHeaderRows(elmt.getValues());
                            //For each dec in parent
                            for (var i = 0; i < Tools.numOfHeaderRows(elmt.getValues()); i++) {
                                //console.log("i:" + i + " decInParent: " + Tools.numOfHeaderRows(elmt.getValues()));
                                var decRow = elmt.getValues()[i];
                                //console.log("checking if: " + decRow[0] + " is in " + math.flatten(dataHeaders) + " : " + (math.flatten(dataHeaders).indexOf(decRow[0]) > -1));
                                //If the parents decision already is in data headers add it to decRows to be used when creating parentsubmatrices
                                if (math.flatten(dataHeaders).indexOf(decRow[0]) > -1) {
                                    decRows.push(decRow);
                                }
                                else {
                                    newRow = model.getElement(elmt.getValues()[i][0]).getMainValues();
                                    // console.log("new row: " + newRow);
                                    //The decision does not already exist. Insert it into headerrows
                                    headerRows = Tools.insertNewHeaderRowAtBottom(newRow, headerRows);
                                    //console.log("new header rows: " + headerRows);
                                    //Update data headers to contain the new dec row
                                    dataHeaders = Tools.insertNewHeaderRowAtBottom(newRow, dataHeaders);
                                }
                            }
                            if (element.getType() === 0 || element.getType() === 2) {
                                if (decRows.length > 0) {
                                    var parentSubMatrices = Tools.createSubMatrices(element, parentValuesMatrix, undefined, decRows)[0];
                                }
                                var j = 0;
                                for (var i = 0; i < submatrices.length; i++) {
                                    if (decRows.length > 0) {
                                        // console.log("multiplying " + submatrices[i] + " size " + math.size(submatrices[i]) + " and " + parentSubMatrices[j] + " size " + math.size(parentSubMatrices[j]));
                                        var newMatrix = Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentSubMatrices[j]));
                                        if (j < parentSubMatrices.length - 1) {
                                            j++;
                                        }
                                        else {
                                            j = 0;
                                        }
                                    }
                                    else {
                                        //console.log("multiplying " + submatrices[i] + " size " + math.size(submatrices[i]) + " and " + parentValuesMatrix + " size " + math.size(parentValuesMatrix));
                                        var newMatrix = Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentValuesMatrix));
                                    }
                                    // console.log("size of new matrix: " + math.size(newMatrix));
                                    result.push(newMatrix);
                                }
                                newValues = Tools.concatMatrices(result);
                            }
                        }
                        else if (elmt.getType() === 1) {
                            //console.log("parent is a decision");
                            //Only add if it does not already exist
                            if (math.flatten(headerRows).indexOf(elmt.getID) === -1) {
                                headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows);
                            }
                        }
                        //  console.log("done with parent " + elmt.getName());
                    });
                    if (element.getType() === 3) {
                        var valueArray = [];
                        var defValue; //This is the value from the def table which we multiply by
                        headerRows = Tools.makeSureItsTwoDimensional(headerRows);
                        // console.log("headerrows: " + headerRows);
                        if (headerRows[0].length < 2) {
                            headerRows = [[undefined, undefined]];
                        }
                        // console.log(headerRows);
                        var conditionElmts = math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(headerRows, 0)));
                        for (var i = 1; i < math.size(headerRows)[1]; i++) {
                            valueArray.push(0); //Make room for the new value
                            var conditions = math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(headerRows, i)));
                            element.getParentElements().forEach(function (parent) {
                                /*for (var n = 0; n < conditionElmts.length; n++) {//For each parent element
                                    var parent: Element = model.getElement(conditionElmts[n]);*/
                                for (var j = 0; j < data.length; j++) {
                                    if (data[j][0] === parent.getID()) {
                                        defValue = data[j][1];
                                        break;
                                    }
                                }
                                var parentMatrix;
                                if (parent === undefined) {
                                    parentMatrix = undefined;
                                }
                                else {
                                    parentMatrix = parent.getValues();
                                }
                                valueArray[i - 1] += Tools.getValueWithConditions(parentMatrix, conditionElmts, conditions)[0] * defValue;
                            });
                        }
                        if (headerRows[0][0] === undefined) {
                            headerRows = [];
                        }
                        newValues = [valueArray];
                    }
                    newValues = Tools.makeSureItsTwoDimensional(newValues);
                    if (element.getType() === 0 || element.getType() === 1) {
                        //Inserting the element id first in each row
                        for (var i = 0; i < newValues.length; i++) {
                            //       console.log("unshifting " + data[i + Tools.numOfHeaderRows(element.getData())][0])
                            newValues[i].unshift(data[i + Tools.numOfHeaderRows(element.getData())][0]);
                        }
                    }
                    else {
                        newValues[0].unshift("Value");
                    }
                    // console.log("new values: \n" + newValues);
                    // console.log("size: " + math.size(newValues));
                    if (headerRows.length > 0) {
                        headerRows = Tools.makeSureItsTwoDimensional(headerRows);
                        newValues = Tools.makeSureItsTwoDimensional(newValues);
                        var elmtsInNewValues = Tools.getColumn(newValues, 0);
                        for (var i = 0; i < newValues.length; i++) {
                            //only add row if it is not already there
                            //console.log("pushing " + newValues[i] + " into " + headerRows);
                            headerRows.push(newValues[i]);
                        }
                        newValues = headerRows;
                    }
                    //console.log("new values: " + newValues);
                    p_element.setValues(Tools.makeSureItsTwoDimensional(newValues));
                }
                else {
                    Tools.calculateDecisionValues(element, model);
                }
                //console.log("done calculatint values for " + p_element.getName());
            };
            Tools.calculateDecisionValues = function (p_elmt, p_model) {
                if (p_elmt.getType() !== 1) {
                    throw "ERROR Trying to use calculateDecisionValues on non decision element";
                }
                //console.log("decisions node begin");
                //   p_elmt.setValues(Tools.fillEmptySpaces((p_elmt.copyDefArray())));
                var values = p_elmt.getValues();
                //Number of header rows is equal to number of rows in values minus number of rows in definition
                var numOfHeaderRows = values.length - p_elmt.getData().length;
                //First calculate the utility tables to use
                var utilityTables = [];
                p_model.getElementArr().forEach(function (elmt) {
                    if (elmt.getType() === 2) {
                        //console.log("value: " + elmt.getName());
                        //If the node is not updated, update
                        if (!elmt.isUpdated()) {
                            elmt.update();
                        }
                        var utilityValues = Tools.removeDecisionsFromValues(p_model, elmt, p_elmt);
                        utilityValues = Tools.removeChancesFromValues(p_model, elmt, utilityValues, p_elmt);
                        utilityTables.push(utilityValues);
                    }
                });
                //For each value row
                for (var i = numOfHeaderRows; i < values.length; i++) {
                    //For each values column
                    for (var j = 1; j < values[0].length; j++) {
                        var conditions = [values[i][0]];
                        conditions = conditions.concat(Tools.convertToArray(math.flatten(Tools.getColumn(values, j))).slice(0, numOfHeaderRows));
                        var conditionElmts = [p_elmt.getID()];
                        conditionElmts = conditionElmts.concat(Tools.convertToArray(math.flatten(Tools.getColumn(values, 0))).slice(0, numOfHeaderRows));
                        //console.log("condition: " + condition);
                        var value = 0;
                        //For each utility node in the model
                        utilityTables.forEach(function (table) {
                            //Sum values that meet the condition
                            var valueArray = Tools.getValueWithConditions(table, conditionElmts, conditions);
                            //console.log("value array: " + valueArray);
                            //If there are several values that meet the condition, use the highest
                            value += Tools.getHighest(valueArray);
                        });
                        //console.log("i: " + i + "  j: " + j + "  Value: " + value);
                        values[i][j] = value;
                    }
                }
                //     console.log("decisions end");
                //console.log("new values: " + values);
                p_elmt.setValues(values);
            };
            //Takes a utility node and a dec node and removes all decisions from the utility value that are not in the dec headers
            Tools.removeDecisionsFromValues = function (p_model, p_utilityNode, p_decNode) {
                var decHeaders = math.flatten(Tools.getColumn(p_decNode.getValues(), 0));
                var values = p_utilityNode.getValues().slice();
                var valueMatrix = Tools.getMatrixWithoutHeader(values);
                var valueHeaders = values.slice(0, Tools.numOfHeaderRows(values));
                for (var row = 0; row < Tools.numOfHeaderRows(values); row++) {
                    var elmt = p_model.getElement(values[row][0]); //check if this elements needs removing
                    if (elmt.getType() === 1 && decHeaders.indexOf(values[row][0]) === -1 && elmt.getID() !== p_decNode.getID()) {
                        var temp = Tools.createSubMatrices(p_utilityNode, math.flatten(valueMatrix), elmt, valueHeaders);
                        valueHeaders = temp[1];
                        valueMatrix = [];
                        temp[0].forEach(function (matrix) {
                            //Each submatrix represents a free choice
                            matrix = matrix[0];
                            var max = matrix[0];
                            //Find the maximum in each sub matrix
                            matrix.forEach(function (v) {
                                max = Math.max(max, v);
                            });
                            valueMatrix.push([max]);
                        });
                    }
                }
                //Put headers and matrix back together
                valueMatrix.unshift(["value"]);
                if (valueHeaders[0].length > 0) {
                    valueHeaders.push(math.flatten(valueMatrix));
                }
                else {
                    //If there are no headers
                    valueHeaders = [math.flatten(valueMatrix)];
                }
                return valueHeaders;
            };
            //Takes a value table and a decision node and removes all chances from the value table that are not in the dec nodes headers
            Tools.removeChancesFromValues = function (p_model, p_utilityNode, utilityValues, p_decNode) {
                var decHeaders = math.flatten(Tools.getColumn(p_decNode.getValues(), 0));
                var values = utilityValues.slice();
                var valueMatrix = Tools.getMatrixWithoutHeader(values);
                var valueHeaders = values.slice(0, Tools.numOfHeaderRows(values));
                for (var row = 0; row < Tools.numOfHeaderRows(values); row++) {
                    var elmt = p_model.getElement(values[row][0]);
                    if (elmt.getType() === 0 && decHeaders.indexOf(values[row][0]) === -1) {
                        var temp = Tools.createSubMatrices(p_utilityNode, valueMatrix, elmt, valueHeaders);
                        valueHeaders = temp[1];
                        valueMatrix = [];
                        temp[0].forEach(function (matrix) {
                            //Multiply each submatrix with probabilities
                            valueMatrix = valueMatrix.concat(math.multiply(matrix, Tools.getMatrixWithoutHeader(elmt.getValues())));
                        });
                    }
                }
                //Put headers and matrix back together
                valueMatrix.unshift(["value"]);
                valueHeaders.push(math.flatten(valueMatrix));
                return valueHeaders;
            };
            Tools.isOneDimensional = function (p_array) {
                //console.log(p_array.length);
                return (p_array.length === 1 || !($.isArray((p_array)[0])) || p_array[1] === undefined);
            };
            Tools.fillEmptySpaces = function (p_table) {
                //console.log("Filling empty spaces in: " + p_table);
                for (var i = 0; i < p_table.length; i++) {
                    for (var j = 0; j < p_table[0].length; j++) {
                        // console.log(p_table[i][j])
                        if (p_table[i][j] === undefined) {
                            p_table[i][j] = 0;
                        }
                    }
                }
                // console.log("result: " + p_table);
                return p_table;
            };
            //Removes the columns belonging to the state p_state
            Tools.removeState = function (p_data, p_changedElmt, p_state) {
                var data = Tools.makeSureItsTwoDimensional(p_data);
                var rows = math.size(data)[0];
                var columns = math.size(data)[1];
                var newData = [];
                var newRow;
                for (var i = 0; i < rows; i++) {
                    if (data[i][0] === p_changedElmt.getID()) {
                        var changedRow = i;
                        break;
                    }
                }
                for (var i = 0; i < rows; i++) {
                    newRow = [];
                    for (var j = 0; j < columns; j++) {
                        if (data[changedRow][j] !== p_state) {
                            newRow.push(data[i][j]);
                        }
                    }
                    newData.push(newRow);
                }
                data = newData;
                return data;
            };
            //Convert the array to only contain one of each element
            Tools.removeDuplicates = function (p_array) {
                p_array = Tools.makeSureItsTwoDimensional(p_array);
                var newArray = [p_array[0][0]];
                //    console.log("newArray size: " + math.size(newArray));
                for (var i = 1; i < math.size(p_array)[1]; i++) {
                    //    console.log("looking for " + array[0][i] + " in " + newArray);
                    if (newArray.indexOf(p_array[0][i]) === -1) {
                        //      console.log("does not exist");
                        newArray.push(p_array[0][i]);
                    }
                }
                newArray = Tools.makeSureItsTwoDimensional(newArray);
                return newArray;
            };
            Tools.addNewHeaderRow = function (p_newRow, p_table) {
                //console.log("Adding array: " + p_newRow + " size " + math.size(p_newRow));
                var array = Tools.makeSureItsTwoDimensional(p_newRow.slice());
                //Convert the array to only contain one of each element
                array = Tools.removeDuplicates(array);
                //          console.log("array size: " + math.size(array));
                //         console.log("to " + p_table + " size "+ math.size(p_table));
                var newTable = [];
                var numOfDiffValues = array[0].length - 1;
                //        console.log("numOfDiffValues " + numOfDiffValues)
                var newRow;
                if (p_table[0] !== undefined) {
                    if (!($.isArray((p_table)[0]))) {
                        p_table = [p_table];
                    }
                    var rowLength = p_table[0].length - 1;
                    //For each row
                    for (var i = 0; i < p_table.length; i++) {
                        //For each different value in new row
                        for (var n = 0; n < numOfDiffValues - 1; n++) {
                            newRow = p_table[i];
                            //  console.log(newRow);
                            //For each column
                            for (var j = 1; j <= rowLength; j++) {
                                //Add the value
                                newRow.push(p_table[i][j]);
                            }
                        }
                        //        console.log("new row number " + i + ": " + newRow)
                        newTable.push(newRow);
                    }
                }
                else {
                    //       console.log("p_table was empty");
                    rowLength = 1;
                }
                //Add the new row of variables
                var newRow = [array[0][0]];
                //delete first element before going into the loop
                array[0].splice(0, 1);
                for (var j = 0; j < numOfDiffValues; j++) {
                    for (var i = 0; i < rowLength; i++) {
                        newRow.push(array[0][j]);
                    }
                }
                //  console.log("new header row: " + newRow);
                //Add the new row at the top of the table
                newTable.splice(0, 0, newRow);
                //     console.log("new table: " + newTable + " size: " + math.size(newTable));
                return newTable;
            };
            Tools.getRowNumber = function (p_values, decisionElement) {
                //  console.log("looking for " + decisionElement.getID() + " in " + p_values);
                for (var i = 0; i < p_values.length; i++) {
                    if (p_values[i][0] === decisionElement.getID()) {
                        return i;
                    }
                }
            };
            Tools.updateConcerningDecisions = function (element) {
                //console.log("updating concerning decisions " + element.getName());
                var rowsToDelete = [];
                //console.log("all ancestors for " + element.getName() +": "  + element.getAllAncestors());
                element.getAllAncestors().forEach(function (elmt) {
                    if (elmt.getType() === 1 && elmt.getDecision() !== undefined) {
                        //console.log("checking: " + elmt.getName());
                        var values = element.getValues();
                        var decision = elmt.getData()[elmt.getDecision()][0];
                        //console.log("choice is made: " + decision + " in elemnent " + elmt.getName());
                        // console.log("values: " + values + " size: " + math.size(values));
                        var newValues = [];
                        var rowNumber = Tools.getRowNumber(element.getValues(), elmt);
                        //console.log("rownumber: " + rowNumber);
                        for (var i = 0; i < values.length; i++) {
                            var newRow = [];
                            for (var j = 0; j < values[0].length; j++) {
                                //console.log("checking if " + values[rowNumber][j] + " matches " + decision);
                                if (values[rowNumber][j] === decision || j === 0) {
                                    //console.log("adding " + (values[i][j]));
                                    newRow.push(values[i][j]);
                                }
                            }
                            //console.log("adding row: " + newRow);
                            newValues.push(newRow);
                        }
                        rowsToDelete.push(rowNumber);
                        //console.log("setting values to: " + newValues);
                        element.setValues(newValues);
                    }
                });
                //console.log("done updating element concerning decisions");
                //element.setValues(Tools.deleteRows(element.getValues(), rowsToDelete)); //This will delete the headerrows that have been decided
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
                //   console.log("underDim: " + underDim);
                //  console.log("overDim: " + overDim);
                return strength;
            };
            //Copies all data and adds it to the table. This should be used when new parent elements have been added
            Tools.fillDataTable = function (p_elmt, p_dataTable) {
                // console.log("filling table: " + p_dataTable);
                // console.log(p_dataTable);
                var headerRows = [];
                var data = [];
                var tempData = [];
                var numOfHeaderRows = Tools.numOfHeaderRows(p_dataTable);
                var newDataTable;
                if (p_elmt.getType() === 3) {
                    newDataTable = [];
                    for (var i = 0; i < p_dataTable.length; i++) {
                        if (p_dataTable[i][1] === undefined) {
                            newDataTable.push([p_dataTable[i][0]]);
                            newDataTable[i].push(0);
                        }
                        else {
                            newDataTable.push(p_dataTable[i]);
                        }
                    }
                    newDataTable = Tools.makeSureItsTwoDimensional(newDataTable);
                }
                else {
                    //Adding the header rows
                    for (var i = 0; i < numOfHeaderRows; i++) {
                        var newRow = [];
                        for (var j = 0; j < p_dataTable[0].length; j++) {
                            newRow.push(p_dataTable[i][j]);
                        }
                        headerRows.push(newRow);
                    }
                    headerRows = Tools.makeSureItsTwoDimensional(headerRows);
                    //  console.log("header rows: " + headerRows);
                    //Adding data values
                    for (var i = numOfHeaderRows; i < p_dataTable.length; i++) {
                        var newRow = [];
                        for (var j = 1; j < p_dataTable[0].length; j++) {
                            var value = p_dataTable[i][j];
                            if (!isNaN(value)) {
                                newRow.push(value);
                            }
                        }
                        data.push(newRow);
                        tempData.push(newRow);
                    }
                    data = Tools.makeSureItsTwoDimensional(data);
                    tempData = Tools.makeSureItsTwoDimensional(tempData);
                    //Copy data into tempData until the number of columns matches the num of columns in headerows
                    while (tempData[0].length < headerRows[0].length - 1) {
                        tempData = math.concat(tempData, data);
                    }
                    data = tempData;
                    newDataTable = headerRows;
                    //Add element id first in each row
                    for (var i = 0; i < data.length; i++) {
                        data[i].unshift(p_dataTable[numOfHeaderRows + i][0]);
                        newDataTable.push(data[i]);
                    }
                }
                //console.log("new table after filling: " + newDataTable);
                return newDataTable;
            };
            //removes headerrow and updates the datatable accordingly
            Tools.removeHeaderRow = function (p_elmt, p_rowName, p_oldData) {
                //var newData: Array<Array<any>> = [];
                var newData = [];
                var numHeaderRows = this.numOfHeaderRows(p_oldData, p_elmt);
                //console.log(p_oldData);
                // console.log("numHeaderRows: " + numHeaderRows);
                var dims = [];
                var underDim = [];
                var overDim = [];
                var removeDim = 0;
                var oldRowLength = p_oldData[0].length;
                var numDataRows = p_oldData.length - numHeaderRows;
                for (var i = 0; i <= numHeaderRows; i++) {
                    dims[i] = 1;
                }
                //finding the dims of the datatable
                for (var i = numHeaderRows - 1; i >= 1; i--) {
                    //console.log("Data: " + p_oldData);
                    //console.log("Data first element: " + p_oldData[i][1]);
                    for (j = 1 + dims[i + 1]; j < oldRowLength; j++) {
                        //console.log("Data j: " + j + "  " + p_oldData[i][j]);
                        if (p_oldData[i][j] == p_oldData[i][1]) {
                            dims[i] = j - 1;
                            break;
                        }
                    }
                }
                dims[0] = oldRowLength - 1;
                for (var i = 1; i < numHeaderRows; i++) {
                    dims[i - 1] /= dims[i];
                }
                // console.log("cumula Dims: " + dims);
                for (var init = 0; init < numHeaderRows; init++) {
                    underDim[init] = 1;
                    overDim[init] = 1;
                }
                //console.log("begin");
                for (var ix in dims) {
                    for (var iy in dims) {
                        if (ix < iy) {
                            //console.log("p_dims under b " + p_dims[ix] + "  " + p_dims[iy] + "  " + underDim[ix]);
                            underDim[ix] *= dims[iy];
                        }
                        if (ix > iy) {
                            //console.log("p_dims over b " + p_dims[ix] + "  " + p_dims[iy] + "  " + overDim[ix]);
                            overDim[ix] *= dims[iy];
                        }
                    }
                }
                //console.log("p_dims: " + p_dims);
                //console.log("under: " + underDim);
                //console.log("over: " + overDim);
                //console.log("OldData: ");
                //for (var i = 0; i < p_oldData.length; i++) {
                //    console.log(this.getRow(p_oldData, i)); 
                //}
                //console.log("OldData: " + p_oldData.length);
                //console.log("num Header  rows: " + this.numOfHeaderRows(p_oldData));
                var found = false;
                for (var i = 0; i < numHeaderRows; i++) {
                    //console.log("checking " + p_oldData[i][0] + " and " + p_rowName + " : " + (p_rowName == p_oldData[i][0]));
                    if (p_rowName == p_oldData[i][0]) {
                        //console.log("newDatatable constrict");
                        //console.log("Before splice p_dims: " + p_dims);
                        removeDim = dims[i];
                        //p_dims.splice(i, 1);
                        //console.log("After splice p_dims: " + p_dims);
                        ////console.log("newDatatable constrict");
                        //console.log("removeDim: " + removeDim);
                        //for (var init = 0; init < numHeaderRows-1; init++) {
                        //    underDim[init] = 1;
                        //    overDim[init] = 1;
                        //}
                        //for (var ix in p_dims) {
                        //    for (var iy in p_dims) {
                        //        if (ix < iy) {
                        //            console.log("p_dims under b " + p_dims[ix] + "  " + p_dims[iy] + "  " + underDim[ix]);
                        //            underDim[ix] *= p_dims[ix];
                        //            console.log("p_dims under a " + p_dims[ix] + "  " + p_dims[iy] + "  " + underDim[ix]);
                        //        }
                        //        if (ix > iy) {
                        //            console.log("p_dims over b " + p_dims[ix] + "  " + p_dims[iy] + "  " + overDim[ix]);
                        //            overDim[ix] *= p_dims[ix];
                        //            console.log("p_dims over a " + p_dims[ix] + "  " + p_dims[iy] + "  " + overDim[ix]);
                        //        }
                        //    }
                        //}
                        //for (var j = 0; j < numHeaderRows-1; j++) {
                        //    console.log("OverDim: " + overDim[j]);
                        //    console.log("underDim: " + underDim[j]);
                        //}
                        for (var j = 0; j < numHeaderRows - 1; j++) {
                            newData[j] = [];
                            if (j < i) {
                                newData[j][0] = p_oldData[j][0];
                                //console.log("ol/re " + (oldRowLength - 1) / removeDim);
                                for (var k = 0; k < (oldRowLength - 1) / removeDim; k++) {
                                    //console.log("j: " + j + "  k: " + (k) + " k*rd: " + (k * removeDim + 1) + " Data : " + p_oldData[j][k * removeDim + 1]);
                                    newData[j][(k + 1)] = p_oldData[j][k * removeDim + 1];
                                }
                            }
                            else {
                                newData[j][0] = p_oldData[j + 1][0];
                                for (var k = 0; k < (oldRowLength - 1) / removeDim; k++) {
                                    //console.log("j: " + j + "  k: " + (k) + " k*rd: " + (k * removeDim + 1) + " Data : " + p_oldData[j + 1][k  + 1]);
                                    newData[j][k + 1] = p_oldData[j + 1][k * removeDim + 1];
                                }
                            }
                        }
                        //console.log("Under: " + underDim[i] + " Over: " + overDim[i] + " Remove: " + removeDim);
                        for (var ia = 0; ia < numDataRows; ia++) {
                            // for (var ia = 0; ia < 1; ia++) {
                            newData[ia + numHeaderRows - 1] = [];
                            newData[ia + numHeaderRows - 1][0] = p_oldData[ia + numHeaderRows][0];
                            for (var ib = 0; ib < overDim[i]; ib++) {
                                for (var ic = 0; ic < underDim[i]; ic++) {
                                    //console.log("ia + numHeaderRows - 1: " + (ia + numHeaderRows - 1) + "  ib * underDim[i] + 1: " + (ib * underDim[i] + ic + 1)) ;
                                    newData[ia + numHeaderRows - 1][ib * underDim[i] + ic + 1] = 0;
                                    for (var id = 0; id < removeDim; id++) {
                                        //console.log("ib * overDim[i] + ic*underDim[i] + id+1 " + (((id * underDim[i]) + ic) + underDim[i] * removeDim * ib + 1 ));
                                        //ib * (removeDim + ic * overDim[i]) +
                                        //console.log("index: " + (ib * underDim[i] + ic + 1) + "  Value: " + p_oldData[ia + numHeaderRows][((id * underDim[i]) + ic) + underDim[i] * removeDim * ib + 1]);
                                        newData[ia + numHeaderRows - 1][ib * underDim[i] + ic + 1] += p_oldData[ia + numHeaderRows][((id * underDim[i]) + ic) + underDim[i] * removeDim * ib + 1];
                                    }
                                    newData[ia + numHeaderRows - 1][ib * underDim[i] + ic + 1] /= removeDim;
                                }
                            }
                        }
                        //for (var j = 0; j < numHeaderRows - 1; j++) {
                        //    for (var k = 0; k < 
                        //    else {
                        //    }
                        //}
                        found = true;
                        break;
                    }
                }
                for (var i = 0; i < p_oldData.length; i++) {
                }
                if (!found) {
                    console.log("not found");
                    newData = p_oldData;
                }
                //console.log("NewData: length: "  + newData.length);
                for (var i = 0; i < newData.length; i++) {
                    console.log(this.getRow(newData, i));
                }
                console.log("newData: " + newData);
                console.log(newData);
                return newData;
            };
            Tools.validConnection = function (inputElmt, outputElmt) {
                //console.log("checking connection from " + inputElmt.getID() + " to " + outputElmt.getID());
                var valid = true;
                if (inputElmt.isAncestorOf(outputElmt)) {
                    valid = false;
                }
                else if (inputElmt.isParentOf(outputElmt)) {
                    valid = false;
                }
                else if (inputElmt.getType() === 2 && (outputElmt.getType() === 1 || outputElmt.getType() === 0 || (outputElmt.getType() === 2 && outputElmt.getParentElements().length > 0))) {
                    valid = false;
                }
                else if (outputElmt.getType() === 3 && inputElmt.getType() !== 2) {
                    valid = false;
                }
                // console.log("valid connection between " + inputElmt.getType() + " and  " + outputElmt.getType() + ": " + valid);
                return valid;
            };
            Tools.valueOfInformation = function (p_model, p_pov, p_forDec, p_chanceElmts, p_gui) {
                console.log("value of information. POV: " + p_pov.getName() + " for dec: " + p_forDec.getName() + " chancenodes: " + p_chanceElmts.length);
                var tempConnections = [];
                var isPossible = true;
                //Create temporary decision
                var tempDecision = p_model.createNewElement(1);
                //Add connection from temp dec to point of interest
                var c = p_model.createNewConnection(tempDecision, p_pov);
                if (!p_model.addConnection(c)) {
                    isPossible = false;
                }
                p_pov.setUpdated(false);
                p_pov.getAllDescendants().forEach(function (e) {
                    e.setUpdated(false);
                });
                p_pov.getAllAncestors().forEach(function (e) {
                    e.setUpdated(false);
                });
                tempDecision.setUpdated(false);
                //Find a utility node
                var utilityFound = false;
                for (var i = 0; i < p_model.getElementArr().length; i++) {
                    var elmt = p_model.getElementArr()[i];
                    if (elmt.getType() === 2) {
                        //Add connection from temp dec to utility node
                        var c = p_model.createNewConnection(tempDecision, elmt);
                        if (!p_model.addConnection(c)) {
                            isPossible = false;
                        }
                        elmt.setUpdated(false);
                        elmt.getAllDescendants().forEach(function (e) {
                            e.setUpdated(false);
                        });
                        elmt.getAllAncestors().forEach(function (e) {
                            e.setUpdated(false);
                        });
                        utilityFound = true;
                        break;
                    }
                }
                if (!utilityFound) {
                    //If there is no utility node in the model it is not possible to calc value of information
                    isPossible = false;
                }
                //Update model and save values of temp dec
                p_model.update();
                var matrix1 = Tools.getMatrixWithoutHeader(tempDecision.getValues()).slice();
                //Create connection from each of the selected chance nodes to the selected for decision
                p_chanceElmts.forEach(function (e) {
                    var c = p_model.createNewConnection(e, p_forDec);
                    if (!p_model.addConnection(c)) {
                        isPossible = false;
                    }
                    else {
                        tempConnections.push(c);
                    }
                    p_forDec.setUpdated(false);
                    p_forDec.getAllDescendants().forEach(function (e) {
                        e.setUpdated(false);
                    });
                    p_forDec.getAllAncestors().forEach(function (e) {
                        e.setUpdated(false);
                    });
                    e.setUpdated(false);
                });
                //Update model and save values of temp decision
                p_model.update();
                var matrix2 = Tools.getMatrixWithoutHeader(tempDecision.getValues()).slice();
                //Subtract the two saved matrices
                var resultMatrix = math.subtract(matrix2, matrix1);
                //Delete temporary elements and connections
                debugger;
                p_gui.deleteSelected(new Event("click"), [tempDecision], tempConnections); //The event is empyt and not used
                p_gui.updateModel();
                if (isPossible) {
                    return resultMatrix;
                }
                else {
                    return [[0], [0]];
                }
            };
            Tools.calcValuesLikelihoodSampling = function (p_model, p_numOfIterations) {
                //console.log("calculating values with evidence");
                var numberOfRuns = p_numOfIterations;
                var table = []; //contains all cases
                var evidenceElmts = p_model.getElmtsWithEvidence();
                for (var n = 0; n < numberOfRuns; n++) {
                    var w = 1;
                    var aCase = {};
                    var sampledElmts = [];
                    p_model.getElementArr().forEach(function (e) {
                        if (e.getType() !== 2 && sampledElmts.indexOf(e) < 0) {
                            var result = Tools.sample(sampledElmts, evidenceElmts, aCase, w, e, p_model);
                            aCase = result[0]; //Update the case 
                            w = result[1]; //Update weight
                            sampledElmts = result[2]; //Update sampled elements
                            sampledElmts.push(e);
                        }
                    });
                    table.push([aCase, w]);
                }
                var weightSum = 0;
                /*for (var i = 0; i < table.length; i++) {
                    //console.log("weight: " + table[i][1]);
                    weightSum += table[i][1];
                }*/
                //console.log("weightSum " + weightSum);
                p_model.getElementArr().forEach(function (e) {
                    console.log("calculating values for " + e.getName());
                    if (e.getType() === 0 || e.getType() === 2) {
                        var data = e.getData();
                        var values = [];
                        var oldValues = e.getValues(); //This is used to gain information about the headerrows in values
                        //Add the headerrows into values
                        for (var row = 0; row < Tools.numOfHeaderRows(oldValues, e); row++) {
                            values.push(oldValues[row]);
                        }
                        var dataLength = data.length;
                        var startCol = Tools.numOfHeaderRows(data, e);
                        if (e.getType() === 2) {
                            dataLength = data[0].length;
                            startCol = 1;
                        }
                        // console.log("startCol: " + startCol + " dataLenght: " + dataLength);
                        for (var i = startCol; i < dataLength; i++) {
                            var valRow = [];
                            if (e.getType() === 0) {
                                valRow.push(data[i][0]); //push name of value
                            }
                            else {
                                valRow.push("dummyCol");
                            }
                            for (var col = 1; col < oldValues[0].length; col++) {
                                var value = 0;
                                //console.log("calculating for " + data[i][0] + " column: " + col + " in " + e.getName());
                                weightSum = 0; //Calculate a new weight sum for each column
                                for (var j = 0; j < table.length; j++) {
                                    //console.log("case: " + JSON.stringify(table[j][0]));
                                    var matchingCase = true;
                                    var matchingValue = true;
                                    if (e.getType() === 2) {
                                        for (var headerRow = 0; headerRow < Tools.numOfHeaderRows(data); headerRow++) {
                                            //console.log("column: " + i + ". Checking " + data[headerRow][0] + ", " + table[j][0][data[headerRow][0]] + " against " + data[headerRow][i]);
                                            if (table[j][0][data[headerRow][0]] !== data[headerRow][i]) {
                                                matchingValue = false;
                                            }
                                        }
                                    }
                                    else if (table[j][0][e.getID()] !== data[i][0]) {
                                        //console.log("value does not match");
                                        matchingValue = false;
                                    }
                                    for (var headerRow = 0; headerRow < Tools.numOfHeaderRows(oldValues, e); headerRow++) {
                                        var headerElmt = oldValues[headerRow][0];
                                        //console.log("checking if case includes " + p_model.getElement(headerElmt).getName() + " : " + oldValues[headerRow][col]); 
                                        if (table[j][0][headerElmt] !== oldValues[headerRow][col]) {
                                            //console.log("does not match");
                                            matchingCase = false;
                                        }
                                    }
                                    if (matchingCase) {
                                        weightSum += table[j][1];
                                    }
                                    if (matchingValue && matchingCase) {
                                        //console.log("matching case and value");
                                        value += table[j][1]; //Add the weight
                                    }
                                    else {
                                    }
                                }
                                value /= weightSum;
                                if (isNaN(value)) {
                                    value = 0;
                                }
                                valRow.push(value);
                            }
                            values.push(valRow);
                        }
                        if (e.getType() === 2) {
                            //console.log("values: ");
                            //console.log(values);
                            //console.log("multiplying "+ Tools.getMatrixWithoutHeader(data) + " and " + Tools.getMatrixWithoutHeader(values));
                            var utilityValue = math.multiply(Tools.getMatrixWithoutHeader(data), Tools.getMatrixWithoutHeader(values));
                            utilityValue = math.squeeze(utilityValue);
                            if (!isNaN(utilityValue)) {
                                utilityValue = [utilityValue];
                            }
                            //console.log("result: ");
                            //console.log(utilityValue);
                            //Add the headerrows into values
                            values = [];
                            for (var row = 0; row < Tools.numOfHeaderRows(oldValues, e); row++) {
                                values.push(oldValues[row]);
                            }
                            var valueRow = ["Value"];
                            for (var i = 0; i < utilityValue.length; i++) {
                                valueRow.push(utilityValue[i]);
                            }
                            //console.log("valueRow: " + valueRow);
                            //console.log(valueRow);
                            values[row] = valueRow;
                        }
                        //console.log("new values: ");
                        //console.log(values);
                        //console.log("setting values for " + e.getName()+ " + to: "+ values);
                        e.setValues(values);
                        e.setUpdated(true);
                    }
                });
                p_model.getElementArr().forEach(function (e) {
                    if (!e.isUpdated()) {
                        //console.log("calculating for " + e.getName());
                        Tools.calculateValues(p_model, e);
                        e.setUpdated(true);
                    }
                });
            };
            Tools.sample = function (p_sampledElmts, p_evindeceElmts, p_case, p_weight, p_elmt, p_model) {
                var oldValues = p_elmt.getValues();
                //console.log("\nsampling " + p_elmt.getName());
                p_elmt.getParentElements().forEach(function (parent) {
                    if (p_sampledElmts.indexOf(parent) < 0 && parent.getType() !== 2) {
                        var result = Tools.sample(p_sampledElmts, p_evindeceElmts, p_case, p_weight, parent, p_model);
                        p_case = result[0];
                        p_weight = result[1];
                        p_sampledElmts = result[2];
                        p_sampledElmts.push(parent);
                    }
                });
                if (p_evindeceElmts.indexOf(p_elmt) > -1) {
                    //console.log("this is evindece elmt");
                    p_weight = p_weight * Tools.getValueFromParentSamples(p_elmt, p_case, p_model);
                    //console.log("weight updated to " + p_weight);
                    var row = Number(p_elmt.getEvidence()) + Tools.numOfHeaderRows(p_elmt.getData());
                    //console.log("row: " + row);
                    p_case[p_elmt.getID()] = p_elmt.getData()[row][0];
                }
                else {
                    //console.log("not evidence");
                    var sample = Tools.getWeightedSample(p_elmt, p_case);
                    //console.log("sampled: " + sample);
                    p_case[p_elmt.getID()] = sample;
                }
                return [p_case, p_weight, p_sampledElmts];
            };
            Tools.getElmtsWithEvidence = function (p_model) {
                var elementsWithEvidence = [];
                p_model.getElementArr().forEach(function (e) {
                    if (e.getType() === 0 && e.getEvidence() !== undefined) {
                        elementsWithEvidence.push(e);
                    }
                });
                return elementsWithEvidence;
            };
            Tools.getWeightedSample = function (p_elmt, p_case) {
                var randomNumber = Math.random();
                var data = p_elmt.getData();
                var columnNumbers = Tools.getColumnFromCase(p_case, p_elmt);
                var sum = 0;
                // console.log("columnnumbers: " + columnNumbers);
                for (var i = Tools.numOfHeaderRows(data, p_elmt); i < data.length; i++) {
                    var columnSum = 0;
                    if (p_elmt.getType() === 0) {
                        for (var j = 0; j < columnNumbers.length; j++) {
                            //console.log("data[i][columnNumber[j]]: " + data[i][columnNumber[j]]);
                            columnSum += data[i][columnNumbers[j]];
                        }
                        columnSum /= j;
                    }
                    else if (p_elmt.getType() === 1) {
                        /*if (p_elmt.getDecision() !== undefined) {//If the choice is made
                            return data[Number(p_elmt.getDecision()) + Tools.numOfHeaderRows(data, p_elmt)][0];//Return the choice (Is  + Tools.numOfHeaderRows needed??)
                        }*/
                        columnSum = 1 / (data.length - Tools.numOfHeaderRows(data, p_elmt)); // just sample randomly from the choices
                    }
                    sum += columnSum; // If there is just one matching column (no decision parent) this is the same as sum += data[i][columnNumber]
                    //console.log("sum: " + sum);
                    if (randomNumber <= sum) {
                        //console.log("sampled " + data[i][0]);
                        return data[i][0];
                    }
                }
            };
            Tools.getColumnFromCase = function (p_case, p_elmt) {
                //console.log("Looking for columns in " + p_elmt.getName());
                var parents = p_elmt.getParentElements();
                var conditions = [];
                parents.forEach(function (e) {
                    //console.log("pushing " + p_case[e.getID()] + " elmt " +e.getID() + " into conditions");
                    conditions.push([e.getID(), p_case[e.getID()]]);
                });
                //Find the right column in data table
                var data = p_elmt.getData();
                var columnNumbers = [];
                for (var i = 1; i < data[0].length; i++) {
                    //console.log("checking column " + i);
                    var matchingColumn = true;
                    for (var j = 0; j < Tools.numOfHeaderRows(data, p_elmt); j++) {
                        //console.log("checking row: " + data[j]);
                        for (var n = 0; n < conditions.length; n++) {
                            // console.log("elmt " + data[j][0] + " matches: " + conditions[n][0] + "?");
                            //console.log( data[j][0] === conditions[n][0]);
                            //console.log("data condition: " + data[j][i].trim() + " does not match: " + conditions[n][1].trim() + "?")
                            //console.log(data[j][i].trim() !== conditions[n][1].trim());
                            if (data[j][0] === conditions[n][0] && data[j][i].trim() !== conditions[n][1].trim()) {
                                //console.log("not correct column");
                                matchingColumn = false; // then it's not the right column
                                break;
                            }
                        }
                    }
                    if (matchingColumn) {
                        // console.log("correct column " + i);
                        columnNumbers.push(i);
                    }
                }
                //console.log("found columns: " + columnNumbers);
                return columnNumbers;
            };
            Tools.getValueFromParentSamples = function (p_elmt, p_case, p_model) {
                var columns = Tools.getColumnFromCase(p_case, p_elmt);
                // console.log("col: " + columns);
                var averageLikelihood = 0;
                for (var i = 0; i < columns.length; i++) {
                    var row = Number(p_elmt.getEvidence()) + Tools.numOfHeaderRows(p_elmt.getData());
                    averageLikelihood += p_elmt.getData()[row][columns[i]];
                }
                averageLikelihood /= i;
                //console.log("averageLikelihood: " + averageLikelihood);
                //console.log("getting value row: " + p_elmt.getEvidence() + " col: " + column);
                return averageLikelihood;
            };
            return Tools;
        }());
        DST.Tools = Tools;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Tools.js.map