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
                    if (sum < 0.999 || sum > 1.001) {
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
                //console.log(p_valuesArray);
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
            Tools.htmlTableFromArray = function (p_header, p_matrix, p_model) {
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
                        if (j === 0) {
                            htmlString += "<th>" + p_model.getElement(data[i][j]).getName() + "</th>";
                        }
                        else {
                            htmlString += "<th>" + data[i][j] + "</th>";
                        }
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
                //console.log("get column " + index + " from " + p_matrix + " size " + math.size(p_matrix));
                //  console.log(p_matrix)
                var rows = math.size(p_matrix).valueOf()[0];
                var range = math.range(0, rows);
                // //console.log("returned: " + math.subset(matrix, math.index(range, index)))
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
            Tools.concatMatrices = function (p_list) {
                var matrix = p_list[0];
                for (var i = 1; i < p_list.length; i++) {
                    //  console.log("concatting " + Tools.arrayToString(matrix) + " size " + math.size(matrix) + " and " + Tools.arrayToString(p_list[i]) + " size: " + math.size(p_list[i]));
                    matrix = math.concat(matrix, p_list[i]);
                }
                //console.log((matrix));
                return matrix;
            };
            Tools.makeSureItsAnArray = function (p_value) {
                if (math.size(p_value).valueOf()[1] === undefined) {
                    p_value = [p_value];
                }
                return p_value;
            };
            Tools.makeSureItsTwoDimensional = function (p_array) {
                if (math.size(p_array).length < 2) {
                    p_array = [p_array];
                }
                return p_array;
            };
            Tools.getMatrixWithoutHeader = function (p_matrix) {
                // console.log("get matrix without header from " + p_matrix)
                //       console.log(p_matrix);
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
                //console.log("returned: " + Tools.arrayToString(newMatrix));
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
            Tools.createSubMatrices = function (p_matrix, p_elmt, p_data) {
                //       console.log("create sub matrix from " + p_matrix + " size " + math.size(p_matrix) + " for values " + p_elmt);
                var data = Tools.makeSureItsTwoDimensional(p_data);
                //      console.log("data: " + (data) + " size " + math.size(data));
                var subMatrices = [];
                var columns = math.size(p_matrix).valueOf()[1];
                var newDataHeaders = [];
                //   console.log("columns: " + columns);
                var added = [];
                //    console.log("size of data: " + math.size(data));
                //For each column
                for (var n = 1; n <= columns; n++) {
                    //  console.log("n: " + n);
                    //If column has not already been added
                    if (added.indexOf(n) === -1) {
                        // console.log(data);
                        var currentColumn = math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(data, n)));
                        // console.log("current column: " + currentColumn + " num: "+ n);
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
                            // console.log("checking column " + columnValues);
                            //For each header value in column
                            for (var j = 0; j < Tools.numOfHeaderRows(data); j++) {
                                //If the value is not found this is not a matching column
                                //console.log("checking value: " + data[j][i]);
                                if (currentColumn.indexOf(data[j][i]) === -1) {
                                    //console.log(data[j][i] + " was not found in " + currentColumn)
                                    matchingColumn = false;
                                    //  But if the value is part of the make-submatrix-element the column might be a matching column
                                    if (p_elmt !== undefined && p_elmt.getID() === data[j][0]) {
                                        //       console.log("element is the make-submatrix-element");
                                        matchingColumn = true;
                                    }
                                }
                                //If the element was not found in current column and is not the make-submatrix-element break out of the loop
                                if (!matchingColumn) {
                                    // console.log("not a matching column");
                                    break;
                                }
                            }
                            //If this column is right, add it to the matrix
                            if (matchingColumn) {
                                //       console.log("matching column");
                                added.push(i);
                                var column = Tools.makeSureItsAnArray(Tools.getColumn(p_matrix, i - 1));
                                newMatrix = math.concat(newMatrix, column);
                            }
                        }
                        // console.log("adding matrix: " + newMatrix);
                        subMatrices.push(newMatrix);
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
                if (p_elmt !== undefined) {
                    //Delete the row that was used to make the submatrices
                    for (var i = 0; i < newDataHeaders.length; i++) {
                        if (p_elmt.getID() === newDataHeaders[i][0]) {
                            newDataHeaders.splice(i, 1);
                        }
                    }
                }
                //    console.log("new data headers: " + newDataHeaders);
                //   console.log("returned " + subMatrices + " size of submatrix " + math.size(subMatrices[0]) + " number of submatrices " + subMatrices.length);
                return [subMatrices, newDataHeaders];
                //return subMatrices;
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
            //This method removes the last row in p_dataheader and addds the new row p_newRow
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
                var newArray = [p_newRow[0][0]];
                for (var i = 1; i < columnsInNewRow; i++) {
                    if (newArray.indexOf(p_newRow[0][i]) === -1) {
                        newArray.push(p_newRow[0][i]);
                    }
                }
                var newRow = newArray;
                //console.log("new row with one of each: " + newRow);
                columnsInNewRow = newRow.length;
                // console.log("data headers size: " + p_dataHeader.length);
                //If p_dataheader is empty just set p_dataHeader equal to newRow
                if (p_dataHeader.length < 1) {
                    //console.log(" data header was one dimensional");
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
                                //                   console.log("j: " + j);
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
                        //console.log("data headers: " + p_dataHeader);
                        //console.log("columnsInNewRows: " + columnsInNewRows + " columnsInDataHeader: " + columnsInDataHeader);
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
                // console.log("inserting " + p_newRow + " in " + p_table + " size " + math.size(p_table));
                var tempTable = p_newRow.slice();
                //console.log("temp table: " + tempTable);
                if (p_table.length !== 0) {
                    if (Tools.isOneDimensional(p_table)) {
                        //      console.log("one dimensional");
                        tempTable = Tools.addNewHeaderRow(p_table, tempTable);
                    }
                    else {
                        //  console.log("length of p_table: " + p_table.length);
                        //Add each row from the bottom up
                        for (var i = p_table.length - 1; i >= 0; i--) {
                            tempTable = Tools.addNewHeaderRow(p_table[i], tempTable);
                        }
                    }
                }
                //console.log("returned: " + tempTable);
                return tempTable;
            };
            Tools.calculateValues = function (p_model, p_element) {
                var model = p_model;
                var element = p_element;
                //   console.log("calculate values for " + p_element.getName());
                var dataHeaders = []; //the header rows from data
                var data = element.getData();
                //     console.log("data: " + data + " size " + math.size(data));
                for (var i = 0; i < Tools.numOfHeaderRows(data); i++) {
                    var newRow = [];
                    for (var j = 0; j < data[0].length; j++) {
                        newRow.push(data[i][j]);
                    }
                    dataHeaders.push(newRow);
                }
                //  console.log("data headers: " + dataHeaders);
                if (element.getType() !== 1) {
                    var headerRows = []; //Used to add decisions to value matrix
                    // var takenIntoAccount = [];
                    var newValues = Tools.getMatrixWithoutHeader(data);
                    // console.log("data: " + Tools.arrayToString(newValues));
                    element.getParentElements().forEach(function (elmt) {
                        // console.log("parent: " + elmt.getName());
                        if (elmt.getType() === 0) {
                            // takenIntoAccount.push(elmt) //The parents which already have been evaluated
                            //  console.log("dataheaders: " + dataHeaders);
                            //Parent must be updated
                            if (!elmt.isUpdated()) {
                                //  console.log("updating " + elmt.getName());
                                elmt.update();
                            }
                            //console.log("parent values: " + Tools.arrayToString(elmt.getValues()));
                            var parentValuesMatrix = Tools.getMatrixWithoutHeader(elmt.getValues());
                            // console.log("current element: " + element.getName());
                            //console.log("data headers: " + Tools.arrayToString(dataHeaders));
                            // console.log("taken into account: " + takenIntoAccount);
                            var temp = Tools.createSubMatrices(newValues, elmt, dataHeaders);
                            var submatrices = temp[0];
                            // console.log("submatrices has size: " + math.size(submatrices));
                            dataHeaders = temp[1];
                            //var submatrices = Tools.createSubMatrices(newValues, takenIntoAccount, dataHeaders);
                            //console.log("data headers: " + dataHeaders);
                            var result = [];
                            var decRows = [];
                            var newRow = [];
                            //If parent has dec in values table these are added to dataHeaders or parent submatrices are created
                            //   console.log("num of header rows in parent " + elmt.getName() + " values: " + Tools.numOfHeaderRows(elmt.getValues()));
                            if (Tools.numOfHeaderRows(elmt.getValues()) > 0) {
                                //For each dec in parent
                                var decInParent = Tools.numOfHeaderRows(elmt.getValues());
                                for (var i = 0; i < decInParent; i++) {
                                    //console.log("i:" + i + " decInParent: " + decInParent);
                                    var decRow = elmt.getValues()[i];
                                    //  console.log("decRow: " + decRow);
                                    // console.log("checking if dec exsists: " + math.flatten(Tools.getColumn(dataHeaders, 0)) + " index of " + decRow[0]);
                                    //If the parents decision already is in data headers add it to decRows to be used when creating parentsubmatrices
                                    //  console.log("number of header rows in data headers: " + Tools.numOfHeaderRows(dataHeaders));
                                    // console.log(dataHeaders);
                                    if (math.size(dataHeaders).length > 1 && math.size(dataHeaders)[0] > 1 && math.flatten(Tools.getColumn(dataHeaders, 0)).indexOf(decRow[0]) > -1) {
                                        //     console.log("DEC EXISTS");
                                        decRows.push(decRow);
                                    }
                                    else if (math.size(Tools.makeSureItsTwoDimensional(dataHeaders))[0] === 1 && Tools.makeSureItsTwoDimensional(dataHeaders)[0][0] === decRow[0]) {
                                        //   console.log("DEC EXISTS");
                                        decRows.push(decRow);
                                    }
                                    else {
                                        // console.log("dataHeaders before adding: " + Tools.arrayToString(dataHeaders));
                                        //The decision does not already exist. Insert it into headerrows
                                        headerRows = Tools.insertNewHeaderRowAtBottom(p_model.getElement(elmt.getValues()[i][0]).getMainValues(), headerRows);
                                        //   console.log("new header rows: " + headerRows);
                                        newRow = model.getElement(elmt.getValues()[i][0]).getMainValues();
                                        //      console.log("new row: " + newRow);
                                        //Update data headers to contain the new dec row
                                        dataHeaders = Tools.insertNewHeaderRowAtBottom(newRow, dataHeaders);
                                    }
                                }
                                if (decRows.length > 0) {
                                    //console.log("creating submatrices for parent");
                                    var parentSubMatrices = Tools.createSubMatrices(parentValuesMatrix, undefined, decRows)[0];
                                    var j = 0;
                                    for (var i = 0; i < submatrices.length; i++) {
                                        // console.log("i: " + i + " j: " + j);
                                        //console.log("multiplying " + submatrices[i] + " size " + math.size(submatrices[i]) + " and " + parentSubMatrices[j] + " size " + math.size(parentSubMatrices[j]));
                                        var newMatrix = Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentSubMatrices[j]));
                                        //console.log("size of new matrix: " + math.size(newMatrix));
                                        result.push(newMatrix);
                                        //   console.log("size of result: " + math.size(result));
                                        if (j < parentSubMatrices.length - 1) {
                                            j++;
                                        }
                                        else {
                                            j = 0;
                                        }
                                    }
                                    //   console.log("size of result" + math.size(result));
                                    newValues = Tools.concatMatrices(result);
                                }
                            }
                            if (result.length === 0) {
                                //    console.log("there were no decisions that already existed");
                                for (var i = 0; i < submatrices.length; i++) {
                                    //       console.log("multiplying " + submatrices[i] + " size " + math.size(submatrices[i]) + " and " + parentValuesMatrix + " size " + math.size(parentValuesMatrix));
                                    var newMatrix = Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentValuesMatrix));
                                    //console.log("size of new matrix: " + math.size(newMatrix));
                                    result.push(newMatrix);
                                }
                                newValues = Tools.concatMatrices(result);
                            }
                        }
                        else if (elmt.getType() === 1) {
                            //   console.log("headerrows: " + headerRows + " size " + math.size(headerRows));
                            //   console.log("checking if " + elmt.getID() + " is in headerrows");
                            //Only add if it does not already exist
                            if (headerRows.length === 0) {
                                // console.log("empty");
                                headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows);
                            }
                            else if (math.size(headerRows).length === 1 && headerRows[0] !== elmt.getID()) {
                                // console.log("compared " + headerRows[0] + " and " + elmt.getID() + " not equal " + headerRows[0] !== elmt.getID());
                                //   console.log("one dimensional");
                                headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows);
                            }
                            else if (math.size(headerRows).length > 1 &&
                                math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(Tools.makeSureItsTwoDimensional(headerRows), 0))).indexOf(elmt.getID()) === -1) {
                                // console.log("adding");
                                headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows);
                            }
                        }
                    });
                    newValues = Tools.convertToArray(newValues);
                    if (math.size(newValues).length === 2 && math.size(newValues)[0] === 1) {
                        var tempArray = [];
                        for (var i = 0; i < math.size(newValues)[1]; i++) {
                            tempArray.push(newValues[0][i]);
                        }
                        newValues = tempArray;
                    }
                    // console.log("checking for dimension: " + Tools.isOneDimensional(newValues)); 
                    if (Tools.isOneDimensional(newValues)) {
                        //console.log("one-dimensional")
                        newValues.unshift(data[Tools.numOfHeaderRows(element.getData())][0]);
                    }
                    else {
                        for (var i = 0; i < newValues.length; i++) {
                            //   console.log("unshifting " + data[i + Tools.numOfHeaderRows(element.getData())][0])
                            newValues[i].unshift(data[i + Tools.numOfHeaderRows(element.getData())][0]);
                        }
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
                    //       console.log("new values: " +(newValues))
                    newValues = Tools.makeSureItsTwoDimensional(newValues);
                    p_element.setValues(newValues);
                }
                else {
                    // console.log("decisions node begin");
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
                    //     console.log("decisions end");
                    p_element.setValues(values);
                }
                console.log("done calculatint values for " + p_element.getName());
                console.log("values: " + p_element.getValues() + " size " + math.size(p_element.getValues()));
            };
            Tools.isOneDimensional = function (p_array) {
                //console.log(p_array.length);
                return (p_array.length === 1 || !($.isArray((p_array)[0])) || p_array[1] === undefined);
            };
            Tools.arrayToString = function (p_array) {
                var newString = "[";
                if (Tools.isOneDimensional(p_array)) {
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
            Tools.addNewHeaderRow = function (p_newRow, p_table) {
                //         console.log("Adding array: " + p_newRow + " size " + math.size(p_newRow));
                var array = p_newRow.slice();
                array = Tools.makeSureItsTwoDimensional(array);
                //Convert the array to only contain one of each element
                var newArray = [array[0][0]];
                //    console.log("newArray size: " + math.size(newArray));
                for (var i = 1; i < math.size(array)[1]; i++) {
                    //    console.log("looking for " + array[0][i] + " in " + newArray);
                    if (newArray.indexOf(array[0][i]) === -1) {
                        //      console.log("does not exist");
                        newArray.push(array[0][i]);
                    }
                }
                array = Tools.makeSureItsTwoDimensional(newArray);
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
                //Add the new row at the bottom of the table
                // newTable.splice(Tools.numOfHeaderRows(p_data) - 1, 0, newRow);
                newTable.splice(0, 0, newRow);
                //     console.log("new table: " + newTable + " size: " + math.size(newTable));
                return newTable;
            };
            Tools.deleteHeaderRow = function (p_elmtID, p_table) {
                // console.log("deleting " + p_elmtID + " from " + p_table);
                var rows;
                var columns;
                var rowToDelete;
                if (Tools.isOneDimensional(p_table)) {
                    rows = 1;
                    columns = p_table.length;
                }
                else {
                    rows = p_table.length;
                    columns = p_table[0].length;
                }
                if (rows === 1) {
                    if (rows[0] === p_elmtID) {
                        return [];
                    }
                    else {
                        return p_table;
                    }
                }
                else {
                    for (var i = 0; i < rows; i++) {
                        if (p_table[i][0] === p_elmtID) {
                            rowToDelete = i;
                        }
                    }
                    if (rowToDelete === undefined) {
                        return p_table;
                    }
                }
                var tempTable = [rows];
                for (var j = 0; j < columns; j++) {
                    if (p_table[rowToDelete][i] === p_table[rowToDelete][columns - 1]) {
                        for (var i = 0; i < rows; i++) {
                            tempTable[i].push(p_table[i][j]);
                        }
                    }
                }
                return tempTable;
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
                // console.log("updating concerning decisions " + element.getName());
                var rowsToDelete = [];
                // console.log("all ancestors for " + element.getName() +": "  + element.getAllAncestors());
                element.getAllAncestors().forEach(function (elmt) {
                    if (elmt.getType() === 1 && elmt.getDecision() !== undefined) {
                        //   console.log("checking: " + elmt.getName());
                        var values = element.getValues();
                        var decision = elmt.getData()[elmt.getDecision()][0];
                        //console.log("choice is made: " + decision + " in elemnent " + elmt.getName());
                        //  console.log("values: " + values + " size: " + math.size(values));
                        var newValues = [];
                        var rowNumber = Tools.getRowNumber(element.getValues(), elmt);
                        // console.log("rownumber: " + rowNumber);
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
                //  console.log("deleting " + rows + " from " + array);
                var newArray = [];
                for (var i = 0; i < array.length; i++) {
                    if (rows.indexOf(i) === -1) {
                        // console.log("pushing row " + i+ " " + rows.indexOf(i));
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
                //   console.log("underDim: " + underDim);
                //  console.log("overDim: " + overDim);
                return strength;
            };
            Tools.fillDataTable = function (p_dataTable) {
                // console.log("filling table: " + p_dataTable);
                console.log(p_dataTable);
                var headerRows = [];
                var data = [];
                var tempData = [];
                var numOfHeaderRows = Tools.numOfHeaderRows(p_dataTable);
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
                var newDataTable = headerRows;
                //Add element id first in each row
                for (var i = 0; i < data.length; i++) {
                    data[i].unshift(p_dataTable[numOfHeaderRows + i][0]);
                    newDataTable.push(data[i]);
                }
                // console.log("new table after filling: " + newDataTable);
                return newDataTable;
            };
            return Tools;
        })();
        DST.Tools = Tools;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Tools.js.map