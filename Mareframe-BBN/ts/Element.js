var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var Element = (function () {
            function Element(p_id, p_model, p_type, p_dstType) {
                this.m_data = [];
                this.m_dateDim = [];
                this.m_id = "elmtbroken";
                this.m_name = "Element";
                this.m_description = "write description here";
                this.m_userDescription = "write your own description or comments here";
                this.m_type = 0;
                this.m_weightingMethod = 1;
                this.m_connections = [];
                this.m_values = [];
                this.m_updated = false;
                this.m_easelElmt = new createjs.Container();
                this.m_minitableEaselElmt = new createjs.Container();
                //private m_swingWeightsArr: number[] = [];
                this.m_swingWeightsArr = [];
                this.m_dataArr = [];
                if (p_id.substr(0, 4) == "elmt") {
                    this.m_id = p_id;
                }
                else {
                    this.m_id = "elmt" + p_id;
                }
                if (p_type != undefined) {
                    if (this.m_dstType === 1) {
                        this.m_type = p_type;
                    }
                    else {
                        this.m_type = p_type;
                    }
                }
                else {
                    //console.log("type not defined");
                    if (p_dstType === 1) {
                        this.m_type = 101;
                    }
                    else {
                        this.m_type = 1;
                    }
                }
                this.m_model = p_model;
                if (p_dstType !== undefined)
                    this.m_dstType = p_dstType;
                else
                    this.m_dstType = 0;
                this.getChildrenElements = this.getChildrenElements.bind(this);
                this.m_swingWeightsArr = [];
            }
            Element.prototype.getDataBaseLine = function () {
                return this.m_dataBaseLine;
            };
            Element.prototype.setDataBaseLine = function (p_baseLine) {
                this.m_dataBaseLine = p_baseLine;
            };
            Element.prototype.getDataMax = function () {
                return this.m_dataMax;
            };
            Element.prototype.setDataMax = function (p_max) {
                this.m_dataMax = p_max;
                for (var i in this.m_dataArr) {
                    if (this.m_dataArr[i] > p_max)
                        this.m_dataMax = this.m_dataArr[i];
                }
            };
            Element.prototype.getDataMin = function () {
                return this.m_dataMin;
            };
            Element.prototype.setDataMin = function (p_min) {
                this.m_dataMin = p_min;
                for (var i in this.m_dataArr) {
                    if (this.m_dataArr[i] < p_min)
                        this.m_dataMin = this.m_dataArr[i];
                }
            };
            Element.prototype.getDataArrAtIndex = function (p_index) {
                if (p_index >= 0 || p_index < this.m_dataArr.length)
                    return this.m_dataArr[p_index];
                else
                    return undefined;
            };
            Element.prototype.getDataArrLength = function () {
                return this.m_dataArr.length;
            };
            Element.prototype.changeDataArrAtIndex = function (p_index, p_value) {
                if (p_index >= 0 || p_index < this.m_dataArr.length)
                    this.m_dataArr[p_index] = p_value;
                if (p_value < this.m_dataMin)
                    this.m_dataMin = p_value;
                if (p_value > this.m_dataMax)
                    this.m_dataMax = p_value;
            };
            Element.prototype.pushValueToDataArr = function (p_value) {
                this.m_dataArr.push(p_value);
            };
            Element.prototype.deleteValueAtIndex = function (p_index) {
                this.m_dataArr.splice(p_index, 1);
            };
            Element.prototype.dataArrLength = function () {
                return this.m_dataArr.length;
            };
            Element.prototype.getValues = function () {
                return this.m_values;
            };
            Element.prototype.setValues = function (p_val) {
                this.m_values = p_val;
            };
            Element.prototype.isUpdated = function () {
                return this.m_updated;
            };
            Element.prototype.setUpdated = function (p_updated) {
                this.m_updated = p_updated;
            };
            Element.prototype.getDecision = function () {
                return this.m_decision;
            };
            Element.prototype.setDecision = function (n) {
                this.m_decision = n;
            };
            Element.prototype.update = function () {
                console.log("Updating element " + this.getName());
                if (this.m_type !== 1) {
                    //   console.log("This is not a decision node");
                    //Definition table in decision nodes does not rely on parents
                    this.updateData();
                }
                DST.Tools.calculateValues(this.m_model, this);
                //console.log("Updated element " + this.getName());
                this.m_updated = true;
            };
            Element.prototype.getParentElements = function () {
                var elmt = this;
                var parents = [];
                this.m_connections.forEach(function (c) {
                    if (c.getOutputElement().getID() === elmt.getID()) {
                        parents.push(c.getInputElement());
                    }
                });
                ////console.log(elmt.getName() + " parents: " + parents);
                return parents;
            };
            Element.prototype.isParentOf = function (p_elmt) {
                var retBool = false;
                for (var e in this.getChildrenElements()) {
                    //console.log("Element: " + p_elmt.getID() + "   ChildElement: " + this.getChildrenElements()[e].getID());
                    if (this.getChildrenElements()[e].getID() == p_elmt.getID()) {
                        retBool = true;
                        break;
                    }
                }
                console.log(" Is Parent Of: " + retBool);
                return retBool;
            };
            Element.prototype.isChildOf = function (p_elmt) {
                var retBool = false;
                for (var e in this.getParentElements()) {
                    //console.log("Element: " + p_elmt.getID() + "   ParentElement: " + this.getParentElements()[e].getID());
                    if (this.getParentElements()[e].getID() == p_elmt.getID()) {
                        retBool = true;
                        break;
                    }
                }
                console.log(" Is Child Of: " + retBool);
                return retBool;
            };
            Element.prototype.getChildrenElements = function () {
                var children = [];
                var elmt = this;
                // console.log(this.m_connections);
                this.m_connections.forEach(function (c) {
                    //console.log("OutputElement: " + c.getOutputElement().getID());
                    //console.log("this Element id: " + elmt.getID());
                    if (c.getInputElement().getID() === elmt.getID()) {
                        children.push(c.getOutputElement());
                    }
                });
                //   console.log(this.getName() + " chilxxdren: " + children);
                return children;
            };
            Element.prototype.getAllAncestors = function () {
                //  console.log("getting ancestors for: " + this.getName());
                var ancestors = [];
                var parents = this.getParentElements();
                if (parents.length === 0) {
                    //  console.log("ancestors: " + ancestors);
                    return ancestors;
                }
                else {
                    parents.forEach(function (e) {
                        if (ancestors.indexOf(e) === -1) {
                            //   console.log("pushing " + e.getName());
                            ancestors.push(e);
                            ancestors = ancestors.concat(e.getAllAncestors());
                        }
                    });
                }
                return ancestors;
            };
            Element.prototype.getAllDecisionAncestors = function () {
                var decisions = [];
                this.getAllAncestors().forEach(function (e) {
                    if (e.getType() === 1) {
                        decisions.push(e);
                    }
                });
                return decisions;
            };
            Element.prototype.isAncestorOf = function (elmt) {
                //  console.log("checking if " + this.getName() + " is an ancestor of " + elmt.getName() + ": " + (this.getAllAncestors().indexOf(elmt) > -1));
                return (this.getAllAncestors().indexOf(elmt) > -1);
            };
            Element.prototype.getAllDescendants = function () {
                //   console.log("get all decendants for " + this.getName());
                var decendants = [];
                var children = this.getChildrenElements();
                if (children.length === 0) {
                    //   console.log("returned: " + decendants);
                    return decendants;
                }
                else {
                    children.forEach(function (e) {
                        if (decendants.indexOf(e) === -1) {
                            //   console.log("pushing " + e.getName());
                            decendants.push(e);
                            decendants = decendants.concat(e.getAllDescendants());
                        }
                    });
                }
                //console.log("returned: " + decendants);
                return decendants;
            };
            Element.prototype.copyDefArray = function () {
                var valueArray = [];
                //console.log(this);
                for (var i = 0; i < this.m_data.length; i++) {
                    valueArray[i] = [];
                    for (var j = 0; j < this.m_data[0].length; j++) {
                        valueArray[i].push(this.m_data[i][j]);
                    }
                }
                return valueArray;
            };
            Element.prototype.updateData = function () {
                // console.log("updateData " + this.m_name);
                // console.log("data: " + this.m_data);
                this.m_data = this.updateHeaderRows(this.m_data);
                // console.log("data: " + this.m_data);
                var rows;
                var columns;
                // console.log("checking: " + this.m_data[this.m_data.length - 1][1]);
                //console.log("data length: " + this.m_data.length);
                if (this.m_data[this.m_data.length - 1][1] === undefined) {
                    rows = 1;
                    columns = this.m_data.length;
                }
                else {
                    rows = this.m_data.length;
                    columns = this.m_data[0].length;
                }
                //console.log("rows " + rows + " columns " + columns);
                // console.log("in filling " + this.m_name + " last cell is " + this.m_data[rows - 1][columns - 1]);
                if (this.m_data[rows - 1][columns - 1] === undefined) {
                    this.m_data = DST.Tools.fillDataTable(this.m_data);
                }
            };
            Element.prototype.updateHeaderRows = function (p_originalData) {
                //console.log("updating header rows in " + this.getName())
                // console.log("data: " + p_originalData);
                var data = [];
                var parents = this.getParentElements();
                for (var i = 0; i < parents.length; i++) {
                    var elmt = parents[i];
                    // console.log("Parent: " + elmt.getName());
                    data = DST.Tools.addNewHeaderRow(elmt.getMainValues(), data);
                }
                //console.log("number of header rows : " + Tools.numOfHeaderRows(this.m_data));
                //Add original values to the table
                for (var i = DST.Tools.numOfHeaderRows(this.m_data); i < p_originalData.length; i++) {
                    //console.log("i: " + i);
                    // console.log("new data: " + p_originalData[i]);
                    data.push(p_originalData[i]);
                }
                // console.log(data);
                return data;
            };
            //returns the different variables (conditions or choices) that belong to the element
            Element.prototype.getMainValues = function () {
                //console.log(this.m_data);
                var row = [];
                var data = this.m_data;
                row.push(this.m_id);
                for (var i = 0; i < data.length; i++) {
                    // //console.log("i: " + i);
                    // //console.log("check data: " + data[i][1]);
                    if (!isNaN(parseFloat(data[i][1])) || data[i][1] === undefined) {
                        row.push(data[i][0]);
                    }
                }
                ////console.log("new row: " + row);
                return row;
            };
            //MCA TOOL
            Element.prototype.getDataArr = function (p_index, p_secondary) {
                if (p_index != undefined) {
                    var data = this.m_dataArr[p_index];
                    if (p_secondary != undefined && data instanceof Array)
                        data = data[p_secondary];
                    return data;
                }
                else {
                    return this.m_dataArr;
                }
            };
            Element.prototype.getDataOld = function (p_index, p_secondary) {
                if (p_index != undefined) {
                    var data = this.m_data[p_index];
                    if (p_secondary != undefined && data instanceof Array)
                        data = data[p_secondary];
                    return data;
                }
                else {
                    return this.m_data;
                }
            };
            Element.prototype.setData = function (p_data, p_index, p_secondary) {
                if (p_index != undefined) {
                    if (p_secondary != undefined && this.m_data[p_index] instanceof Array) {
                        this.m_data[p_index][p_secondary] = p_data;
                    }
                    else {
                        this.m_data[p_index] = p_data;
                    }
                }
                else {
                    this.m_data = p_data;
                }
                this.m_updated = false;
            };
            Element.prototype.getID = function () {
                return this.m_id;
            };
            Element.prototype.setID = function (p_id) {
                if (p_id.substr(0, 4) == "elmt") {
                    this.m_id = p_id;
                }
                else {
                    this.m_id = "elmt" + p_id;
                }
                this.m_easelElmt.name = p_id;
                return this.m_id;
            };
            Element.prototype.getName = function () {
                return this.m_name;
            };
            Element.prototype.setName = function (p_name) {
                this.m_name = p_name;
            };
            Element.prototype.getDescription = function () {
                return this.m_description;
            };
            Element.prototype.setDescription = function (p_description) {
                this.m_description = p_description;
            };
            Element.prototype.getUserDescription = function () {
                return this.m_userDescription;
            };
            Element.prototype.setUserDescription = function (p_description) {
                this.m_userDescription = p_description;
            };
            Element.prototype.getType = function () {
                return this.m_type;
            };
            Element.prototype.getTypeName = function () {
                switch (this.getType()) {
                    case 100:
                        return "Attribute";
                        break;
                    case 101:
                        return "Objective";
                        break;
                    case 102:
                        return "Alternative";
                        break;
                    case 103: return "Goal";
                    default: console.log("No such element type name: " + this.getType());
                }
            };
            Element.prototype.setType = function (p_type) {
                this.m_type = p_type;
            };
            Element.prototype.getMethod = function () {
                return this.m_weightingMethod;
            };
            Element.prototype.getMethodName = function () {
                switch (this.getMethod()) {
                    case 0:
                        return "Direct";
                        break;
                    case 1:
                        return "Swing / Direct";
                        break;
                    case 2:
                        return "Value Function";
                        break;
                }
            };
            Element.prototype.setMethod = function (p_weightingMethod) {
                this.m_weightingMethod = p_weightingMethod;
            };
            Element.prototype.deleteConnection = function (p_connID) {
                var key = 0;
                this.m_connections.every(function (p_conn) {
                    if (p_conn.getID() === p_connID)
                        return false;
                    else {
                        key++;
                        return true;
                    }
                });
                console.log("Key: " + key + "  Lengthm_conn: " + this.m_connections.length);
                if (key >= this.m_connections.length)
                    return false;
                else {
                    for (var index in this.m_connections) {
                        console.log(this.m_name + "  EBefore: " + this.m_connections[index].getID());
                    }
                    this.m_connections.splice(key, 1);
                    console.log("m_conn Length: " + this.m_connections.length);
                    for (var index in this.m_connections) {
                        console.log(this.m_name + "  EAfter: " + this.m_connections[index].getID());
                    }
                    //console.log("Total conections: " + this.m_model.getConnectionArr().length);
                    //this.deleteConnection(p_connID);
                    //console.log("Total conections: " + this.m_model.getConnectionArr().length);
                    return true;
                }
            };
            Element.prototype.deleteAllConnections = function () {
                this.m_connections.forEach(function (p_conn) {
                });
            };
            Element.prototype.addConnection = function (p_conn) {
                this.m_connections.push(p_conn);
            };
            Element.prototype.getConnections = function () {
                return this.m_connections;
            };
            Element.prototype.toJSON = function () {
                var retJson = {
                    posX: this.m_easelElmt.x,
                    posY: this.m_easelElmt.y,
                    elmtValueFnX: this.m_valueFunctionX,
                    elmtValueFnY: this.m_valueFunctionY,
                    elmtValueFnFlip: this.m_valueFunctionFlip,
                    elmtID: this.getID(),
                    elmtName: this.getName(),
                    elmtDesc: this.getDescription(),
                    elmtType: this.getType(),
                    elmtWghtMthd: this.getMethod(),
                    elmtDstType: this.m_dstType,
                    elmtDataMin: this.m_dataMin,
                    elmtDataMax: this.m_dataMax,
                    elmtDataUnit: this.m_dataUnit,
                    elmtDataBaseLine: this.m_dataBaseLine
                };
                if (this.getMethod() === 2)
                    retJson["elmtDataArr"] = this.getDataArr();
                if (this.getMethod() === 1)
                    retJson["elmtData"] = this.m_swingWeightsArr;
                return retJson;
            };
            Element.prototype.toJSONOld = function () {
                return {
                    posX: this.m_easelElmt.x,
                    posY: this.m_easelElmt.y,
                    elmtID: this.getID(),
                    elmtName: this.getName(),
                    elmtDesc: this.getDescription(),
                    elmtType: this.getType(),
                    elmtData: this.getDataArr(),
                    elmtWghtMthd: this.getMethod(),
                    elmtDstType: this.m_dstType
                };
            };
            Element.prototype.fromJSON = function (p_jsonElmt) {
                // console.log("element.fromJSON()");
                //console.log(p_jsonElmt);
                this.m_easelElmt.x = p_jsonElmt.posX;
                this.m_easelElmt.y = p_jsonElmt.posY;
                this.m_id = p_jsonElmt.elmtID;
                this.m_name = p_jsonElmt.elmtName;
                //console.log("FromJSONname: " + this.m_name);
                this.m_description = p_jsonElmt.elmtDesc;
                this.m_type = p_jsonElmt.elmtType;
                //this.m_data = p_jsonElmt.elmtData;
                //console.log("FromJSONdata: " + this.m_data);
                this.m_weightingMethod = p_jsonElmt.elmtWghtMthd;
                switch (this.m_weightingMethod) {
                    case 0: break;
                    case 1:
                        if (p_jsonElmt.elmtData) {
                            for (var i = 0; i < p_jsonElmt.elmtData.length; i++) {
                                this.m_swingWeightsArr[i] = p_jsonElmt.elmtData[i];
                            }
                        }
                        break;
                    case 2:
                        this.m_dataBaseLine = p_jsonElmt.elmtDataBaseLine;
                        this.m_dataMin = p_jsonElmt.elmtDataMin;
                        this.m_dataMax = p_jsonElmt.elmtDataMax;
                        this.m_dataArr = p_jsonElmt.elmtDataArr;
                        this.m_dataUnit = p_jsonElmt.elmtDataUnit;
                        this.m_valueFunctionX = p_jsonElmt.elmtValueFnX;
                        this.m_valueFunctionY = p_jsonElmt.elmtValueFnY;
                        this.m_valueFunctionFlip = p_jsonElmt.elmtValueFnFlip;
                        break;
                    default: console.log("Json Goof");
                }
                console.log("element " + p_jsonElmt.elmtName + " imported from JSON.");
            };
            Element.prototype.fromJSONOld = function (p_jsonElmt) {
                // console.log("element.fromJSON()");
                //console.log(p_jsonElmt);
                this.m_easelElmt.x = p_jsonElmt.posX;
                this.m_easelElmt.y = p_jsonElmt.posY;
                this.m_id = p_jsonElmt.elmtID;
                this.m_name = p_jsonElmt.elmtName;
                //console.log("FromJSONname: " + this.m_name);
                this.m_description = p_jsonElmt.elmtDesc;
                this.m_type = p_jsonElmt.elmtType;
                //this.m_data = p_jsonElmt.elmtData;
                //console.log("FromJSONdata: " + this.m_data);
                this.m_weightingMethod = p_jsonElmt.elmtWghtMthd;
            };
            Element.prototype.getConnectionFrom = function (p_elmt) {
                var retConnection = null;
                for (var index in this.m_connections) {
                    if (this.m_connections[index].getOutputElement().m_id == p_elmt.m_id) {
                        retConnection = this.m_connections[index];
                        break;
                    }
                }
                return retConnection;
            };
            return Element;
        })();
        DST.Element = Element;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Element.js.map