var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var Model = (function () {
            function Model(p_bbnMode) {
                this.m_numOfIteraions = 10000;
                this.m_bbnMode = false;
                this.m_modelIdent = "temp";
                this.m_elmtCounter = 0;
                this.m_ConnCounter = 0;
                this.m_elementArr = [];
                this.m_connectionArr = [];
                this.m_modelName = "untitled";
                this.m_modelPath = "./";
                this.m_modelChanged = true;
                this.m_dataMatrix = [];
                this.m_autoUpdate = false; //auto update is off by default
                this.m_bbnMode = p_bbnMode;
                //this.m_bbnMode = true;
                this.createNewElement = this.createNewElement.bind(this);
                this.deleteElement = this.deleteElement.bind(this);
                console.log("model loaded");
                ////console.log(this);
                this.m_modelName = "untitled";
            }
            ;
            Model.prototype.getmumOfIteraions = function () {
                return this.m_numOfIteraions;
            };
            Model.prototype.saveModel = function () {
                var dataStream = "";
                if (this.m_bbnMode) {
                    dataStream = this.getBBNDataStream();
                }
                else {
                    dataStream = this.getMCADataStream();
                }
                return dataStream;
            };
            Model.prototype.getBBNDataStream = function () {
                var dataStream = '<?xml version="1.0" encoding="ISO-8859-1"?>\n<smile version="1.0" id="' + this.m_modelIdent + '" numsamples="1000">\n<nodes>\n';
                this.m_elementArr.forEach(function (elmt) {
                    switch (elmt.getType()) {
                        case 0:
                            dataStream += '<cpt id="' + elmt.getID() + '">\n';
                            for (var i = elmt.getParentElements().length; i < elmt.getData().length; i++) {
                                dataStream += '<state id="' + elmt.getData(i, 0) + '" />\n';
                            }
                            if (elmt.getParentElements().length > 0) {
                                dataStream += '<parents>';
                                elmt.getParentElements().forEach(function (parElmt) {
                                    dataStream += parElmt.getID() + ' ';
                                });
                                dataStream = dataStream.slice(0, dataStream.length - 1) + '</parents>\n';
                            }
                            console.log(elmt.getData());
                            dataStream += '<probabilities>';
                            for (var i = 1; i < elmt.getData(1).length; i++) {
                                for (var j = elmt.getParentElements().length; j < elmt.getData().length; j++)
                                    dataStream += elmt.getData(j, i) + ' ';
                            }
                            dataStream = dataStream.slice(0, dataStream.length - 1) + '</probabilities>\n';
                            dataStream += '</cpt>\n';
                            break;
                        case 1:
                            dataStream += '<decision id="' + elmt.getID() + '">\n';
                            for (var i = 0; i < elmt.getData().length; i++) {
                                dataStream += '<state id="' + elmt.getData(i) + '" />\n';
                            }
                            if (elmt.getParentElements().length > 0) {
                                dataStream += '<parents>';
                                elmt.getParentElements().forEach(function (parElmt) {
                                    dataStream += parElmt.getID() + ' ';
                                });
                                dataStream = dataStream.slice(0, dataStream.length - 1) + '</parents>\n';
                            }
                            dataStream += '</decision>\n';
                            break;
                        case 2:
                            dataStream += '<utility id="' + elmt.getID() + '">\n';
                            if (elmt.getParentElements().length > 0) {
                                dataStream += '<parents>';
                                elmt.getParentElements().forEach(function (parElmt) {
                                    dataStream = dataStream.substring(0, dataStream.lastIndexOf(">") + 1) + parElmt.getID() + ' ' + dataStream.substring(dataStream.lastIndexOf(">") + 1);
                                });
                                dataStream = dataStream.slice(0, dataStream.length - 1) + '</parents>\n';
                            }
                            dataStream += '<utilities>';
                            for (var i = 1; i < elmt.getData(0).length; i++) {
                                dataStream += elmt.getData(elmt.getData().length - 1, i) + ' ';
                            }
                            dataStream = dataStream.slice(0, dataStream.length - 1) + '</utilities>\n';
                            dataStream += '</utility>\n';
                            break;
                        case 3:
                            dataStream += '<mau id="' + elmt.getID() + '">\n';
                            if (elmt.getParentElements().length > 0) {
                                dataStream += '<parents>';
                                elmt.getParentElements().forEach(function (parElmt) {
                                    dataStream = dataStream.substring(0, dataStream.lastIndexOf(">") + 1) + parElmt.getID() + ' ' + dataStream.substring(dataStream.lastIndexOf(">") + 1);
                                });
                                dataStream = dataStream.slice(0, dataStream.length - 1) + '</parents>\n';
                            }
                            dataStream += '<weights>';
                            for (var i = 0; i < elmt.getData().length; i++) {
                                dataStream += elmt.getData(i, 1) + ' ';
                            }
                            dataStream = dataStream.slice(0, dataStream.length - 1) + '</weights>\n';
                            dataStream += '</mau>\n';
                            break;
                    }
                });
                dataStream += '</nodes>\n<extensions>\n<genie version="1.0" name="' + this.getName() + '" faultnameformat="nodestate"><comment></comment>\n';
                this.m_elementArr.forEach(function (elmt) {
                    dataStream += '<node id="' + elmt.getID() + '">\n' +
                        '<name>' + elmt.getName() + '</name>\n' +
                        '<interior color="aaaaaa" />\n' +
                        '<outline color="000080" />\n' +
                        '<font color="000000" name="Arial" size="8" />\n' +
                        '<position>' + (elmt.m_easelElmt.x - 75) + ' ' + (elmt.m_easelElmt.y - 15) + ' ' + (elmt.m_easelElmt.x + 75) + ' ' + (elmt.m_easelElmt.y + 15) + '</position>\n</node>\n';
                });
                dataStream += '</genie>\n</extensions>\n</smile>\n';
                return dataStream;
            };
            Model.prototype.getMCADataStream = function () {
                return JSON.stringify(this);
            };
            Model.prototype.closeDown = function () {
                $(".removebleDialog").remove(); //Removes all created dialogs
            };
            Model.prototype.update = function () {
                var m = this;
                console.log("updating model");
                this.m_elementArr.forEach(function (p_elmt) {
                    console.log(p_elmt.getID() + " has been updated: " + p_elmt.isUpdated());
                    if (!p_elmt.isUpdated()) {
                        p_elmt.update();
                    }
                });
                //console.log("done updating first round");
                // if (this.getElmtsWithEvidence().length > 0) {
                this.getElementArr().forEach(function (e) {
                    if (e.getType() !== 0) {
                        e.setUpdated(false);
                    }
                });
                DST.Tools.calcValuesLikelihoodSampling(this, this.m_numOfIteraions);
                // }
                console.log("done updating with evidence");
            };
            Model.prototype.initialize = function () {
                this.m_elementArr.forEach(function (e) {
                    e.update();
                });
            };
            Model.prototype.getIdent = function () {
                return this.m_modelIdent;
            };
            Model.prototype.setAutoUpdate = function (p_bool) {
                this.m_autoUpdate = p_bool;
            };
            Model.prototype.getAutoUpdate = function () {
                return this.m_autoUpdate;
            };
            Model.prototype.setMainObj = function (p_goalElmt) {
                this.m_mainObjective = p_goalElmt;
            };
            Model.prototype.getMainObj = function () {
                return this.m_mainObjective;
            };
            Model.prototype.getDataMatrix = function (p_index, p_secondary) {
                if (p_index != undefined) {
                    if (p_secondary != undefined) {
                        return this.m_dataMatrix[p_index][p_secondary];
                    }
                    else {
                        return this.m_dataMatrix[p_index];
                    }
                }
                else {
                    return this.m_dataMatrix;
                }
            };
            Model.prototype.setDataMatrix = function (p_matrix) {
                this.m_dataMatrix = p_matrix;
            };
            Model.prototype.getFinalScore = function () {
                var tempMatrix = JSON.parse(JSON.stringify(this.m_dataMatrix));
                var weightsArr = DST.Tools.getWeights(this.m_mainObjective, this);
                ////console.log(tempMatrix);
                //console.log("DataMatrix: " + this.m_dataMatrix);
                //console.log("numWeights: " + weightsArr.length);
                for (var i = 0; i < weightsArr.length; i++) {
                    //console.log("Elemet** " + this.getElement(this.m_dataMatrix[0][i + 1]).getData());
                    var elmtData = this.getElement(this.m_dataMatrix[0][i + 1]).getData();
                    //set minimum and maximum values
                    var maxVal = elmtData[5];
                    var minVal = elmtData[4];
                    //check if data is within min-max values, and expand as necessary
                    for (var j = 1; j < tempMatrix.length - 1; j++) {
                        if (tempMatrix[j][i + 1] > maxVal) {
                            maxVal = tempMatrix[j][i + 1];
                        }
                    }
                    for (var j = 1; j < tempMatrix.length - 1; j++) {
                        if (tempMatrix[j][i + 1] < minVal) {
                            minVal = tempMatrix[j][i + 1];
                        }
                    }
                    //var currentMax = 0;
                    //for (var j = 1; j < tempMatrix.length; j++) {
                    //    if (tempMatrix[j][i + 1] > currentMax) {
                    //        currentMax = tempMatrix[j][i + 1];
                    //    }
                    //}
                    for (var j = 1; j < tempMatrix.length - 1; j++) {
                        tempMatrix[j][i + 1] = Mareframe.DST.Tools.getValueFn(Math.abs(elmtData[3] - ((tempMatrix[j][i + 1] - minVal) / (maxVal - minVal))), Math.abs(elmtData[3] - ((elmtData[1] / 100))), 1 - (elmtData[2] / 100));
                        ////console.log(getValueFn(tempMatrix[j][i + 1] / currentMax, elmtData[1]/100, elmtData[2]/100));
                        ////console.log(tempMatrix[j][i + 1] / currentMax);
                        tempMatrix[j][i + 1] *= weightsArr[i][1];
                        tempMatrix[j][i + 1] = (Math.round(1000 * tempMatrix[j][i + 1])) / 1000;
                    }
                }
                for (var i = 1; i < tempMatrix.length - 1; i++) {
                    //console.log("tmpMat" + tempMatrix);
                    tempMatrix[i][0] = this.getElement(tempMatrix[i][0]).getName();
                }
                //console.log("FinalScore: " + tempMatrix);
                return tempMatrix;
            };
            Model.prototype.getWeightedData = function (p_elmt, p_addHeader) {
                var tempMatrix = [];
                if (p_addHeader) {
                    tempMatrix.push(['string', 'number']);
                }
                console.log("DataMatrix: " + this.m_dataMatrix);
                switch (p_elmt.getType()) {
                    case 2:
                        console.log("type 2, scenario");
                        for (var i = 1; i < this.m_dataMatrix[0].length; i++) {
                            //console.log("
                            tempMatrix.push([this.m_dataMatrix[0][i], this.m_dataMatrix[p_elmt.getData(0)][i]]);
                            console.log("******TempMatrix: " + i + "   " + tempMatrix);
                        }
                        break;
                    case 0:
                        console.log("Type 0, attibute");
                        //set minimum and maximum values
                        var maxVal = p_elmt.getData(5);
                        //var maxVal = 100000;
                        var minVal = p_elmt.getData(4);
                        //var minVal = -100000;
                        //check if data is within min-max values, and expand as necessary
                        for (var i = 1; i < this.m_dataMatrix.length - 1; i++) {
                            if (this.m_dataMatrix[i][p_elmt.getData(0)] > maxVal) {
                                maxVal = this.m_dataMatrix[i][p_elmt.getData(0)];
                            }
                        }
                        for (var i = 1; i < this.m_dataMatrix.length - 1; i++) {
                            if (this.m_dataMatrix[i][p_elmt.getData(0)] < minVal) {
                                minVal = this.m_dataMatrix[i][p_elmt.getData(0)];
                            }
                        }
                        //calculate weights according to valueFn
                        for (var i = 1; i < this.m_dataMatrix.length - 1; i++) {
                            var toAdd = [this.getElement(this.m_dataMatrix[i][0]).getName(), this.m_dataMatrix[i][p_elmt.getData(0)]];
                            if (!p_addHeader) {
                                //console.log("elmtData: " + p_elmt.getData());
                                //console.log("elmtData(1): " + p_elmt.getData(1));
                                //console.log("elmtData(2): " + p_elmt.getData(2));
                                //console.log("elmtData(3): " + p_elmt.getData(3));
                                //console.log("elmtData(0): " + p_elmt.getData(0));
                                //console.log("minvalue: " + minVal);
                                //console.log("maxValue: " + maxVal);
                                toAdd.push(Mareframe.DST.Tools.getValueFn(Math.abs(p_elmt.getData(3) - (this.m_dataMatrix[i][p_elmt.getData(0)] - minVal) / (maxVal - minVal)), Math.abs(p_elmt.getData(3) - p_elmt.getData(1) / 100), 1 - p_elmt.getData(2) / 100));
                            }
                            ////console.log(elmt.getData()[1]);
                            tempMatrix.push(toAdd);
                        }
                        break;
                    case 1:
                        console.log("Type 1, sub-objective");
                        var total = 0.0;
                        p_elmt.getData(1).forEach(function (val) { total += val; });
                        ////console.log(total + " : " + elmt.getName());
                        for (var i = 0; i < p_elmt.getData(0).length; i++) {
                            ////console.log(elmt.getData());
                            var tempEl = this.getConnection(p_elmt.getData(0, i)).getInputElement();
                            var tempArr = this.getWeightedData(tempEl, false);
                            ////console.log(tempArr);
                            var result = 0;
                            for (var j = 0; j < tempArr.length; j++) {
                                result += tempArr[j][1];
                            }
                            ////console.log(result + " " + elmt.getName()+"; "+tempArr+" "+tempEl.getName());
                            tempMatrix.push([tempEl.getName(), result * (p_elmt.getData(1, i) / total)]);
                        }
                        break;
                }
                console.log("WeigthedData: " + tempMatrix);
                return tempMatrix;
            };
            Model.prototype.createNewElement = function (p_type, p_notVisual) {
                console.log("number of elements: " + this.m_elmtCounter);
                //This loop makes sure that no two elements have the same id
                do {
                    var name = "elmt" + this.m_elmtCounter;
                    this.m_elmtCounter++;
                } while (this.getElement(name) != undefined);
                var e = new DST.Element(name, this, p_type, p_notVisual);
                this.m_elementArr.push(e);
                switch (p_type) {
                    case 0:
                        e.setData([["state0", 0.5], ["state1", 0.5]]);
                        e.setValues(e.getData());
                        e.setName("Chance" + this.m_elmtCounter);
                        break;
                    case 1:
                        e.setData([["choice0"], ["choice1"]]);
                        e.setValues([["choice0", 0], ["choice1", 0]]);
                        e.setName("Decision" + this.m_elmtCounter);
                        break;
                    case 2:
                        e.setData([["Value", 0]]);
                        e.setValues([["Value", 0]]);
                        e.setName("Utility" + this.m_elmtCounter);
                        break;
                    case 3:
                        e.setData([]);
                        e.setValues([]);
                    default:
                        break;
                }
                return e;
            };
            Model.prototype.getElement = function (p_elmtStringId) {
                if (p_elmtStringId === undefined) {
                    return undefined;
                }
                return this.m_elementArr[this.getObjectIndex(p_elmtStringId)];
            };
            Model.prototype.getObjectIndex = function (p_objectStringId) {
                // console.log(" get object "  + p_objectStringId + " in list: "+ this.m_elementArr);
                var key = 0;
                if (p_objectStringId.substr(0, 4) === "elmt") {
                    this.m_elementArr.every(function (p_elmt) {
                        //console.log("comparing with : " + p_elmt.getID());
                        if (p_elmt.getID() === p_objectStringId)
                            return false;
                        else {
                            key = key + 1;
                            return true;
                        }
                    });
                }
                else if (p_objectStringId.substr(0, 4) === "conn") {
                    this.m_connectionArr.every(function (p_conn) {
                        if (p_conn.getID() === p_objectStringId)
                            return false;
                        else {
                            key = key + 1;
                            return true;
                        }
                    });
                }
                else {
                    console.log(p_objectStringId + " not found");
                    throw DOMException.NOT_FOUND_ERR;
                }
                //console.log("returned key: " + key);
                return key;
            };
            Model.prototype.getEaselElementsInBox = function (p_x1, p_y1, p_x2, p_y2) {
                var selection = [];
                this.m_elementArr.forEach(function (elmt) {
                    if (((elmt.m_easelElmt.x > p_x1 && elmt.m_easelElmt.x < p_x2) || (elmt.m_easelElmt.x < p_x1 && elmt.m_easelElmt.x > p_x2)) && ((elmt.m_easelElmt.y > p_y1 && elmt.m_easelElmt.y < p_y2) || (elmt.m_easelElmt.y < p_y1 && elmt.m_easelElmt.y > p_y2))) {
                        selection.push(elmt.m_easelElmt);
                    }
                });
                this.getConnectionArr().forEach(function (c) {
                    if (selection.indexOf(c.getInputElement().m_easelElmt) !== -1 && selection.indexOf(c.getOutputElement().m_easelElmt) !== -1) {
                        selection.push(c.m_easelElmt);
                    }
                });
                return selection;
            };
            Model.prototype.getConnectionArr = function () {
                return this.m_connectionArr;
            };
            Model.prototype.getConnection = function (p_connectionStringId) {
                return this.m_connectionArr[this.getObjectIndex(p_connectionStringId)];
            };
            Model.prototype.getElementArr = function () {
                return this.m_elementArr;
            };
            Model.prototype.deleteElement = function (p_elementStringId) {
                var key = 0;
                this.m_elementArr.every(function (p_elmt) {
                    if (p_elmt.getID() === p_elementStringId) {
                        if (p_elmt.getType() === 1) {
                            p_elmt.getAllDescendants().forEach(function (e) {
                                e.setUpdated(false);
                            });
                        }
                        else if (p_elmt.getType() === 0) {
                            var isInformative = false;
                            p_elmt.getChildrenElements().forEach(function (e) {
                                if (e.getType() === 1) {
                                    isInformative = true;
                                }
                            });
                            if (isInformative) {
                                //If this is an informative chance node all ancestors and descendant need to be updated
                                p_elmt.getAllAncestors().forEach(function (e) {
                                    e.setUpdated(false);
                                });
                                p_elmt.getAllDescendants().forEach(function (e) {
                                    e.setUpdated(false);
                                });
                            }
                        }
                        return false;
                    }
                    else {
                        key++;
                        return true;
                    }
                });
                if (key >= this.m_elementArr.length)
                    return false;
                else {
                    this.m_elementArr.splice(key, 1);
                    return true;
                }
            };
            Model.prototype.deleteConnection = function (p_connID) {
                var key = 0;
                this.m_connectionArr.every(function (p_conn) {
                    if (p_conn.getID() === p_connID)
                        return false;
                    else {
                        key++;
                        return true;
                    }
                });
                if (key >= this.m_connectionArr.length)
                    return false;
                else {
                    var inputElmt = this.m_connectionArr[key].getInputElement();
                    var outputElmt = this.m_connectionArr[key].getOutputElement();
                    // console.log("Deleting connection: " + p_connID + " from " + inputElmt.getName() + " to " + outputElmt.getName());
                    var states = this.m_connectionArr[key].getInputElement().getData().length;
                    var data = this.m_connectionArr[key].getOutputElement().getData();
                    var dataIn = this.m_connectionArr[key].getInputElement().getData();
                    var removeHeader = this.m_connectionArr[key].getInputElement().getID();
                    //console.log("Remove header: " + removeHeader);
                    //console.log("Original Data Out: " + data);
                    //console.log("Original Data In: " + dataIn);
                    var dims = [0, 0, 0];
                    data = DST.Tools.removeHeaderRow(outputElmt, removeHeader, data);
                    //var splicePos = 1 + Math.floor((data[data.length - 1].length / states));
                    //console.log("states: " + states);
                    //console.log("splicepos: " + splicePos);
                    //for (var row = 0; row < data.length;row++) {
                    //    if(data[row].length-1 > splicePos)
                    //        data[row].splice(splicePos);
                    //}
                    //console.log("New data: " + data);
                    //console.log("ConnectionArr: " + this.m_connectionArr[key]);
                    this.m_connectionArr[key].getOutputElement().setData(data);
                    //console.log("data : " + outputElmt.getData());
                    this.m_connectionArr.splice(key, 1);
                    //console.log(this.m_elementArr);
                    if (inputElmt.getType() === 1) {
                        outputElmt.getAllDescendants().forEach(function (e) {
                            //console.log("descendant: " + e.getName());
                            e.setUpdated(false);
                        });
                    }
                    if (inputElmt.getType() === 0 && outputElmt.getType() === 1) {
                        //Then all ancestors need to be updated
                        var temp = inputElmt.getAllAncestors();
                        inputElmt.getAllAncestors().forEach(function (e) {
                            e.setUpdated(false);
                        });
                        inputElmt.getAllDescendants().forEach(function (e) {
                            //console.log("descendant: " + e.getName());
                            e.setUpdated(false);
                        });
                    }
                    //Delete connection from the elements
                    inputElmt.deleteConnection(p_connID);
                    outputElmt.deleteConnection(p_connID);
                    return true;
                }
            };
            Model.prototype.setName = function (name) {
                this.m_modelName = name;
            };
            Model.prototype.getName = function () {
                return this.m_modelName;
            };
            Model.prototype.setNumOfIterations = function (n) {
                this.m_numOfIteraions = n;
            };
            Model.prototype.addConnection = function (p_connection) {
                var validConn = true;
                this.m_connectionArr.forEach(function (conn) {
                    if (conn === p_connection) {
                        validConn = false;
                    }
                    else if ((p_connection.getOutputElement().getID() === conn.getOutputElement().getID() &&
                        p_connection.getInputElement().getID() === conn.getInputElement().getID()) ||
                        (p_connection.getOutputElement().getID() === conn.getInputElement().getID() &&
                            p_connection.getInputElement().getID() === conn.getOutputElement().getID())) {
                        validConn = false;
                    }
                });
                if (validConn) {
                    this.m_connectionArr.push(p_connection);
                    p_connection.getInputElement().addConnection(p_connection);
                    p_connection.getOutputElement().addConnection(p_connection);
                    return true;
                }
                else {
                    return false;
                }
            };
            Model.prototype.toJSON = function () {
                var connections = []; //This is created to prevent circular references
                this.m_connectionArr.forEach(function (c) {
                    connections.push(c.toJSON());
                });
                var elmts = []; //This is created to prevent circular references
                this.m_elementArr.forEach(function (e) {
                    elmts.push(e.toJSON());
                });
                return { elements: elmts, connections: connections, mdlName: this.m_modelName, mainObj: this.m_mainObjective, dataMat: this.m_dataMatrix, mdlIdent: this.m_modelIdent, mdlIterations: this.m_numOfIteraions };
            };
            Model.prototype.fromJSON = function (p_jsonObject, p_showVisual) {
                // console.log("from json: p_jsonObject = " + p_jsonObject);
                if (p_showVisual) {
                    $("#modelHeader").html(p_jsonObject.mdlName);
                    var header = $("#model_header").html();
                    //Only append if model name has not been added
                    if (header.indexOf(">", header.length - 1) !== -1) {
                        $("#model_header").append(p_jsonObject.mdlName);
                    }
                }
                this.m_modelName = p_jsonObject.mdlName;
                this.m_modelIdent = p_jsonObject.mdlIdent;
                if (p_jsonObject.mdlIterations) {
                    //First time a model is loaded num of iterations is undefined
                    this.m_numOfIteraions = p_jsonObject.mdlIterations;
                }
                this.m_dataMatrix = p_jsonObject.dataMat;
                this.m_elementArr = [];
                this.m_connectionArr = [];
                this.m_elmtCounter = 0;
                var maxX = 0;
                var maxY = 0;
                for (var i = 0; i < p_jsonObject.elements.length; i++) {
                    var JsonElmt = p_jsonObject.elements[i];
                    var elmt = this.createNewElement(undefined, !p_showVisual);
                    //if (JsonElmt.posX > maxX)
                    //    maxX = JsonElmt.posX;
                    //if (JsonElmt.posY > maxY)
                    //    maxY = JsonElmt.posY;
                    elmt.fromJSON(JsonElmt);
                }
                for (var i = 0; i < p_jsonObject.connections.length; i++) {
                    var conn = p_jsonObject.connections[i];
                    var inpt = this.getElement(conn.connInput);
                    var c = this.createNewConnection(inpt, this.getElement(conn.connOutput), !p_showVisual);
                    //this.m_counter++;
                    c.fromJSON(conn);
                    this.addConnection(c);
                }
                if (!this.m_bbnMode)
                    this.m_mainObjective = this.getElement(p_jsonObject.mainObj);
                for (var i = 0; i < p_jsonObject.elements.length; i++) {
                    if (this.m_bbnMode)
                        //console.log("from json: " + elmt.getName());
                        //console.log(this.m_elementArr);
                        //elmt.update();
                        this.m_elementArr[i].updateData();
                }
                //h.gui.setSize(maxX + 80, maxY + 20);
                //h.gui.updateTable(this.dataMatrix);
                //console.log("model.fromJSON()");
                //console.log(this);
                console.log("finnished loading from json");
            };
            Model.prototype.createNewConnection = function (p_inputElmt, p_outputElmt, p_notVisual) {
                do {
                    var id = "conn" + this.m_ConnCounter;
                    this.m_ConnCounter++;
                } while (this.getConnection(id) != undefined);
                var c = new DST.Connection(p_inputElmt, p_outputElmt, id, this.m_bbnMode, p_notVisual);
                return c;
            };
            Model.prototype.setDecision = function (p_elmt, p_decisNumb) {
                if (p_elmt.getDecision() == p_decisNumb) {
                    //console.log("unsetting decision");
                    p_elmt.setDecision(undefined);
                }
                else {
                    p_elmt.setDecision(p_decisNumb);
                }
                this.getElementArr().forEach(function (e) {
                    e.setUpdated(false);
                }); /*
                This is commented out because createSubMatrix did not work properly when only updating some of the elements.
                This solution is not optimal, but it forces the program to update every element without looking at decisions first and then focusing on decision.
                The problem occured when first one decision was set and the model was updated and then another decision was set.
                elmt.getAllDescendants().forEach(function (e: Element) {
                    e.setUpdated(false);
                    console.log(e.getName() + " not updated");
                });*/
                //console.log(elmt.getName() + " wants to set decision number " + p_decisNumb);
            };
            Model.prototype.setEvidence = function (p_elmt, p_evidenceNumber) {
                console.log("setting evidence no. " + p_evidenceNumber + " previous evidence: " + p_elmt.getEvidence());
                if (p_elmt.getEvidence() == p_evidenceNumber) {
                    console.log("unsetting evidence");
                    p_elmt.setEvidence(undefined);
                }
                else {
                    p_elmt.setEvidence(p_evidenceNumber);
                }
                this.getElementArr().forEach(function (e) {
                    e.setUpdated(false);
                });
            };
            Model.prototype.getElmtsWithEvidence = function () {
                var elements = [];
                this.getElementArr().forEach(function (e) {
                    if (e.getType() === 0 && e.getEvidence() !== undefined) {
                        elements.push(e);
                    }
                });
                return elements;
            };
            return Model;
        }());
        DST.Model = Model;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Model.js.map