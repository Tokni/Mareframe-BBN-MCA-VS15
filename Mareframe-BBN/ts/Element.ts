module Mareframe {
    export module DST{
        export class Element {
            private m_data: any[][] = [];
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
            public m_decisEaselElmt: createjs.Container = new createjs.Container();
            private m_model: Model;
            private m_decision: number;

            constructor(p_id: string, p_model: Model) {
                if (p_id.substr(0, 4) == "elmt")
                { this.m_id = p_id; }
                else { this.m_id = "elmt" + p_id; }
                this.m_model = p_model;
            }

            getValues(): any[][] {
                return this.m_values;
            }
            setValues(p_val: number[][]): void {
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
                //console.log(this);
                if (this.m_type !== 1) {
                    //Definition table in decision nodes does not rely on parents
                    this.updateData();
                }
                Tools.calculateValues(this.m_model,this);
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
                this.m_data = this.updateHeaderRows(this.m_data);
            }

            updateHeaderRows(p_originalData: any[][]): any[][] {
                // //console.log("updating header rows")
                //console.log(this);
                var data: any[][] = [];
                var parents: Element[] = this.getParentElements();
                
                for (var i = 0; i < parents.length; i++) {
                    var elmt: Element = parents[i];
                    //console.log("Parent: " + elmt.getName());
                    data = Tools.addNewHeaderRow(elmt.getMainValues(), data, this.m_data);
                    //console.log(data);

                }

                //Add original values to the table
                for (var i = Tools.numOfHeaderRows(this.m_data); i < p_originalData.length; i++) {
                    // //console.log("i: " + i);
                    // //console.log("new data: " + originalData[i]);
                    data.push(p_originalData[i]);
                }
                //console.log(data);
                return data;

            }

            


            
            
            
            

            

	        //returns the different variables (conditions or choices) that belong to the element
            getMainValues(): any[]{
                //console.log(this.m_data);
                var row = [];
                var data = this.m_data;
                row.push(this.m_name);
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
                if (key >= this.m_connections.length)
                    return false;
                else {
                    this.m_connections.splice(key, 1);
                    this.m_model.deleteConnection(p_connID);
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
                return { posX: this.m_easelElmt.x, posY: this.m_easelElmt.y, elmtID: this.getID(), elmtName: this.getName(), elmtDesc: this.getDescription(), elmtType: this.getType(), elmtData: this.getData(), elmtWghtMthd: this.getMethod() };
            }

            fromJSON(p_jsonElmt: any): void {
                //console.log("element.fromJSON()");
                //console.log(p_jsonElmt);
                this.m_easelElmt.x = p_jsonElmt.posX;
                this.m_easelElmt.y = p_jsonElmt.posY;
                this.m_id = p_jsonElmt.elmtID;
                this.m_name = p_jsonElmt.elmtName;
                this.m_description = p_jsonElmt.elmtDesc;
                this.m_type = p_jsonElmt.elmtType;
                this.m_data = p_jsonElmt.elmtData;
                this.m_weightingMethod = p_jsonElmt.elmtWghtMthd;
                
            }
        }
    }
}