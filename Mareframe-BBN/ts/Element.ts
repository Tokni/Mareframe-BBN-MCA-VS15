module Mareframe {
    export module DST {
        export class Element {
            private m_data: any[][] = [];
            private m_dateDim: number[] = [];
            private m_id: string = "elmtbroken"
            private m_name: string = "Element";
            private m_description: string = "write description here";
            private m_userDescription: string = "write your own description or comments here";
            private m_type: number = 0;
            private m_weightingMethod: number = 1;
            private m_connections: Connection[] = [];
            private m_values: number[][] = [];
            private m_updated: boolean = false;
            public m_easelElmt: any//createjs.Container;
            public m_minitableEaselElmt: createjs.Container;
            private m_model: Model;
            private m_decision: number; //undefined if no decision is sat
            private m_dialog: JQuery;
            private m_evidence: number;
            private m_visuallySelected = false;

            constructor(p_id: string, p_model: Model, p_type: number, p_notVisual?: boolean) {
                if (p_id.substr(0, 4) == "elmt")
                { this.m_id = p_id; }
                else { this.m_id = "elmt" + p_id; }
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
                    this.m_easelElmt = {x: 0, y:0};
                }

            }
            addEaselElmt() {
                var x: number = this.m_easelElmt.x;
                var y: number = this.m_easelElmt.y
                this.m_easelElmt = new createjs.Container();
                this.m_easelElmt.x = x;
                this.m_easelElmt.y = y;
            }
            addMinitable() {
                this.m_minitableEaselElmt = new createjs.Container();
            }
            getVisuallySelected() {
                return this.m_visuallySelected;
            }
            setVisuallySelected(bool: boolean) {
                this.m_visuallySelected = bool;
            }
            getDialog(): JQuery {
                return this.m_dialog;
            }
            setDialog(dialog: JQuery) {
                this.m_dialog = dialog;
            }
            getValues(): any[][] {
                return this.m_values;
            }
            setValues(p_val: any[][]): void {
                this.m_values = p_val;
            }
            isUpdated(): boolean {
                return this.m_updated;
            }
            setUpdated(p_updated): void {
                this.m_updated = p_updated;
            }
            getDecision(): number {
                return this.m_decision;
            }
            setDecision(n: number): void {
                if (this.getType() !== 1) {
                    throw "Error. Trying to set decision in nondecision element";
                }
                this.m_decision = n;
            }
            getEvidence(): number {
                return this.m_evidence;
            }
            setEvidence(n: number): void {
                if (this.getType() !== 0) {
                    throw "Error. Trying to set evidence in nonchance element";
                }
                this.m_evidence = n;
            }
            update(): void {
                //console.log("Updating element " + this.getName() );
                if (this.m_type !== 1) {
                    //   console.log("This is not a decision node");
                    //Definition table in decision nodes does not rely on parents
                    this.updateData();
                }
               // Tools.calculateValues(this.m_model, this);
                Tools.updateValuesHeaders(this.m_model, this);
                //console.log("Updated element " + this.getName());
               // this.m_updated = true;
            }

            getParentElements(): Element[] {
                var elmt = this;
                var parents = [];
                this.m_connections.forEach(function (c) {
                    if (c.getOutputElement().getID() === elmt.getID()) {
                        parents.push(c.getInputElement());
                    }
                })
                ////console.log(elmt.getName() + " parents: " + parents);
                return parents;
            }

            isParentOf(p_elmt: Element): boolean {
                var retBool: boolean = false;

                for (var e in this.getChildrenElements()) {
                    //console.log("Element: " + p_elmt.getID() + "   ChildElement: " + this.getChildrenElements()[e].getID());
                    if (this.getChildrenElements()[e].getID() == p_elmt.getID()) {

                        retBool = true;
                        break;
                    }
                }
                // console.log(" Is Parent Of: " + retBool);
                return retBool;
            }

            isChildOf(p_elmt: Element): boolean {
                var retBool: boolean = false;

                for (var e in this.getParentElements()) {
                    //console.log("Element: " + p_elmt.getID() + "   ParentElement: " + this.getParentElements()[e].getID());
                    if (this.getParentElements()[e].getID() == p_elmt.getID()) {

                        retBool = true;
                        break;
                    }
                }
                //console.log(" Is Child Of: " + retBool );
                return retBool;
            }


            getChildrenElements(): Element[] {
                var children: Element[] = [];
                var elmt = this;
                // console.log(this.m_connections);
                this.m_connections.forEach(function (c) {
                    //console.log("OutputElement: " + c.getOutputElement().getID());
                    //console.log("this Element id: " + elmt.getID());
                    if (c.getInputElement().getID() === elmt.getID()) {
                        children.push(c.getOutputElement());
                    }
                })
                //   console.log(this.getName() + " chilxxdren: " + children);
                return children;
            }
            getAllAncestors(): Element[] {
                //  console.log("getting ancestors for: " + this.getName());
                var ancestors: Element[] = [];
                var parents: Element[] = this.getParentElements();
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
            }

            

            isInfluencing(): boolean {//An element is influencing if it has a utility descendant
                var descendants: Element[] = this.getAllDescendants();
                for (var i = 0; i < descendants.length; i++) {
                    var e: Element = descendants[i];
                    if (e.getType() === 2) {
                        return true;
                    }
                }
                return false;
            }
            isInformative(): boolean {//An element is informative if it has a decision child {
                var informative: boolean = false;
                if (this.getType() === 0) {//Only chance nodes can be informative
                    this.getChildrenElements().forEach(function (e) {
                        if (e.getType() === 1) {
                            informative = true;
                        }
                    });
                }
                return informative;
            }

            getAllDecisionAncestors(): Element[] {
                var decisions: Element[] = [];
                this.getAllAncestors().forEach(function (e) {
                    if (e.getType() === 1) {
                        decisions.push(e);
                    }
                });
                return decisions;
            }

            isAncestorOf(elmt): boolean {
                //  console.log("checking if " + this.getName() + " is an ancestor of " + elmt.getName() + ": " + (this.getAllAncestors().indexOf(elmt) > -1));
                return (this.getAllAncestors().indexOf(elmt) > -1);
            }
            getAllDescendants(): Element[] {
                //console.log("get all decendants for " + this.getName());
                var descendants: Element[] = [];
                var elmt: Element = this;
                var children: Element[] = this.getChildrenElements();
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
            }

            copyDefArray(): any[] {
                var valueArray = [];
                //console.log(this);
                for (var i = 0; i < this.m_data.length; i++) {
                    valueArray[i] = [];
                    for (var j = 0; j < this.m_data[0].length; j++) {
                        valueArray[i].push(this.m_data[i][j]);
                    }
                }
                return valueArray;

            }

            updateData() {
                //console.log("updateData " + this.m_name);
                this.m_data = Tools.makeSureItsTwoDimensional(this.updateHeaderRows(this.m_data));
                
                // console.log("updating data: " + this.m_data);
                var size: number[] = math.size(this.m_data);
                var rows: number = size[0];
                var columns: number = size[1];
                /*if (this.getType() === 3 && columns === 0) {//There needs to be an empty cell for the value
                    columns = 1;
                }*/
                //console.log("rows " + rows + " columns " + columns);
                // console.log("in filling " + this.m_name + " last cell is " + this.m_data[rows - 1][columns - 1]);
                if (columns > 0 && this.m_data[rows - 1][columns - 1] === undefined) {
                    this.m_data = Tools.fillDataTable(this, this.m_data);
                }
            }

            updateHeaderRows(p_originalData: any[][]): any[][] {
                //console.log("updating header rows in " + this.getName())
                //console.log("data: " + p_originalData);
                var data: any[][] = [];
                var parents: Element[] = this.getParentElements();
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
                    if (this.m_type !== 1) {//Decision elements should not have header rows
                        for (var i = 0; i < parents.length; i++) {
                            var elmt: Element = parents[i];
                            //console.log("Parent: " + elmt.getName());
                            data = Tools.addNewHeaderRow(elmt.getMainValues(), data);
                            // console.log(data);
                        }
                    }
                    //console.log("number of header rows : " + Tools.numOfHeaderRows(this.m_data));
                    //Add original values to the table
                    for (var i = Tools.numOfHeaderRows(this.m_data); i < p_originalData.length; i++) {
                        //console.log("i: " + i);
                        // console.log("new data: " + p_originalData[i]);
                        data.push(p_originalData[i]);
                    }
                }
                // console.log(data);
                return data;
            }

            addDefaultDataInEmptyCells(p_originalData: any[][], p_editedElmt: Element, p_addedState: String): any[][] {
                // console.log("adding default values in " + this.getName() + " for the new state " + p_addedState + " in element: "+ p_editedElmt.getName());
                var data: any[][] = Tools.makeSureItsTwoDimensional(p_originalData);
                var rows: number = data.length;
                var columns: number = data[0].length;
                //console.log("original data: " + p_originalData);
                for (var i = 0; i < rows; i++) {
                    if (data[i][0] === p_editedElmt.getID()) {//This is the right row
                        //console.log("found row");
                        for (var j = 0; j < columns; j++) { 
                            // console.log("comparing " + (data[i][j] + " and " + p_addedState);
                            if (data[i][j].trim() === p_addedState.trim()) {//This is the right column
                                //console.log("found column");
                                for (var n = Tools.numOfHeaderRows(data); n < rows; n++) { //For each row in this column add a default value
                                    //console.log("adding " + (1 / (rows - Tools.numOfHeaderRows(data))));
                                    data[n].splice(j, 0, (1 / (rows - Tools.numOfHeaderRows(data))));
                                }
                            }
                        }
                    }
                }
                return data;
            }
            //returns the different variables (conditions or choices) that belong to the element
            getMainValues(): string[] {
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
                        //console.log("push data " + data[i][0]);
                    }
                }
                //console.log("new row: " + row);
                return row;
            }

            
            //MCA TOOL
            getData(p_index?: number, p_secondary?: number): any {
                if (p_index != undefined) {
                    var data = this.m_data[p_index];
                    if (p_secondary != undefined && data instanceof Array)
                        data = data[p_secondary];
                    return data;
                } else {
                    return this.m_data;
                }
            }

            setData(p_data: any, p_index?: number, p_secondary?: number): any {
                if (p_index != undefined) {
                    if (p_secondary != undefined && this.m_data[p_index] instanceof Array) {
                        this.m_data[p_index][p_secondary] = p_data;
                    } else {
                        this.m_data[p_index] = p_data
                    }
                } else {
                    this.m_data = p_data;
                }
                this.m_updated = false;
            }
            getID(): string {
                return this.m_id;
            }
            setID(p_id: string): string {
                if (p_id.substr(0, 4) == "elmt")
                { this.m_id = p_id; }
                else { this.m_id = "elmt" + p_id; }
                this.m_easelElmt.name = p_id;
                return this.m_id;

            }
            getName(): string {
                return this.m_name;
            }
            setName(p_name: string): void {
                this.m_name = p_name;
            }
            getDescription(): string {
                return this.m_description;
            }
            setDescription(p_description: string): void {
                this.m_description = p_description
            }
            getUserDescription(): string {
                return this.m_userDescription;
            }
            setUserDescription(p_description: string): void {
                this.m_userDescription = p_description
            }
            getType(): number {
                return this.m_type;
            }
            setType(p_type: number): void {
                this.m_type = p_type;
            }
            getMethod(): number {
                return this.m_weightingMethod
            }
            setMethod(p_weightingMethod: number): void {
                this.m_weightingMethod = p_weightingMethod;
            }

            deleteConnection(p_connID: string): boolean {

                var key = 0;
                this.m_connections.every(function (p_conn: Connection) {
                    if (p_conn.getID() === p_connID)
                        return false;
                    else {
                        key++
                        return true;
                    }
                });
                //console.log("Key: " + key + "  Lengthm_conn: " + this.m_connections.length) ;
                if (key >= this.m_connections.length)
                    return false;
                else {
                    for (var index in this.m_connections) {
                        //console.log(this.m_name + "  EBefore: " + this.m_connections[index].getID());
                    }

                    this.m_connections.splice(key, 1);

                    //console.log("m_conn Length: " + this.m_connections.length);
                    for (var index in this.m_connections) {
                        //console.log(this.m_name + "  EAfter: " + this.m_connections[index].getID());
                    }
                    //console.log("Total conections: " + this.m_model.getConnectionArr().length);
                    //this.m_model.deleteConnection(p_connID);
                    //console.log("Total conections: " + this.m_model.getConnectionArr().length);

                    return true;
                }
            }

            deleteAllConnections(): any {
                this.m_connections.forEach(function (p_conn: Connection) {

                });
            }
            addConnection(p_conn: Connection): void {
                this.m_connections.push(p_conn)
            }
            getConnections(): Connection[] {
                return this.m_connections;
            }

            toJSON(): any {
                
                return { posX: this.m_easelElmt.x, posY: this.m_easelElmt.y, elmtID: this.getID(), elmtName: this.getName(), elmtDesc: this.getDescription(), elmtType: this.getType(), elmtData: this.getData(), elmtWghtMthd: this.getMethod(), elmtValues: this.getValues(), elmtUpdated: this.isUpdated(), elmtDec: this.m_decision, elmtEvidence: this.m_evidence, elmtDialog: this.m_dialog};
            }

            fromJSON(p_jsonElmt: any): void {
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
            }

            getConnectionFrom(p_elmt: Element): Connection {
                var retConnection: Connection = null;

                for (var index in this.m_connections) {
                    if (this.m_connections[index].getOutputElement().m_id == p_elmt.m_id) {
                        retConnection = this.m_connections[index];
                        break;
                    }
                }

                return retConnection;

            }
            convertToSuperValue(): void {
                this.setType(3);
                this.setData([[]]);
                this.setValues([[]]);
            }
            actualRowsDoesNotEqualVisualRows(): boolean {
                //console.log("dialog: " + this.m_dialog);
                return (this.m_dialog !== undefined && (!(this.m_dialog.data("deletedRows").length === 0 && this.m_dialog.data("newStates").length === 0)));
            }
            getMinAndMaxValue(): number[] {//Only works for decision nodes
                var max: number = this.m_values[0][1];
                var min: number = this.m_values[0][1];
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
            }
            getSumOfValues(): number {//Only works for decision nodes 
                var sum: number = 0;
                for (var i = 0; i < this.m_values.length; i++) {
                    sum += this.m_values[i][1];
                }
                return sum;

            }
        }
    }
}

