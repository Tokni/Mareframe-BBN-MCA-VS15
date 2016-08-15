module Mareframe {
    export module DST{
        export class Element {
            private m_data: any[][] = [];
            private m_dateDim: number[] =[]; 
            private m_id: string = "elmtbroken"
            private m_name: string = "Element";
            private m_description: string = "write description here";
            private m_userDescription: string = "write your own description or comments here";
            private m_type: number = 0;
            private m_weightingMethod: number = 1;
            private m_connections: Connection[] = [];
            private m_values: number[][] = [];
            private m_updated: boolean = false;
            public m_easelElmt: createjs.Container = new createjs.Container();
            public m_minitableEaselElmt: createjs.Container = new createjs.Container();
            private m_model: Model;
            private m_decision: number;
            public m_dstType: number;
            public m_criteriaLevel;
            public m_disregard = false;

            //private m_swingWeightsArr: number[] = [];
            public m_swingWeightsArr: any[] = [];

            //private m_valueFunctionX: number;
            //private m_valueFunctionY: number;
            //private m_valueFunctionFlip: number;

            //private m_dataMax: number;
            //private m_dataArr: number[] = [];
            //private m_dataUnit: string;
            //private m_dataMin: number;

            public m_valueFunctionX: number;
            public m_valueFunctionY: number;
            public m_valueFunctionFlip: number;

            private m_dataMax: number;
            private m_dataArr: number[] = [];
            public m_dataUnit: string;
            private m_dataMin: number;
            private m_dataBaseLine: number;

            private m_pwlVF: PiecewiseLinear;
            private m_pwlFlipHorizontal: boolean = false;
            private m_pwlFlipVertical: boolean = false;

            constructor(p_id: string, p_model: Model, p_type: number, p_dstType?: number) {
                if (p_id.substr(0, 4) == "elmt")
                { this.m_id = p_id; }
                else { this.m_id = "elmt" + p_id; }
                if (p_type != undefined) {
                    if (this.m_dstType === 1) {
                    this.m_type = p_type; 
                    } else {
                        this.m_type = p_type;
                }
                }
                else {
                    //console.log("type not defined");
                    if (p_dstType === 1) {
                        this.m_type = 101;
                    } else {
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
            setPwlVF(p_vf: PiecewiseLinear) {
                this.m_pwlVF = p_vf;
            }
            getPwlVF(): PiecewiseLinear {
                return this.m_pwlVF;
            }
            getFlipVertical(): boolean {
                return this.m_pwlFlipVertical;
            }
            setFlipVertical(p_fVert: boolean) {
                this.m_pwlFlipVertical = p_fVert;
            }
            getFlipHorizontal(): boolean {
                return this.m_pwlFlipHorizontal;
            }
            setFlipHorizontal(p_fHori: boolean) {
                this.m_pwlFlipHorizontal = p_fHori;
            }
            getDataBaseLine(): number {
                return this.m_dataBaseLine;
            }
            setDataBaseLine(p_baseLine: number) {
                this.m_dataBaseLine = p_baseLine;
            }
            getDataMax(): number {
                return this.m_dataMax;
            }
            setDataMax(p_max: number) {
                this.m_dataMax = p_max;
                for (var i in this.m_dataArr) {
                    if (this.m_dataArr[i] > p_max)
                        this.m_dataMax = this.m_dataArr[i];
                }
            }
            getDataMin(): number {
                return this.m_dataMin;
            }
            setDataMin(p_min: number) {
                this.m_dataMin = p_min;
                for (var i in this.m_dataArr) {
                    if (this.m_dataArr[i] < p_min)
                        this.m_dataMin = this.m_dataArr[i];
                }
            }
            getDataArrAtIndex(p_index: number) {
                if (p_index >= 0 || p_index < this.m_dataArr.length)
                    return this.m_dataArr[p_index];
                else 
                    return undefined;       
            }
            getDataArrLength(): number {
                return this.m_dataArr.length;
            }
            changeDataArrAtIndex(p_index: number, p_value:number) {
                if (p_index >= 0 || p_index < this.m_dataArr.length)
                    this.m_dataArr[p_index] = p_value;
                if (p_value < this.m_dataMin)
                    this.m_dataMin = p_value;
                if (p_value > this.m_dataMax)
                    this.m_dataMax = p_value;
            }
            pushValueToDataArr(p_value) {
                this.m_dataArr.push(p_value);
            }
            deleteValueAtIndex(p_index: number) {
                this.m_dataArr.splice(p_index, 1);
            }
            dataArrLength() {
                return this.m_dataArr.length;
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
                this.m_decision = n;
            }
            update(): void {
                //console.log("Updating element " + this.getName() );
                if (this.m_type !== 1) {
                 //   console.log("This is not a decision node");
                    //Definition table in decision nodes does not rely on parents
                    this.updateData();
                }
                Tools.calculateValues(this.m_model, this);
                //console.log("Updated element " + this.getName());
                this.m_updated = true;
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
                
                for (var e in this.getChildrenElements() ) {
                    //console.log("Element: " + p_elmt.getID() + "   ChildElement: " + this.getChildrenElements()[e].getID());
                    if (this.getChildrenElements()[e].getID() == p_elmt.getID()) {
                        
                        retBool = true;
                        break;
                    }
                }
                console.log(" Is Parent Of: " + retBool);
                return retBool;
            }
            isChildOf(p_elmt: Element): boolean {
                var retBool: boolean = false;

                for (var e in this.getParentElements() ) {
                    //console.log("Element: " + p_elmt.getID() + "   ParentElement: " + this.getParentElements()[e].getID());
                    if (this.getParentElements()[e].getID() == p_elmt.getID()) {
                        
                        retBool = true;
                        break;
                    }
                }
                console.log(" Is Child Of: " + retBool );
                return retBool;
            }
            getChildrenElements(): Element[] {
                var children: Element[] = [];
                var elmt = this;
               // console.log(this.m_connections);
                this.m_connections.forEach(function (c) {
                    var tmp = c.getOutputElement().getID();
                    var tmp3 = c.getInputElement().getID();
                    var tmp2 = elmt.getID();
                    if (c.getOutputElement().getID() === elmt.getID() ) {
                        children.push(c.getInputElement());
                    }
                })
             //   console.log(this.getName() + " chilxxdren: " + children);
                return children;
            }
            getAllAncestors(): Element[] {
              //  console.log("getting ancestors for: " + this.getName());
                var ancestors: Element[] =[];
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
                            ancestors = ancestors.concat(e.getAllAncestors());
                        }
                    });
                }
                return ancestors;
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
                //console.log("checking if " + this.getName() + " is an ancestor of " + elmt.getName() + ": " + (this.getAllAncestors().indexOf(elmt) > -1));
                //console.log(this.getAllAncestors());
                return (this.getAllAncestors().indexOf(elmt) > -1);
            }
            getAllDescendants(): Element[]{
             //   console.log("get all decendants for " + this.getName());
                var decendants: Element[] = [];
                var children: Element[] = this.getChildrenElements();
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
               // console.log("updateData " + this.m_name);
               // console.log("data: " + this.m_data);
              this.m_data = this.updateHeaderRows(this.m_data);
                
               // console.log("data: " + this.m_data);
                var rows: number;
                var columns: number;
               // console.log("checking: " + this.m_data[this.m_data.length - 1][1]);
                //console.log("data length: " + this.m_data.length);
                if (this.m_data[this.m_data.length-1][1] === undefined) {// One dimensional
                    rows = 1;
                    columns = this.m_data.length;
                }
                else {
                    rows = this.m_data.length;
                    columns = this.m_data[0].length;
                }
                //console.log("rows " + rows + " columns " + columns);
               // console.log("in filling " + this.m_name + " last cell is " + this.m_data[rows - 1][columns - 1]);
                if (this.m_data[rows-1][columns-1] === undefined) {
                    this.m_data = Tools.fillDataTable(this.m_data);
                }
            }
            updateHeaderRows(p_originalData: any[][]): any[][] {
                //console.log("updating header rows in " + this.getName())
               // console.log("data: " + p_originalData);
                
                var data: any[][] = [];
                var parents: Element[] = this.getParentElements();
                
                for (var i = 0; i < parents.length; i++) {
                    var elmt: Element = parents[i];
                   // console.log("Parent: " + elmt.getName());
                    data = Tools.addNewHeaderRow(elmt.getMainValues(), data);
                    //console.log(data);

                }
                //console.log("number of header rows : " + Tools.numOfHeaderRows(this.m_data));
                //Add original values to the table
                for (var i = Tools.numOfHeaderRows(this.m_data); i < p_originalData.length; i++) {
                    //console.log("i: " + i);
                   // console.log("new data: " + p_originalData[i]);
                    data.push(p_originalData[i]);
                }
               // console.log(data);
                return data;
            }

            addDefaultDataInEmptyCells(p_originalData: any[][], p_editedElmt: Element, p_addedState: String): any[][]{
                console.log("adding default values in " + this.getName());
                var data:any[][] = Tools.makeSureItsTwoDimensional(p_originalData);
                var elmtType: number = this.getType();
                var rows: number = data.length;
                var columns: number = data[0].length;
               
                for (var i = 0; i < rows; i++) {
                    if (data[i][0] === p_editedElmt.getID()) {//This is the right row
                        console.log("found row");
                        for (var j = 0; j < columns; j++) { 
                            if (data[i][j] === p_addedState) {//This is the right column
                                console.log("found column");
                                for (var n = Tools.numOfHeaderRows(data); n < rows; n++) { //For each row in this column add a default value
                                    console.log("adding " + (1 / (rows - Tools.numOfHeaderRows(data))));
                                    data[n].splice(j, 0, (1 / (rows - Tools.numOfHeaderRows(data))));
                                }
                            }
                        }
                    }
                }
                return data;
            }
	        //returns the different variables (conditions or choices) that belong to the element
            getMainValues(): any[]{
                //console.log(this.m_data);
                var row = [];
                var data = this.m_data;
                row.push(this.m_id);
                for (var i = 0; i < data.length; i++) {
                    // //console.log("i: " + i);
                    // //console.log("check data: " + data[i][1]);
                    if (!isNaN(parseFloat(data[i][1])) || data[i][1] === undefined) {
                        row.push(data[i][0]);
                        ////console.log("push data " + data[i][0]);
                    }
                }
                ////console.log("new row: " + row);
                return row;
            }
            //MCA TOOL
            getDataArr(p_index?: number, p_secondary?: number): any {
                if (p_index != undefined) {
                    var data: any = this.m_dataArr[p_index];
                    if (p_secondary != undefined && data instanceof Array)
                        data = data[p_secondary];
                    return data;
                } else {
                    return this.m_dataArr;
                }
            }
            getDataOld(p_index?: number, p_secondary?: number): any {
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
            getTypeName(): string {
                switch (this.getType()) {
                    case 100: return "Attribute";
                        //break;
                    case 101: return "Objective";
                        //break;
                    case 102: return "Alternative";
                        //break;
                    case 103: return "Goal";
                    default: console.log("No such element type name: " + this.getType() );
                }
            }
            setType(p_type: number): void {
                this.m_type = p_type;
                if (p_type === 103) this.m_criteriaLevel = 0;
            }
            getMethod(): number {
                return this.m_weightingMethod
            }
            getMethodName(): string {
                switch (this.getMethod()) {
                    case 0: return "Direct"; //break;
                    case 1: return "Swing / Direct"; //break;
                    case 2: return "Value Function"; //break;
                }
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
                console.log("Key: " + key + "  Lengthm_conn: " + this.m_connections.length) ;
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
            }
            deleteAllConnections(): any {
                this.m_connections.forEach(function (p_conn: Connection) {

                });
            }
            addConnection(p_conn: Connection): void {
                this.m_connections.push(p_conn);
                if (p_conn.getInputElement().m_criteriaLevel != null)
                    p_conn.getOutputElement().setCriteriaLevel( p_conn.getInputElement().m_criteriaLevel + 1 );
            }
            getConnections(): Connection[] {
                return this.m_connections;
            }
            toJSON(): any {
                var retJson = 
                {
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
                    }
                
                    retJson["elmtDataArr"] = this.getDataArr();
                    retJson["pwl"] = this.m_pwlVF;
                    retJson["pwlFlipVertical"] = this.m_pwlFlipVertical;
                    retJson["pwlFlipHorizontal"] = this.m_pwlFlipHorizontal;
                
                
                    retJson["elmtData"] = this.m_swingWeightsArr;
                return retJson;
                }            
            toJSONOld(): any {
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
                //this.m_data = p_jsonElmt.elmtData;
                //console.log("FromJSONdata: " + this.m_data);
                this.m_weightingMethod = p_jsonElmt.elmtWghtMthd;
                switch (this.m_type) {
                    case 100: {
                        this.m_dataBaseLine = p_jsonElmt.elmtDataBaseLine;
                        this.m_dataMin = p_jsonElmt.elmtDataMin;
                        this.m_dataMax = p_jsonElmt.elmtDataMax;
                        this.m_dataArr = p_jsonElmt.elmtDataArr;
                        this.m_dataUnit = p_jsonElmt.elmtDataUnit;
                        var vf: PiecewiseLinear = new PiecewiseLinear(this.getDataMin(), 0, this.getDataMax(), 1, 0, 1);
                        for (var i = 1; i < p_jsonElmt.pwl.points.length - 1; i++) {
                            vf.addPoint(p_jsonElmt.pwl.points[i].x, p_jsonElmt.pwl.points[i].y);
                        }
                        
                        this.m_pwlVF = vf;
                        if (p_jsonElmt.pwlFlipVertical == undefined)
                            this.m_pwlFlipVertical = false;
                        else 
                            this.m_pwlFlipVertical = p_jsonElmt.pwlFlipVertical;
                        if (p_jsonElmt.pwlFlipHorizontal == undefined)
                            this.m_pwlFlipHorizontal = false;
                        else
                            this.m_pwlFlipHorizontal = p_jsonElmt.pwlFlipHorizontal;
                        this.m_pwlVF.setStartPoint(p_jsonElmt.pwl.points[0].x, p_jsonElmt.pwl.points[0].y);
                        this.m_pwlVF.setEndPoint(p_jsonElmt.pwl.points[p_jsonElmt.pwl.points.length - 1].x, p_jsonElmt.pwl.points[p_jsonElmt.pwl.points.length - 1].y);
                        this.m_pwlVF.sortPointsByX();
                        break;

                    }

                }
                
                //switch (this.m_weightingMethod) {
                //    case 0: break;
                //    case 1:
                //        if (p_jsonElmt.elmtData) {
                //            for (var i = 0; i < p_jsonElmt.elmtData.length; i++) {
                //                this.m_swingWeightsArr[i] = p_jsonElmt.elmtData[i];
                //            }
                //        }
                //        break;

                //    case 2:
                        
                //        this.m_valueFunctionX = p_jsonElmt.elmtValueFnX;
                //        this.m_valueFunctionY = p_jsonElmt.elmtValueFnY;
                //        this.m_valueFunctionFlip = p_jsonElmt.elmtValueFnFlip;
                       
                //        break;
                //    default: console.log("Json Goof");
                
                        if (p_jsonElmt.elmtData) {
                            for (var i = 0; i < p_jsonElmt.elmtData.length; i++) {
                                this.m_swingWeightsArr[i] = p_jsonElmt.elmtData[i];
                            }
                        }
                        

                        this.m_valueFunctionX = p_jsonElmt.elmtValueFnX;
                        this.m_valueFunctionY = p_jsonElmt.elmtValueFnY;
                        this.m_valueFunctionFlip = p_jsonElmt.elmtValueFnFlip;

                        
                
                console.log("element " + p_jsonElmt.elmtName + " imported from JSON.");

            }
            fromJSONOld(p_jsonElmt: any): void {
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
            getPwlValue(p_num: number) : number{
                var ret = 0;
                if (this.getFlipHorizontal()) {
                    if (this.getFlipVertical()) {                        
                        ret = 1 - this.getPwlVF().getValue(this.getDataMax() - p_num);
                    }
                    else {
                        ret = 1 - this.getPwlVF().getValue(p_num);
                    }
                }
                else {
                    if (this.getFlipVertical()) {
                        ret = this.getPwlVF().getValue(this.getDataMax() - p_num);
                    }
                    else {
                        ret = this.getPwlVF().getValue(p_num);
                    }
                }
                return ret;
            }
            setCriteriaLevel(p_level: number): void {
                this.m_criteriaLevel = p_level;
                var tmp = this.getChildrenElements();
                for (var chd of this.getChildrenElements()) {
                    if (p_level != null)
                        chd.setCriteriaLevel(p_level + 1);
                    else    
                        chd.setCriteriaLevel(null);
                }                                
            }
            getWeightedValues(alt: number): number {
                var ret: number;
                switch (this.m_weightingMethod) {
                    case 0: break;
                    case 1: { // Swing - direct
                        var total = 0;
                        for (var k = 0; k < this.m_swingWeightsArr.length; k++) {
                            total += this.m_swingWeightsArr[k][1];
                        }                       
                        ret = this.m_swingWeightsArr[alt][1] / total;                        
                        break;
                    }
                    case 2: {// utility - value function
                            ret = this.m_pwlVF.getValue(this.getDataArr[alt]);
                        break;
                    }
                }
                return ret;
            }   
            getScore(): any[] {
                var ret: any[] = [];
                if (this.getType() !== 100) {
                    var w = Tools.getWeights(this, this.m_model, undefined, undefined, undefined, this.m_criteriaLevel + 1 );
                    for (var c in this.getChildrenElements()) {
                        var tmp = this.getChildrenElements()[c];
                        if (ret.length == 0) {
                            ret = this.getChildrenElements()[c].getScore();
                            for (var r2 in ret) {
                                ret[r2] *= w[c][1];
                            }
                            var tml = ret;
                        }
                        else {
                            var tmpp = this.getChildrenElements();
                            var score = this.getChildrenElements()[c].getScore();
                            for (var r in ret) {
                                var tm = parseFloat(w[c][1]);
                                var tmpr = ret[r];
                                var tmpm = score[r] * parseFloat(w[c][1]);
                                ret[r] += (score[r] * parseFloat(w[c][1]));
                                var tmps = score[r];
                                var tmpm2 = tmps * tm;
                                tmpr = ret[r];
                            }
                            var tmprt = ret;
                        }
                    }
                }
                else {
                    if (this.m_weightingMethod == 1) {
                        var total = 0;
                        for (var k = 0; k < this.m_swingWeightsArr.length; k++) {
                            total += this.m_swingWeightsArr[k][1];
                        }
                        for (var k = 0; k < this.m_swingWeightsArr.length; k++) {
                            ret[k] = this.m_swingWeightsArr[k][1] / total;
                        }

                    }
                    else {
                        for (var k = 0; k < this.m_dataArr.length; k++) {
                            //ret[k] = this.m_pwlVF.getValue(this.getDataArr[k]);
                            //var tmp3 = this.getDataArr;
                            var t = this.getDataArr()[k];
                            ret[k] = this.getPwlValue(this.getDataArr()[k]);
                        }
                    }                  
                }
                console.log("ID: " + this.getID() + "  Name: " + this.getName() + "   Score: " + ret);
                return ret;
            }
        }
    }
}