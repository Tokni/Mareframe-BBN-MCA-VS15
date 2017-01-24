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
                this.m_altIndex = [];
                this.m_autoUpdate = true; //auto update is on by default
                this.m_bbnMode = p_bbnMode;
                this.createNewElement = this.createNewElement.bind(this);
                this.deleteElement = this.deleteElement.bind(this);
            }
            ;
            Model.prototype.updateAltIndex = function () {
                this.m_altIndex = [];
                for (var e in this.m_elementArr) {
                    if (this.m_elementArr[e].getType() === 102)
                        this.m_altIndex.push(e);
                }
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
                            for (var i = elmt.getParentElements().length; i < elmt.getDataOld().length; i++) {
                                dataStream += '<state id="' + elmt.getDataOld(i, 0) + '" />\n';
                            }
                            if (elmt.getParentElements().length > 0) {
                                dataStream += '<parents>';
                                elmt.getParentElements().forEach(function (parElmt) {
                                    dataStream += parElmt.getID() + ' ';
                                });
                                dataStream = dataStream.slice(0, dataStream.length - 1) + '</parents>\n';
                            }
                            dataStream += '<probabilities>';
                            for (var i = 1; i < elmt.getDataOld(1).length; i++) {
                                for (var j = elmt.getParentElements().length; j < elmt.getDataOld().length; j++)
                                    dataStream += elmt.getDataOld(j, i) + ' ';
                            }
                            dataStream = dataStream.slice(0, dataStream.length - 1) + '</probabilities>\n';
                            dataStream += '</cpt>\n';
                            break;
                        case 1:
                            dataStream += '<decision id="' + elmt.getID() + '">\n';
                            for (var i = 0; i < elmt.getDataOld().length; i++) {
                                dataStream += '<state id="' + elmt.getDataOld(i) + '" />\n';
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
                            for (var i = 1; i < elmt.getDataOld(1).length; i++) {
                                dataStream += elmt.getDataOld(elmt.getDataOld().length - 1, i) + ' ';
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
                var ret = JSON.stringify(this);
                return JSON.stringify(this);
            };
            Model.prototype.update = function () {
                var m = this;
                this.m_elementArr.forEach(function (p_elmt) {
                    if (!p_elmt.isUpdated()) {
                        p_elmt.update();
                    }
                });
                this.m_elementArr.forEach(function (p_elmt) {
                    DST.Tools.updateConcerningDecisions(p_elmt);
                });
            };
            Model.prototype.getMainObjective = function () {
                return this.m_mainObjective;
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
            Model.prototype.getDataMatrix = function (p_name) {
                if (p_name == undefined)
                    p_name = false;
                var retDataMatrix = [];
                this.updateAltIndex();
                //first column
                retDataMatrix[0] = [];
                retDataMatrix[0][0] = "leave empty";
                retDataMatrix[1] = [];
                retDataMatrix[1][0] = "Minimum rating";
                retDataMatrix[2] = [];
                retDataMatrix[2][0] = "Baseline";
                var j = 3;
                for (var e in this.m_elementArr) {
                    if (this.m_elementArr[e].getType() === 102) {
                        retDataMatrix[j] = [];
                        if (p_name)
                            retDataMatrix[j++][0] = this.m_elementArr[e].getName();
                        else
                            retDataMatrix[j++][0] = this.m_elementArr[e].getID();
                    }
                }
                retDataMatrix[j] = [];
                retDataMatrix[j][0] = "Units";
                retDataMatrix[j + 1] = [];
                retDataMatrix[j + 1][0] = "maximum";
                //Data columns
                var column = 1;
                for (var e1 in this.m_elementArr) {
                    j = 3;
                    if (this.m_elementArr[e1].getType() === 100) {
                        if (p_name)
                            retDataMatrix[0][column] = this.m_elementArr[e1].getName();
                        else
                            retDataMatrix[0][column] = this.m_elementArr[e1].getID();
                        retDataMatrix[1][column] = this.m_elementArr[e1].getDataMin();
                        retDataMatrix[2][column] = this.m_elementArr[e1].getDataBaseLine();
                        for (var val in this.m_elementArr) {
                            if (this.m_elementArr[val].getType() === 102) {
                                retDataMatrix[j][column] = this.m_elementArr[e1].getDataArrAtIndex((j++) - 3);
                            }
                        }
                        retDataMatrix[j][column] = this.m_elementArr[e1].m_dataUnit;
                        retDataMatrix[j + 1][column] = this.m_elementArr[e1].getDataMax();
                        column++;
                    }
                }
                return retDataMatrix;
            };
            Model.prototype.getDataMatrixOld = function (p_index, p_secondary) {
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
            Model.prototype.getScore2 = function (p_element, p_weight, p_criteria) {
                var retMatrix = [];
                var w = DST.Tools.getWeights(p_element, this, undefined, undefined, undefined, p_element.m_criteriaLevel + 1);
                if (p_element.getChildrenElements().length !== 0 && p_criteria > 0) {
                    var index = 0;
                    for (var c in p_element.getChildrenElements()) {
                        var score = this.getScore2(p_element.getChildrenElements()[c], w[index++][1] * p_weight, p_criteria - 1);
                        for (var s in score) {
                            retMatrix.push(score[s]);
                        }
                    }
                }
                else {
                    retMatrix[0] = [];
                    retMatrix[0][0] = p_element.getName();
                    retMatrix[0] = retMatrix[0].concat(p_element.getScore());
                    for (var r in retMatrix[0]) {
                        if (r != '0')
                            retMatrix[0][parseInt(r)] *= p_weight;
                    }
                }
                return retMatrix;
            };
            Model.prototype.getScore = function (p_element, p_criteria, p_element1Replace, p_element2Replace, p_elementIgnoreValue) {
                var tempMatrix = JSON.parse(JSON.stringify(this.getDataMatrix()));
                var retMatrix = [];
                if (this.m_mainObjective != null) {
                    for (var _i = 0, _a = p_element.getChildrenElements(); _i < _a.length; _i++) {
                        var c = _a[_i];
                        var t = c.getID();
                    }
                    var weightsArr = DST.Tools.getWeights(p_element, this, p_element2Replace, p_element1Replace, p_elementIgnoreValue, p_criteria);
                    var sortedWeights = [];
                    //sortedWeigths matches tempMatrix
                    for (var i = 0; i < weightsArr.length; i++) {
                        for (var j = 1; j < tempMatrix[0].length; j++) {
                            if (tempMatrix[0][j] === weightsArr[i][0]) {
                                sortedWeights[j - 1] = weightsArr[i][1];
                                break;
                            }
                        }
                    }
                    for (var j = 0; j < tempMatrix.length - 2; j++) {
                        retMatrix[j] = [];
                    }
                    retMatrix[0][0] = "xx";
                    for (var i = 0; i < weightsArr.length; i++) {
                        for (var j = 1; j < 3; j++) {
                            retMatrix[j][0] = "r00";
                            retMatrix[j][i + 1] = 0;
                        }
                        var index = 0;
                        retMatrix[0][i + 1] = weightsArr[i][0];
                        var elmt = this.getElement(tempMatrix[0][i + 1]); // alternative element
                        for (var j = 3; j < tempMatrix.length - 2; j++) {
                            if (elmt.m_disregard == false) {
                                retMatrix[j][0] = tempMatrix[j][0];
                                if (p_element1Replace != undefined) {
                                    var tmp7b = p_element2Replace.getID();
                                    if (p_element2Replace.getID() === tempMatrix[0][i + 1] && p_element1Replace.getID() === tempMatrix[j][0]) {
                                        if (elmt.getMethod() == 1) {
                                            var total = 0;
                                            for (var k = 0; k < elmt.m_swingWeightsArr.length; k++) {
                                                total += elmt.m_swingWeightsArr[k][1];
                                            }
                                            retMatrix[j][i + 1] = elmt.m_swingWeightsArr[j - 3][1] / total;
                                        }
                                        else
                                            retMatrix[j][i + 1] = elmt.getPwlValue(p_elementIgnoreValue);
                                    }
                                    else {
                                        if (elmt.getMethod() == 1) {
                                            var total = 0;
                                            for (var k = 0; k < elmt.m_swingWeightsArr.length; k++) {
                                                total += elmt.m_swingWeightsArr[k][1];
                                            }
                                            retMatrix[j][i + 1] = elmt.m_swingWeightsArr[j - 3][1] / total;
                                        }
                                        else
                                            retMatrix[j][i + 1] = elmt.getPwlValue(tempMatrix[j][i + 1]);
                                    }
                                }
                                else {
                                    if (elmt.getMethod() == 1) {
                                        if (elmt.getType() === 100) {
                                            var total = 0;
                                            for (var k = 0; k < elmt.m_swingWeightsArr.length; k++) {
                                                total += elmt.m_swingWeightsArr[k][1];
                                            }
                                            retMatrix[j][i + 1] = elmt.m_swingWeightsArr[j - 3][1] / total;
                                        }
                                        else if (elmt.getType() === 101) {
                                        }
                                    }
                                    else {
                                        var tm = tempMatrix[j][i + 1];
                                        retMatrix[j][i + 1] = elmt.getPwlValue(tempMatrix[j][i + 1]);
                                    }
                                }
                                retMatrix[j][i + 1] *= sortedWeights[i];
                                retMatrix[j][i + 1] = (Math.round(100000 * retMatrix[j][i + 1])) / 100000;
                            }
                        }
                        retMatrix[0][i + 1] = elmt.getName(); // change from element ID to element name
                    }
                    for (var j = 3; j < retMatrix.length; j++) {
                        elmt = this.getElement(retMatrix[j][0]);
                        retMatrix[j][0] = elmt.getName();
                    }
                }
                else {
                }
                return retMatrix;
            };
            //this should be in elment
            Model.prototype.getWeightedData = function (p_elmt, p_addHeader) {
                var tempMatrix = [];
                var dm = this.getDataMatrix();
                if (p_addHeader) {
                    tempMatrix.push(['string', 'number']);
                }
                switch (p_elmt.getType()) {
                    case 102:
                        break;
                    case 100:
                        var maxVal = p_elmt.getDataMax();
                        var minVal = p_elmt.getDataMin();
                        //calculate weights according to valueFn or sliders 
                        if (p_elmt.getMethod() == 1) {
                            var total = 0;
                            for (var i = 0; i < p_elmt.m_swingWeightsArr.length; i++) {
                                total += p_elmt.m_swingWeightsArr[i][1];
                            }
                            for (var i = 0; i < p_elmt.m_swingWeightsArr.length; i++) {
                                var toAdd = [this.getElement(p_elmt.m_swingWeightsArr[i][0]).getName(), p_elmt.getDataArrAtIndex(i)];
                                if (!p_addHeader) {
                                    toAdd.push(p_elmt.m_swingWeightsArr[i][1] / total);
                                }
                                tempMatrix.push(toAdd);
                            }
                        }
                        else if (p_elmt.getMethod() == 2) {
                            for (var i = 3; i < this.getDataMatrix().length - 2; i++) {
                                var toAdd = [this.m_elementArr[this.m_altIndex[i - 3]].getName(), p_elmt.getDataArrAtIndex(i - 3)];
                                if (!p_addHeader) {
                                    var frac2 = p_elmt.getPwlVF().getPoints();
                                    var frac = p_elmt.getPwlValue(p_elmt.getDataArrAtIndex(i - 3));
                                    toAdd.push(frac);
                                }
                                tempMatrix.push(toAdd);
                            }
                        }
                        else if (p_elmt.getMethod() === 4) {
                            for (var i = 3; i < this.getDataMatrix().length - 2; i++) {
                                var toAdd = [this.m_elementArr[this.m_altIndex[i - 3]].getName(), p_elmt.getDataArrAtIndex(i - 3)];
                                if (!p_addHeader) {
                                    toAdd.push("ss");
                                }
                                tempMatrix.push(toAdd);
                            }
                        }
                        else {
                        }
                        break;
                    case 101:
                        break;
                }
                return tempMatrix;
            };
            Model.prototype.createNewElement = function (p_type) {
                if (this.m_bbnMode === false) {
                    var e = new DST.Element("elmt" + this.m_counter, this, p_type, 1);
                }
                else {
                    var e = new DST.Element("elmt" + this.m_counter, this, p_type);
                }
                this.m_elementArr.push(e);
                this.m_counter++;
                switch (p_type) {
                    case 0:
                        e.setData([["state0", 0.5], ["state1", 0.5]]);
                        e.setValues(e.getDataOld());
                        break;
                    case 1:
                        e.setData([["choice0"], ["choice1"]]);
                        e.setValues([["choice0", 0], ["choice1", 0]]);
                        break;
                    case 2:
                        e.setData([["Value", 0]]);
                        e.setValues([["Value", 0]]);
                    default:
                        break;
                }
                return e;
            };
            Model.prototype.getElement = function (p_elmtStringId) {
                return this.m_elementArr[this.getObjectIndex(p_elmtStringId)];
            };
            Model.prototype.getObjectIndex = function (p_objectStringId) {
                var key = 0;
                if (!p_objectStringId)
                    debugger;
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
                    if (this.m_elementArr[key].getType() === 103)
                        this.m_mainObjective = undefined;
                    else if (this.m_elementArr[key].getType() === 102) {
                        for (var _i = 0, _a = this.m_elementArr; _i < _a.length; _i++) {
                            var elm = _a[_i];
                            if (elm.getType() === 100) {
                                this.updateAltIndex();
                                var t = this.m_altIndex[key];
                                var n = 0;
                                for (var _b = 0, _c = this.m_altIndex; _b < _c.length; _b++) {
                                    var i = _c[_b];
                                    if (i == key)
                                        break;
                                    else
                                        n++;
                                }
                                elm.deleteValueAtIndex(n);
                            }
                        }
                    }
                    this.m_elementArr.splice(key, 1);
                    this.updateAltIndex();
                    return true;
                }
            };
            Model.prototype.deleteConnection = function (p_connID) {
                var key = 0;
                //finding the index 'key' in the connection array
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
                    if (this.m_bbnMode) {
                        var states = this.m_connectionArr[key].getInputElement().getDataOld().length;
                        var data = this.m_connectionArr[key].getOutputElement().getDataOld();
                        var dataIn = this.m_connectionArr[key].getInputElement().getDataOld();
                        var removeHeader = this.m_connectionArr[key].getInputElement().getID();
                        var dims = [0, 0, 0];
                        data = DST.Tools.removeHeaderRow(removeHeader, data);
                        this.m_connectionArr[key].getOutputElement().setData(data);
                        this.m_connectionArr.splice(key, 1);
                        return true;
                    }
                    else {
                        //updates the data of the element connected to the deletetee
                        var elmtOut = this.m_connectionArr[key].getOutputElement();
                        var elmtIn = this.m_connectionArr[key].getInputElement();
                        switch (elmtOut.getType()) {
                            case 100:
                                break;
                            case 101:
                                for (var e in elmtOut.m_swingWeightsArr) {
                                    var out = elmtOut.m_swingWeightsArr[e][0];
                                    var id = this.m_connectionArr[key].getID();
                                    if (elmtOut.m_swingWeightsArr[e][0] === this.m_connectionArr[key].getID()) {
                                        elmtOut.m_swingWeightsArr.splice(parseInt(e), 1);
                                    }
                                }
                                break;
                            case 102:
                                break;
                            case 103:
                                for (var e in elmtOut.m_swingWeightsArr) {
                                    if (elmtOut.m_swingWeightsArr[e][0] === this.m_connectionArr[key].getID()) {
                                        elmtOut.m_swingWeightsArr.splice(parseInt(e), 1);
                                    }
                                }
                                break;
                        }
                        var tmp = elmtOut.m_criteriaLevel;
                        var tmp2 = elmtIn.m_criteriaLevel;
                        elmtIn.setCriteriaLevel(null);
                        //removes connection from the conncetions array and the two elements
                        elmtOut.deleteConnection(p_connID);
                        elmtIn.deleteConnection(p_connID);
                        this.m_connectionArr.splice(key, 1);
                    }
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
                var mainObj = "";
                if (this.m_mainObjective !== undefined)
                    mainObj = this.m_mainObjective.getID();
                return {
                    elements: this.m_elementArr,
                    connections: this.m_connectionArr,
                    mdlName: this.m_modelName,
                    mainObj: mainObj,
                    dataMat: this.m_dataMatrix,
                    mdlIdent: this.m_modelIdent
                };
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
                    if (parseInt(elmt.getID().substr(4)) !== NaN && parseInt(elmt.getID().substr(4)) > this.m_counter)
                        this.m_counter = parseInt(elmt.getID().substr(4));
                }
                for (var i = 0; i < p_jsonObject.connections.length; i++) {
                    var conn = p_jsonObject.connections[i];
                    var inpt = this.getElement(conn.connInput);
                    var tmp34 = this.getElement(conn.connOutput);
                    var c = this.createNewConnection(inpt, this.getElement(conn.connOutput));
                    c.fromJSON(conn);
                    if (parseInt(c.getID().substr(4)) !== NaN && parseInt(c.getID().substr(4)) > this.m_counter)
                        this.m_counter = parseInt(c.getID().substr(4)) + 1;
                    this.addConnection(c);
                }
                if (!this.m_bbnMode)
                    if (p_jsonObject.mainObj !== "") {
                        this.m_mainObjective = this.getElement(p_jsonObject.mainObj);
                    }
                    else
                        p_jsonObject.mainObj = undefined;
                for (var i = 0; i < p_jsonObject.elements.length; i++) {
                    if (this.m_bbnMode)
                        this.m_elementArr[i].update();
                }
                var tmp = this.m_counter;
            };
            Model.prototype.createNewConnection = function (p_inputElmt, p_outputElmt) {
                this.m_counter++;
                var c = new DST.Connection(p_inputElmt, p_outputElmt, this.m_bbnMode, "conn" + this.m_counter);
                return c;
            };
            Model.prototype.setDecision = function (p_elmtIdent, p_decisNumb) {
                var elmt = this.getElement(p_elmtIdent);
                if (elmt.getDecision() == p_decisNumb) {
                    elmt.setDecision(undefined);
                }
                else {
                    elmt.setDecision(p_decisNumb);
                }
                this.getElementArr().forEach(function (e) {
                    e.setUpdated(false);
                }); /*
                This is commented out because createSubMatrix did not work properly when only updating some of the elements.
                This solution is not optimal, but it forces the program to update every element without looking at decisions first and then focusing on decision.
                The problem occured when first one decision was set and the model was updated and then another decision was set.
                elmt.getAllDescendants().forEach(function (e: Element) {
                    e.setUpdated(false);
                    //console.log(e.getName() + " not updated");
                });*/
            };
            Model.prototype.getCumuluValue = function (p_element, p_level) {
                var retValue = 0;
                var weights = DST.Tools.getWeights(p_element, undefined, undefined, undefined, undefined, p_level);
                var lowerLevel = p_level - 1;
                if (lowerLevel >= 0) {
                    for (var _i = 0, weights_1 = weights; _i < weights_1.length; _i++) {
                        var i = weights_1[_i];
                        retValue += this.getCumuluValue(this.getElement(i[0]), lowerLevel);
                    }
                }
                else {
                }
                return retValue;
            };
            return Model;
        }());
        DST.Model = Model;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Model.js.map