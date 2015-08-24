/// <reference path="Declarations\easeljs.d.ts" />
/// <reference path="Declarations\createjs-lib.d.ts" />


module Mareframe {
    export module DST {
        export class GUIHandler {
            public m_dialog: Dialog = null;
            public m_editorMode: boolean = false;
            private m_mcaStage: createjs.Stage = new createjs.Stage("MCATool");
            private m_dialogs: Dialog[] = [];
            private m_mcaStageCanvas: HTMLCanvasElement = <HTMLCanvasElement> this.m_mcaStage.canvas;
            private m_mcaSizeX: number = 800;
            private m_mcaSizeY: number = 480;
            private m_mcaContainer: createjs.Container = new createjs.Container()
            private m_googleColors: string[] = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"];
            private m_mcaBackground: createjs.Shape = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.m_mcaSizeX, this.m_mcaSizeY));
            
            public m_updateMCAStage: boolean = true;
            private m_chartsLoaded: boolean = false;
            private m_oldX: number = 0;
            private m_oldY: number = 0;
            private m_selectedItems: any[] = [];
            
            private m_elementColors: string[][] = [["#efefff", "#15729b", "#dfdfff"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#fff6e0", "#f6a604", "#fef4c6"], ["#efffef", "#2fc433", "#dfffdf"]];
            private m_model: Model;

            
            constructor(p_model: Model) {

                if (p_model.m_bbnMode) {
                    $("#detailsDialog").on('dialogclose', function (event) {
                        $("#valuesTable_div").hide();
                    });
                }



                this.pressMove = this.pressMove.bind(this);
                this.mouseDown = this.mouseDown.bind(this);
                this.dblClick = this.dblClick.bind(this);
                this.clearSelection = this.clearSelection.bind(this);
                this.tick = this.tick.bind(this);
                this.importStage = this.importStage.bind(this);
                this.updateTable = this.updateTable.bind(this);
                this.connectTo = this.connectTo.bind(this);
                this.updateConnection = this.updateConnection.bind(this);
                this.createNewElement = this.createNewElement.bind(this);
                this.deleteElement = this.deleteElement.bind(this);
                this.m_model = p_model;

                this.m_mcaBackground.name = "hitarea";
                if (this.m_editorMode) {
                    this.m_mcaBackground.addEventListener("pressmove", this.pressMove);
                    $(".header-bar").show();
                    $("#editableDataTable").on("focusout", function () {
                        //TODO: needs work
                    });
                } else {
                    $(".header-bar").hide();
                    $("#reset").hide();
                }
                this.m_mcaBackground.addEventListener("mousedown", this.mouseDown);

                $("#newElmt").on("click", this.createNewElement);
                $("#delete").on("click", this.deleteElement);

                this.m_mcaStage.addChild(this.m_mcaBackground);
                this.m_mcaStage.addChild(this.m_mcaContainer);
                
                createjs.Ticker.addEventListener("tick", this.tick);
                createjs.Ticker.setFPS(60);

            }

            setSize(p_width: number, p_height: number): void {
                this.m_mcaStageCanvas.height = p_height;
                this.m_mcaStageCanvas.width = p_width;
            }

            importStage(): void {
                console.log("importing stage");
                this.m_mcaContainer.removeAllChildren();
                var elmts = this.m_model.getElementArr();
                var conns = this.m_model.getConnectionArr();
                for (var i = 0; i < elmts.length; i++) {
                    this.addElementToStage(elmts[i]);
                }
                for (var i = 0; i < conns.length; i++) {
                    this.addConnectionToStage(conns[i]);
                }
                this.updateTable(this.m_model.getDataMatrix());
                if (!this.m_model.m_bbnMode)
                    this.updateFinalScores();

                this.m_updateMCAStage = true


            };

            updateElement(p_elmt: Element) {
                p_elmt.m_easelElmt.removeAllChildren();

                var shape = new createjs.Shape();
                shape.graphics.f(this.m_elementColors[p_elmt.getType()][0]).s(this.m_elementColors[p_elmt.getType()][1]);

                var elmtShapeType: number = 2;
                if (this.m_model.m_bbnMode)
                    elmtShapeType = p_elmt.getType();

                switch (elmtShapeType) {
                    case 0:
                        //chance
                        shape.graphics.drawEllipse(0, 0, 150, 30);
                        break;
                    case 1:
                        //decision
                        shape.graphics.drawRect(0, 0, 150, 30);
                        break;
                    case 2:
                        //Value
                        shape.graphics.drawRoundRect(0, 0, 150, 30, 4);
                    default:
                        break;

                }


                var label = new createjs.Text(p_elmt.getName().substr(0, 24), "1em trebuchet", this.m_elementColors[p_elmt.getType()][1]);
                label.textAlign = "center";
                label.textBaseline = "middle";
                label.maxWidth = 145;
                label.x = 75;
                label.y = 15;

                p_elmt.m_easelElmt.addChild(shape);
                p_elmt.m_easelElmt.addChild(label);
            }

            updateEditorMode() {
                if (this.m_editorMode) {
                    $(".header-bar").show();
                    $("#reset").show();
                    this.m_mcaBackground.addEventListener("pressmove", this.pressMove);
                } else {
                    $(".header-bar").hide();
                    $("#reset").hide();
                    $("#cnctTool").prop("checked", false);
                    this.m_mcaBackground.removeEventListener("pressmove", this.pressMove);
                }
                var elementArr = this.m_model.getElementArr();
                for (var i = 0; i < elementArr.length; i++) {
                    if (this.m_editorMode) {
                        elementArr[i].m_easelElmt.addEventListener("pressmove", this.pressMove);
                    } else {
                        elementArr[i].m_easelElmt.removeEventListener("pressmove", this.pressMove);
                    }
                }
            }


            setEditorMode = function (cb) {
                this.m_editorMode = cb.checked;
                this.updateEditorMode();
                console.log("editormode: " + this.m_editorMode);
            }

            createNewElement(p_evt: Event) {
                var elmt = this.m_model.createNewElement()
                this.addElementToStage(elmt);
            }

            deleteElement(p_evt: Event) {
            }

            addElementToStage(p_elmt: Element) {
                this.updateElement(p_elmt);


                p_elmt.m_easelElmt.regX = 75;
                p_elmt.m_easelElmt.regY = 15;
                if (p_elmt.m_easelElmt.x <= 0 && p_elmt.m_easelElmt.y <= 0) {
                    p_elmt.m_easelElmt.x = 225;
                    p_elmt.m_easelElmt.y = 125;
                }
                if (this.m_editorMode) {
                    p_elmt.m_easelElmt.addEventListener("pressmove", this.pressMove);
                }
                p_elmt.m_easelElmt.addEventListener("mousedown", this.mouseDown);
                p_elmt.m_easelElmt.on("dblclick", this.dblClick);
                p_elmt.m_easelElmt.mouseChildren = false;
                p_elmt.m_easelElmt.name = p_elmt.getID();

                this.m_mcaContainer.addChild(p_elmt.m_easelElmt);
                this.m_updateMCAStage = true;
            }

            private dblClick(p_evt: createjs.MouseEvent) {
                //console.log(this);
                //$("#debug").text("D#" + this.m_model.getElement(p_evt.target.name).getID());
                
                if (p_evt.target.name.substr(0, 4) === "elmt") {
                    
                    this.populateElmtDetails(this.m_model.getElement(p_evt.target.name));
                   
                    
                    /*
                    if (this.m_editorMode && this.m_model.m_bbnMode) {
                        $("#submit").show();
                    } else {
                        $("#submit").hide();
                    }*/
                    //$("#detailsDialog").dialog("open");
                
                    //$("#" + this.m_model.getElement(p_evt.target.name).getName()).text("open");
                 

                }
                else {
                    $("#debug").text("what");
                }
            }

            //private createPopUp(

            populateElmtDetails(p_elmt: Element): void {
                
                if ($("#Dialog" + p_elmt.getID()).length == 0) {
                    this.m_dialogs.push(new Dialog(this.m_model, p_elmt));
                    this.m_updateMCAStage = true;
                }
                    else {
                    $("#Dialog" + p_elmt.getID()).dialog("open");
                }
            };

            addEditFunction() {

                $(function () {
                    $("td").dblclick(function () {
                        var originalValue = $(this).text();
                        $(this).addClass("editable");
                        $(this).html("<input type='text' value='" + originalValue + "' />");
                        $(this).children().first().focus();
                        $(this).children().first().keypress(function (e) {
                            if (e.which == 13) {
                                var newText = $(this).val();
                                if (isNaN(newText)) {
                                    alert("Value must be a number");
                                    //TODO find better solution than alert

                                    $(this).parent().text(originalValue);
                                } else {
                                    $(this).parent().text(newText);
                                }

                                $(this).parent().removeClass("editable");
                            }
                        });
                        $(this).children().first().blur(function () {
                            var newText = $(this).val();
                            $(this).parent().text(newText);
                            if (isNaN(newText)) {
                                alert("Value must be a number");
                                //TODO find better solution than alert

                                $(this).parent().text(originalValue);
                            } else {
                                $(this).parent().text(newText);
                            }
                            $(this).parent().removeClass("editable");
                        });
                    });
                    //TODO Prevent user from editing the top rows. That data should come from the child elements
                    $("th").dblclick(function () {
                        var originalText = $(this).text();
                        $(this).addClass("editable");
                        $(this).html("<input type='text' value='" + originalText + "' />");
                        $(this).children().first().focus();
                        $(this).children().first().keypress(function (e) {
                            if (e.which == 13) {
                                var newText = $(this).val();
                                $(this).parent().text(newText);
                                $(this).parent().removeClass("editable");
                            }
                        });
                        $(this).children().first().blur(function () {
                            var newText = $(this).val();
                            $(this).parent().text(newText);
                            $(this).parent().removeClass("editable");
                        });
                    });

                });

            };

            showValues() {
                var elmt: Element = $("#detailsDialog").data("element");
                $("#valuesTable_div").html(Tools.htmlTableFromArray("Values", elmt.getData()));
                $("#valuesTable_div").show();
                $("#values").prop("disabled", true);
            }

            saveDefTable() {
                var elmt: Element = $("#detailsDialog").data("element");
                var table = $("#defTable_div");
                var newTable = [];
                var newRow = [];
                table.find("tr").each(function () {
                    $(this).find("th,td").each(function () {
                        // console.log("text to be added: " + $(this).text());
                        // console.log("does it exsist: " + $.inArray($(this).text(), newRow) === -1)
                        var value: any = $(this).text();
                        //Don't add the same value twice if it is in one of the header cells
                        //(Better solution: check before the text is saved in the cell)
                        if ($.inArray(value, newRow) === -1 || !isNaN(value)) {	
                            //Convert to number
                            if (!isNaN(value)) {
                                value = Number(value);
                            }
                            newRow.push(value);
                        }
                    });
                    newTable.push(newRow);
                    newRow = [];
                });
                //Remove header row with title the "Definition"
                newTable.splice(0, 1);
                if (!this.columnSumsAreValid(newTable, Tools.numOfHeaderRows(elmt.getData())) && elmt.getType() == 0) {
                    //Should also show which row is unvalid (maybe right after the user has changed the value)
                    alert("The values in each column must add up to 1");
                } else {
                    elmt.setData(newTable);
                    elmt.setUpdated(false);
                    //TODO set all elements which are affected by this change to updated = false
                }
                console.log("new table after submit:");
                console.log(elmt.getData());
            }

            columnSumsAreValid(data, numOfHeaderRows) {
                var sum = 0;
                for (var i = 1; i < data[data.length - 1].length; i++) {
                    for (var j = numOfHeaderRows; j < data.length; j++) {
                        sum += parseFloat(data[j][i]);
                    }
                    if (sum < 0.9999 || sum > 1.0001) {
                        return false;
                    }
                    sum = 0;
                }
                return true;
            }

            updateFinalScores(): void {
                console.log("updating final scores");
                var data = google.visualization.arrayToDataTable(this.m_model.getFinalScore());
                data.removeRow(data.getNumberOfRows() - 1);
                //this.m_finalScoreChart.draw(data, this.m_finalScoreChartOptions);
                //this.m_dialog.m_finalScoreChart.draw(data, this.m_dialog.m_finalScoreChartOptions);
            }

            updateTable(p_matrix: any[][]): void {
                var tableHTML = "";

                var topRow = true;
                for (var j = 0; j < p_matrix.length; j++) {
                    var row: any[] = p_matrix[j];

                    tableHTML = tableHTML + "<tr style=\"border:1px solid black;height:64px\">";
                    for (var i = 1; i < row.length; i++) {
                        if (topRow) {
                            tableHTML = tableHTML + "<td contenteditable=true style=\"padding-right:10px;padding-left:5px;text-align:center;vertical-align:middle\">" + this.m_model.getElement(row[i]).getName() + "</td>";
                        }
                        else {
                            tableHTML = tableHTML + "<td contenteditable=true style=\"padding-right:10px;padding-left:5px;text-align:center;vertical-align:middle\">" + row[i] + "</td>";
                        }
                    }
                    tableHTML = tableHTML + "</tr>";
                    topRow = false;
                }


                $("#editableDataTable").html(tableHTML);

                console.log("original datamatrix");
                console.log(this.m_model.getDataMatrix());
            }

            private mouseDown(p_evt: createjs.MouseEvent): void {
                //console.log("mouse down at: ("+e.stageX+","+e.stageY+")");
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                //console.log("cnctool options: "+$("#cnctTool").button("option","checked"));
                if (p_evt.target.name.substr(0, 4) === "elmt") {
                    var cnctChkbox: HTMLInputElement = <HTMLInputElement>document.getElementById("cnctTool")
                    if (cnctChkbox.checked) //check if connect tool is enabled
                    {
                        console.log("cnctTool enabled");
                        this.connectTo(p_evt);
                    } else {
                        this.select(p_evt);
                    }
                } else {
                    this.clearSelection();
                }
            }

            select(p_evt: createjs.MouseEvent): void {
                //console.log("ctrl key: " + e.nativeEvent.ctrlKey);
                if (!p_evt.nativeEvent.ctrlKey && this.m_selectedItems.indexOf(p_evt.target) === -1) {
                    this.clearSelection();
                }
                //console.log("adding to selection");
                this.addToSelection(p_evt.target);
            }

            private pressMove(p_evt: createjs.MouseEvent): void {
                //console.log("press move");

                if (p_evt.target.name === "hitarea") {
                    //console.log("panning");
                    this.m_mcaContainer.x += p_evt.stageX - this.m_oldX;
                    this.m_mcaContainer.y += p_evt.stageY - this.m_oldY;
                } else if (p_evt.target.name.substr(0, 4) === "elmt") {
                    for (var i = 0; i < this.m_selectedItems.length; i++) {
                        var elmt = this.m_selectedItems[i];

                        elmt.x += p_evt.stageX - this.m_oldX;
                        elmt.y += p_evt.stageY - this.m_oldY;
                        for (var j = 0; j < this.m_model.getElement(elmt.name).getConnections().length; j++) {
                            var c = this.m_model.getElement(elmt.name).getConnections()[j];

                            this.updateConnection(c);
                        }
                    }

                }
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                this.m_updateMCAStage = true;
            }

            private tick(): void {
                //this.m_updateMCAStage = true;
                if (this.m_updateMCAStage) {
                    console.log("tick tick");
                    this.m_updateMCAStage = false;

                    this.m_mcaStage.update();
                    console.log("tick tick22");
                }

                if (this.m_dialogs != null) {

                    for (var i in this.m_dialogs) {
                        if (this.m_dialogs[i].getReadyToUpdate()) {
                            this.m_dialogs[i].update();
                            this.m_dialogs[i].setReadyToUpdate(false);
                        }
                    }
                }
            }

            clear(): void {
                this.m_mcaContainer.removeAllChildren();
                this.m_updateMCAStage = true;
            }


            connectTo(p_evt: createjs.MouseEvent): void {
                var elmtIdent = p_evt.target.name;
                var connected = false;
                
                for (var i = 0; i < this.m_selectedItems.length; i++) {
                    var e = this.m_selectedItems[i];
                    if (e.name.substr(0, 4) === "elmt" && e.name !== elmtIdent) {
                        var outputElmt: Element = this.m_model.getElement(elmtIdent);
                        var c = this.m_model.createNewConnection(this.m_model.getElement(e.name), outputElmt);
                        
                        if (this.m_model.addConnection(c)) {
                            this.addConnectionToStage(c);
                            connected = true;
                        }
                        if (outputElmt.getType() !== 1 && this.m_model.m_bbnMode) {
                            outputElmt.updateData();
                        }
                    }
                }
                if (!connected) {
                    this.select(p_evt);
                }
                //this.select(elmtIdent);
            }

            addConnectionToStage(p_connection: Connection): void {
                var line = new createjs.Graphics().beginStroke(p_connection.getColor()).mt(p_connection.getInputElement().m_easelElmt.x, p_connection.getInputElement().m_easelElmt.y).lt(p_connection.getOutputElement().m_easelElmt.x, p_connection.getOutputElement().m_easelElmt.y);
                var conn = new createjs.Shape(line);
                var arrow = new createjs.Graphics().beginFill(p_connection.getColor()).mt(-5, 0).lt(5, 5).lt(5, -5).cp();
                var arrowCont = new createjs.Shape(arrow);
                var cont = new createjs.Container();

                arrowCont.x = ((p_connection.getInputElement().m_easelElmt.x - p_connection.getOutputElement().m_easelElmt.x) / 2) + p_connection.getOutputElement().m_easelElmt.x;
                arrowCont.y = ((p_connection.getInputElement().m_easelElmt.y - p_connection.getOutputElement().m_easelElmt.y) / 2) + p_connection.getOutputElement().m_easelElmt.y;
                arrowCont.rotation = (180 / Math.PI) * Math.atan((p_connection.getInputElement().m_easelElmt.y - p_connection.getOutputElement().m_easelElmt.y) / (p_connection.getInputElement().m_easelElmt.x - p_connection.getOutputElement().m_easelElmt.x));
                if (p_connection.getInputElement().m_easelElmt.x < p_connection.getOutputElement().m_easelElmt.x) {
                    arrowCont.rotation = 180 + arrowCont.rotation;
                }
                //cont.hitArea = new createjs.Container()
                //cont.hitArea.add    new createjs.Graphics().setStrokeStyle(10).beginStroke("#0f0f0f").mt(c.getInputElement().easelElmt.x, c.getInputElement().easelElmt.y).lt(c.getOutputElement().easelElmt.x, c.getOutputElement().easelElmt.y);
                cont.name = p_connection.getID();
                //conn.addEventListener("pressmove", pressMove);
                //cont.addEventListener("mousedown", mouseDown);
                cont.addChild(arrowCont);
                cont.addChild(conn);


                this.m_mcaContainer.addChildAt(cont, 0);
                p_connection.m_easelElmt = cont;
                this.m_updateMCAStage = true;

            }

            updateConnection(p_connection: Connection): void {
                //stage.removeChild(c.easelElmt);
                var temp: createjs.Shape = <createjs.Shape>p_connection.m_easelElmt.getChildAt(1);
                temp.graphics.clear().beginStroke(p_connection.getColor()).mt(p_connection.getInputElement().m_easelElmt.x, p_connection.getInputElement().m_easelElmt.y).lt(p_connection.getOutputElement().m_easelElmt.x, p_connection.getOutputElement().m_easelElmt.y);
                p_connection.m_easelElmt.getChildAt(0).x = ((p_connection.getInputElement().m_easelElmt.x - p_connection.getOutputElement().m_easelElmt.x) / 2) + p_connection.getOutputElement().m_easelElmt.x;
                p_connection.m_easelElmt.getChildAt(0).y = ((p_connection.getInputElement().m_easelElmt.y - p_connection.getOutputElement().m_easelElmt.y) / 2) + p_connection.getOutputElement().m_easelElmt.y;
                p_connection.m_easelElmt.getChildAt(0).rotation = (180 / Math.PI) * Math.atan((p_connection.getInputElement().m_easelElmt.y - p_connection.getOutputElement().m_easelElmt.y) / (p_connection.getInputElement().m_easelElmt.x - p_connection.getOutputElement().m_easelElmt.x));
                if (p_connection.getInputElement().m_easelElmt.x < p_connection.getOutputElement().m_easelElmt.x) {
                    p_connection.m_easelElmt.getChildAt(0).rotation = 180 + p_connection.m_easelElmt.getChildAt(0).rotation;
                }
                //stage.addChildAt(c.easelElmt, 0);
                //update = true;
            }


            addToSelection(p_easelElmt: createjs.Container): void {
                if (this.m_selectedItems.indexOf(p_easelElmt) === -1 && p_easelElmt.name.substr(0, 4) === "elmt") {
                    this.m_selectedItems.push(p_easelElmt);
                    var elmtType = this.m_model.getElement(p_easelElmt.name).getType();
                    //console.log(e);
                    var shape: createjs.Shape = <createjs.Shape>p_easelElmt.getChildAt(0);
                    shape.graphics.clear().f(this.m_elementColors[elmtType][2]).s(this.m_elementColors[elmtType][1]);

                    var elmtShapeType: number = 2;
                    if (this.m_model.m_bbnMode)
                        elmtShapeType = elmtType;

                    switch (elmtShapeType) {
                        case 0:
                            //chance
                            shape.graphics.drawEllipse(0, 0, 150, 30);
                            break;
                        case 1:
                            //decision
                            shape.graphics.drawRect(0, 0, 150, 30);
                            break;
                        case 2:
                            //Value
                            shape.graphics.drawRoundRect(0, 0, 150, 30, 4);
                        default:
                            break;
                    }

                    this.m_updateMCAStage = true;
                }
            }

            setSelection(p_easelElmt: createjs.Container): void {
                this.clearSelection();
                this.addToSelection(p_easelElmt);
            }

            getSelected(): any[] {
                return this.m_selectedItems;
            }

            clearSelection(): void {
                for (var i = 0; i < this.m_selectedItems.length; i++) {
                    var easelElmt = this.m_selectedItems[i];
                    var elmtType = this.m_model.getElement(easelElmt.name).getType();
                    var shape = easelElmt.getChildAt(0);
                    shape.graphics.clear().f(this.m_elementColors[elmtType][0]).s(this.m_elementColors[elmtType][1]);

                    var elmtShapeType: number = 2;
                    if (this.m_model.m_bbnMode)
                        elmtShapeType = elmtType;

                    switch (elmtShapeType) {
                        case 0:
                            //chance
                            shape.graphics.drawEllipse(0, 0, 150, 30);
                            break;
                        case 1:
                            //decision
                            shape.graphics.drawRect(0, 0, 150, 30);
                            break;
                        case 2:
                            //Value
                            shape.graphics.drawRoundRect(0, 0, 150, 30, 4);
                        default:
                            break;

                    }
                    this.m_selectedItems = [];
                    this.m_updateMCAStage = true;
                }
            }

            
        }

    }
}