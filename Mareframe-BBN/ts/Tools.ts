module Mareframe {
    export module DST {
        export class Tools {
            static getValueFn(p_xVal, p_posX, p_posY) {

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
            }
            static getUrlParameter(p_sParam) {
                var sPageURL = window.location.search.substring(1);
                var sURLVariables = sPageURL.split('&');
                for (var i = 0; i < sURLVariables.length; i++) {
                    var sParameterName = sURLVariables[i].split('=');
                    if (sParameterName[0] === p_sParam) {
                        //console.log("returning " + sParameterName[1] + " to handler");
                        return sParameterName[1];
                    }
                }
            }//borrowed code

            static columnSumsAreValid(data, numOfHeaderRows) {
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

            static getWeights(p_elmt: Element, p_model: Model): number[][]{
                var weightsArr: number[][]=[];

                if (p_elmt.getType() != 0 && p_elmt.getType() !=2) {
                    var total: number = 0.0;
                    p_elmt.getData(1).forEach(function (val: number) { total += val; });
                    for (var i = 0; i < p_elmt.getData()[0].length; i++) {
                        var childWeights: number[][] = this.getWeights(p_model.getConnection(p_elmt.getData(0, i)).getInputElement(), p_model);
                        for (var j = 0; j < childWeights.length; j++) {
                            childWeights[j][1] *= (p_elmt.getData()[1][i] / total);
                        }
                        weightsArr = weightsArr.concat(childWeights);
                    }
                } else {
                    weightsArr.push([p_elmt.getData[0], 1]);
                }
                return weightsArr;
            }

            static getHighest(array: number[]):number {
                // //console.log("finding highest in " + array)
                var highest: number = Number.NEGATIVE_INFINITY;
                array.forEach(function (numb: number) {
                    if (numb > highest) {
                        highest = numb;
                    }
                })
                // //console.log("higest " + highest)
                return highest;
            }

            static numOfHeaderRows(p_valuesArray): number {
                var counter = 0;
                for (var i = 0; i < p_valuesArray.length; i++) {
                    //if the cell in column 2 contains text it is a header row and must be a decision
                    if (isNaN(p_valuesArray[i][1]) && p_valuesArray[i][1] !== undefined) {
                        counter++;
                    }
                }
                return counter
            }

            static htmlTableFromArray(p_header: string, p_matrix: any[][]) {

                var data: any[][] = p_matrix;
                var numOfHeaderRows = Tools.numOfHeaderRows(p_matrix);

                var htmlString = "";
                if (data[0] !== undefined) {
                    htmlString += "<tr><th style='text-align:center' colspan=\"" + data[0].length + "\">" + p_header + " </th></tr>";
                } else {
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
                        } else {
                            htmlString += "<td>" + Tools.round((data[i][j])) + "</td>";
                        }

                    }
                    htmlString += "</tr>";
                }
                //console.log("html table: " + htmlString);
                return htmlString;
            }

            static round(numb: number) {
                return Number(Math.round(numb * 1000) / 1000);
            }

            static getColumn(p_matrix: any[][], index: number) {
                //console.log("get column " + index + " from " + p_matrix)
                //console.log(p_matrix)
                var rows = math.size(p_matrix).valueOf()[0];
                var range = math.range(0, rows);
                // //console.log("returned: " + math.subset(matrix, math.index(range, index)))
                return math.subset(p_matrix, math.index(range, index));
            }

            static getRow(p_matrix: any[][], p_index: number) {
                // //console.log("get row " + index + " from " + matrix)
                var columns = math.size(p_matrix).valueOf()[1];
                var range = [];
                for (var n = 0; n < columns; n++) {
                    range.push(n);
                }
                return math.subset(p_matrix, math.index(p_index, range));
            }

            static concatMatrices(p_list: any[][][]): any[][] {
                var matrix = p_list[0];
                for (var i = 1; i < p_list.length; i++) {
                    matrix = math.concat(matrix, p_list[i]);
                }
                return matrix;
            }

            static makeSureItsAnArray(p_value: any[]): any[] {
                if (math.size(p_value).valueOf()[1] === undefined) {
                    p_value = [p_value];
                }
                return p_value;
            }

            static getMatrixWithoutHeader(p_matrix: any[][]): any[][] {
                // //console.log("get matrix without header from " + matrix)
                var numOfColumns = math.size(p_matrix)[1];
                var numOfRows = math.size(p_matrix)[0];
                // //console.log("numOfRows: " + numOfRows + " numOfColumns: " + numOfColumns);
                var newMatrix = [];
                //For each row
                for (var i = 0; i < numOfRows; i++) {
                    //If there is a number in column 2 in this row, this is not a header row
                    // //console.log("i: " + i)
                    // //console.log("subset: " + math.subset(matrix, math.index(i, 1)));
                    if (!(isNaN(math.subset(p_matrix, math.index(i, 1))))) {
                        var row = math.squeeze(Tools.getRow(p_matrix, i));
                        // //console.log("row " + i+ ": " + row + " length " + row.length)
                        var range = math.range(1, row.length)
                        row = math.subset(row, math.index(math.squeeze(range)))
                        if (row.length === undefined) {
                            row = [row];
                        }
                        // //console.log(row)
                        newMatrix.push(row);
                        // //console.log("newMatrix: "+ newMatrix)
                    }
                }
                // //console.log("returned: " + newMatrix)
                return newMatrix;
            }


            static getValueWithCondition(p_values:any[][],p_rowElmt:any, p_conditionArray): number[] {
                // //console.log("getting value " + rowElmt + " with condition " + conditionArray + " from " + this.getName());
                var values: number[][] = p_values;
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
                            })
                            //If all elements are found in the column return the value
                            if (rightColumn) {
                                valuesFound.push(values[i][j]);
                            }
                        }
                    }
                }
                // //console.log("returned " + valuesFound);
                return valuesFound;
            }

            static createSubMatrices(p_matrix: any[][], p_takenIntoAccount: any[], p_data: any[][]) {
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
                                var column = Tools.makeSureItsAnArray(Tools.getColumn(p_matrix, i - 1));
                                newMatrix = math.concat(newMatrix, column)
                                // //console.log("new matrix:" + newMatrix);
                            }
                        }
                        subMatrices.push(newMatrix);
                    }
                }
                // //console.log("returned " + subMatrices)
                return subMatrices;
            }

            static convertToArray(p_matrix: any[][]): any[] {
                // //console.log("converting to array: " + matrix)
                var rows = math.size(p_matrix).valueOf()[0];
                var columns = math.size(p_matrix).valueOf()[1];
                var array = [];
                var newRow = [];
                //For each row
                for (var i = 0; i < rows; i++) {
                    if (columns === undefined) {//Its one-dimensional
                        array.push(math.subset(p_matrix, math.index(i)));
                    } else {
                        //For each column
                        for (var j = 0; j < columns; j++) {
                            newRow.push(math.subset(p_matrix, math.index(i, j)));
                        }
                        array.push(newRow);
                        newRow = [];
                    }
                }
                return array;
            }

            static calculateValues(p_model: Model, p_element: Element) { //move to model or tools??
                var model: Model = p_model;
                var element: Element = p_element;
                //console.log("calculate valeus for " + p_element.getName());
                

                if (element.getType() !== 1) {//If its a chance or value node
                    // console.log("calculate valeus for " + this.getName());
                    var data = element.getData();
                    var headerRows = [];
                    var takenIntoAccount = [];
                    var newValues = Tools.getMatrixWithoutHeader(data);
                    element.getParentElements().forEach(function (elmt) {
                        if (elmt.getType() === 0) {//If Parent is a chance
                            takenIntoAccount.push(elmt) //The parents which already have been evaluated
                            var submatrices = Tools.createSubMatrices(newValues, takenIntoAccount, element.getData());
                            //Parent must be updated
                            if (!elmt.isUpdated()) {
                                elmt.update();
                            }
                            var parentValuesMatrix = Tools.getMatrixWithoutHeader(elmt.getValues());
                            //For each submatrix calculate new values
                            var result = Tools.makeSureItsAnArray([math.multiply(submatrices[0], parentValuesMatrix)]);
                            for (var i = 1; i < submatrices.length; i++) {
                                result.push(Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentValuesMatrix)));
                            }
                            newValues = Tools.concatMatrices(result);
                        } else if (elmt.getType() === 1) {//If Parent is a decision
                            headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows, element.getData());
                        }
                    })
                    newValues = Tools.convertToArray(newValues);
                    // //console.log(newValues)
                    if (newValues[0][0] === undefined) {//It's one dimensional
                        // //console.log("one-dimensional")
                        newValues.unshift(data[Tools.numOfHeaderRows(element.getData())][0]);
                    } else {
                        for (var i = 0; i < newValues.length; i++) {
                            // //console.log("unshifting " + newValues[i])
                            newValues[i].unshift(data[i + Tools.numOfHeaderRows(element.getData())][0]);
                        }
                    }
                    if (headerRows.length > 0) {//If there have been added header rows
                        headerRows.push(newValues);
                        newValues = headerRows;
                    }
                    // //console.log("new values: " + newValues)
                    element.setValues(newValues);
                } else {//If it is a decision node
                    console.log("decisions node begin");
                    element.setValues(element.updateHeaderRows(element.copyDefArray()));
                    var values: any[] = element.getValues();
                    //Number of header rows is equal to number of rows in values minus number of rows in deftinition
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
                                var conditions = math.flatten(Tools.getColumn(values, j));
                                var range = math.range(0, numOfHeaderRows - 1);
                                conditions = math.subset(conditions, math.squeeze(range))
                            } else {
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
                                    var valueArray = Tools.getValueWithCondition(elmt.getValues(),"Value", conditions);
                                    //If there are several values that meet the condition, use the highest
                                    value += Tools.getHighest(valueArray);
                                }
                            })
                            console.log("i: " + i + "  j: " + j + "  Value: " + value);
                            values[i][j] = value;
                            
                        }
                    }
                    console.log("decisions end");
                    p_element.setData(values);
                    //p_element.setValues(values);
                }

            }

            static addNewHeaderRow(p_headerRow: any[], p_table: any[][],p_data:any[][]): any[][] {
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
                var newTable: any[][] = [];
                var numOfDiffValues: number = array.length - 1;
                // //console.log("numOfDiffValues " + numOfDiffValues)
                if (p_table[0] !== undefined) {
                    var rowLength = p_table[0].length - 1;
                    //For each row
                    for (var i = 0; i < p_table.length; i++) {
                        //For each different value in new header row
                        for (var n = 0; n < numOfDiffValues - 1; n++) {
                            var newRow: any[] = p_table[i];
                            //For each column
                            for (var j = 1; j <= rowLength; j++) {
                                //Add the value
                                newRow.push(p_table[i][j]);
                                // //console.log("adding " + table[i][j]);
                            }
                        }
                        // //console.log("new row number " + i + ": " + newRow)
                        newTable.push(newRow);
                    }
                } else {//This is the first row to be added
                    rowLength = 1;
                }
                //Add the new row of variables
                var newRow: any[] = [array[0]];
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
            }
        }
    }
}