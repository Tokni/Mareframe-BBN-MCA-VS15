var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var Element = (function () {
            function Element(p_id, p_model, p_type, p_notVisual) {
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
                this.m_visuallySelected = false;
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
                if (!p_notVisual) {
                    this.m_easelElmt = new createjs.Container();
                    this.m_minitableEaselElmt = new createjs.Container();
                }
                else {
                    //This is used when the model is created from the web worker
                    this.m_easelElmt = { x: 0, y: 0 };
                }
            }
            Element.prototype.addEaselElmt = function () {
                var x = this.m_easelElmt.x;
                var y = this.m_easelElmt.y;
                this.m_easelElmt = new createjs.Container();
                this.m_easelElmt.x = x;
                this.m_easelElmt.y = y;
            };
            Element.prototype.addMinitable = function () {
                this.m_minitableEaselElmt = new createjs.Container();
            };
            Element.prototype.getVisuallySelected = function () {
                return this.m_visuallySelected;
            };
            Element.prototype.setVisuallySelected = function (bool) {
                this.m_visuallySelected = bool;
            };
            Element.prototype.getDialog = function () {
                return this.m_dialog;
            };
            Element.prototype.setDialog = function (dialog) {
                this.m_dialog = dialog;
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
                if (this.getType() !== 1) {
                    throw "Error. Trying to set decision in nondecision element";
                }
                this.m_decision = n;
            };
            Element.prototype.getEvidence = function () {
                return this.m_evidence;
            };
            Element.prototype.setEvidence = function (n) {
                if (this.getType() !== 0) {
                    throw "Error. Trying to set evidence in nonchance element";
                }
                this.m_evidence = n;
            };
            Element.prototype.update = function () {
                //console.log("Updating element " + this.getName() );
                if (this.m_type !== 1) {
                    //   console.log("This is not a decision node");
                    //Definition table in decision nodes does not rely on parents
                    this.updateData();
                }
                // Tools.calculateValues(this.m_model, this);
                DST.Tools.updateValuesHeaders(this.m_model, this);
                //console.log("Updated element " + this.getName());
                // this.m_updated = true;
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
                // console.log(" Is Parent Of: " + retBool);
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
                //console.log(" Is Child Of: " + retBool );
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
                            if (e.getType() !== 1) {
                                //ancestor of a decision node aren't real ancestors
                                ancestors = ancestors.concat(e.getAllAncestors());
                            }
                        }
                    });
                }
                return ancestors;
            };
            Element.prototype.isInfluencing = function () {
                var descendants = this.getAllDescendants();
                for (var i = 0; i < descendants.length; i++) {
                    var e = descendants[i];
                    if (e.getType() === 2) {
                        return true;
                    }
                }
                return false;
            };
            Element.prototype.isInformative = function () {
                var informative = false;
                if (this.getType() === 0) {
                    this.getChildrenElements().forEach(function (e) {
                        if (e.getType() === 1) {
                            informative = true;
                        }
                    });
                }
                return informative;
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
                //console.log("get all decendants for " + this.getName());
                var descendants = [];
                var elmt = this;
                var children = this.getChildrenElements();
                if (children.length === 0) {
                    //   console.log("returned: " + decendants);
                    return descendants;
                }
                else {
                    children.forEach(function (e) {
                        //If the child is a decision it is not a real descendant
                        if (descendants.indexOf(e) === -1 && e.getType() !== 1) {
                            //   console.log("pushing " + e.getName());
                            descendants.push(e);
                            descendants = descendants.concat(e.getAllDescendants());
                        }
                    });
                }
                // console.log("returned: " + descendants);
                return descendants;
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
                //console.log("updateData " + this.m_name);
                this.m_data = DST.Tools.makeSureItsTwoDimensional(this.updateHeaderRows(this.m_data));
                // console.log("updating data: " + this.m_data);
                var size = math.size(this.m_data);
                var rows = size[0];
                var columns = size[1];
                /*if (this.getType() === 3 && columns === 0) {//There needs to be an empty cell for the value
                    columns = 1;
                }*/
                //console.log("rows " + rows + " columns " + columns);
                // console.log("in filling " + this.m_name + " last cell is " + this.m_data[rows - 1][columns - 1]);
                if (columns > 0 && this.m_data[rows - 1][columns - 1] === undefined) {
                    this.m_data = DST.Tools.fillDataTable(this, this.m_data);
                }
            };
            Element.prototype.updateHeaderRows = function (p_originalData) {
                //console.log("updating header rows in " + this.getName())
                //console.log("data: " + p_originalData);
                var data = [];
                var parents = this.getParentElements();
                if (this.m_type === 3 && parents.length > 0) {
                    //If this is a super utility node with at least one parent
                    for (var i = 0; i < parents.length; i++) {
                        data.push([parents[i].m_id]);
                    }
                    for (var i = 0; i < p_originalData.length; i++) {
                        data[i].push(p_originalData[i][1]);
                    }
                }
                else {
                    if (this.m_type !== 1) {
                        for (var i = 0; i < parents.length; i++) {
                            var elmt = parents[i];
                            //console.log("Parent: " + elmt.getName());
                            data = DST.Tools.addNewHeaderRow(elmt.getMainValues(), data);
                        }
                    }
                    //console.log("number of header rows : " + Tools.numOfHeaderRows(this.m_data));
                    //Add original values to the table
                    for (var i = DST.Tools.numOfHeaderRows(this.m_data); i < p_originalData.length; i++) {
                        //console.log("i: " + i);
                        // console.log("new data: " + p_originalData[i]);
                        data.push(p_originalData[i]);
                    }
                }
                // console.log(data);
                return data;
            };
            Element.prototype.addDefaultDataInEmptyCells = function (p_originalData, p_editedElmt, p_addedState) {
                // console.log("adding default values in " + this.getName() + " for the new state " + p_addedState + " in element: "+ p_editedElmt.getName());
                var data = DST.Tools.makeSureItsTwoDimensional(p_originalData);
                var rows = data.length;
                var columns = data[0].length;
                //console.log("original data: " + p_originalData);
                for (var i = 0; i < rows; i++) {
                    if (data[i][0] === p_editedElmt.getID()) {
                        //console.log("found row");
                        for (var j = 0; j < columns; j++) {
                            // console.log("comparing " + (data[i][j] + " and " + p_addedState);
                            if (data[i][j].trim() === p_addedState.trim()) {
                                //console.log("found column");
                                for (var n = DST.Tools.numOfHeaderRows(data); n < rows; n++) {
                                    //console.log("adding " + (1 / (rows - Tools.numOfHeaderRows(data))));
                                    data[n].splice(j, 0, (1 / (rows - DST.Tools.numOfHeaderRows(data))));
                                }
                            }
                        }
                    }
                }
                return data;
            };
            //returns the different variables (conditions or choices) that belong to the element
            Element.prototype.getMainValues = function () {
                //console.log("getting main values from " + this.getName());
                //console.log(this.m_data);
                var row = [];
                var data = this.m_data;
                row.push(this.m_id);
                for (var i = 0; i < data.length; i++) {
                    // //console.log("i: " + i);
                    //console.log("check data: " + data[i][1]);
                    //If the second column contains a number or is undefined this is a main value
                    if (!isNaN(parseFloat(data[i][1])) || data[i][1] === undefined) {
                        row.push(data[i][0]);
                    }
                }
                //console.log("new row: " + row);
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
                //console.log("Key: " + key + "  Lengthm_conn: " + this.m_connections.length) ;
                if (key >= this.m_connections.length)
                    return false;
                else {
                    for (var index in this.m_connections) {
                    }
                    this.m_connections.splice(key, 1);
                    //console.log("m_conn Length: " + this.m_connections.length);
                    for (var index in this.m_connections) {
                    }
                    //console.log("Total conections: " + this.m_model.getConnectionArr().length);
                    //this.m_model.deleteConnection(p_connID);
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
                return { posX: this.m_easelElmt.x, posY: this.m_easelElmt.y, elmtID: this.getID(), elmtName: this.getName(), elmtDesc: this.getDescription(), elmtType: this.getType(), elmtData: this.getData(), elmtWghtMthd: this.getMethod(), elmtValues: this.getValues(), elmtUpdated: this.isUpdated(), elmtDec: this.m_decision, elmtEvidence: this.m_evidence, elmtDialog: this.m_dialog };
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
                this.m_data = p_jsonElmt.elmtData;
                this.m_values = p_jsonElmt.elmtValues;
                //console.log("FromJSONdata: " + this.m_data);
                this.m_weightingMethod = p_jsonElmt.elmtWghtMthd;
                this.m_updated = p_jsonElmt.elmtUpdated;
                this.m_evidence = p_jsonElmt.elmtEvidence;
                this.m_decision = p_jsonElmt.elmtDec;
                this.m_dialog = p_jsonElmt.elmtDialog;
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
            Element.prototype.convertToSuperValue = function () {
                this.setType(3);
                this.setData([[]]);
                this.setValues([[]]);
            };
            Element.prototype.actualRowsDoesNotEqualVisualRows = function () {
                //console.log("dialog: " + this.m_dialog);
                return (this.m_dialog !== undefined && (!(this.m_dialog.data("deletedRows").length === 0 && this.m_dialog.data("newStates").length === 0)));
            };
            Element.prototype.getMinAndMaxValue = function () {
                var max = this.m_values[0][1];
                var min = this.m_values[0][1];
                if (this.m_type === 1) {
                    for (var i = 1; i < this.m_values.length; i++) {
                        if (this.m_values[i][1] > max) {
                            max = this.m_values[i][1];
                        }
                        if (this.m_values[i][1] < min) {
                            min = this.m_values[i][1];
                        }
                    }
                }
                else {
                    throw "Get max value was called on element of type not decision";
                }
                return [min, max];
            };
            Element.prototype.getSumOfValues = function () {
                var sum = 0;
                for (var i = 0; i < this.m_values.length; i++) {
                    sum += this.m_values[i][1];
                }
                return sum;
            };
            return Element;
        }());
        DST.Element = Element;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Element.js.map