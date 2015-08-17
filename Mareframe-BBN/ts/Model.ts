module Mareframe {
    export module DST {
        export class Model {
            public m_bbnMode: boolean = false;
            private m_counter: number = 0;
            private m_elementArr: Element[] = [];
            private m_connectionArr: Connection[] = [];
            private m_modelName: string = "untitled";
            private m_modelPath: string = "./";
            private m_modelChanged: boolean = true;
            private m_dataMatrix: any[][] = [];
            private m_mainObjective: Element;
            constructor(p_bbnMode: boolean) {
                this.m_bbnMode = p_bbnMode;
                this.createNewElement = this.createNewElement.bind(this);
                this.deleteElement = this.deleteElement.bind(this);
                console.log("model loaded")
                console.log(this);

            };

            update() {
                this.m_elementArr.forEach(function (p_elmt: Element) {
                    if (p_elmt.isUpdated()) {
                        p_elmt.update();
                    }
                });
            }

            setMainObj(p_goalElmt: Element): void {
                this.m_mainObjective = p_goalElmt;
            }
            getMainObj(): Element {
                return this.m_mainObjective;
            }
            getDataMatrix(p_index?: number, p_secondary?: number): any {
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
            }
            setDataMatrix(p_matrix: any[][]): void {
                this.m_dataMatrix = p_matrix;
            }

            getFinalScore(): number[][] {
                var tempMatrix = JSON.parse(JSON.stringify(this.m_dataMatrix));
                var weightsArr = Tools.getWeights(this.m_mainObjective, this);
    	

                //console.log(tempMatrix);
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
                        //console.log(getValueFn(tempMatrix[j][i + 1] / currentMax, elmtData[1]/100, elmtData[2]/100));
                        //console.log(tempMatrix[j][i + 1] / currentMax);
                        tempMatrix[j][i + 1] *= weightsArr[i][1];
                        tempMatrix[j][i + 1] = (Math.round(1000 * tempMatrix[j][i + 1])) / 1000;
                    }

                }
                for (var i = 1; i < tempMatrix.length - 1; i++) {
                    tempMatrix[i][0] = this.getElement(tempMatrix[i][0]).getName();
                }


                return tempMatrix;
            }

            getWeightedData(p_elmt: Element, p_addHeader: boolean): any[][]{
                var tempMatrix = [];
                if (p_addHeader) {
                    tempMatrix.push(['string', 'number']);
                }
                switch (p_elmt.getType()) {
                    case 2: //scenario
                        for (var i = 1; i < this.m_dataMatrix[0].length; i++) {
                            tempMatrix.push([this.m_dataMatrix[0][i], this.m_dataMatrix[p_elmt.getData(0)][i]]);
                        }
                        break;
                    case 0: //attribute
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
                            //console.log(elmt.getData()[1]);
                            tempMatrix.push(toAdd);
                        }
                        break;
                    case 1: //sub-objective
                        var total = 0.0;
                        p_elmt.getData(1).forEach(function (val) { total += val; });
                        //console.log(total + " : " + elmt.getName());
                        for (var i = 0; i < p_elmt.getData(0).length; i++) {
                            //console.log(elmt.getData());
                            var tempEl = this.getConnection(p_elmt.getData(0,i)).getInputElement();

                            var tempArr = this.getWeightedData(tempEl, false);
                            //console.log(tempArr);


                            var result = 0;
                            for (var j = 0; j < tempArr.length; j++) {

                                result += tempArr[j][1];

                            }
                            //console.log(result + " " + elmt.getName()+"; "+tempArr+" "+tempEl.getName());
                            tempMatrix.push([tempEl.getName(), result * (p_elmt.getData(1,i) / total)]);
                        }
                        break;
                }
                return tempMatrix;
            }

            createNewElement(): Element {
                console.log(this.m_counter);
                var e = new Element("elmt" + this.m_counter,this);
                this.m_counter++;
                this.m_elementArr.push(e);
                return e;

            }
            getElement(p_elmtStringId: string): Element {
                return this.m_elementArr[this.getObjectIndex(p_elmtStringId)];
            }
            private getObjectIndex(p_objectStringId: string): number {
                console.log(p_objectStringId);
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
                } else if (p_objectStringId.substr(0, 4) === "conn") {
                    this.m_connectionArr.every(function (p_conn) {
                        if (p_conn.getID() === p_objectStringId)
                            return false;
                        else {
                            key = key + 1;
                            return true;
                        }
                    });
                } else {
                    console.log(p_objectStringId);
                    throw DOMException.NOT_FOUND_ERR;
                }
                return key;
            }
            getConnectionArr(): Connection[] {
                return this.m_connectionArr;
            }
            getConnection(p_connectionStringId: string): Connection
            {
                return this.m_connectionArr[this.getObjectIndex(p_connectionStringId)];
            }
            getElementArr(): Element[] {
                return this.m_elementArr;
            }
            deleteElement(p_elementStringId): void {
            }
            setName(name: string): void {
                this.m_modelName = name;
            }
            getName(): string {
                return this.m_modelName;
            }
            addConnection(p_connection: Connection): boolean {
                var validConn = true;
                this.m_connectionArr.forEach(function (conn) {

                    if (conn === p_connection)
                    { validConn = false; }
                    else if ((p_connection.getOutputElement().getID() === conn.getOutputElement().getID() && p_connection.getInputElement().getID() === conn.getInputElement().getID()) || (p_connection.getOutputElement().getID() === conn.getInputElement().getID() && p_connection.getInputElement().getID() === conn.getOutputElement().getID())) {
                        validConn = false;
                    }
                });
                if (validConn) {
                    this.m_connectionArr.push(p_connection);

                    p_connection.getInputElement().addConnection(p_connection);
                    p_connection.getOutputElement().addConnection(p_connection);
                    return true;
                } else {
                    return false;
                }
            }
            toJSON(): any {
                return { elements: this.m_elementArr, connections: this.m_connectionArr, mdlName: this.m_modelName, mainObj: this.m_mainObjective, dataMat: this.m_dataMatrix };

            }
            fromJSON(p_jsonObject: any): void {

                $("#modelHeader").html(p_jsonObject.mdlName);
                $("#model_header").append(p_jsonObject.mdlName);
                console.log(p_jsonObject);
                this.m_modelName = p_jsonObject.mdlName;

                this.m_dataMatrix = p_jsonObject.dataMat;


                var maxX = 0;
                var maxY = 0;
                for (var i = 0; i < p_jsonObject.elements.length; i++)
                {
                    var JsonElmt = p_jsonObject.elements[i];
                    var elmt = this.createNewElement()
                    //if (JsonElmt.posX > maxX)
                    //    maxX = JsonElmt.posX;

                    //if (JsonElmt.posY > maxY)
                    //    maxY = JsonElmt.posY;
                    elmt.fromJSON(JsonElmt);
                    

                }

                for (var i = 0; i < p_jsonObject.connections.length; i++)
                {
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
                        elmt.update();
                }
                //h.gui.setSize(maxX + 80, maxY + 20);

                //h.gui.updateTable(this.dataMatrix);
                console.log("model.fromJSON()");
                console.log(this);
            }

            createNewConnection(p_inputElmt: Element, p_outputElmt: Element): Connection {
                var c = new Connection(p_inputElmt, p_outputElmt, this.m_bbnMode, "conn" + this.m_counter);
                return c;


            }




        }


    }
}