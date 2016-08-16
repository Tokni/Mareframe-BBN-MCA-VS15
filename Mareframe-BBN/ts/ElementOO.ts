
module Mareframe {
    export module DST {
        export interface ElementOO {
            getName(): string;
            setName(p_name): void;
            getID(): string;
            setID(p_id): void;
            getDescription(): string;
            setDescription(p_description): void;
            getUserDescription(): string;
            setUserDescription(p_userDescription): void;
            getParentElements(): ElementOO[];
            isParentOf(e: ElementOO): boolean;
            isChildOf(e: ElementOO): boolean;
            getChildrenElements(): ElementOO[];
            deleteConnection(cid: string): boolean;
            //deleteConnection(c: Connection): boolean;
            //deleteConnection(c: any): boolean;
            deleteAllConnections();
            addConnection(c: Connection);
            getConnectionFrom(e: ElementOO): Connection;
            getConnections(): Connection[];

        }

        export class ElementOOBase implements ElementOO {
            private m_name: string;
            private m_id: string;
            private m_description: string;
            private m_userDescription: string;
            private m_connections: Connection[] = [];
            private m_easelElmt: createjs.Container;

            constructor(p_name: string) {
                this.m_name = p_name;
            }
            getName(): string {
                return this.m_name;
            }
            setName(p_name) {
                this.m_name = p_name;
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
            getParentElements(): ElementOO[] {
                var elmt = this;
                var parents = [];
                this.m_connections.forEach(function (c) {
                    if (c.getOutputElement().getID() === elmt.getID()) {
                        parents.push(c.getInputElement());
                    }
                })
                //////console.log(elmt.getName() + " parents: " + parents);
                return parents;
            }
            isParentOf(p_elmt: ElementOO): boolean {
                var retBool: boolean = false;

                for (var e in this.getChildrenElements()) {
                    ////console.log("Element: " + p_elmt.getID() + "   ChildElement: " + this.getChildrenElements()[e].getID());
                    if (this.getChildrenElements()[e].getID() == p_elmt.getID()) {

                        retBool = true;
                        break;
                    }
                }
                //console.log(" Is Parent Of: " + retBool);
                return retBool;
            }
            isChildOf(p_elmt: ElementOO): boolean {
                var retBool: boolean = false;

                for (var e in this.getParentElements()) {
                    ////console.log("Element: " + p_elmt.getID() + "   ParentElement: " + this.getParentElements()[e].getID());
                    if (this.getParentElements()[e].getID() == p_elmt.getID()) {

                        retBool = true;
                        break;
                    }
                }
                //console.log(" Is Child Of: " + retBool);
                return retBool;
            }
            getChildrenElements(): ElementOO[] {
                var children: Element[] = [];
                var elmt = this;
                // //console.log(this.m_connections);
                this.m_connections.forEach(function (c) {
                    ////console.log("OutputElement: " + c.getOutputElement().getID());
                    ////console.log("this Element id: " + elmt.getID());
                    if (c.getInputElement().getID() === elmt.getID()) {
                        children.push(c.getOutputElement());
                    }
                })
                //   //console.log(this.getName() + " chilxxdren: " + children);
                return children;
            }
            deleteConnection(p_connID: string): boolean;
            deleteConnection(p_connID: Connection): boolean;
            deleteConnection(p_connID: any): boolean {
                alert("not imp fully imp yet (overload)");
                var key = 0;
                this.m_connections.every(function (p_conn: Connection) {
                    if (p_conn.getID() === p_connID)
                        return false;
                    else {
                        key++
                        return true;
                    }
                });
                //console.log("Key: " + key + "  Lengthm_conn: " + this.m_connections.length);
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
                    ////console.log("Total conections: " + this.m_model.getConnectionArr().length);
                    //this.deleteConnection(p_connID);
                    ////console.log("Total conections: " + this.m_model.getConnectionArr().length);

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
            getConnectionFrom(p_elmt: ElementOO): Connection {
                var retConnection: Connection = null;

                for (var index in this.m_connections) {
                    if (this.m_connections[index].getOutputElement().getID() == p_elmt.getID()) {
                        retConnection = this.m_connections[index];
                        break;
                    }
                }

                return retConnection;

            }

        }
        //export interface ElementOOMca extends ElementOO {

        //}

        export class ElementOOMca extends ElementOOBase {
            private m_weightingMetod: number;
            private m_swingWeightArr: any[] = [];
            private m_valueFunctionX: number;
            private m_valueFunctionY: number;
            private m_valueFunctionFlip: number;
            private m_dataMax: number;
            private m_dataArr: number[] = [];
            private m_dataUnit: string;
            private m_dataMin: number;
            private m_dataBaseLine: number;

            constructor(name: string, weightMethod: number) {
                super(name);
                this.m_weightingMetod = weightMethod;
            }
            getWeightingMetod(): number {
                return this.m_weightingMetod;
            }
            setweightingMethod(p_weight: number) {
                this.m_weightingMetod = p_weight;
            }
            getValueFunctionX(): number {
                return this.m_valueFunctionX;
            }
            setValueFunctionX(p_x: number) {
                this.m_valueFunctionX = p_x;
            }
            getValueFunctionY(): number {
                return this.m_valueFunctionY;
            }
            setValueFunctionY(p_y: number) {
                this.m_valueFunctionY = p_y;
            }
            getValueFunctionFlip(): number {
                return this.m_valueFunctionFlip;
            }
            setValueFunctionFlip(p_flip: number) {
                this.m_valueFunctionFlip = p_flip;
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
            getDataUnit(): string {
                return this.m_dataUnit;
            }
            setDataUnit(p_unit: string) {
                this.m_dataUnit = p_unit;
            }
            changeDataArrAtIndex(p_index: number, p_value: number) {
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

        }
        //export interface ElementOOBbn extends ElementOO {
        //    //m_data: any[][];
        //    //m_dataDim: number[];
        //    //m_minitableEaselElmt: createjs.Container;
    //getData(p_index ?: number, p_secondary ?: number): any;
    //setData(p_data: any, p_index ?: number, p_secondary ?: number): any;
        //}
        //export interface ElementOOMcaAttribute extends ElementOOMca {

        //}
        //export interface ElementOOMcaObjective extends ElementOOMca {

        //}
        //export interface ElementOOMcaAlternative extends ElementOOMca {

        //}
        //export interface ElementOOMcaGoal extends ElementOOMca {

        //}

    }

    
}
