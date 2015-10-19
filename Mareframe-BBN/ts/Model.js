var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var Model = (function () {
            function Model(p_bbnMode) {
                this.m_bbnMode = false;
                this.m_modelIdent = "temp";
                this.m_counter = 0;
                this.m_elementArr = [];
                this.m_connectionArr = [];
                this.m_modelName = "untitled";
                this.m_modelPath = "./";
                this.m_modelChanged = true;
                this.m_dataMatrix = [];
                this.m_autoUpdate = false;
                this.m_bbnMode = p_bbnMode;
                this.createNewElement = this.createNewElement.bind(this);
                this.deleteElement = this.deleteElement.bind(this);
                ////console.log("model loaded")
                ////console.log(this);
            }
            ;
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
                            for (var i = 1; i < elmt.getData(1).length; i++) {
                                dataStream += elmt.getData(elmt.getData().length - 1, i) + ' ';
                            }
                            dataStream = dataStream.slice(0, dataStream.length - 1) + '</utilities>\n';
                            dataStream += '</utility>\n';
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
            Model.prototype.update = function () {
                var m = this;
                console.log("updating model");
                this.m_elementArr.forEach(function (p_elmt) {
                    if (!p_elmt.isUpdated()) {
                        p_elmt.update();
                    }
                });
                this.m_elementArr.forEach(function (p_elmt) {
                    DST.Tools.updateConcerningDecisions(p_elmt);
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
                for (var i = 0; i < weightsArr.length; i++) {
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
                    tempMatrix[i][0] = this.getElement(tempMatrix[i][0]).getName();
                }
                return tempMatrix;
            };
            Model.prototype.getWeightedData = function (p_elmt, p_addHeader) {
                var tempMatrix = [];
                if (p_addHeader) {
                    tempMatrix.push(['string', 'number']);
                }
                switch (p_elmt.getType()) {
                    case 2:
                        for (var i = 1; i < this.m_dataMatrix[0].length; i++) {
                            tempMatrix.push([this.m_dataMatrix[0][i], this.m_dataMatrix[p_elmt.getData(0)][i]]);
                        }
                        break;
                    case 0:
                        //set minimum and maximum values
                        var maxVal = p_elmt.getData(5);
                        var minVal = p_elmt.getData(4);
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
                                toAdd.push(Mareframe.DST.Tools.getValueFn(Math.abs(p_elmt.getData(3) - ((this.m_dataMatrix[i][p_elmt.getData(0)] - minVal) / (maxVal - minVal))), Math.abs(p_elmt.getData(3) - ((p_elmt.getData(1) / 100))), 1 - (p_elmt.getData(2) / 100)));
                            }
                            ////console.log(elmt.getData()[1]);
                            tempMatrix.push(toAdd);
                        }
                        break;
                    case 1:
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
                return tempMatrix;
            };
            Model.prototype.createNewElement = function (p_type) {
                ////console.log(this.m_counter);
                var e = new DST.Element("elmt" + this.m_counter, this, p_type);
                this.m_counter++;
                this.m_elementArr.push(e);
                switch (p_type) {
                    case 0:
                        e.setData([["state0", 0.5], ["state1", 0.5]]);
                        break;
                    case 1:
                        e.setData([["choice0"], ["choice1"]]);
                        break;
                    case 2:
                        e.setData(["Value", 0]);
                    default:
                        break;
                }
                return e;
            };
            Model.prototype.getElement = function (p_elmtStringId) {
                return this.m_elementArr[this.getObjectIndex(p_elmtStringId)];
            };
            Model.prototype.getObjectIndex = function (p_objectStringId) {
                console.log(" get object " + p_objectStringId);
                var key = 0;
                if (p_objectStringId.substr(0, 4) === "elmt") {
                    this.m_elementArr.every(function (p_elmt) {
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
                return key;
            };
            Model.prototype.getEaselElementsInBox = function (p_x1, p_y1, p_x2, p_y2) {
                var selection = [];
                this.m_elementArr.forEach(function (elmt) {
                    if (((elmt.m_easelElmt.x > p_x1 && elmt.m_easelElmt.x < p_x2) || (elmt.m_easelElmt.x < p_x1 && elmt.m_easelElmt.x > p_x2)) && ((elmt.m_easelElmt.y > p_y1 && elmt.m_easelElmt.y < p_y2) || (elmt.m_easelElmt.y < p_y1 && elmt.m_easelElmt.y > p_y2))) {
                        selection.push(elmt.m_easelElmt);
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
                    if (p_elmt.getID() === p_elementStringId)
                        return false;
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
                    var states = this.m_connectionArr[key].getInputElement().getData().length;
                    var data = this.m_connectionArr[key].getOutputElement().getData();
                    var splicePos = 1 + Math.floor((data[data.length - 1].length / states));
                    //console.log(states);
                    //console.log(splicePos);
                    for (var row = 0; row < data.length; row++) {
                        if (data[row].length - 1 > splicePos)
                            data[row].splice(splicePos);
                    }
                    //console.log(data);
                    //console.log(this.m_connectionArr[key]);
                    this.m_connectionArr[key].getOutputElement().setData(data);
                    this.m_connectionArr.splice(key, 1);
                    //console.log(this.m_elementArr);
                    return true;
                }
            };
            Model.prototype.setName = function (name) {
                this.m_modelName = name;
            };
            Model.prototype.getName = function () {
                return this.m_modelName;
            };
            Model.prototype.addConnection = function (p_connection) {
                var validConn = true;
                this.m_connectionArr.forEach(function (conn) {
                    if (conn === p_connection) {
                        validConn = false;
                    }
                    else if ((p_connection.getOutputElement().getID() === conn.getOutputElement().getID() && p_connection.getInputElement().getID() === conn.getInputElement().getID()) || (p_connection.getOutputElement().getID() === conn.getInputElement().getID() && p_connection.getInputElement().getID() === conn.getOutputElement().getID())) {
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
                return { elements: this.m_elementArr, connections: this.m_connectionArr, mdlName: this.m_modelName, mainObj: this.m_mainObjective, dataMat: this.m_dataMatrix, mdlIdent: this.m_modelIdent };
            };
            Model.prototype.fromJSON = function (p_jsonObject) {
                $("#modelHeader").html(p_jsonObject.mdlName);
                var header = $("#model_header").html();
                //Only append if model name has not been added
                if (header.indexOf(">", header.length - 1) !== -1) {
                    $("#model_header").append(p_jsonObject.mdlName);
                }
                this.m_modelName = p_jsonObject.mdlName;
                this.m_modelIdent = p_jsonObject.mdlIdent;
                this.m_dataMatrix = p_jsonObject.dataMat;
                this.m_elementArr = [];
                this.m_connectionArr = [];
                this.m_counter = 0;
                var maxX = 0;
                var maxY = 0;
                for (var i = 0; i < p_jsonObject.elements.length; i++) {
                    var JsonElmt = p_jsonObject.elements[i];
                    var elmt = this.createNewElement(undefined);
                    //if (JsonElmt.posX > maxX)
                    //    maxX = JsonElmt.posX;
                    //if (JsonElmt.posY > maxY)
                    //    maxY = JsonElmt.posY;
                    elmt.fromJSON(JsonElmt);
                }
                for (var i = 0; i < p_jsonObject.connections.length; i++) {
                    var conn = p_jsonObject.connections[i];
                    var inpt = this.getElement(conn.connInput);
                    var c = this.createNewConnection(inpt, this.getElement(conn.connOutput));
                    this.m_counter++;
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
                        this.m_elementArr[i].update();
                }
                //h.gui.setSize(maxX + 80, maxY + 20);
                //h.gui.updateTable(this.dataMatrix);
                ////console.log("model.fromJSON()");
                ////console.log(this);
            };
            Model.prototype.createNewConnection = function (p_inputElmt, p_outputElmt) {
                var c = new DST.Connection(p_inputElmt, p_outputElmt, this.m_bbnMode, "conn" + this.m_counter);
                return c;
            };
            Model.prototype.setDecision = function (p_elmtIdent, p_decisNumb) {
                var elmt = this.getElement(p_elmtIdent);
                elmt.setDecision(p_decisNumb);
                elmt.getAllDescendants().forEach(function (e) {
                    e.setUpdated(false);
                    console.log(e.getName() + " not updated");
                });
                console.log(elmt.getName() + " wants to set decision number " + p_decisNumb);
            };
            return Model;
        })();
        DST.Model = Model;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Model.js.map