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
                if (p_valuesArray[p_valuesArray.length - 1][1] !== undefined) { //One dimensional
                    
                for (var i = 0; i < p_valuesArray.length; i++) {
                    //if the cell in column 2 contains text it is a header row and must be a decision
                    if (isNaN(p_valuesArray[i][1]) && p_valuesArray[i][1] !== undefined) {
                        counter++;
                    }
                }
                }
                return counter
            }

            static htmlTableFromArray(p_header: string, p_matrix: any[][], p_model: Model) {

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

            static concatMatrices(p_list: any[][][]): any[][] {
                var matrix = p_list[0];
                for (var i = 1; i < p_list.length; i++) {
                  //  console.log("concatting " + Tools.arrayToString(matrix) + " size " + math.size(matrix) + " and " + Tools.arrayToString(p_list[i]) + " size: " + math.size(p_list[i]));
                    matrix = math.concat(matrix, p_list[i]);
                }
                //console.log((matrix));
                return matrix;
            }

            static makeSureItsAnArray(p_value: any[]): any[] {
                if (math.size(p_value).valueOf()[1] === undefined) {
                    p_value = [p_value];
                }
                return p_value;
            }

            static getMatrixWithoutHeader(p_matrix: any[][]): any[][] {
               console.log("get matrix without header from " + p_matrix)
                var numOfColumns: number;
                var numOfRows: number;
               console.log("size: " + math.size(p_matrix));
                if (math.size(p_matrix).length > 1) {
                    numOfColumns = math.size(p_matrix)[1];
                    numOfRows = math.size(p_matrix)[0];
                    
                }
                else { //one dimensional
                    numOfColumns = math.size(p_matrix)[0];
                    numOfRows = 1;
                }
              //  console.log("numOfRows: " + numOfRows + " numOfColumns: " + numOfColumns);
                var newMatrix = [];
                //For each row
                for (var i = 0; i < numOfRows; i++) {
                    //If there is a number in column 2 in this row, this is not a header row
                    
                    var secondColumnValue: any;
                    if (numOfRows === 1) { // One dimensional
                        secondColumnValue = math.subset(p_matrix, math.index(1));
                    }
                    else {
                        secondColumnValue = math.subset(p_matrix, math.index(i, 1));
                    }
                   // console.log("subset: " + secondColumnValue);
                    if (!(isNaN(secondColumnValue))) {
                        var row = math.squeeze(Tools.getRow(p_matrix, i));
               //         console.log("row " + i+ ": " + row + " length " + row.length)
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
       //         console.log("create sub matrix from " + p_matrix + " for values " + p_takenIntoAccount[p_takenIntoAccount.length - 1].getMainValues())
                var data = p_data;
              //  console.log("data: " + Tools.arrayToString(data))
                var subMatrices = [];
                var columns = math.size(p_matrix).valueOf()[1];
              //  console.log("columns: " + columns);
                var added = [];
                //For each column
                for (var n = 1; n < columns; n++) {
                    //If column has not already been added
                    if (added.indexOf(n) === -1) {
                        var currentColumn = math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(data, n)));
                       // console.log("current column: " + currentColumn)
                        var newMatrix = Tools.makeSureItsAnArray(Tools.getColumn(p_matrix, n - 1));
                        var matchingColumn = true;
                        //Look through the rest of the columns
                        for (var i = n + 1; i <= columns; i++) {
                            var columnValues = math.flatten(Tools.makeSureItsAnArray(Tools.getColumn(data, i)));
                            //For each header value in column
                            for (var j = 0; j < Tools.numOfHeaderRows(data); j++) {
                                //If the value is not found this is not a matching column
                                //console.log("checking value: " + data[j][i]);
                                if (currentColumn.indexOf(data[j][i]) === -1) {
                                   // console.log(data[j][i] + " was not found in " + currentColumn)
                                    matchingColumn = false;
                                    //But if the value has already been taken into account the column might be a matching column
                                    p_takenIntoAccount.forEach(function (elmt) {
                                        if (elmt.getMainValues()[0] === data[j][0]) {
                                         //   console.log("element has been taking into account");
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
                                //console.log("new matrix:" + Tools.arrayToString(newMatrix));
                            }
                        }
                        subMatrices.push(newMatrix);
                    }
                }
             //   console.log("returned " + subMatrices)
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
            static updateDataHeader(p_dataHeader: any[][], p_newRows: any[][]) {
              //  console.log("inserting " + Tools.arrayToString(p_newRows) + " into " + Tools.arrayToString(p_dataHeader));
                var rowsInDataHeader: number;
                var columnsInDataHeader: number;
                var rowsInNewRows: number;
                var columnsInNewRows: number;
                if (Tools.isOneDimensional(p_dataHeader)) {
                    p_dataHeader = p_newRows;
                    return; //There is no need to do anything else
                }
                else {
                    rowsInDataHeader = p_dataHeader.length;
                    columnsInDataHeader = p_dataHeader[0].length;
                    //Delete last row in dataHeader
                  //  console.log("deleting: " + p_dataHeader[rowsInDataHeader - 1]);
                    p_dataHeader.splice(rowsInDataHeader - 1, 1);
                    rowsInDataHeader--;
                   // console.log("dataHeader: " + Tools.arrayToString(p_dataHeader));
                }
                
                if (Tools.isOneDimensional(p_newRows)) {
                    rowsInNewRows = 1;
                    columnsInNewRows = p_newRows.length;
                }
                else {
                    rowsInNewRows = p_newRows.length;
                    columnsInNewRows = p_newRows[0].length;
                }
                //If some of the new rows already exist in dataHeader they are removed from dataHeader
               // console.log("rowsInDataHeader: " + rowsInDataHeader + " columnsInDataHeader: " + columnsInDataHeader);
               // console.log("rowsInNewRows: " + rowsInNewRows + " columnsInNewRows: " + columnsInNewRows);
                var tempDataHeader:any[] = [];
                var duplicateRow: Boolean;
                var rowsInNewDataHeader: number = rowsInDataHeader;
                if (rowsInDataHeader === 1 && rowsInNewRows === 1) {
                    //console.log("both tables are one dimensional");
                        if (p_dataHeader[0] !== p_newRows[0]) {
                            tempDataHeader = p_dataHeader;
                        }
                        else {
                            p_dataHeader = p_newRows;
                            return;
                        }
                }
                else if (rowsInDataHeader === 1) {
                   // console.log("dataHeader is one dimensional");
                        duplicateRow = false;
                        for (var i = 0; i < rowsInNewRows; i++) {
                            if (p_dataHeader[0] === p_newRows[i][0]) {
                                duplicateRow = true;
                            }
                        }
                        if (duplicateRow) {
                            p_dataHeader = p_newRows;
                            return;
                        }
                        else {
                            tempDataHeader = p_dataHeader;
                        } 
                }
                else if (rowsInNewRows === 1) {
                    //console.log("new rows is one dimensional");
                    for (var i = 0; i < rowsInDataHeader; i++) {
                       // console.log("comparing " + p_dataHeader[i][0] + " and " + p_newRows[0]);
                        if (p_dataHeader[i][0] !== p_newRows[0]) {
                           // console.log("pushing " + p_dataHeader[i]);
                            tempDataHeader.push(p_dataHeader[i]);
                        }
                        else {
                            rowsInNewDataHeader--;
                        }
                    } 
                }

                else {

                    for (var i = 0; i < rowsInDataHeader; i++) {
                        duplicateRow = false;
                        for (var j = 0; j < rowsInNewRows; j++) {
                            if (p_dataHeader[i][0] === p_newRows[j][0]) {
                                duplicateRow = true;
                            }
                        }
                        if (duplicateRow === false) {
                            tempDataHeader.push(p_newRows[i])
                        }
                        else {
                            //console.log("duplicate found: " + p_dataHeader[i][0]);
                            rowsInNewDataHeader--;
                        }
                    }
                }
                p_dataHeader = tempDataHeader;
                rowsInDataHeader = rowsInNewDataHeader;
               // console.log("p_dataHeader: " + p_dataHeader);
               // console.log("rowsInDataHeader: " + rowsInDataHeader + " columnsInDataHeader: " + columnsInDataHeader);
                if (Tools.isOneDimensional(p_newRows)) {
                    rowsInNewRows = 1;
                    columnsInNewRows = p_newRows.length;
                }
                else {
                    rowsInNewRows = p_newRows.length;
                    columnsInNewRows = p_newRows[0].length;
                }
                //console.log("rowsInNewRows: " + rowsInNewRows + " columnsInNewRows: " + columnsInNewRows);
                /*if (math.size(p_dataHeader).length === 2 && math.size(p_dataHeader)[0] === 1) {//Its a one dimensional array inside another array
                    var tempArray = [];
                    for (var i = 0; i < math.size(p_dataHeader)[1]; i++) {
                        tempArray.push(p_dataHeader[0][i]);
                    }
                    p_dataHeader = tempArray;
                }*/
                var sameValueColumns = 1;
                for (var i = 2; i < columnsInDataHeader; i++) {
                    //if (rowsInDataHeader > 1) {
                        //console.log("comparing " + p_dataHeader[rowsInDataHeader - 1][1] + " and " + p_dataHeader[rowsInDataHeader - 1][i]);
                        if (p_dataHeader[rowsInDataHeader - 1][1] === p_dataHeader[rowsInDataHeader - 1][i]) {
                            sameValueColumns++;
                        }

                    /*}
                    else {
                        console.log(p_dataHeader[0]);
                        console.log("comparing " + p_dataHeader[1] + " and " + p_dataHeader[i]);
                        if (p_dataHeader[1] === p_dataHeader[i]) {
                            sameValueColumns++;
                        }
                    }*/
                    
                }
                //console.log("same value columns: " + sameValueColumns);
                //If there are fewer same value columns in dataHeader than there are columns in newRows
                //copy columns until there are the same amount
             //   console.log("dataHeader: " + p_dataHeader);
                while (sameValueColumns < columnsInNewRows - 1) {
                    for (var i = 1; i < columnsInNewRows; i += sameValueColumns) {
                        if (rowsInDataHeader === 1) {
                            p_dataHeader.splice(i, 0, p_dataHeader[i]);
                        }
                        else {
                            for (var j = 0; j < rowsInDataHeader; j++) {
                                console.log("inserting " + Tools.arrayToString(p_dataHeader));
                                p_dataHeader[j].splice(i, 0, p_dataHeader[j][i]);
                            }
                        }
                    }
                    sameValueColumns++;
                }
                //If there are more same value columns in dataHeader than there are columns in newRow
                //delete columns until there are the same amount
                while (sameValueColumns > columnsInDataHeader -1 ) {
                    for (var i = 1; i < columnsInNewRows; i += sameValueColumns) {
                        if (rowsInDataHeader === 1) {
                            p_dataHeader.splice(i, 1);
                        }
                        else {
                            for (var j = 0; j < rowsInDataHeader; j++) {
                                p_dataHeader[j].splice(i, 1);
                            }
                        }
                    }
                    sameValueColumns--;
                }
               // console.log("rows in dataHeader : " + p_dataHeader.length);
                    //Insert the new rows
                if (rowsInNewRows === 1) {
                   // console.log("inserting : " + p_newRows);
                    p_dataHeader.push(p_newRows);
                }
                else {
                    for (var i = 0; i < rowsInNewRows; i++) {
                       // console.log("inserting: " + p_newRows[i]);
                        p_dataHeader.push(p_newRows[i]);
                    }
                }
               // console.log("rows in dataHeader : " + p_dataHeader.length);
               // console.log("new dataHeader: " +(p_dataHeader));
                var columnsInOriginalNewRows = columnsInNewRows - 1;
                //console.log("columnsInOriginalNewRows: " + columnsInOriginalNewRows);
                //insert into the table until it is full
                while (columnsInNewRows < columnsInDataHeader) {
                    //console.log("columnsInNewRows: " + columnsInNewRows + " columnsInDataHeader: " + columnsInDataHeader);
                    //Add the new rows
                    for (var i = 0; i < rowsInNewRows; i++) {
                        for (var j = 1; j < columnsInNewRows; j++) {
                           // console.log(i + rowsInDataHeader);
                            if (rowsInNewRows === 1) {
                                p_dataHeader[i + rowsInDataHeader].push(p_newRows[j]);
                       // console.log("inserting " + p_newRows[j]);
                            }
                            else {
                                p_dataHeader[i + rowsInDataHeader].push(p_newRows[i][j]);
                                //console.log("inserting " + p_newRows[i][j]);
                            }
                        }
                        columnsInNewRows += columnsInOriginalNewRows;
                    }
                }
            }
            static insertNewHeaderRowAtBottom(p_newRow: any[], p_table: any[]): any[] {
                //   console.log("inserting " + p_newRow + " in " + p_table);
                var tempTable: any[] = p_newRow.slice();
                if (p_table.length === 0) {
                  //  console.log("table was empty");
                    //p_table = tempTable;
                //    console.log("returned " + p_table);
                    return tempTable;
                }
                if (Tools.isOneDimensional(p_table)) {
                  //  console.log("one dimensional");
                    tempTable = Tools.addNewHeaderRow(p_table, tempTable);
                    //p_table = tempTable;
                    return tempTable;
                }
                for (var i = p_table.length - 1; i >= 0; i--) {
                    tempTable = Tools.addNewHeaderRow(p_table[i], tempTable);
                }
                //p_table = tempTable;
                return p_table;
            }
            static calculateValues(p_model: Model, p_element: Element) {
                var model: Model = p_model;
                var element: Element = p_element;
                console.log("calculate valeus for " + p_element.getName());
                var dataHeaders: any[][] = [];
                var data: any[][] = element.getData();
                console.log("data: " + data);
                for (var i = 0; i < Tools.numOfHeaderRows(data); i++) {
                    var newRow: any[] = [];
                    for (var j = 0; j < data[0].length; j++) {
                        newRow.push(data[i][j]);
                    }
                    dataHeaders.push(newRow);
                }
                if (element.getType() !== 1) {//If its a chance or value node
                    var headerRows = [];
                    var takenIntoAccount = [];
                    var newValues = Tools.getMatrixWithoutHeader(data);
                   // console.log("data: " + Tools.arrayToString(newValues));
                    element.getParentElements().forEach(function (elmt) {
                        console.log("parent: " + elmt.getName());
                        if (elmt.getType() === 0) {//If Parent is a chance
                            takenIntoAccount.push(elmt) //The parents which already have been evaluated
                            //Parent must be updated
                            if (!elmt.isUpdated()) {
                                elmt.update();
                            }
                        //console.log("parent values: " + Tools.arrayToString(elmt.getValues()));
                            var parentValuesMatrix = Tools.getMatrixWithoutHeader(elmt.getValues());
                            var submatrices = Tools.createSubMatrices(newValues, takenIntoAccount, dataHeaders);
                            //For each submatrix calculate new values
                          //  console.log("multiplying " + submatrices[0] + " and " + parentValuesMatrix);
                            var result = [];//Tools.makeSureItsAnArray([math.multiply(submatrices[0], parentValuesMatrix)]);
                           // console.log("size of result: " + math.size(result));
                                for (var i = 0; i < submatrices.length; i++) {
                                 //   console.log("multiplying " + submatrices[i] + " and " + parentValuesMatrix);
                                    var newMatrix = Tools.makeSureItsAnArray(math.multiply(submatrices[i], parentValuesMatrix));
                                    //console.log("size of new matrix: " + math.size(newMatrix));
                                    result.push(newMatrix);
                                 //   console.log("size of result: " + math.size(result));
                                
                            }
                            newValues = Tools.concatMatrices(result);
                            //If parent has dec in values table these are added to dataHeaders
                         //   console.log("num of header rows in parent " + elmt.getName() + " values: " + Tools.numOfHeaderRows(elmt.getValues()));
                            if (Tools.numOfHeaderRows(elmt.getValues()) > 0) {
                             //   console.log("parent contains decisions");
                               // console.log("dataHeaders before adding: " + Tools.arrayToString(dataHeaders));
                                var newRows: any[];
                                //If there is just one decision
                                if (Tools.numOfHeaderRows(elmt.getValues()) === 1) {
                                    //dataHeaders = Tools.deleteHeaderRow(elmt.getValues()[0][0], dataHeaders); //Delete if it already has been added
                                    //Tools.insertNewHeaderRowAtBottom(elmt.getValues()[0].slice(), dataHeaders);
                                    newRows = elmt.getValues()[0].slice();
                                    //headerRows = Tools.deleteHeaderRow(elmt.getValues()[0][0], headerRows);
                                    headerRows = Tools.insertNewHeaderRowAtBottom(elmt.getValues()[0], headerRows);
                                    console.log("new header rows: " + headerRows);
                                }
                                else {
                                    newRows = [];
                                    for (var i = 0; i < Tools.numOfHeaderRows(elmt.getValues()); i++) {
                                        //dataHeaders = Tools.deleteHeaderRow(elmt.getValues()[i][0], dataHeaders); //Delete if it already has been added
                                        //Tools.insertNewHeaderRowAtBottom(elmt.getValues()[0].slice(), dataHeaders);

                                       newRows.push(elmt.getValues()[i].slice());
                                        //headerRows = Tools.deleteHeaderRow(elmt.getValues()[i][0], headerRows);
                                        Tools.insertNewHeaderRowAtBottom(elmt.getValues()[i], headerRows);
                                     //   console.log("new header rows: " + headerRows);
                                    }
                                }


                               // console.log("new rows: " + newRows);
                               Tools.updateDataHeader(dataHeaders, newRows);
                             //   console.log("Parent values: " + elmt.getValues());
                             //   console.log("new dataHeaders: " + Tools.arrayToString(dataHeaders));
                            }
                        } else if (elmt.getType() === 1) {//If Parent is a decision
                            headerRows = Tools.addNewHeaderRow(elmt.getMainValues(), headerRows);
                        }
                        console.log("parent values: " + Tools.arrayToString(elmt.getValues()));
                    })
                    newValues = Tools.convertToArray(newValues);
                   // console.log("size: " + math.size(newValues));
                    //console.log(Tools.arrayToString(newValues));
                    if (math.size(newValues).length === 2 && math.size(newValues)[0] === 1) {//Its a one dimensional array inside another array
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

                    } else {
                        for (var i = 0; i < newValues.length; i++) {
                            //console.log("unshifting " + data[i + Tools.numOfHeaderRows(element.getData())][0])
                            newValues[i].unshift(data[i + Tools.numOfHeaderRows(element.getData())][0]);
                        }
                    }
                   // console.log("new values: \n" + Tools.arrayToString(newValues));
                    //console.log("size: " + math.size(newValues));
                    if (headerRows.length > 0) {//If there have been added header rows
                        if (!($.isArray((headerRows)[0]))) {
                            headerRows = [headerRows];
                        }
                        if (newValues[newValues.length - 1][1] === undefined) {
                           console.log("pushing " + newValues + " into " + headerRows);
                            headerRows.push(newValues);
                        }
                        else {
                            for (var i = 0; i < newValues.length; i++) {
                                console.log("pushing " + newValues[i] + " into " + headerRows);
                                headerRows.push(newValues[i]);
                            }
                        }
                        newValues = headerRows;
                    }
                    console.log("new values: " + Tools.arrayToString(newValues))
                    p_element.setValues(newValues);
                } else {//If it is a decision node
                   // console.log("decisions node begin");
                    element.setValues(Tools.fillEmptySpaces(element.updateHeaderRows(element.copyDefArray())));
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
                            if (numOfHeaderRows !== 0) {
                                //Get the conditions for this value
                               // console.log("Trying to get column " + j);
                                //console.log(values);
                                var conditions = math.flatten(Tools.getColumn(values, j));
                                var range = math.range(0, numOfHeaderRows);// - 1);
                               // console.log("trying to get subset from " + conditions + " with range " + range);
                                //console.log(conditions);
                                //console.log(math.index(0, math.squeeze(range)));
                                conditions = Tools.makeSureItsAnArray(math.subset(conditions, math.index(math.squeeze(range))));
                                //console.log(conditions);
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
                            //console.log("i: " + i + "  j: " + j + "  Value: " + value);
                            values[i][j] = value;

                        }
                    }
                    //console.log("decisions end");
                    p_element.setValues(values);
                }

            }
            static isOneDimensional(p_array: any[][]): Boolean {
                //console.log(p_array.length);
                return (p_array.length === 1 || !($.isArray((p_array)[0])) || p_array[1] === undefined);
            }
            static arrayToString(p_array: any[][]): String {
                var newString: String = "[";
                if (Tools.isOneDimensional(p_array)) {//Its one dimensional
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
            static addNewHeaderRow(p_headerRow: any[], p_table: any[][]): any[][] {
                //console.log("Adding array: " + p_headerRow)
                var array = p_headerRow.slice();
                //Convert the array to only contain one of each element
                var newArray = [array[0]];
                for (var i = 1; i < array.length; i++) {
                    if (newArray.indexOf(array[i]) === -1) {
                        newArray.push(array[i]);
                    }
                }
                array = newArray;
               // console.log("to " + p_table);
                // //console.log("number of header rows: " + numOfHeaderRows);
                var newTable: any[][] = [];
                var numOfDiffValues: number = array.length - 1;
                // //console.log("numOfDiffValues " + numOfDiffValues)
                var newRow: any[];
                if (p_table[0] !== undefined) {
                    if (!($.isArray((p_table)[0]))) {
                    p_table = [p_table];
                }
                    var rowLength = p_table[0].length - 1;
                    //For each row
                    for (var i = 0; i < p_table.length; i++) {
                        //For each different value in new header row
                        for (var n = 0; n < numOfDiffValues - 1; n++) {
                            newRow = p_table[i];
                            
                        console.log(newRow);
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
              //  console.log("new header row: " + newRow);
                //Add the new row at the bottom of the table
                
               // newTable.splice(Tools.numOfHeaderRows(p_data) - 1, 0, newRow);
                newTable.splice(0, 0, newRow);
                //console.log("new table: " + newTable)
                return newTable;
            }
            static deleteHeaderRow(p_elmtID: String, p_table: any[][]): any[][]{
               // console.log("deleting " + p_elmtID + " from " + p_table);
                var rows: number;
                var columns: number;
                var rowToDelete: number;
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
                var tempTable: any[] = [rows];
                for (var j = 0; j < columns; j++) {
                    if (p_table[rowToDelete][i] === p_table[rowToDelete][columns - 1]) { //This is a column to keep
                        for (var i = 0; i < rows; i++) {
                            tempTable[i].push(p_table[i][j]);
                        }
                    }
                }
                return tempTable;
            }
            static getRowNumber(p_values: any[][], decisionElement: Element): number {
                console.log("looking for " + decisionElement.getID() + " in " + p_values);
                for (var i = 0; i < p_values.length; i++) {
                    if (p_values[i][0] === decisionElement.getID()) {
                        return i;
                    }
                }
            }
            static updateConcerningDecisions(element: Element) {
                console.log("updating concerning decisions " + element.getName());
                var rowsToDelete: number[] = [];
                console.log("all ancestors for " + element.getName() +": "  + element.getAllAncestors());
                element.getAllAncestors().forEach(function (elmt) {
                    if (elmt.getType() === 1 && elmt.getDecision() !== undefined) {//If Parent is decision and choice is made
                        console.log("checking: " + elmt.getName());
                        var values: any[][] = element.getValues();
                        var decision: String = elmt.getData()[elmt.getDecision()][0];
                        console.log("choice is made: " + decision + " in elemnent " + elmt.getName());
                        console.log("values: " + values + " size: " + math.size(values));
                        var newValues: any[][] = [];
                        var rowNumber: number = Tools.getRowNumber(element.getValues(), elmt);
                        console.log("rownumber: " + rowNumber);
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
                //element.setValues(Tools.deleteRows(element.getValues(), rowsToDelete));
            }
            static deleteRows(array: any[][], rows: number[]): any[][] {
              //  console.log("deleting " + rows + " from " + array);
                var newArray: any[][] = [];
                for (var i = 0; i < array.length; i++) {
                    if (rows.indexOf(i) === -1) {
                       // console.log("pushing row " + i+ " " + rows.indexOf(i));
                        newArray.push(array[i]);
                    }
                }
               return newArray;
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
           
            static fillDataTable(p_dataTable: any[][]) {
               // console.log("filling table: " + p_dataTable);
                var headerRows: any[][] = [];
                var data: any[][] = [];
                var numOfHeaderRows: number = Tools.numOfHeaderRows(p_dataTable);
                for (var i = 0; i < numOfHeaderRows; i++) {
                    var newRow: any[] = [];
                    for (var j = 0; j < p_dataTable[0].length; j++) {
                        newRow.push(p_dataTable[i][j]);
                    }
                    headerRows.push(newRow);
                }
              //  console.log("header rows: " + headerRows);
                for (var i = numOfHeaderRows; i < p_dataTable.length; i++) {
                    var newRow: any[] = [];
                    for (var j = 1; j < p_dataTable[0].length; j++) {
                        var value: any = p_dataTable[i][j];
                        if (!isNaN(value)) {
                            newRow.push(value);
                        }
                    }
                    data.push(newRow);
                }
          //      console.log("before concat: " + data);
                data = math.concat(data, data);
            //    console.log("after concat: " + data);
                var newDataTable: any[][] = headerRows;
                for (var i = 0; i < data.length; i++) {
                    data[i].unshift(p_dataTable[numOfHeaderRows + i][0]);
                    newDataTable.push(data[i]);
                }
               // console.log("new table after filling: " + newDataTable);
                return newDataTable;
            }
                 
        }
    }
}