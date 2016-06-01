module Mareframe {
    export module DST {
        export class Model {
            private m_numOfIteraions:number = 10000;
            public m_bbnMode: boolean = false;
            private m_modelIdent: string = "temp";
            private m_elmtCounter: number = 0;
            private m_ConnCounter: number = 0;
            private m_elementArr: Element[] = [];
            private m_connectionArr: Connection[] = [];
            private m_modelName: string = "untitled";
            private m_modelPath: string = "./";
            private m_modelChanged: boolean = true;
            private m_dataMatrix: any[][] = [];
            private m_mainObjective: Element;
            private m_autoUpdate: boolean = false; //auto update is off by default
            constructor(p_bbnMode: boolean) {
                this.m_bbnMode = p_bbnMode;
                //this.m_bbnMode = true;
                this.createNewElement = this.createNewElement.bind(this);
                this.deleteElement = this.deleteElement.bind(this);
                console.log("model loaded")
                ////console.log(this);
                this.m_modelName = "untitled";
            };

            getmumOfIteraions(): number {
                return this.m_numOfIteraions;
            }
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
                            for (var i = elmt.getParentElements().length; i < elmt.getData().length; i++) {
                                dataStream += '<state id="' + elmt.getData(i, 0) + '" />\n';
                            }
                            if (elmt.getParentElements().length > 0) {
                                dataStream += '<parents>'
                                elmt.getParentElements().forEach(function (parElmt) {
                                    dataStream += parElmt.getID() + ' ';
                                });
                                dataStream = dataStream.slice(0, dataStream.length-1) + '</parents>\n';
                            }

                            console.log(elmt.getData());
                            dataStream += '<probabilities>'
                            for (var i = 1; i < elmt.getData(1).length; i++) {
                                for (var j = elmt.getParentElements().length; j < elmt.getData().length; j++)
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
                                    dataStream = dataStream.substring(0, dataStream.lastIndexOf(">") + 1) + parElmt.getID() + ' ' + dataStream.substring(dataStream.lastIndexOf(">") + 1);
                                });
                                dataStream = dataStream.slice(0, dataStream.length - 1) + '</parents>\n';
                            }
                            dataStream += '<utilities>'
                            for (var i = 1; i < elmt.getData(1).length; i++) {

                                dataStream += elmt.getData(elmt.getData().length - 1, i) + ' ';
                            }
                            dataStream = dataStream.slice(0, dataStream.length - 1) + '</utilities>\n';

                            dataStream += '</utility>\n';
                            break;
                        case 3:
                            dataStream += '<superValue id="' + elmt.getID() + '">\n';
                            if (elmt.getParentElements().length > 0) {
                                dataStream += '<parents>'
                                elmt.getParentElements().forEach(function (parElmt) {
                                    dataStream = dataStream.substring(0, dataStream.lastIndexOf(">") + 1) + parElmt.getID() + ' ' + dataStream.substring(dataStream.lastIndexOf(">") + 1);
                                });
                                dataStream = dataStream.slice(0, dataStream.length - 1) + '</parents>\n';
                            }
                            dataStream += '<utilities>'
                            for (var i = 1; i < elmt.getData(0).length; i++) {

                                dataStream += elmt.getData(elmt.getData().length - 1, i) + ' ';
                            }
                            dataStream = dataStream.slice(0, dataStream.length - 1) + '</utilities>\n';

                            dataStream += '</superValue>\n';
                            break;
                    }
                    
                });

                dataStream += '</nodes>\n<extensions>\n<genie version="1.0" name="' + this.getName() + '" faultnameformat="nodestate"><comment></comment>\n'
                this.m_elementArr.forEach(function (elmt: Element) {
                    dataStream += '<node id="' + elmt.getID() + '">\n' +
                    '<name>' + elmt.getName() + '</name>\n' +
                    '<interior color="aaaaaa" />\n' +
                    '<outline color="000080" />\n' +
                    '<font color="000000" name="Arial" size="8" />\n' +
                    '<position>' + (elmt.m_easelElmt.x-75) + ' ' + (elmt.m_easelElmt.y-15) + ' ' + (elmt.m_easelElmt.x+75) + ' ' + (elmt.m_easelElmt.y+15) + '</position>\n</node>\n';
                });
                dataStream+='</genie>\n</extensions>\n</smile>\n'
                return dataStream;
            }

            private getMCADataStream(): string {
                return JSON.stringify(this);
            }
            closeDown() {
               $(".removebleDialog").remove(); //Removes all created dialogs
            }
            update() {
                var m: Model = this;
                console.log("updating model");
                this.m_elementArr.forEach(function (p_elmt: Element) {
                    console.log(p_elmt.getID() + " has been updated: " + p_elmt.isUpdated());
                    if (!p_elmt.isUpdated()) {
                        p_elmt.update();
                    }

                });
                console.log("done updating first round");
               // if (this.getElmtsWithEvidence().length > 0) {
                    this.getElementArr().forEach(function (e) {//This is needed to make sure values and decisions are updated in the right order
                        if (e.getType() !== 0) {
                            e.setUpdated(false);
                        }
                });
                Tools.calcValueWithEvidence(this, this.m_numOfIteraions);
               // }
                    console.log("done updating with evidence");
                this.m_elementArr.forEach(function (p_elmt: Element) {
                    Tools.updateConcerningDecisions(p_elmt);
                    });
                console.log("done updating concerning decisions");
            }
            getIdent(): string {
                return this.m_modelIdent;
            }
            setAutoUpdate(p_bool: boolean): void {
                this.m_autoUpdate = p_bool;
            }
            getAutoUpdate(): boolean {
                return this.m_autoUpdate;
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
    	

                ////console.log(tempMatrix);
                //console.log("DataMatrix: " + this.m_dataMatrix);
                //console.log("numWeights: " + weightsArr.length);
                for (var i = 0; i < weightsArr.length; i++) {
                    //console.log("Elemet** " + this.getElement(this.m_dataMatrix[0][i + 1]).getData());
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
                        ////console.log(getValueFn(tempMatrix[j][i + 1] / currentMax, elmtData[1]/100, elmtData[2]/100));
                        ////console.log(tempMatrix[j][i + 1] / currentMax);
                        tempMatrix[j][i + 1] *= weightsArr[i][1];
                        tempMatrix[j][i + 1] = (Math.round(1000 * tempMatrix[j][i + 1])) / 1000;
                    }

                }
                for (var i = 1; i < tempMatrix.length - 1; i++) {
                    //console.log("tmpMat" + tempMatrix);
                    tempMatrix[i][0] = this.getElement(tempMatrix[i][0]).getName();
                }

                //console.log("FinalScore: " + tempMatrix);
                return tempMatrix;
            }

            getWeightedData(p_elmt: Element, p_addHeader: boolean): any[][]{
                var tempMatrix = [];
                if (p_addHeader) {
                    tempMatrix.push(['string', 'number']);
                }
                console.log("DataMatrix: " + this.m_dataMatrix);
                switch (p_elmt.getType()) {
                    case 2: //scenario
                        console.log("type 2, scenario");
                        for (var i = 1; i < this.m_dataMatrix[0].length; i++) {
                            //console.log("
                            tempMatrix.push([this.m_dataMatrix[0][i], this.m_dataMatrix[p_elmt.getData(0)][i]]);
                            console.log("******TempMatrix: " + i + "   " + tempMatrix);
                        }
                        break;
                    case 0: //attribute
                        console.log("Type 0, attibute");
                        //set minimum and maximum values
                        var maxVal = p_elmt.getData(5);
                        //var maxVal = 100000;
                        var minVal = p_elmt.getData(4);
                        //var minVal = -100000;
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
                                //console.log("elmtData: " + p_elmt.getData());
                                //console.log("elmtData(1): " + p_elmt.getData(1));
                                //console.log("elmtData(2): " + p_elmt.getData(2));
                                //console.log("elmtData(3): " + p_elmt.getData(3));
                                //console.log("elmtData(0): " + p_elmt.getData(0));
                                //console.log("minvalue: " + minVal);
                                //console.log("maxValue: " + maxVal);
                                toAdd.push(Mareframe.DST.Tools.getValueFn(Math.abs(p_elmt.getData(3) -(this.m_dataMatrix[i][p_elmt.getData(0)] - minVal) / (maxVal - minVal)), Math.abs(p_elmt.getData(3) -p_elmt.getData(1) / 100), 1 - p_elmt.getData(2) / 100 ) );
                            }
                            ////console.log(elmt.getData()[1]);
                            tempMatrix.push(toAdd);
                            //console.log("******attrTempMatrix: " + i + "   " + tempMatrix);
                        }
                        break;
                    case 1: //sub-objective
                        console.log("Type 1, sub-objective");
                        var total = 0.0;
                        p_elmt.getData(1).forEach(function (val) { total += val; });
                        ////console.log(total + " : " + elmt.getName());
                        for (var i = 0; i < p_elmt.getData(0).length; i++) {
                            ////console.log(elmt.getData());
                            var tempEl = this.getConnection(p_elmt.getData(0,i)).getInputElement();

                            var tempArr = this.getWeightedData(tempEl, false);
                            ////console.log(tempArr);


                            var result = 0;
                            for (var j = 0; j < tempArr.length; j++) {

                                result += tempArr[j][1];

                            }
                            ////console.log(result + " " + elmt.getName()+"; "+tempArr+" "+tempEl.getName());
                            tempMatrix.push([tempEl.getName(), result * (p_elmt.getData(1, i) / total)]);
                            //console.log("******SubTempMatrix: " + i + "   " + tempMatrix);
                        }
                        break;
                }
                console.log("WeigthedData: " + tempMatrix);
                return tempMatrix;
            }

            createNewElement(p_type: number): Element {
                console.log("number of elements: " + this.m_elmtCounter);
                //This loop makes sure that no two elements have the same id
                do {
                    var name: string = "elmt" + this.m_elmtCounter;
                    this.m_elmtCounter++;
                }
                while (this.getElement(name) != undefined)
                var e = new Element(name, this, p_type);
                this.m_elementArr.push(e);
                switch (p_type) {
                    case 0:
                        e.setData([["state0", 0.5], ["state1", 0.5]]);
                        e.setValues(e.getData());
                        break;
                    case 1:
                        e.setData([["choice0"], ["choice1"]]);
                        e.setValues([["choice0",0], ["choice1",0]]);
                        break;
                    case 2:
                        e.setData([["Value", 0]]);
                        e.setValues([["Value", 0]]);
                        break;
                    case 3:
                        e.setData([]);
                        e.setValues([]);
                    default:
                        break;
                }
                
                return e;

            }
            getElement(p_elmtStringId: string): Element {
                if (p_elmtStringId === undefined) {
                    return undefined;
                }
                return this.m_elementArr[this.getObjectIndex(p_elmtStringId)];
            }
            private getObjectIndex(p_objectStringId: string): number {
            // console.log(" get object "  + p_objectStringId + " in list: "+ this.m_elementArr);
                var key = 0;
                if (p_objectStringId.substr(0, 4) === "elmt") {
                    this.m_elementArr.every(function (p_elmt) {
                        //console.log("comparing with : " + p_elmt.getID());
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
                    console.log(p_objectStringId + " not found");
                    throw DOMException.NOT_FOUND_ERR;
                }
                //console.log("returned key: " + key);
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
                    console.log("Deleting connection: " + p_connID + "   ----------------");
                    var inputElmt: Element = this.m_connectionArr[key].getInputElement();
                    var outputElmt: Element = this.m_connectionArr[key].getOutputElement();
                    var states:number = this.m_connectionArr[key].getInputElement().getData().length;
                    var data = this.m_connectionArr[key].getOutputElement().getData();
                    var dataIn = this.m_connectionArr[key].getInputElement().getData();
                    var removeHeader = this.m_connectionArr[key].getInputElement().getID();
                    
                    console.log("Remove header: " + removeHeader);
                    console.log("Original Data Out: " + data);
                    console.log("Original Data In: " + dataIn);
                    
                    var dims: number[] = [0, 0, 0];
                    data = Tools.removeHeaderRow(outputElmt, removeHeader, data);
                    //var splicePos = 1 + Math.floor((data[data.length - 1].length / states));
                    //console.log("states: " + states);
                    //console.log("splicepos: " + splicePos);
                    //for (var row = 0; row < data.length;row++) {
                    //    if(data[row].length-1 > splicePos)
                    //        data[row].splice(splicePos);
                    //}
                    //console.log("New data: " + data);
                    //console.log("ConnectionArr: " + this.m_connectionArr[key]);
                    this.m_connectionArr[key].getOutputElement().setData(data);
                    console.log("data : " + outputElmt.getData());
                    this.m_connectionArr.splice(key, 1);

                    //console.log(this.m_elementArr);
                    if (inputElmt.getType() === 1) {//If the input element is a dec all descendants of the output element need to be updated
                        outputElmt.getAllDescendants().forEach(function (e) {
                            console.log("descendant: " + e.getName());
                            e.setUpdated(false);
                        });
                    }
                    return true;
                }
            }
            setName(name: string): void {
                this.m_modelName = name;
            }
            getName(): string {
                return this.m_modelName;
            }
            setNumOfIterations(n: number): void {
                this.m_numOfIteraions = n;
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
               // console.log("from json: p_jsonObject = " + p_jsonObject);
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
                this.m_elmtCounter = 0;
                
                var maxX = 0;
                var maxY = 0;
                for (var i = 0; i < p_jsonObject.elements.length; i++) {
                    var JsonElmt = p_jsonObject.elements[i];
                    var elmt = this.createNewElement(undefined)
                    //if (JsonElmt.posX > maxX)
                    //    maxX = JsonElmt.posX;

                    //if (JsonElmt.posY > maxY)
                    //    maxY = JsonElmt.posY;
                    elmt.fromJSON(JsonElmt);
                  //  console.log("created from json: " + elmt.getName());
                   // console.log("position " + elmt.m_easelElmt.y);
                }

                for (var i = 0; i < p_jsonObject.connections.length; i++)
                {
                    var conn = p_jsonObject.connections[i];
                    var inpt = this.getElement(conn.connInput);
                    var c = this.createNewConnection(inpt, this.getElement(conn.connOutput));
                    //this.m_counter++;
                    c.fromJSON(conn);
                    this.addConnection(c);
                }
                if (!this.m_bbnMode)
                    this.m_mainObjective = this.getElement(p_jsonObject.mainObj);

               /* for (var i = 0; i < p_jsonObject.elements.length; i++) {
                    if (this.m_bbnMode)
                        //console.log("from json: " + elmt.getName());
                        //console.log(this.m_elementArr);
                        //elmt.update();
                        
                        this.m_elementArr[i].update();
                }*/
                if (this.m_bbnMode) {
                    this.update();
                }
                //h.gui.setSize(maxX + 80, maxY + 20);

                //h.gui.updateTable(this.dataMatrix);
                //console.log("model.fromJSON()");
                //console.log(this);
                console.log("finnished loading from json");
            }

            createNewConnection(p_inputElmt: Element, p_outputElmt: Element): Connection {
                var c = new Connection(p_inputElmt, p_outputElmt, "conn" + this.m_ConnCounter,this.m_bbnMode);
                this.m_ConnCounter++;
                return c;


            }

            setDecision(p_elmt: Element, p_decisNumb: number): void {
                if (p_elmt.getDecision() == p_decisNumb) {
                    //console.log("unsetting decision");
                    p_elmt.setDecision(undefined)
                }
                else {
                    p_elmt.setDecision(p_decisNumb);
                }
                this.getElementArr().forEach(function (e) {
                    e.setUpdated(false);
                });/*
                This is commented out because createSubMatrix did not work properly when only updating some of the elements.
                This solution is not optimal, but it forces the program to update every element without looking at decisions first and then focusing on decision.
                The problem occured when first one decision was set and the model was updated and then another decision was set. 
                elmt.getAllDescendants().forEach(function (e: Element) {
                    e.setUpdated(false);
                    console.log(e.getName() + " not updated");
                });*/
                //console.log(elmt.getName() + " wants to set decision number " + p_decisNumb);
            }
            setEvidence(p_elmt: Element, p_evidenceNumber: number): void {
                console.log("setting evidence no. " + p_evidenceNumber + " previous evidence: " + p_elmt.getEvidence());
                if (p_elmt.getEvidence() == p_evidenceNumber) {
                    console.log("unsetting evidence");
                    p_elmt.setEvidence(undefined)
                }
                else {
                    p_elmt.setEvidence(p_evidenceNumber);
                }
                this.getElementArr().forEach(function (e) {
                    e.setUpdated(false);
                });
            }
            getElmtsWithEvidence() {
                var elements = [];
                this.getElementArr().forEach(function (e) {
                    if (e.getType() === 0 && e.getEvidence() !== undefined) {
                        elements.push(e);
                    }
                });
                return elements;
            }
        }


    }
}