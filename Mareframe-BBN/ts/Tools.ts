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
            static dataContainsNegative(p_data: any[]) {
                for (var i = 1; i < p_data[p_data.length - 1].length; i++) {//For each column
                    for (var j = Tools.numOfHeaderRows(p_data); j < p_data.length; j++) {//For each row
                        if (parseFloat(p_data[j][i]) < 0) {
                            return true;
                        }
                        //console.log("number: " + parseFloat(data[j][i]));
                    }
                }
                return false;
            }
            static columnSumsAreValid(data, numOfHeaderRows) {
                //console.log("Checking if sum is valid");
                //console.log("numOfHeaderRows: " + numOfHeaderRows);
                //console.log("data: " + data);
                var sum = 0;
                for (var i = 1; i < data[data.length - 1].length; i++) {//For each column
                    for (var j = numOfHeaderRows; j < data.length; j++) {//For each row
                        sum += parseFloat(data[j][i]);
                        //console.log("number: " + parseFloat(data[j][i]));
                    }
                    //console.log("sum: " + sum);
                    if (sum < 0.999 || sum > 1.01) {
                        console.log("invalid sum");
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

            static numOfHeaderRows(p_valuesArray, p_elmt?: Element): number {
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
                return counter
            }
            
            static round(numb: number) {
                //return numb.toFixed(2);
                return Number(Math.round(numb * 1000) / 1000);
            }

            static round2(numb: number) {
                //return numb.toFixed(2);
                return Number(Math.round(numb * 100) / 100);
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
            static addDataRow(p_elmt: Element, p_matrix: any[][]): any[][] {
                var oldData: any[][] = [];
                oldData = p_matrix
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
                var stateNames: String[] = math.flatten(Tools.getColumn(oldData, 0));
                var num: number = oldData.length - Tools.numOfHeaderRows(oldData);
                if (p_elmt.getType() === 0) {
                    do {
                        newStateName = "State" + num;
                        num++;
                    } while(stateNames.indexOf(newStateName) !== -1) 
                }
                else if (p_elmt.getType() === 1) {
                    do {
                        newStateName = "Choice" + num;
                        num++;
                    } while (stateNames.indexOf(newStateName) !== -1) 
                }
                newData[oldData.length][0] = newStateName;
                //Add 0 in every cell in new row (In decisions nothing is done here)
                for (var i = 1; i < oldData[0].length; i++) {
                    newData[oldData.length][i] = 0;
                    //console.log("old.len: " + oldData[0].length + "   i: " + i);
                }
                return newData;
            }
            static removeRow(p_matrix: any[][], p_index: number): any[][] {
                var matrix: any[][] = Tools.makeSureItsAnArray(Tools.copy(p_matrix));
                var headerRows: number = Tools.numOfHeaderRows(matrix);
                var rows: number = math.size(matrix)[0];
                if (p_index < headerRows) {
                    throw "ERROR Can not delete headerrows";
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
            //Returns a copy of the given matrix/array
            static copy(p_matrix: any[][]): any[][] {
                var matrix: any[][] = Tools.makeSureItsTwoDimensional(p_matrix);
                var newMatrix: any[][] = [];
                for (var i = 0; i < matrix.length; i++) {
                    var row: any[] = [];
                    for (var j = 0; j < matrix[0].length; j++) {
                        row.push(matrix[i][j]);
                    }
                    newMatrix.push(row);
                }
                return newMatrix;
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
                if (p_value === undefined || math.size(p_value).valueOf()[1] === undefined) {
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
                //console.log("returned: " + newMatrix);
                // console.log(newMatrix);
                return newMatrix;
            }

            static getValueWithCondition(p_values: any[][], p_elmt: Element, p_condition: String): number[] {
                console.log("getting value with condition " + p_condition +" elmt: "+ p_elmt.getName()+ " from " + p_values);
                var values: any[][] = Tools.makeSureItsTwoDimensional(p_values);
                // //console.log("values table : \n " + values);
                var valuesFound = [];
                var size: number[] = math.size(values);
                var rows: number = size[0];
                var columns: number = size[1];
                //Find the right row
                for (var i = 0; i < rows; i++) {
                    if (values[i][0] === p_elmt.getID() || i === rows-1) {//If the element matches or if this is the last row (then the element might not be in this table)
                        //Find the correct column
                        //console.log("correct row");
                        for (var j = 1; j < columns; j++) {
                            if (values[i][j] === p_condition || i === rows - 1) {//if this is the last row then the element might not be in this table and we should just take every value
                                valuesFound.push(values[rows - 1][j]);
                            }
                        }
                        return valuesFound;
                    }
                }
                //console.log("returned " + valuesFound);
                return valuesFound;
            }
            static getValueWithConditions(p_values: any[][], p_elmts: string[], p_conditions: string[]): number[] {
                //console.log("get value with condtions: " + p_conditions + " in: " + p_values + " for elements: " + p_elmts);
                var values = Tools.makeSureItsTwoDimensional(p_values);
                var rows: number = math.size(values)[0];
                var columns: number = math.size(values)[1];
                var valuesFound: number[] = [];
                for (var i = 1; i < columns; i++) {
                    var matchingColumn: boolean = true;
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
            }

            static createSubMatrices(p_currentElement: Element, p_matrix: any[][], p_makeSubmatrixElmt: Element, p_dataHeaders: any[][]) {
                if (p_makeSubmatrixElmt !== undefined) {
                    // console.log("create sub matrix from " + p_matrix + " size " + math.size(p_matrix) + " for values " + p_makeSubmatrixElmt.getName() + " current elmt type: " + p_currentElement.getType());
                }
                var data = Tools.makeSureItsTwoDimensional(p_dataHeaders);
                p_matrix = Tools.makeSureItsTwoDimensional(p_matrix);
                //console.log("data: " + (data) + " size " + math.size(data));
                // console.log(data);
                var subMatrices = [];
                var columns = math.size(p_matrix).valueOf()[1];
                var newDataHeaders: any[][] = [];
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
                    if (p_makeSubmatrixElmt !== undefined) { //Only delete if elmt is not undefined
                        //Delete the row that was used to make the submatrices
                        for (var i = 0; i < newDataHeaders.length; i++) {
                            if (p_makeSubmatrixElmt.getID() === newDataHeaders[i][0]) {
                                newDataHeaders.splice(i, 1);
                            }
                        }
                    }
                }
                else {//In super value nodes each value should be its own submatrix
                    //console.log("super value node");
                    for (var i = 0; i < p_matrix.length; i++) {
                        subMatrices.push(Tools.makeSureItsTwoDimensional([p_matrix[i][0]]));
                        //console.log(subMatrices);
                    }
                    newDataHeaders = p_dataHeaders;//Because data headers do not get updated in super value nodes
                }
                // console.log("new data headers: " + newDataHeaders);
                // console.log("returned " + subMatrices + " size of submatrix " + math.size(subMatrices[0]) + " number of submatrices " + subMatrices.length);
                return [subMatrices, Tools.makeSureItsTwoDimensional(newDataHeaders)];
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
                var tempTable: any[] = p_newRow.slice();
                var table: any[][] = Tools.makeSureItsTwoDimensional(p_table);
                // console.log("inserting " + p_newRow + " into " + table + " size " + math.size(table));
                // console.log("temp table: " + tempTable);
                // console.log("p_table empty: " + !(math.size(table)[1] !== 0));
                if (math.size(table)[1] !== 0) {//If table was not originally empty
                    if (Tools.isOneDimensional(table)) {
                        //      console.log("one dimensional");
                        tempTable = Tools.addNewHeaderRow(table, tempTable);
                    }
                    else {
                        //  console.log("length of p_table: " + p_table.length);
                        //Add each row from the bottom up
                        for (var i = table.length - 1; i >= 0; i--) {
                            tempTable = Tools.addNewHeaderRow(table[i], tempTable);
                            //   console.log("temp table: " + tempTable);
                        }
                    }
                }
                //console.log("returned: " + tempTable);
                return tempTable;
            }
            static updateValuesHeaders(p_model: Model, p_elmt: Element): void {
                var headerRows: any[] = [];
                var added: String[] = [];//Used to make sure no element is added twice into headers
                if (p_elmt.getType() === 1) {//If this is a decision node
                    p_elmt.getParentElements().forEach(function (parent: Element) {
                        if (parent.isInfluencing()) {
                            headerRows = Tools.addNewHeaderRow(parent.getMainValues(), headerRows);
                        }
                    });
                    p_elmt.getAllAncestors().forEach(function (ancestor: Element) {
                        ancestor.getParentElements().forEach(function (parent: Element) {
                            //If one of the ancestor has a influencing chance parent, this should be added too
                            if (parent.getType() === 0 && parent.isInfluencing()) {
                                headerRows = Tools.addNewHeaderRow(parent.getMainValues(), headerRows);
                            }
                        });
                    });
                    //p_elmt.setUpdated(true);
                }
                else if (p_elmt.getType() === 2 || p_elmt.getType() === 0) {//If this is a utility or chance node 
                    p_elmt.getAllAncestors().forEach(function (ancestor: Element) {
                      
                        if (ancestor.getType() === 0 &&//If ancestor is chance
                            ancestor.isInfluencing()) {//If ancestor is influencing

                            if (ancestor.isInformative() &&//If ancestor is informative
                                added.indexOf(ancestor.getID()) === -1) {//If ancestor has not been added
                                added.push(ancestor.getID());
                                headerRows = Tools.addNewHeaderRow(ancestor.getMainValues(), headerRows);
                            }
                            if (!ancestor.isInformative()) {
                                //If ancestor has an informative decsendant this should be added too, but only if ancestor is not informative
                                ancestor.getAllDescendants().forEach(function (descendant: Element) {

                                    if (descendant.isInformative() && added.indexOf(descendant.getID()) === -1 && descendant.getID() !== p_elmt.getID()) {
                                        added.push(descendant.getID());
                                        headerRows = Tools.addNewHeaderRow(descendant.getMainValues(), headerRows);
                                    }
                                });
                            }
                        }
                        else if (ancestor.getType() === 1 && ancestor.isInfluencing() && added.indexOf(ancestor.getID()) === -1) { //If ancestor is an influencing decision
                            headerRows = Tools.addNewHeaderRow(ancestor.getMainValues(), headerRows);
                            added.push(ancestor.getID());
                        }
                    });
                    if (!p_elmt.isInformative()) {
                        //Decsendants are only important if this is not an informative node
                        p_elmt.getAllDescendants().forEach(function (descendant: Element) {
                            if (descendant.getType() === 0) {//If descendant is a chance node

                                if (descendant.isInformative() && added.indexOf(descendant.getID()) === -1) {
                                    headerRows = Tools.addNewHeaderRow(descendant.getMainValues(), headerRows);
                                    added.push(descendant.getID());
                                }
                            }
                        });
                    }
                    //p_elmt.setUpdated(true);
                }
                p_elmt.setValues(headerRows);
                Tools.addMainValues(p_model, p_elmt);
            }
            static addMainValues(p_model: Model, p_elmt: Element): void {
                var valueHeaders: any[] = p_elmt.getValues();
                var mainValues: any[] = p_elmt.getMainValues();
                for (var i = 1; i < mainValues.length; i++) {
                    valueHeaders.push([mainValues[i]]);
                }
                for (var col = 1; col < Math.max(valueHeaders[0].length,2); col++) {
                    for (var row = Tools.numOfHeaderRows(valueHeaders); row < valueHeaders.length; row++) {
                        valueHeaders[row].push(0);
                    }
                }
            }

            static calculateValues(p_model: Model, p_element: Element) {
                var model: Model = p_model;
                var element: Element = p_element;
                //console.log("calculate values for " + p_element.getName());
                var dataHeaders: any[][] = []; //the header rows from data
                var data: any[][] = element.getData();
                var newValues: any[];
                //console.log("data: " + data + " size " + math.size(data));
                //console.log(data);
                //copy headerrows to dataHeaders to be updated
                for (var i = 0; i < Tools.numOfHeaderRows(data); i++) {
                    var newRow: any[] = [];
                    for (var j = 0; j < data[0].length; j++) {
                        newRow.push(data[i][j]);
                    }
                    dataHeaders.push(newRow);
                }
                //console.log("data headers: " + dataHeaders);
                if (element.getType() === 3 && math.size(data)[1] < 1) {//If the def table in a super value node is empty, value should just be zero
                    newValues = [0];
                }
                else if (element.getType() !== 1) {//If its a chance or value node
                    var headerRows = []; //Used to add decisions to value matrix
                    newValues = Tools.getMatrixWithoutHeader(data);
                    //console.log(newValues);
                    element.getParentElements().forEach(function (elmt) {
                        //console.log("parent: " + elmt.getName());
                        if (elmt.getType() === 0 || elmt.getType() === 2) {//If Parent is a chance or value
                            //  console.log("dataheaders: " + dataHeaders);
                            //Parent must be updated
                            if (!elmt.isUpdated()) {
                                //console.log("updating " + elmt.getName());
                                elmt.update();
                                //console.log(elmt.getName() + " has been updated");
                            }
                            var parentValuesMatrix = Tools.getMatrixWithoutHeader(elmt.getValues());
                            // console.log("current element: " + element.getName());
                            //console.log("parent: " + elmt.getName());
                            //console.log("new values: " + newValues);
                            var temp: any[] = Tools.createSubMatrices(element, newValues, elmt, dataHeaders);
                            //console.log("newValues: " + newValues);
                            var submatrices = temp[0];
                            // console.log("submatrices have size: " + math.size(submatrices));
                            //console.log(submatrices);
                            dataHeaders = temp[1];
                            //console.log("data headers: " + dataHeaders);
                            var result = [];
                            var decRows: any[] = [];
                            var newRow: any[] = [];
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
                                    // console.log("new dataHeaders: " + dataHeaders);
                                }
                            } if (element.getType() === 0 || element.getType() === 2) {//Is this line needed???
                                if (decRows.length > 0) { var parentSubMatrices = Tools.createSubMatrices(element, parentValuesMatrix, undefined, decRows)[0]; }
                                var j: number = 0;
                                for (var i = 0; i < submatrices.length; i++) {//For each submatrix multiply it by parentmatrix or parent submatrices
                                    if (decRows.length > 0) {//If there are decisions in decRows we need to use parent submatrices when multiplying
                                        // console.log("multiplying " + submatrices[i] + " size " + math.size(submatrices[i]) + " and " + parentSubMatrices[j] + " size " + math.size(parentSubMatrices[j]));
                                        var newMatrix = Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentSubMatrices[j]));
                                        if (j < parentSubMatrices.length - 1) { j++; }
                                        else { j = 0; }
                                    }
                                    else {//This means there were no decisions that already existed in dataheaders and we multiply by parent matrix
                                        //console.log("multiplying " + submatrices[i] + " size " + math.size(submatrices[i]) + " and " + parentValuesMatrix + " size " + math.size(parentValuesMatrix));
                                        var newMatrix = Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentValuesMatrix));
                                    }
                                    // console.log("size of new matrix: " + math.size(newMatrix));
                                    result.push(newMatrix);
                                    //console.log("size of result: " + math.size(result));
                                }
                                newValues = Tools.concatMatrices(result);
                                // console.log("newValues: " + newValues);
                                // console.log(newValues);
                            }
                        } else if (elmt.getType() === 1) {//If Parent is a decision
                            //console.log("parent is a decision");
                            //Only add if it does not already exist
                            if (math.flatten(headerRows).indexOf(elmt.getID) === -1) {
                                headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows);
                            }
                        }
                        //  console.log("done with parent " + elmt.getName());
                    });
                    if (element.getType() === 3) {
                        var valueArray: number[] = [];
                        var defValue: number; //This is the value from the def table which we multiply by
                        headerRows = Tools.makeSureItsTwoDimensional(headerRows);
                        // console.log("headerrows: " + headerRows);
                        if (headerRows[0].length < 2) {//If headerrows is empty 
                            headerRows = [[undefined, undefined]];
                        }
                        // console.log(headerRows);
                        var conditionElmts: string[] = math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(headerRows, 0)));
                        for (var i = 1; i < math.size(headerRows)[1]; i++) {//For each column in headerRows
                            valueArray.push(0);//Make room for the new value
                            var conditions: string[] = math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(headerRows, i)))
                            element.getParentElements().forEach(function (parent) {
                                /*for (var n = 0; n < conditionElmts.length; n++) {//For each parent element
                                    var parent: Element = model.getElement(conditionElmts[n]);*/

                                for (var j = 0; j < data.length; j++) {//Find the right value in def table 
                                    if (data[j][0] === parent.getID()) {
                                        defValue = data[j][1];
                                        break;
                                    }
                                }
                                var parentMatrix: any[];
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
                    //console.log("new values: " + newValues);
                    p_element.setValues(Tools.makeSureItsTwoDimensional(newValues));
                } else {//If it is a decision node
                    Tools.calculateDecisionValues(element, model);
                    
                }
                //console.log("done calculatint values for " + p_element.getName());
            }
            static calculateDecisionValues(p_elmt: Element, p_model: Model) {
                if (p_elmt.getType() !== 1) {
                    throw "ERROR Trying to use calculateDecisionValues on non decision element";
                }
               //console.log("decisions node begin");
             //   p_elmt.setValues(Tools.fillEmptySpaces((p_elmt.copyDefArray())));
                var values: any[] = p_elmt.getValues();
                //Number of header rows is equal to number of rows in values minus number of rows in definition
                var numOfHeaderRows = values.length - p_elmt.getData().length;
                //First calculate the utility tables to use
                var utilityTables: any[] = [];
                p_model.getElementArr().forEach(function (elmt) {
                    if (elmt.getType() === 2) {
                        //console.log("value: " + elmt.getName());
                        //If the node is not updated, update
                        if (!elmt.isUpdated()) {
                            elmt.update();
                        }
                        var utilityValues: any[] = Tools.removeDecisionsFromValues(p_model, elmt, p_elmt);
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
                        var conditionElmts: string[] = [p_elmt.getID()];
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
                            
                        })
                        //console.log("i: " + i + "  j: " + j + "  Value: " + value);
                        values[i][j] = value;
                    }
                }
                //     console.log("decisions end");
                //console.log("new values: " + values);
                p_elmt.setValues(values);

            }

            //Takes a utility node and a dec node and removes all decisions from the utility value that are not in the dec headers
            static removeDecisionsFromValues(p_model: Model, p_utilityNode: Element, p_decNode: Element): any[] {
                var decHeaders: any[] = math.flatten(Tools.getColumn(p_decNode.getValues(), 0));
                var values = p_utilityNode.getValues().slice();
                var valueMatrix: any[] = Tools.getMatrixWithoutHeader(values);
                var valueHeaders: any[] = values.slice(0, Tools.numOfHeaderRows(values));
                for (var row = 0; row < Tools.numOfHeaderRows(values); row++) {
                    var elmt: Element = p_model.getElement(values[row][0]);//check if this elements needs removing
                    if (elmt.getType() === 1 && decHeaders.indexOf(values[row][0]) === -1 && elmt.getID() !== p_decNode.getID()) {//if elmt is dec and is not in dec headers
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
                if (valueHeaders.length > 0 && valueHeaders[0].length > 0) {
                    valueHeaders.push(math.flatten(valueMatrix));
                }
                else {
                    //If there are no headers
                    valueHeaders = [math.flatten(valueMatrix)];
                }
                return valueHeaders;
            }

            //Takes a value table and a decision node and removes all chances from the value table that are not in the dec nodes headers
            static removeChancesFromValues(p_model: Model, p_utilityNode: Element, utilityValues: any[], p_decNode: Element): any[] {
                var decHeaders: any[] = math.flatten(Tools.getColumn(p_decNode.getValues(), 0));
                var values = utilityValues.slice();
                var valueMatrix: any[] = Tools.getMatrixWithoutHeader(values);
                var valueHeaders: any[] = values.slice(0, Tools.numOfHeaderRows(values));
                for (var row = 0; row < Tools.numOfHeaderRows(values); row++) {
                    var elmt: Element = p_model.getElement(values[row][0]);
                    if (elmt.getType() === 0 && decHeaders.indexOf(values[row][0]) === -1) {//if elmt is chance and is not in dec headers
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

            }
            static isOneDimensional(p_array: any[][]): Boolean {
                //console.log(p_array.length);
                return (p_array.length === 1 || !($.isArray((p_array)[0])) || p_array[1] === undefined);
            }

            static fillEmptySpaces(p_table: any[][]): any[][] {
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
                        if (data[changedRow][j] !== p_state) {//This column does not need to be deleted
                            newRow.push(data[i][j]);
                        }
                    }
                    newData.push(newRow);
                }
                data = newData;
                return data;

            }
            //Convert the array to only contain one of each element
            static removeDuplicates(p_array: any[][]): any[][] {
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
                //console.log("Adding array: " + p_newRow + " size " + math.size(p_newRow));
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
                    if (p_table[0].constructor !== Array) {
                       // if (!($.isArray((p_table)[0]))) {
                            p_table = [p_table];
                     //   }
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
                        //console.log("rownumber: " + rowNumber);
                        for (var i = 0; i < values.length; i++) {
                            var newRow: any[] = [];
                            for (var j = 0; j < values[0].length; j++) {
                                //console.log("checking if " + values[rowNumber][j] + " matches " + decision);
                                if (values[rowNumber][j] === decision || j === 0) {
                                    //console.log("adding " + (values[i][j]));
                                    newRow.push(values[i][j]);
                                    //console.log("new row: " + newRow);
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
            static fillDataTable(p_elmt: Element, p_dataTable: any[][]) {
                // console.log("filling table: " + p_dataTable);
                // console.log(p_dataTable);
                var headerRows: any[][] = [];
                var data: any[][] = [];
                var tempData: any[][] = [];
                var numOfHeaderRows: number = Tools.numOfHeaderRows(p_dataTable);
                var newDataTable: any[][];
                if (p_elmt.getType() === 3) {//Super value node
                    newDataTable = [];
                    for (var i = 0; i < p_dataTable.length; i++) {
                        if (p_dataTable[i][1] === undefined) {//copy first column and insert 0 in second column
                            newDataTable.push([p_dataTable[i][0]]);
                            newDataTable[i].push(0);
                        }
                        else {//copy row
                            newDataTable.push(p_dataTable[i]);
                        }
                    }
                    newDataTable = Tools.makeSureItsTwoDimensional(newDataTable);
                }
                else {
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
            }

            //removes headerrow and updates the datatable accordingly
            static removeHeaderRow(p_elmt: Element, p_rowName: string, p_oldData: any[][]): any[][] {
                //var newData: Array<Array<any>> = [];
                var newData: any[][] = [];

                var numHeaderRows = this.numOfHeaderRows(p_oldData, p_elmt);
                //console.log(p_oldData);
               // console.log("numHeaderRows: " + numHeaderRows);
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
            }
            static validConnection(inputElmt: Element, outputElmt: Element): boolean {
                //console.log("checking connection from " + inputElmt.getID() + " to " + outputElmt.getID());
                var valid: boolean = true;
                if (inputElmt.isAncestorOf(outputElmt)) { //Cannot connect to its ancestor. This would create a cycle
                    valid = false;
                   // alert("Can not create a cycle");

                }
                else if (inputElmt.isParentOf(outputElmt)) { //Cannot connect if there is already a connection
                    valid = false;
                }
                //Value cannot connect to value if output cannot be converted to super value
                else if (inputElmt.getType() === 2 && (outputElmt.getType() === 1 || outputElmt.getType() === 0 || (outputElmt.getType() === 2 && outputElmt.getParentElements().length > 0))) {
                    valid = false;
                   // alert("Value nodes cannot have children");
                }
                /*else if (inputElmt.getType() === 0 && outputElmt.getType() === 1) {
                    valid = false;
                  //  alert("Chance nodes can not have decsion node children");
                }*/
                else if (outputElmt.getType() === 3 && inputElmt.getType() !== 2) {//Super value nodes can only have value children
                    valid = false;
                   // alert("Super value nodes can only have value children");
                }
               // console.log("valid connection between " + inputElmt.getType() + " and  " + outputElmt.getType() + ": " + valid);
                return valid;
            }
            static getVIOMatrices(p_model: Model, p_pov: Element, p_forDec: Element, p_chanceElmts: Element[], p_gui: GUIHandler): any[] {
                var tempConnections: Connection[] = [];
                var isPossible: boolean = true;
                //Create temporary decision
                var tempDecision: Element = p_model.createNewElement(1);
                //Add connection from temp dec to point of interest
                var c = p_model.createNewConnection(tempDecision, p_pov);
                if (!Tools.validConnection(tempDecision, p_pov) || !p_model.addConnection(c)) {
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
                var utilityFound: boolean = false;
                for (var i = 0; i < p_model.getElementArr().length; i++) {
                    var elmt: Element = p_model.getElementArr()[i];
                    if (elmt.getType() === 2) {
                        //Add connection from temp dec to utility node
                        var c = p_model.createNewConnection(tempDecision, elmt);
                        if (!Tools.validConnection(tempDecision, elmt) || !p_model.addConnection(c)) {
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
                var model1: Object = $.extend(true, {},p_model.toJSON());
                
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
                var model2: Object = $.extend(true, {}, p_model.toJSON());
                
                //Delete temporary elements and connections
                p_gui.deleteSelected(new Event("click"), [tempDecision], tempConnections);//The event is empty and not used
                if (isPossible) {
                    return [model1, model2,tempDecision.getID()];
                }
                else {
                    return undefined;
                } 
            }
            static valueOfInformation(p_model: Model, p_pov: Element, p_forDec: Element, p_chanceElmts: Element[], p_gui: GUIHandler): any[] {
               
                console.log("value of information. POV: " + p_pov.getName() + " for dec: " + p_forDec.getName() + " chancenodes: " + p_chanceElmts.length);
                var tempConnections: Connection[] = [];
                var isPossible: boolean = true;
                //Create temporary decision
                var tempDecision: Element = p_model.createNewElement(1);
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
                var utilityFound: boolean = false;
                for (var i = 0; i < p_model.getElementArr().length; i++) {
                    var elmt: Element = p_model.getElementArr()[i];
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
                var resultMatrix:any[] = math.subtract(matrix2, matrix1);
                //Find average between the two rows
                var newResult = [];
                for (var i = 0; i < Tools.numOfHeaderRows(resultMatrix); i++) {
                    newResult.push(resultMatrix[i]);
                }
                newResult.push([]);
                var numOfRows: number = resultMatrix.length;
                for (var i = 0; i < resultMatrix[0].length; i++) {
                    var val1: number = resultMatrix[numOfRows - 2][i];
                    var val2: number = resultMatrix[numOfRows - 1][i];
                    var average: number = (val1+val2) / 2;
                    newResult[newResult.length - 1].push(Tools.round(average));
                }
                //Delete temporary elements and connections
                p_gui.deleteSelected(new Event("click"), [tempDecision], tempConnections);//The event is empty and not used
                if (isPossible) {
                    return newResult;
                }
                else {
                    return [[0]];
                }
            }
            static calcVOIResult(p_matrix1: any[], p_matrix2: any[]): any[] {
                //Subtract the two saved matrices
                var resultMatrix: any[] = math.subtract(p_matrix2, p_matrix1);
                //Find average between the two rows
                var newResult = [];
                for (var i = 0; i < Tools.numOfHeaderRows(resultMatrix); i++) {
                    newResult.push(resultMatrix[i]);
                }
                newResult.push([]);
                var numOfRows: number = resultMatrix.length;
                for (var i = 0; i < resultMatrix[0].length; i++) {
                    var val1: number = resultMatrix[numOfRows - 2][i];
                    var val2: number = resultMatrix[numOfRows - 1][i];
                    var average: number = (val1 + val2) / 2;
                    newResult[newResult.length - 1].push(Tools.round(average));
                }
                return newResult;
            }
            static createLikelihoodTable(p_model: Model, p_numOfIterations: number): any[] {
                console.log("creating table");
                var numberOfRuns = p_numOfIterations;
                var table = [];//contains all cases
                var evidenceElmts: Element[] = p_model.getElmtsWithEvidence();

                var interval = setInterval(loop, 1);
                function loop() {
                    if (numberOfRuns % n === 10) {
                        $("#progressBar").progressbar({
                            value: n
                        });

                    }
                };
                for (var n = 0; n < numberOfRuns; n++) {

                    var w = 1;
                    var aCase = {};
                    var sampledElmts: Element[] = [];
                    p_model.getElementArr().forEach(function (e) {
                        if (e.getType() !== 2 && sampledElmts.indexOf(e) < 0) {//If this is a chance or decision and it has not already been sampled. Should it be !==2 ??
                            var result = Tools.sample(sampledElmts, evidenceElmts, aCase, w, e, p_model);
                            aCase = result[0];//Update the case 
                            w = result[1];//Update weight
                            sampledElmts = result[2]; //Update sampled elements
                            sampledElmts.push(e);
                        }
                    });
                    table.push([aCase, w]);
                }
                console.log("done creating table");
                return table;
            }
            
            static calcValuesLikelihoodSamplingElmt(p_elmt: Element, p_table: any[]) {

                console.log("calculating values for " + p_elmt.getName());
                if (p_elmt.getType() === 0 || p_elmt.getType() === 2) {
                    var data = p_elmt.getData();
                    var values = [];
                    var oldValues = p_elmt.getValues(); //This is used to gain information about the headerrows in values
                    var numOfHeaderrowsData: number = Tools.numOfHeaderRows(data);
                    var numOfHeaderrowsOldValues: number = Tools.numOfHeaderRows(oldValues, p_elmt);
                    //Add the headerrows into values
                    for (var row = 0; row < Tools.numOfHeaderRows(oldValues, p_elmt); row++) {
                        values.push(oldValues[row]);
                    }
                    var dataLength = data.length;
                    var startRow = Tools.numOfHeaderRows(data, p_elmt);
                    if (p_elmt.getType() === 2) {
                        dataLength = data[0].length;
                        startRow = 1;
                    }
                    // console.log("startCol: " + startCol + " dataLenght: " + dataLength);
                    for (var i = startRow; i < dataLength; i++) {//For each of the different values
                        var valRow = [];
                        if (p_elmt.getType() === 0) {
                            valRow.push(data[i][0]);//push name of value
                        }
                        else {
                            valRow.push("dummyCol");
                        }
                        for (var col = 1; col < oldValues[0].length; col++) {//There must be the same amount of columns in new values as there were in old values
                            var value = 0;

                            //console.log("calculating for " + data[i][0] + " column: " + col + " in " + e.getName());
                            var weightSum: number = 0; //Calculate a new weight sum for each column
                            
                            for (var j = 0; j < p_table.length; j++) {//For each case
                                //console.log("case: " + JSON.stringify(table[j][0]));
                                var matchingCase = true;
                                var matchingValue = true;

                                if (p_elmt.getType() === 2) {
                                    for (var headerRow = 0; headerRow < numOfHeaderrowsData; headerRow++) {

                                        //console.log("column: " + i + ". Checking " + data[headerRow][0] + ", " + table[j][0][data[headerRow][0]] + " against " + data[headerRow][i]);
                                        if (p_table[j][0][data[headerRow][0]] !== data[headerRow][i]) {//If the value in headerrow is not the same as the one sampled
                                            matchingValue = false;
                                            //console.log("does not match");
                                        }
                                    }
                                }
                                else if (p_table[j][0][p_elmt.getID()] !== data[i][0]) {
                                    //console.log("value does not match");
                                    matchingValue = false;
                                }
                                for (var headerRow = 0; headerRow < numOfHeaderrowsOldValues; headerRow++) {//Checking if all elements in this column match
                                    var headerElmt = oldValues[headerRow][0];
                                    //console.log("checking if case includes " + p_model.getElement(headerElmt).getName() + " : " + oldValues[headerRow][col]); 
                                    if (p_table[j][0][headerElmt] !== oldValues[headerRow][col]) {
                                        //console.log("does not match");
                                        matchingCase = false;
                                    }
                                }
                                if (matchingCase) {//Only increment weigthsum if this case includes all choices in this column
                                    weightSum += p_table[j][1];
                                    //console.log("mathcing case. Updated weight sum to " + weightSum);
                                }
                                if (matchingValue && matchingCase) {
                                    //console.log("matching case and value");
                                    value += p_table[j][1];//Add the weight

                                    //console.log("value = " + value);

                                } else {
                                    //console.log("does not match");
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
                    if (p_elmt.getType() === 2) {//If this is a utility node then values corresponds to a chance node where the states are the headers of the utility def
                        //console.log("values: ");
                        //console.log(values);
                        //console.log("multiplying "+ Tools.getMatrixWithoutHeader(data) + " and " + Tools.getMatrixWithoutHeader(values));
                        var utilityValue = math.multiply(Tools.getMatrixWithoutHeader(data), Tools.getMatrixWithoutHeader(values));
                        utilityValue = math.squeeze(utilityValue);
                        if (!isNaN(utilityValue)) {//check if utility value is just a number
                            utilityValue = [utilityValue];
                        }
                        //console.log("result: ");
                        //console.log(utilityValue);
                        //Add the headerrows into values
                        values = [];
                        for (var row = 0; row < numOfHeaderrowsOldValues; row++) {
                            values.push(oldValues[row]);
                        }
                        var valueRow = ["Value"];
                        for (var i = 0; i < utilityValue.length; i++) {
                            valueRow.push(utilityValue[i]);
                        }
                        //console.log("valueRow: " + valueRow);
                        //console.log(valueRow);
                        values[row] = valueRow;
                        //console.log(values);
                    }
                    //console.log("new values: ");
                    //console.log(values);
                    //console.log("setting values for " + e.getName()+ " + to: "+ values);
                    p_elmt.setValues(values);
                    p_elmt.setUpdated(true);
                }
            }
            static calcValuesLikelihoodSampling(p_model: Model, p_numOfIterations: number) {
                //console.log("calculating values with evidence");
                var table: any[] = Tools.createLikelihoodTable(p_model, p_numOfIterations);
                var weightSum = 0;
                /*for (var i = 0; i < table.length; i++) {
                    //console.log("weight: " + table[i][1]);
                    weightSum += table[i][1];
                }*/
                //console.log("weightSum " + weightSum);

                p_model.getElementArr().forEach(function (e) {
                    Tools.calcValuesLikelihoodSamplingElmt(e, table);
                    
                });
                //Update concerning decisions. It is important that this is done before decision values are calculated
                p_model.getElementArr().forEach(function (p_elmt: Element) {
                    Tools.updateConcerningDecisions(p_elmt);
                });
                console.log("done updating concerning decisions");
                p_model.getElementArr().forEach(function (e) {//This recalculates all values of decision elements
                    if (!e.isUpdated()) {
                        //console.log("calculating for " + e.getName());
                        Tools.calculateValues(p_model, e);
                        e.setUpdated(true);
                    }
                });
            }
            static sample(p_sampledElmts: Element[], p_evindeceElmts: Element[], p_case, p_weight: number, p_elmt: Element, p_model: Model) {
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
                if (p_evindeceElmts.indexOf(p_elmt) > -1) {//If this is an evidence element
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
            }
            static allStatesAreDestrinct(p_data: any[][]): boolean {
                var states: String[] = math.flatten(Tools.getColumn(p_data, 0));
                for (var i = 0; i < states.length; i++) {
                    for (var j = i + 1; j < states.length; j++) {
                        if (states[i] === states[j]) {
                            return false;
                        }
                    }
                }
                return true;
            }
            static getElmtsWithEvidence(p_model: Model): Element[] {
                var elementsWithEvidence: Element[] = [];
                p_model.getElementArr().forEach(function (e) {
                    if (e.getType() === 0 && e.getEvidence() !== undefined) {
                        elementsWithEvidence.push(e);
                    }
                });
                return elementsWithEvidence;
            }
            static getWeightedSample(p_elmt: Element, p_case) {
                var randomNumber = Math.random();
                var data = p_elmt.getData();
                var columnNumbers = Tools.getColumnFromCase(p_case, p_elmt);
                var sum = 0;
               // console.log("columnnumbers: " + columnNumbers);
                for (var i = Tools.numOfHeaderRows(data, p_elmt); i < data.length; i++) {
                    var columnSum = 0;
                    if (p_elmt.getType() === 0) {
                        for (var j = 0; j < columnNumbers.length; j++) {//Finding the avarage probability if there is a decision parent
                            //console.log("data[i][columnNumber[j]]: " + data[i][columnNumber[j]]);
                            columnSum += data[i][columnNumbers[j]];
                        }
                        columnSum /= j;

                    }
                    else if (p_elmt.getType() === 1) {//If this is a decision node
                        /*if (p_elmt.getDecision() !== undefined) {//If the choice is made
                            return data[Number(p_elmt.getDecision()) + Tools.numOfHeaderRows(data, p_elmt)][0];//Return the choice (Is  + Tools.numOfHeaderRows needed??)
                        }*/
                        columnSum = 1 / (data.length - Tools.numOfHeaderRows(data, p_elmt));// just sample randomly from the choices
                    }
                    sum += columnSum; // If there is just one matching column (no decision parent) this is the same as sum += data[i][columnNumber]
                    //console.log("sum: " + sum);
                    if (randomNumber <= sum) {//The retuned value is weighted by the probabilities
                        //console.log("sampled " + data[i][0]);
                        return data[i][0];
                    }
                }
            }
        
            static getColumnFromCase(p_case, p_elmt: Element) {
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
                for (var i = 1; i < data[0].length; i++) {//For each column in data
                    //console.log("checking column " + i);
                    var matchingColumn: boolean = true;
                    for (var j = 0; j < Tools.numOfHeaderRows(data, p_elmt); j++) {//For each header row
                        //console.log("checking row: " + data[j]);
                        for (var n = 0; n < conditions.length; n++) {//For each condition
                           // console.log("elmt " + data[j][0] + " matches: " + conditions[n][0] + "?");
                             //console.log( data[j][0] === conditions[n][0]);
                            //console.log("data condition: " + data[j][i].trim() + " does not match: " + conditions[n][1].trim() + "?")
                            //console.log(data[j][i].trim() !== conditions[n][1].trim());
                            if (data[j][0] === conditions[n][0] && data[j][i].trim() !== conditions[n][1].trim()) {//If this is the right row, but the value does not match
                                //console.log("not correct column");
                                matchingColumn = false;// then it's not the right column
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
            }
            static getValueFromParentSamples(p_elmt: Element, p_case, p_model: Model): number {
                var columns = Tools.getColumnFromCase(p_case, p_elmt);
               // console.log("col: " + columns);
                var averageLikelihood: number = 0;
                for (var i = 0; i < columns.length; i++) {
                    var row: number = Number(p_elmt.getEvidence()) + Tools.numOfHeaderRows(p_elmt.getData());
                    averageLikelihood += p_elmt.getData()[row][columns[i]];
                }
                averageLikelihood /= i;
                //console.log("averageLikelihood: " + averageLikelihood);
                //console.log("getting value row: " + p_elmt.getEvidence() + " col: " + column);
                return averageLikelihood;
            }
            static startWorker(p_showProgress: boolean): Worker {
                if (p_showProgress) {
                    $("#progressbarDialog").dialog();
                    $("#progressBar").progressbar({
                        value: 1
                    });
                }
                //Web worker code. Not pretty to have it here, but it did not work if it was in a seperate file
                var myworker = function () {
                    function start() {
                        debugger
                        postMessage("web worker started")
                        //importScripts("ts/Model.js", "ts/Element.js", "ts/Connection.js", "ts/Tools.js", "js/math.min.js");
                    }
                    start();

                    self.addEventListener('message', function (e) {
                        debugger
                        if (e.data.model) {
                            var model = new Mareframe.DST.Model(true);
                            model.fromJSON(JSON.parse(e.data.model), false);
                            var iterations = model.getmumOfIteraions();
                            update(model);

                            var mdlString = JSON.stringify(model.toJSON());

                            self.postMessage({ command: "finnished", model: mdlString });
                        }
                        if (e.data.url) {
                            var url = e.data.url;
                            var index = url.indexOf('DST.html');
                            if (index != -1) {
                                url = url.substring(0, index);
                            }
                            importScripts(url + "/ts/Model.js", url + "/ts/Element.js", url + "/ts/Connection.js", url + "/ts/Tools.js", url + "/js/math.min.js");
                        }
                    }, false);

                    function update(p_model) {
                        p_model.getElementArr().forEach(function (e) {
                            if (!e.isUpdated()) {
                                e.update();
                            }
                        });
                        var n = 0;
                        p_model.getElementArr().forEach(function (e) {//This is needed to make sure values and decisions are updated in the right order
                            if (e.getType() !== 0) {
                                e.setUpdated(false);
                            }
                            n++;
                        });
                        calcValuesLikelihoodSampling(p_model, p_model.m_numOfIteraions, n);
                    }

                    function calcValuesLikelihoodSampling(p_model, p_numOfIterations, p_noOfElmts) {
                        //console.log("calculating values with evidence");
                        var table = Mareframe.DST.Tools.createLikelihoodTable(p_model, p_numOfIterations);
                        var weightSum = 0;
                        /*for (var i = 0; i < table.length; i++) {
                            //console.log("weight: " + table[i][1]);
                            weightSum += table[i][1];
                        }*/
                        //console.log("weightSum " + weightSum);
                        p_model.getElementArr().forEach(function (e) {
                            if (!e.isUpdated()) {
                                status = 100 / p_noOfElmts;
                                self.postMessage({ command: "progress", progress: status })
                                Mareframe.DST.Tools.calcValuesLikelihoodSamplingElmt(e, table);
                            }

                        });
                        //Update concerning decisions. It is important that this is done before decision values are calculated
                        p_model.getElementArr().forEach(function (p_elmt) {
                            Mareframe.DST.Tools.updateConcerningDecisions(p_elmt);
                        });
                        console.log("done updating concerning decisions");
                        p_model.getElementArr().forEach(function (e) {//This recalculates all values of decision elements
                            if (!e.isUpdated()) {
                                //console.log("calculating for " + e.getName());
                                Mareframe.DST.Tools.calculateValues(p_model, e);
                                e.setUpdated(true);
                            }
                        });
                    }
                };//End of web worker code

                //Create the worker
                var worker = null,
                    URL = window.URL || (window.webkitURL); // simple polyfill

                window.URL = URL;
                var workerData = new Blob(['(' + myworker.toString() + ')()'], {
                    type: "text/javascript"
                });
                
                if (typeof (Worker) !== "undefined") {
                    worker = new Worker(window.URL.createObjectURL(workerData));
                    worker.onmessage = function (event) {
                        console.log(event.data);
                    };
                    worker.postMessage({ url: document.location.href });//Load scripts
                } else {
                    console.log("Sorry! No Web Worker support.");
                }
                return worker;
            }
            static stopWorker(p_worker: Worker): void {
                p_worker.terminate();
                $("#progressbarDialog").dialog("close");
            }
        }
    }
}