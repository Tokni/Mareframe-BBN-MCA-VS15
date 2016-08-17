module Mareframe {
    export module DST {
        export class Calculator {
            constructor() {
                declare function postMessage(message: any): void;
                var id = 0;
                self.setInterval(() => {
                    id++;
                    var message = {
                        'id': id,
                        'message': 'Message sent at '
                    };
                    postMessage(message);
                }, 10);
            }

    //        }
    //         calcValuesLikelihoodSampling(p_model: Model, p_numOfIterations: number) {
    //            //console.log("calculating values with evidence");
    //            var numberOfRuns = p_numOfIterations;
    //            var table = [];//contains all cases
    //            var evidenceElmts: Element[] = p_model.getElmtsWithEvidence();
                 
    //            var interval = setInterval(loop, 1);
    //            function loop() {
    //                if (numberOfRuns % n === 10) {
    //                    $("#progressBar").progressbar({
    //                        value: n
    //                    });

    //                }
    //            };
    //            for (var n = 0; n < numberOfRuns; n++) {

    //                var w = 1;
    //                var aCase = {};
    //                var sampledElmts: Element[] = [];
    //                p_model.getElementArr().forEach(function (e) {
    //                    if (e.getType() !== 2 && sampledElmts.indexOf(e) < 0) {//If this is a chance or decision and it has not already been sampled. Should it be !==2 ??
    //                        var result = this.sample(sampledElmts, evidenceElmts, aCase, w, e, p_model);
    //                        aCase = result[0];//Update the case 
    //                        w = result[1];//Update weight
    //                        sampledElmts = result[2]; //Update sampled elements
    //                        sampledElmts.push(e);
    //                    }
    //                });
    //                table.push([aCase, w]);
    //            }
    //            clearInterval(interval);
    //            var weightSum = 0;
    //            /*for (var i = 0; i < table.length; i++) {
    //                //console.log("weight: " + table[i][1]);
    //                weightSum += table[i][1];
    //            }*/
    //            //console.log("weightSum " + weightSum);

    //            p_model.getElementArr().forEach(function (e) {
    //                console.log("calculating values for " + e.getName());
    //                if (e.getType() === 0 || e.getType() === 2) {
    //                    var data = e.getData();
    //                    var values = [];
    //                    var oldValues = e.getValues(); //This is used to gain information about the headerrows in values
    //                    //Add the headerrows into values
    //                    for (var row = 0; row < Tools.numOfHeaderRows(oldValues, e); row++) {
    //                        values.push(oldValues[row]);
    //                    }
    //                    var dataLength = data.length;
    //                    var startCol = Tools.numOfHeaderRows(data, e);
    //                    if (e.getType() === 2) {
    //                        dataLength = data[0].length;
    //                        startCol = 1;
    //                    }
    //                    // console.log("startCol: " + startCol + " dataLenght: " + dataLength);
    //                    for (var i = startCol; i < dataLength; i++) {//For each of the different values
    //                        var valRow = [];
    //                        if (e.getType() === 0) {
    //                            valRow.push(data[i][0]);//push name of value
    //                        }
    //                        else {
    //                            valRow.push("dummyCol");
    //                        }
    //                        for (var col = 1; col < oldValues[0].length; col++) {//There must be the same amount of columns in new values as there were in old values
    //                            var value = 0;

    //                            //console.log("calculating for " + data[i][0] + " column: " + col + " in " + e.getName());
    //                            weightSum = 0; //Calculate a new weight sum for each column
    //                            for (var j = 0; j < table.length; j++) {//For each case
    //                                //console.log("case: " + JSON.stringify(table[j][0]));
    //                                var matchingCase = true;
    //                                var matchingValue = true;

    //                                if (e.getType() === 2) {
    //                                    for (var headerRow = 0; headerRow < Tools.numOfHeaderRows(data); headerRow++) {

    //                                        //console.log("column: " + i + ". Checking " + data[headerRow][0] + ", " + table[j][0][data[headerRow][0]] + " against " + data[headerRow][i]);
    //                                        if (table[j][0][data[headerRow][0]] !== data[headerRow][i]) {//If the value in headerrow is not the same as the one sampled
    //                                            matchingValue = false;
    //                                            //console.log("does not match");
    //                                        }
    //                                    }
    //                                }
    //                                else if (table[j][0][e.getID()] !== data[i][0]) {
    //                                    //console.log("value does not match");
    //                                    matchingValue = false;
    //                                }
    //                                for (var headerRow = 0; headerRow < Tools.numOfHeaderRows(oldValues, e); headerRow++) {//Checking if all elements in this column match
    //                                    var headerElmt = oldValues[headerRow][0];
    //                                    //console.log("checking if case includes " + p_model.getElement(headerElmt).getName() + " : " + oldValues[headerRow][col]); 
    //                                    if (table[j][0][headerElmt] !== oldValues[headerRow][col]) {
    //                                        //console.log("does not match");
    //                                        matchingCase = false;
    //                                    }
    //                                }
    //                                if (matchingCase) {//Only increment weigthsum if this case includes all choices in this column
    //                                    weightSum += table[j][1];
    //                                    //console.log("mathcing case. Updated weight sum to " + weightSum);
    //                                }
    //                                if (matchingValue && matchingCase) {
    //                                    //console.log("matching case and value");
    //                                    value += table[j][1];//Add the weight

    //                                    //console.log("value = " + value);

    //                                } else {
    //                                    //console.log("does not match");
    //                                }
    //                            }
    //                            value /= weightSum;
    //                            if (isNaN(value)) {
    //                                value = 0;
    //                            }
    //                            valRow.push(value);

    //                        }
    //                        values.push(valRow);
    //                    }
    //                    if (e.getType() === 2) {//If this is a utility node then values corresponds to a chance node where the states are the headers of the utility def
    //                        //console.log("values: ");
    //                        //console.log(values);
    //                        //console.log("multiplying "+ Tools.getMatrixWithoutHeader(data) + " and " + Tools.getMatrixWithoutHeader(values));
    //                        var utilityValue = math.multiply(this.getMatrixWithoutHeader(data), this.getMatrixWithoutHeader(values));
    //                        utilityValue = math.squeeze(utilityValue);
    //                        if (!isNaN(utilityValue)) {//check if utility value is just a number
    //                            utilityValue = [utilityValue];
    //                        }
    //                        //console.log("result: ");
    //                        //console.log(utilityValue);
    //                        //Add the headerrows into values
    //                        values = [];
    //                        for (var row = 0; row < Tools.numOfHeaderRows(oldValues, e); row++) {
    //                            values.push(oldValues[row]);
    //                        }
    //                        var valueRow = ["Value"];
    //                        for (var i = 0; i < utilityValue.length; i++) {
    //                            valueRow.push(utilityValue[i]);
    //                        }
    //                        //console.log("valueRow: " + valueRow);
    //                        //console.log(valueRow);
    //                        values[row] = valueRow;
    //                        //console.log(values);
    //                    }
    //                    //console.log("new values: ");
    //                    //console.log(values);
    //                    //console.log("setting values for " + e.getName()+ " + to: "+ values);
    //                    e.setValues(values);
    //                    e.setUpdated(true);
    //                }
    //            });
    //            //Update concerning decisions. It is important that this is done before decision values are calculated
    //            p_model.getElementArr().forEach(function (p_elmt: Element) {
    //                Tools.updateConcerningDecisions(p_elmt);
    //            });
    //            console.log("done updating concerning decisions");
    //            p_model.getElementArr().forEach(function (e) {//This recalculates all values of decision elements
    //                if (!e.isUpdated()) {
    //                    //console.log("calculating for " + e.getName());
    //                    Tools.calculateValues(p_model, e);
    //                    e.setUpdated(true);
    //                }
    //            });
    //        }


    //         sample(p_sampledElmts: Element[], p_evindeceElmts: Element[], p_case, p_weight: number, p_elmt: Element, p_model: Model) {
    //            var oldValues = p_elmt.getValues();
    //            //console.log("\nsampling " + p_elmt.getName());
    //            p_elmt.getParentElements().forEach(function (parent) {
    //                if (p_sampledElmts.indexOf(parent) < 0 && parent.getType() !== 2) {
    //                    var result = this.sample(p_sampledElmts, p_evindeceElmts, p_case, p_weight, parent, p_model);
    //                    p_case = result[0];
    //                    p_weight = result[1];
    //                    p_sampledElmts = result[2];
    //                    p_sampledElmts.push(parent);
    //                }
    //            });
    //            if (p_evindeceElmts.indexOf(p_elmt) > -1) {//If this is an evidence element
    //                //console.log("this is evindece elmt");
    //                p_weight = p_weight * this.getValueFromParentSamples(p_elmt, p_case, p_model);
    //                //console.log("weight updated to " + p_weight);
    //                var row = Number(p_elmt.getEvidence()) + Tools.numOfHeaderRows(p_elmt.getData());
    //                //console.log("row: " + row);
    //                p_case[p_elmt.getID()] = p_elmt.getData()[row][0];

    //            }
    //            else {
    //                //console.log("not evidence");
    //                var sample = this.getWeightedSample(p_elmt, p_case);
    //                //console.log("sampled: " + sample);
    //                p_case[p_elmt.getID()] = sample;
    //            }
    //            return [p_case, p_weight, p_sampledElmts];
    //        }

    //         getWeightedSample(p_elmt: Element, p_case) {
    //            var randomNumber = Math.random();
    //            var data = p_elmt.getData();
    //            var columnNumbers = this.getColumnFromCase(p_case, p_elmt);
    //            var sum = 0;
    //            // console.log("columnnumbers: " + columnNumbers);
    //            for (var i = Tools.numOfHeaderRows(data, p_elmt); i < data.length; i++) {
    //                var columnSum = 0;
    //                if (p_elmt.getType() === 0) {
    //                    for (var j = 0; j < columnNumbers.length; j++) {//Finding the avarage probability if there is a decision parent
    //                        //console.log("data[i][columnNumber[j]]: " + data[i][columnNumber[j]]);
    //                        columnSum += data[i][columnNumbers[j]];
    //                    }
    //                    columnSum /= j;

    //                }
    //                else if (p_elmt.getType() === 1) {//If this is a decision node
    //                    /*if (p_elmt.getDecision() !== undefined) {//If the choice is made
    //                        return data[Number(p_elmt.getDecision()) + Tools.numOfHeaderRows(data, p_elmt)][0];//Return the choice (Is  + Tools.numOfHeaderRows needed??)
    //                    }*/
    //                    columnSum = 1 / (data.length - Tools.numOfHeaderRows(data, p_elmt));// just sample randomly from the choices
    //                }
    //                sum += columnSum; // If there is just one matching column (no decision parent) this is the same as sum += data[i][columnNumber]
    //                //console.log("sum: " + sum);
    //                if (randomNumber <= sum) {//The retuned value is weighted by the probabilities
    //                    //console.log("sampled " + data[i][0]);
    //                    return data[i][0];
    //                }
    //            }
    //        }

    //         getValueFromParentSamples(p_elmt: Element, p_case, p_model: Model): number {
    //            var columns = this.getColumnFromCase(p_case, p_elmt);
    //            // console.log("col: " + columns);
    //            var averageLikelihood: number = 0;
    //            for (var i = 0; i < columns.length; i++) {
    //                var row: number = Number(p_elmt.getEvidence()) + Tools.numOfHeaderRows(p_elmt.getData());
    //                averageLikelihood += p_elmt.getData()[row][columns[i]];
    //            }
    //            averageLikelihood /= i;
    //            //console.log("averageLikelihood: " + averageLikelihood);
    //            //console.log("getting value row: " + p_elmt.getEvidence() + " col: " + column);
    //            return averageLikelihood;
    //        }

        
    //     getColumnFromCase(p_case, p_elmt: Element) {
    //        //console.log("Looking for columns in " + p_elmt.getName());
    //        var parents = p_elmt.getParentElements();
    //        var conditions = [];
    //        parents.forEach(function (e) {
    //            //console.log("pushing " + p_case[e.getID()] + " elmt " +e.getID() + " into conditions");
    //            conditions.push([e.getID(), p_case[e.getID()]]);

    //        });
    //        //Find the right column in data table
    //        var data = p_elmt.getData();
    //        var columnNumbers = [];
    //        for (var i = 1; i < data[0].length; i++) {//For each column in data
    //            //console.log("checking column " + i);
    //            var matchingColumn: boolean = true;
    //            for (var j = 0; j < Tools.numOfHeaderRows(data, p_elmt); j++) {//For each header row
    //                //console.log("checking row: " + data[j]);
    //                for (var n = 0; n < conditions.length; n++) {//For each condition
    //                    // console.log("elmt " + data[j][0] + " matches: " + conditions[n][0] + "?");
    //                    //console.log( data[j][0] === conditions[n][0]);
    //                    //console.log("data condition: " + data[j][i].trim() + " does not match: " + conditions[n][1].trim() + "?")
    //                    //console.log(data[j][i].trim() !== conditions[n][1].trim());
    //                    if (data[j][0] === conditions[n][0] && data[j][i].trim() !== conditions[n][1].trim()) {//If this is the right row, but the value does not match
    //                        //console.log("not correct column");
    //                        matchingColumn = false;// then it's not the right column
    //                        break;
    //                    }
    //                }
    //            }
    //            if (matchingColumn) {
    //                // console.log("correct column " + i);
    //                columnNumbers.push(i);

    //            }
    //        }
    //        //console.log("found columns: " + columnNumbers);
    //        return columnNumbers;
    //    }
    //}
}