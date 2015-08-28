module Mareframe {
    export module DST {
        export class Model {
            public m_bbnMode: boolean = false;
            private m_modelIdent: string = "temp";
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


            saveModel(): string {
                var dataStream: string = "";

                if (this.m_bbnMode) {
                    dataStream = this.getBBNDataStream();
                } else {
                    dataStream = this.getMCADataStream();
                }




                return dataStream;
            }

            private getBBNDataStream(): string {
                var dataStream: string = '<?xml version="1.0" encoding="ISO-8859-1"?>\n<smile version="1.0" id="' + this.m_modelIdent + '" numsamples="1000">\n<nodes>\n';

                this.m_elementArr.forEach(function (elmt: Element) {
                    switch (elmt.getType()) {
                        case 0:
                            dataStream += '<cpt id="' + elmt.getID() + '">\n';
                            for (var i = 0; i < elmt.getData().length; i++) {
                                dataStream += '<state id="' + elmt.getData(1, i) + '" />\n';
                            }
                            if (elmt.getParentElements().length > 0) {
                                dataStream += '<parents>'
                                elmt.getParentElements().forEach(function (parElmt) {
                                    dataStream += parElmt.getID() + ' ';
                                });
                                dataStream = dataStream.slice(0, dataStream.length-1) + '</parents>\n';
                            }


                            dataStream += '<probabilities>'
                            for (var i = 1; i < elmt.getData(1).length; i++) {
                                for (var j = 0; j < elmt.getData().length; j++)
                                    dataStream += elmt.getData(j, i)+' ';
                            }
                            dataStream = dataStream.slice(0, dataStream.length-1) + '</probabilities>\n';

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
                                dataStream += '<parents>'
                                elmt.getParentElements().forEach(function (parElmt) {
                                    dataStream += parElmt.getID() + ' ';
                                });
                                dataStream = dataStream.slice(0, dataStream.length-1) + '</parents>\n';
                            }
                            dataStream += '<utilities>'
                            for (var i = 1; i < elmt.getData(1).length; i++) {

                                dataStream += elmt.getData(elmt.getData().length - 1, i) + ' ';
                            }
                            dataStream = dataStream.slice(0, dataStream.length) + '</utilities>\n';

                            dataStream += '</utility>\n';
                    }
                    
                });

                dataStream += '</nodes>\n<extensions>\n<genie version="1.0" name="' + this.getName() + '" faultnameformat="nodestate"><comment></comment>\n'
                this.m_elementArr.forEach(function (elmt: Element) {
                    dataStream += '<node id="' + elmt.getID() + '">\n' +
                    '<name>' + elmt.getName() + '</name>\n' +
                    '<interior color="aaaaaa" />\n' +
                    '<outline color="000080" />\n' +
                    '<font color="000000" name="Arial" size="8" />\n' +
                    '<position>' + (elmt.m_easelElmt.x-70) + ' ' + (elmt.m_easelElmt.y-30) + ' ' + (elmt.m_easelElmt.x+70) + ' ' + (elmt.m_easelElmt.y+30) + '</position>\n</node>\n';
                });
                dataStream+='</genie>\n</extensions>\n</smile>\n'
                return dataStream;
            }

            private getMCADataStream(): string {
                return JSON.stringify(this);
            }

            update() {
                this.m_elementArr.forEach(function (p_elmt: Element) {
                    if (p_elmt.isUpdated()) {
                        p_elmt.update();
                    }
                });
            }

            getIdent(): string {
                return this.m_modelIdent;
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

            getEaselElementsInBox(p_x1: number, p_y1: number, p_x2: number, p_y2: number): createjs.Container[]{

                var selection: createjs.Container[] = [];

                this.m_elementArr.forEach(function (elmt: Element) {
                    if (((elmt.m_easelElmt.x > p_x1 && elmt.m_easelElmt.x < p_x2) || (elmt.m_easelElmt.x < p_x1 && elmt.m_easelElmt.x > p_x2)) && ((elmt.m_easelElmt.y > p_y1 && elmt.m_easelElmt.y < p_y2) || (elmt.m_easelElmt.y < p_y1 && elmt.m_easelElmt.y > p_y2))) {
                        selection.push(elmt.m_easelElmt);
                    }
                });

                return selection;
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
            deleteElement(p_elementStringId:string): boolean {
                var key = 0;
                this.m_elementArr.every(function (p_elmt: Element) {
                    if (p_elmt.getID() === p_elementStringId)
                        return false;
                    else {
                        key++
                        return true;
                    }
                });
                if (key >= this.m_elementArr.length)
                    return false;
                else {
                    this.m_elementArr.splice(key, 1);
                    return true;
                }
            }

            deleteConnection(p_connID: string): boolean {
                var key = 0;
                this.m_connectionArr.every(function (p_conn: Connection) {
                    if (p_conn.getID() === p_connID)
                        return false;
                    else {
                        key++
                        return true;
                    }
                });
                if (key >= this.m_connectionArr.length)
                    return false;
                else {
                    this.m_connectionArr.splice(key, 1);
                    return true;
                }
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
                return { elements: this.m_elementArr, connections: this.m_connectionArr, mdlName: this.m_modelName, mainObj: this.m_mainObjective, dataMat: this.m_dataMatrix, mdlIdent: this.m_modelIdent };

            }
            fromJSON(p_jsonObject: any): void {

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
                    console.log("created from json: " + elmt.getName());
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
                        //console.log("from json: " + elmt.getName());
                        //console.log(this.m_elementArr);
                    //elmt.update();
                    this.m_elementArr[i].update();
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