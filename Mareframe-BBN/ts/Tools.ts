module Mareframe {
    export module DST {
        export class Tools {
            static getValueFn(p_xVal, p_posX, p_posY) {

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
                //console.log("Checking if sum is valid");
                var sum = 0;
                for (var i = 1; i < data[data.length - 1].length; i++) {
                    for (var j = numOfHeaderRows; j < data.length; j++) {
                        sum += parseFloat(data[j][i]);
                        //console.log("number: "+ parseFloat(data[j][i]));
                    }
                    //console.log("sum: " + sum);
                    if (sum < 0.999 || sum > 1.01) {
                        //console.log("invalid sum");
                        return false;
                    }
                    sum = 0;
                }
                return true;
            }

            static getWeights(p_elmt: Element, p_model: Model): number[][] {
                var weightsArr: number[][] = [];

                if (p_elmt.getType() != 0 && p_elmt.getType() != 2) {
                    var total: number = 0.0;
                    p_elmt.getData(1).forEach(function (val: number) { total += val; });
                    for (var i = 0; i < p_elmt.getData()[0].length; i++) {
                        //console.log("Element: " + p_elmt.getID());
                        //console.log("ElementData: " + p_elmt.getData(0, i) );
                        //console.log("a connection " + p_model.getConnection(p_elmt.getData(0, i)).getID());
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

            static getHighest(array: number[]): number {
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
                //console.log(p_valuesArray);
                var counter = 0;
                Tools.makeSureItsAnArray(p_valuesArray);
                for (var i = 0; i < p_valuesArray.length; i++) {
                    //if the cell in column 2 contains text it is a header row and must be a decision
                    if (isNaN(p_valuesArray[i][1]) && p_valuesArray[i][1] !== undefined) {
                        counter++;
                    }
                }
                return counter
            }

            static htmlTableFromArray(p_header: string, p_elmt: Element, p_model: Model, p_editorMode: boolean) {
                console.log("header: " + p_header);
                console.log("type of elmt: " + p_elmt.getType());
                var data: any[][];
                if (p_header === "Definition") {
                    data = p_elmt.getData();
                }
                else if (p_header === "Values") {
                    data = p_elmt.getValues();
                }
                var numOfHeaderRows = Tools.numOfHeaderRows(data);
                if (p_elmt.getType() == 2 && p_header === "Values") {//Find best decision by finding the highest value in value value table
                    var highestValue: number = 1;
                    for (var i = 2; i < data.length; i++) {
                        if (data[numOfHeaderRows][i] > data[numOfHeaderRows][highestValue]) {
                            highestValue = i;
                        }
                    }
                    //console.log("highest is : " + highestValue);
                }
                if (p_elmt.getType() == 1 && p_header === "Values") {//Find best decision by finding the highest value in dec value table
                    var bestDecRow: number = numOfHeaderRows;
                    var bestDecCol: number = 1;
                    console.log("data length: " + data.length);
                    console.log("data [0] length: " + data[0].length);
                    for (var i = numOfHeaderRows + 1; i < data.length; i++) {
                        for (var j = 1; j < data[0].length; j++) {
                            console.log("i: " + i + " j: " + j);
                            if (data[i][j] > data[bestDecRow][bestDecCol]) {
                                bestDecRow = i;
                                bestDecCol = j;
                            }
                        }
                    }
                    //console.log("best decision: " + bestDecRow + " , " + bestDecCol);
                }
                //console.log("p_header: " + p_header);
                //console.log("data: " + data);
                var htmlString = "";
                if (data[0] !== undefined) {
                    htmlString += "<tr><th style='text-align:center' colspan=\"" + (data[0].length+1) + "\" >" + p_header + " </th></tr>";
                } else {
                    htmlString += "<tr><th style='text-align:center'>" + p_header + " </th></tr>";
                }
                for (var i = 0; i < numOfHeaderRows; i++) {
                    htmlString += "<tr>";
                    if (p_editorMode && p_header === "Definition" && p_elmt.getType() !== 2 ) { htmlString += "<th></th>"; }//Create empty cell above minus cells
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
                //console.log("numOfHeaderRows: " + numOfHeaderRows);
                //console.log("data.length: " + data.length);
                
                for (var i = numOfHeaderRows; i < data.length; i++) {
                    htmlString += "<tr>";
                    if (p_editorMode && p_header === "Definition" && p_elmt.getType() !== 2 ) { htmlString += "<th><button class='minus' id='"+ i+ "'></button></th>"; }//add minus button
                    for (var j = 0; j < (data[0].length); j++) {
                        var value: number = data[i][j];
                        if (value === -Infinity) {//In decision nodes the default value is -infinity, but this should be 0 to the user
                            value = 0;
                        }
                        if (j === 0) {
                            htmlString += "<th><div class='editable_cell'> " + value + "</div></th>";
                        } else {
                            if ( j === highestValue || (i == bestDecRow && j == bestDecCol)) {//mark highest if it is the value table of a value node or a decision node
                                htmlString += "<td> <b>" + Tools.round(value) + "</b></td>";
                            }
                            else {
                                htmlString += "<td>" + Tools.round(value) + "</td>";
                            }
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
                //console.log("get column " + index + " from " + p_matrix + " size " + math.size(p_matrix));
                var rows = math.size(p_matrix).valueOf()[0];
                var range = math.range(0, rows);
                //console.log("returned: " + math.subset(matrix, math.index(range, index)))
                return math.subset(p_matrix, math.index(range, index));
            }

            static getRow(p_matrix: any[][], p_index: number): any[] {
               // console.log("get row " + p_index + " from " + p_matrix)
                var columns = math.size(p_matrix).valueOf()[1];
                var range = [];
                var oneDimensional;
                if (columns === undefined) { //One dimensional
                    return p_matrix;
                }
                //console.log("columns: " + columns);
                for (var n = 0; n < columns; n++) {
                    range.push(n);
                }
                return math.subset(p_matrix, math.index(p_index, range));
            }
            static addDataRow(p_elmt: Element): any[][] {
                var oldData: any[][] = [];
                oldData = p_elmt.getData();
                var newData: any[][] = [];
                //Copy every row to new data
                for (var i = 0; i < oldData.length; i++) {
                    //console.log(i + "  " + oldData[i]);
                    newData[i] = oldData[i];
                }
                newData[oldData.length] = []; //add empty row at bottom
                // console.log("oldDataLenght: " + oldData.length);

                //Add new state
                var newStateName: String;
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
                    //console.log("old.len: " + oldData[0].length + "   i: " + i);
                }
                return newData;
            }
            static removeRow(p_matrix: any[][], p_index: number): any[][]{
                var matrix: any[][] = Tools.makeSureItsAnArray(p_matrix);
                var headerRows: number = Tools.numOfHeaderRows(matrix);
                var rows: number = math.size(matrix)[0];
                if (p_index < headerRows) {
                    console.log("ERROR Can not delete headerrows");
                }
                if (rows < headerRows + 2) { //The last row is being deleted and the matrix is now empty
                    //console.log("matrix is now empty");
                    matrix = [];
                    //console.log("data length: " + matrix.length);
                }
                else {
                    matrix.splice(p_index, 1);
                }
                return matrix;
                
            }
            //This method concats all matrixes in a list one by one
            static concatMatrices(p_list: any[][][]): any[][] {
                var matrix = p_list[0];
                for (var i = 1; i < p_list.length; i++) {
                    //console.log("concatting " + matrix + " size " + math.size(matrix) + " and " + p_list[i] + " size: " + math.size(p_list[i]));
                    matrix = math.concat(matrix, p_list[i]);
                }
                //console.log((matrix));
                return matrix;
            }
            //This method converts an element, which is not an array, to a singleton list
            static makeSureItsAnArray(p_value: any[]): any[] {
                if (math.size(p_value).valueOf()[1] === undefined) {
                    p_value = [p_value];
                }
                return p_value;
            }
            //If a list is one dimensional this method adds extra brackets around the list to make it a two dimensional list with one row
            static makeSureItsTwoDimensional(p_array: any[]): any[][] {
                if (math.size(p_array).length < 2) {
                    p_array = [p_array];
                }
                return p_array;
            }
            //This returns a table withot its headerrows
            static getMatrixWithoutHeader(p_matrix: any[][]): any[][] {
                // console.log("get matrix without header from " + p_matrix)
                p_matrix = Tools.makeSureItsTwoDimensional(p_matrix);
                var numOfColumns: number;
                var numOfRows: number;
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
                        var range = math.range(1, row.length)
                        row = math.subset(row, math.index(math.squeeze(range)))
                        if (row.length === undefined) {
                            row = [row];
                        }
                        newMatrix.push(row);
                        //  console.log("newMatrix: " + newMatrix)
                    }
                }
                //console.log("returned: " + Tools.arrayToString(newMatrix));
                return newMatrix;
            }

            static getValueWithCondition(p_values:any[][],p_elmt: Element, p_condition): number[] {
                //console.log("getting value with condition " + p_condition + " from " + p_values);
                var values: any[][] = Tools.makeSureItsTwoDimensional(p_values);
                // //console.log("values table : \n " + values);
                var valuesFound = [];
                var size: number[] = math.size(values);
                var rows: number = size[0];
                var columns: number = size[1];
                //Find the right row
                for (var i = 0; i < rows; i++) {
                    if (values[i][0] === p_elmt.getID()) {
                        //Find the correct column
                        for (var j = 1; j < columns; j++) {
                            if (values[i][j] === p_condition) {
                                valuesFound.push(values[rows - 1][j]);
                            }
                        }
                    }
                }
                //console.log("returned " + valuesFound);
                return valuesFound;
            }

            static createSubMatrices(p_matrix: any[][], p_elmt: Element, p_data: any[][]) {
                if (p_elmt !== undefined) {
                    //console.log("create sub matrix from " + p_matrix + " size " + math.size(p_matrix) + " for values " + p_elmt.getName());
                }
                var data = Tools.makeSureItsTwoDimensional(p_data);
                p_matrix = Tools.makeSureItsTwoDimensional(p_matrix);
                //console.log("data: " + (data) + " size " + math.size(data));
                //console.log(data);
                var subMatrices = [];
                var columns = math.size(p_matrix).valueOf()[1];
                var newDataHeaders: any[][] = [];
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
                                if (currentColumn[j] !==data[j][i]) {
                                    //console.log(data[j][i] + " does not match " + currentColumn[j])
                                    matchingColumn = false;
                                    //  But if the value is part of the make-submatrix-element the column might be a matching column
                                    if (p_elmt !== undefined && p_elmt.getID() === data[j][0]) {
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
                                newMatrix = math.concat(newMatrix, column)
                                  // console.log("new matrix:" + (newMatrix));
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
                if (p_elmt !== undefined) { //Only delete if elmt is not undefined
                    //Delete the row that was used to make the submatrices
                    for (var i = 0; i < newDataHeaders.length; i++) {
                        if (p_elmt.getID() === newDataHeaders[i][0]) {
                            newDataHeaders.splice(i, 1);
                        }
                    }
                }
               // console.log("new data headers: " + newDataHeaders);
              // console.log("returned " + subMatrices + " size of submatrix " + math.size(subMatrices[0]) + " number of submatrices " + subMatrices.length);
                return [subMatrices, newDataHeaders];
                //return subMatrices;
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
            //This method removes p_element from p_dataheader and addds the new row p_newRow
            //While also making sure the number of columns match
            static updateDataHeader(p_dataHeader: any[][], p_newRow: any[], p_element: Element) {
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
                var newRow: any[][] = Tools.removeDuplicates(p_newRow);
               //console.log("new row with one of each: " + newRow);
                columnsInNewRow = math.size(newRow)[1];//newRow.length;
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
                        var matchingColumn: boolean = true;
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
                                //console.log("after insert: " + p_dataHeader);
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
             //                   console.log("data headers after delete: " + p_dataHeader);
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
         //                      console.log("inserting " + newRow[i]);
                        }
                        columnsInNewRow += columnsInOriginalNewRow;
                    }
                }
           //         console.log("dataHeader: " + p_dataHeader);
                    return p_dataHeader;
            }
            static insertNewHeaderRowAtBottom(p_newRow: any[], p_table: any[]): any[] {
               // console.log("inserting " + p_newRow + " in to " + p_table + " size " + math.size(p_table));
                var tempTable: any[] = p_newRow.slice();
                //console.log("temp table: " + tempTable);
                if (p_table.length !== 0) {//If table was not originally empty
                    if (Tools.isOneDimensional(p_table)) {
                  //      console.log("one dimensional");
                        tempTable = Tools.addNewHeaderRow(p_table, tempTable);
                    }
                    else {
                      //  console.log("length of p_table: " + p_table.length);
                        //Add each row from the bottom up
                        for (var i = p_table.length - 1; i >= 0; i--) {
                            tempTable = Tools.addNewHeaderRow(p_table[i], tempTable);
                         //   console.log("temp table: " + tempTable);
                        }
                    }
                }
                //console.log("returned: " + tempTable);
                return tempTable;
            }
            static calculateValues(p_model: Model, p_element: Element) {
                var model: Model = p_model;
                var element: Element = p_element;
                   //console.log("calculate values for " + p_element.getName());
                var dataHeaders: any[][] = []; //the header rows from data
                var data: any[][] = element.getData();
                //console.log("data: " + data + " size " + math.size(data));
                //console.log(data);
                for (var i = 0; i < Tools.numOfHeaderRows(data); i++) {
                    var newRow: any[] = [];
                    for (var j = 0; j < data[0].length; j++) {
                        newRow.push(data[i][j]);
                    }
                    dataHeaders.push(newRow);
                }
                  //console.log("data headers: " + dataHeaders);
                if (element.getType() !== 1) {//If its a chance or value node
                    var headerRows = []; //Used to add decisions to value matrix
                    var newValues = Tools.getMatrixWithoutHeader(data);
                    //console.log(newValues);
                    element.getParentElements().forEach(function (elmt) {
                         //console.log("parent: " + elmt.getName());
                        if (elmt.getType() === 0) {//If Parent is a chance
                            //  console.log("dataheaders: " + dataHeaders);
                            //Parent must be updated
                            if (!elmt.isUpdated()) {
                                  //console.log("updating " + elmt.getName());
                                elmt.update();
                                 //console.log(elmt.getName() + " has been updated");
                            }
                            //console.log("parent values: " + Tools.arrayToString(elmt.getValues()));
                            var parentValuesMatrix = Tools.getMatrixWithoutHeader(elmt.getValues());
                           // console.log("current element: " + element.getName());
                           // console.log("parent: " + elmt.getName());
                            //console.log("new values: " + newValues);
                            var temp = Tools.createSubMatrices(newValues, elmt, dataHeaders);
                            //console.log("newValues: " + newValues);
                            var submatrices = temp[0];
                            //console.log("submatrices have size: " + math.size(submatrices));
                            //console.log(submatrices);
                            dataHeaders = temp[1];
                            //console.log("data headers: " + dataHeaders);
                            var result = [];
                            var decRows: any[] = [];
                            var newRow: any[] = [];
                            //If parent has dec in values table these are added to dataHeaders or parent submatrices are created
                            //   console.log("num of header rows in parent " + elmt.getName() + " values: " + Tools.numOfHeaderRows(elmt.getValues()));
                            if (Tools.numOfHeaderRows(elmt.getValues()) > 0) {
                                //For each dec in parent
                                var decInParent = Tools.numOfHeaderRows(elmt.getValues());
                                for (var i = 0; i < decInParent; i++) {
                                    //console.log("i:" + i + " decInParent: " + decInParent);
                                    var decRow = elmt.getValues()[i];
                                    //console.log("decRow: " + decRow);
                                    //  console.log("number of header rows in data headers: " + Tools.numOfHeaderRows(dataHeaders));
                                    //If the parents decision already is in data headers add it to decRows to be used when creating parentsubmatrices
                                    if (math.size(dataHeaders).length > 1 && math.size(dataHeaders)[0] > 1 && math.flatten(Tools.getColumn(dataHeaders, 0)).indexOf(decRow[0]) > -1) {
                                        //     console.log("DEC EXISTS");
                                        decRows.push(decRow);
                                    }
                                    else if (math.size(Tools.makeSureItsTwoDimensional(dataHeaders))[0] === 1 && Tools.makeSureItsTwoDimensional(dataHeaders)[0][0] === decRow[0]) {
                                        decRows.push(decRow);
                                    }
                                    else {
                                       //console.log("dataHeaders before adding: " + Tools.arrayToString(dataHeaders));
                                        //The decision does not already exist. Insert it into headerrows
                                        headerRows = Tools.insertNewHeaderRowAtBottom(p_model.getElement(elmt.getValues()[i][0]).getMainValues(), headerRows);
                                           //console.log("new header rows: " + headerRows);
                                        newRow = model.getElement(elmt.getValues()[i][0]).getMainValues();
                                        //      console.log("new row: " + newRow);
                                        //Update data headers to contain the new dec row
                                        dataHeaders = Tools.insertNewHeaderRowAtBottom(newRow, dataHeaders);
                                        // console.log("new dataHeaders: " + (dataHeaders));
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
                                    newValues = Tools.concatMatrices(result);
                                    //console.log("newValues: " + newValues);
                                    //console.log("size of new values: " + math.size(newValues));
                                }
                            }
                            if (result.length === 0) {//This means there were no decisions that already existed
                               //console.log("there were no decisions that already existed");
                                for (var i = 0; i < submatrices.length; i++) {
                                  // console.log("multiplying " + submatrices[i] + " size " + math.size(submatrices[i]) + " and " + parentValuesMatrix + " size " + math.size(parentValuesMatrix));
                                    var newMatrix = Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentValuesMatrix));
                                   // console.log("size of new matrix: " + math.size(newMatrix));
                                    result.push(newMatrix);
                                    //  console.log("size of result: " + math.size(result));
                                }
                                newValues = Tools.concatMatrices(result);
                            }
                            //console.log("newValues: " + newValues);
                            //console.log(newValues);
                        } else if (elmt.getType() === 1) {//If Parent is a decision
                            //console.log("parent is a decision");
                               //console.log("headerrows: " + headerRows + " size " + math.size(headerRows));
                            //   console.log("checking if " + elmt.getID() + " is in headerrows");
                            //Only add if it does not already exist
                            if (headerRows.length === 0) {//There are no headerrows
                                 //console.log("empty");
                                headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows);
                            }
                            else if (math.size(headerRows).length === 1 && headerRows[0] !== elmt.getID()) {//Headerrows is one dimensional
                                 //console.log("compared " + headerRows[0] + " and " + elmt.getID() + " not equal " + headerRows[0] !== elmt.getID());
                                //   console.log("one dimensional");
                                headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows);
                            }
                            else if (math.size(headerRows).length > 1 &&
                                math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(Tools.makeSureItsTwoDimensional(headerRows), 0))).indexOf(elmt.getID()) === -1) {//Only add if it is not already there
                                 //console.log("adding");
                                headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows);
                            }
                             //console.log("new header rows: " + headerRows);
                         }
                        //console.log("done with parent " + elmt.getName());
                    });
                    newValues = Tools.convertToArray(Tools.makeSureItsTwoDimensional(newValues));
                    if (math.size(newValues).length === 2 && math.size(newValues)[0] === 1) {//Its a one dimensional array inside another array
                        var tempArray = [];
                        for (var i = 0; i < math.size(newValues)[1]; i++) {
                            tempArray.push(newValues[0][i]);
                        }
                        newValues = Tools.makeSureItsTwoDimensional(tempArray);
                    }
                    //Inserting the element id first in each row
                    for (var i = 0; i < newValues.length; i++) {
                        //   console.log("unshifting " + data[i + Tools.numOfHeaderRows(element.getData())][0])
                        newValues[i].unshift(data[i + Tools.numOfHeaderRows(element.getData())][0]);
                    }
                    // console.log("new values: \n" + newValues);
                    // console.log("size: " + math.size(newValues));
                    if (headerRows.length > 0) {//If there have been added header rows
                        headerRows = Tools.makeSureItsTwoDimensional(headerRows);
                        newValues = Tools.makeSureItsTwoDimensional(newValues);
                        var elmtsInNewValues: any[] = Tools.getColumn(newValues, 0);
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


                } else {//If it is a decision node
                    //console.log("decisions node begin");
                    element.setValues(Tools.fillEmptySpaces((element.copyDefArray())));
                    var values: any[] = element.getValues();
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
                            /*if (numOfHeaderRows !== 0) {
                                //Get the conditions for this value
                                // console.log("Trying to get column " + j);
                                //console.log(values);
                                var conditions = math.flatten(Tools.getColumn(values, j));
                                var range = math.range(0, numOfHeaderRows);// - 1);
                                // console.log("trying to get subset from " + conditions + " with range " + range);
                                conditions = Tools.makeSureItsAnArray(math.subset(conditions, math.index(math.squeeze(range))));
                            } else {
                                conditions = [];
                            }
                            conditions.push(values[i][0]);*/
                            var conditions = values[i][0];
                            //console.log("conditions: "+conditions);
                            var value = 0;
                            //For each value node in the model
                            model.getElementArr().forEach(function (elmt) {
                                if (elmt.getType() === 2) {
                                //console.log("value: " + elmt.getName());
                                    //If the node is not updated, update
                                    if (!elmt.isUpdated()) {
                                        elmt.update();
                                    }
                                    //Sum values that meet the condition
                                    var valueArray = Tools.getValueWithCondition(elmt.getValues(),element, conditions);
                                    //console.log("value array: " + valueArray);
                                    //If there are several values that meet the condition, use the highest
                                    value += Tools.getHighest(valueArray);
                                }
                            })
                            //console.log("i: " + i + "  j: " + j + "  Value: " + value);
                            values[i][j] = value;

                        }
                    }
                    //     console.log("decisions end");
                    p_element.setValues(values);
                }
                 //console.log("done calculatint values for " + p_element.getName());
            }
            static isOneDimensional(p_array: any[][]): Boolean {
                //console.log(p_array.length);
                return (p_array.length === 1 || !($.isArray((p_array)[0])) || p_array[1] === undefined);
            }
           
            static fillEmptySpaces(p_table: any[][]): any[][]{
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
            }
            //Removes the columns belonging to the state p_state
            static removeState(p_data: any[][], p_changedElmt: Element, p_state: String) {
                var data: any[][] = Tools.makeSureItsTwoDimensional(p_data);
                var rows: number = math.size(data)[0];
                var columns: number = math.size(data)[1];
                var newData: any[][] = [];
                var newRow: any[];
                for (var i = 0; i < rows; i++) {
                    if (data[i][0] === p_changedElmt.getID()) {
                        var changedRow: number = i;
                        break;
                    }
                }
                for (var i = 0; i < rows; i++) {
                    newRow = [];
                    for (var j = 0; j < columns; j++) {
                        if (data[changedRow][j] !== p_state) {//This column dows not need to be deleted
                            newRow.push(data[i][j]);
                        }
                    }
                    newData.push(newRow);
                }
                data = newData;
                return data;

            }
            //Convert the array to only contain one of each element
            static removeDuplicates(p_array: any[][]): any[][]{
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
            }
            static addNewHeaderRow(p_newRow: any[], p_table: any[][]): any[][] {
       //         console.log("Adding array: " + p_newRow + " size " + math.size(p_newRow));
                var array = Tools.makeSureItsTwoDimensional(p_newRow.slice());
                //Convert the array to only contain one of each element
                array = Tools.removeDuplicates(array);
      //          console.log("array size: " + math.size(array));
       //         console.log("to " + p_table + " size "+ math.size(p_table));
                var newTable: any[][] = [];
                var numOfDiffValues: number = array[0].length - 1;
        //        console.log("numOfDiffValues " + numOfDiffValues)
                var newRow: any[];
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
                                // //console.log("adding " + table[i][j]);
                            }
                        }
                //        console.log("new row number " + i + ": " + newRow)
                        newTable.push(newRow);
                    }
                } else {//This is the first row to be added
             //       console.log("p_table was empty");
                    rowLength = 1;
                }
                //Add the new row of variables
                var newRow: any[] = [array[0][0]];
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
            }
            static getRowNumber(p_values: any[][], decisionElement: Element): number {
              //  console.log("looking for " + decisionElement.getID() + " in " + p_values);
                for (var i = 0; i < p_values.length; i++) {
                    if (p_values[i][0] === decisionElement.getID()) {
                        return i;
                    }
                }
            }
            static updateConcerningDecisions(element: Element) {
               //console.log("updating concerning decisions " + element.getName());
                var rowsToDelete: number[] = [];
               //console.log("all ancestors for " + element.getName() +": "  + element.getAllAncestors());
                element.getAllAncestors().forEach(function (elmt) {
                    if (elmt.getType() === 1 && elmt.getDecision() !== undefined) {//If ancestor is decision and choice is made
                      //console.log("checking: " + elmt.getName());
                        var values: any[][] = element.getValues();
                        var decision: String = elmt.getData()[elmt.getDecision()][0];
                      //console.log("choice is made: " + decision + " in elemnent " + elmt.getName());
                       // console.log("values: " + values + " size: " + math.size(values));
                        var newValues: any[][] = [];
                        var rowNumber: number = Tools.getRowNumber(element.getValues(), elmt);
                      //  console.log("rownumber: " + rowNumber);
                        for (var i = 0; i < values.length; i++) {
                            var newRow: any[] = [];
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
                //console.log("done updating element concerning decisions");
                //element.setValues(Tools.deleteRows(element.getValues(), rowsToDelete)); //This will delete the headerrows that have been decided
            }
            static strengthOfInfluence(p_table: number[][], p_dims: number[]): number[] {
                var strength: number[] = [];
                var underDim: number[] = [];
                var overDim: number[] = [];

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
            }
            //Copies all data and adds it to the table. This should be used when new parent elements have been added
            static fillDataTable(p_dataTable: any[][]) {
                console.log("filling table: " + p_dataTable);
                console.log(p_dataTable);
                var headerRows: any[][] = [];
                var data: any[][] = [];
                var tempData: any[][] = [];
                var numOfHeaderRows: number = Tools.numOfHeaderRows(p_dataTable);
                //Adding the header rows
                for (var i = 0; i < numOfHeaderRows; i++) {
                    var newRow: any[] = [];
                    for (var j = 0; j < p_dataTable[0].length; j++) {
                        newRow.push(p_dataTable[i][j]);
                    }
                    headerRows.push(newRow);
                }
                headerRows = Tools.makeSureItsTwoDimensional(headerRows);
              //  console.log("header rows: " + headerRows);
                //Adding data values
                for (var i = numOfHeaderRows; i < p_dataTable.length; i++) {
                    var newRow: any[] = [];
                    for (var j = 1; j < p_dataTable[0].length; j++) {
                        var value: any = p_dataTable[i][j];
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
                while (tempData[0].length < headerRows[0].length -1 ) {
                    tempData = math.concat(tempData, data);
                }
                data = tempData;
                var newDataTable: any[][] = headerRows;
                //Add element id first in each row
                for (var i = 0; i < data.length; i++) {
                    data[i].unshift(p_dataTable[numOfHeaderRows + i][0]);
                    newDataTable.push(data[i]);
                }
               // console.log("new table after filling: " + newDataTable);
                return newDataTable;
            }

            //removes headerrow and updates the datatable accordingly
            static removeHeaderRow(p_rowName: string, p_oldData: any[][] ): any[][] {
                //var newData: Array<Array<any>> = [];
                var newData: any[][] = [];

                var numHeaderRows = this.numOfHeaderRows(p_oldData);

                var dims: number[] = [];
                var underDim: number[] = [];
                var overDim: number[] = [];
                var removeDim: number = 0;

                var oldRowLength: number = p_oldData[0].length;
                var numDataRows: number = p_oldData.length - numHeaderRows;

                for (var i = 0; i <= numHeaderRows; i++) {
                    dims[i] = 1;
                }
                //finding the dims of the datatable
                for (var i = numHeaderRows - 1; i >= 1; i--) {
                    //console.log("Data: " + p_oldData);
                    //console.log("Data first element: " + p_oldData[i][1]);
                    for (j = 1 + dims[i+1]; j < oldRowLength; j++) {
                        //console.log("Data j: " + j + "  " + p_oldData[i][j]);
                        if (p_oldData[i][j] == p_oldData[i][1]) {
                            dims[i] = j - 1;
                            break;
                        }
                    }
                }
                dims[0] = oldRowLength-1;
                for (var i = 1; i < numHeaderRows; i++) {
                    dims[i - 1] /= dims[i];
                }
                console.log("cumula Dims: " + dims); 

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
                            //console.log("p_dims under a " + p_dims[ix] + "  " + p_dims[iy] + "  " + underDim[ix]);
                        }
                        if (ix > iy) {
                            //console.log("p_dims over b " + p_dims[ix] + "  " + p_dims[iy] + "  " + overDim[ix]);
                            overDim[ix] *= dims[iy];
                            //console.log("p_dims over a " + p_dims[ix] + "  " + p_dims[iy] + "  " + overDim[ix]);
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

                
                var found: boolean = false;
                for (var i = 0; i < numHeaderRows; i++) {
                    //console.log(p_oldData[i][0]);
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
                                newData[j][0] = p_oldData[j+1][0];
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
                            newData[ia + numHeaderRows - 1][0] = p_oldData[ia + numHeaderRows][0]
                            for (var ib = 0; ib < overDim[i]; ib++) {
                                for (var ic = 0; ic < underDim[i]; ic++) {
                                    //console.log("ia + numHeaderRows - 1: " + (ia + numHeaderRows - 1) + "  ib * underDim[i] + 1: " + (ib * underDim[i] + ic + 1)) ;
                                    newData[ia + numHeaderRows - 1][ib * underDim[i] + ic + 1] = 0;
                                    for (var id = 0; id < removeDim; id++) {

                                        //console.log("ib * overDim[i] + ic*underDim[i] + id+1 " + (((id * underDim[i]) + ic) + underDim[i] * removeDim * ib + 1 ));
                                        //ib * (removeDim + ic * overDim[i]) +
                                        //console.log("index: " + (ib * underDim[i] + ic + 1) + "  Value: " + p_oldData[ia + numHeaderRows][((id * underDim[i]) + ic) + underDim[i] * removeDim * ib + 1]);
                                        newData[ia + numHeaderRows - 1][ib * underDim[i] + ic + 1] += p_oldData[ia + numHeaderRows][((id * underDim[i]) + ic) + underDim[i] * removeDim * ib + 1];
                                        //console.log("index: " + (ib * underDim[i] + ic + 1) + "  Value: " + newData[ia + numHeaderRows - 1][ib * underDim[i] + ic + 1]);
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
                    newData = p_oldData;
                }


                //console.log("NewData: length: "  + newData.length);
                for (var i = 0; i < newData.length; i++) {
                    console.log(this.getRow(newData, i));
                }    
                    console.log("newData: " + newData);
                
                return newData;
            }
                 
        }
    }
}