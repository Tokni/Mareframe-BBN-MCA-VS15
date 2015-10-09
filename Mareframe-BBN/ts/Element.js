var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var Element = (function () {
            function Element(p_id, p_model, p_type) {
                this.m_data = [];
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
                this.m_decisEaselElmt = new createjs.Container();
                if (p_id.substr(0, 4) == "elmt") {
                    this.m_id = p_id;
                }
                else {
                    this.m_id = "elmt" + p_id;
                }
                if (p_type != undefined) {
                    this.m_type = p_type;
                }
                this.m_model = p_model;
                this.getChildrenElements = this.getChildrenElements.bind(this);
            }
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
                // console.log("Updating element " + this.getName() );
                if (this.m_type !== 1) {
                    //   console.log("This is not a decision node");
                    //Definition table in decision nodes does not rely on parents
                    this.updateData();
                }
                DST.Tools.calculateValues(this.m_model, this);
                //  console.log(this);
                var children = this.getChildrenElements();
                if (children.length !== 0) {
                    for (var i in children) {
                        //  console.log(this.getName() + " children: " + children[i].getName() + " updating");
                        //children[i].update();
                        children[i].setUpdated(false);
                    }
                }
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
                console.log("getting ancestors for: " + this.getName());
                var ancestors = [];
                var parents = this.getParentElements();
                if (parents.length === 0) {
                    console.log("ancestors: " + ancestors);
                    return ancestors;
                }
                else {
                    parents.forEach(function (e) {
                        if (ancestors.indexOf(e) === -1) {
                            console.log("pushing " + e.getName());
                            ancestors.push(e);
                            ancestors = ancestors.concat(e.getAllAncestors());
                        }
                    });
                }
                return ancestors;
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
                //console.log("in filling " + this.m_name + " last cell is " + this.m_data[rows - 1][columns - 1]);
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
            Element.prototype.getData = function (p_index, p_secondary) {
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
            Element.prototype.setType = function (p_type) {
                this.m_type = p_type;
            };
            Element.prototype.getMethod = function () {
                return this.m_weightingMethod;
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
                if (key >= this.m_connections.length)
                    return false;
                else {
                    this.m_connections.splice(key, 1);
                    this.m_model.deleteConnection(p_connID);
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
                return { posX: this.m_easelElmt.x, posY: this.m_easelElmt.y, elmtID: this.getID(), elmtName: this.getName(), elmtDesc: this.getDescription(), elmtType: this.getType(), elmtData: this.getData(), elmtWghtMthd: this.getMethod() };
            };
            Element.prototype.fromJSON = function (p_jsonElmt) {
                // console.log("element.fromJSON()");
                //console.log(p_jsonElmt);
                this.m_easelElmt.x = p_jsonElmt.posX;
                this.m_easelElmt.y = p_jsonElmt.posY;
                this.m_id = p_jsonElmt.elmtID;
                this.m_name = p_jsonElmt.elmtName;
                // console.log("name: " + this.m_name);
                this.m_description = p_jsonElmt.elmtDesc;
                this.m_type = p_jsonElmt.elmtType;
                this.m_data = p_jsonElmt.elmtData;
                //  console.log("data: " + this.m_data);
                this.m_weightingMethod = p_jsonElmt.elmtWghtMthd;
            };
            return Element;
        })();
        DST.Element = Element;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Element.js.map