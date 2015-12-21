

module Mareframe {
    export module DST {
        export class GUIHandler {
            private m_editorMode: boolean = false;
            private m_showDescription: boolean = true;
            private m_unsavedChanges: boolean = false;
            private m_fullscreen: boolean = false;
            private m_handler: Handler;
            private m_mcaStage: createjs.Stage = new createjs.Stage("MCATool");
            private m_valueFnStage: createjs.Stage = new createjs.Stage("valueFn_canvas");
            private m_controlP: createjs.Shape = new createjs.Shape();
            private m_valueFnContainer: createjs.Container = new createjs.Container();
            private m_valueFnLineCont: createjs.Container = new createjs.Container();
            private m_valueFnSize: number = 100;
            private m_mcaStageCanvas: HTMLCanvasElement = <HTMLCanvasElement> this.m_mcaStage.canvas;
            private m_selectionBox: createjs.Shape = new createjs.Shape();
            private m_mcaSizeX: number = $(window).width();
            private m_mcaSizeY: number = 480;
            private m_mcaContainer: createjs.Container = new createjs.Container()
            private m_googleColors: string[] = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"];
            private m_mcaBackground: createjs.Shape = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.m_mcaSizeX, this.m_mcaSizeY));
            private m_valFnBackground: createjs.Shape = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.m_valueFnSize, this.m_valueFnSize));
            public m_updateMCAStage: boolean = true;
            private m_chartsLoaded: boolean = false;
            private m_oldX: number = 0;
            private m_oldY: number = 0;
            private m_originalPressX: number = 0;
            private m_originalPressY: number = 0;
            private m_selectedItems: createjs.Container[] = [];
            private m_finalScoreChart: google.visualization.ColumnChart = new google.visualization.ColumnChart($("#finalScore_div").get(0));
            private m_finalScoreChartOptions: Object = {
                width: 1024,
                height: 400,
                vAxis: { minValue: 0 },
                legend: { position: 'top', maxLines: 3 },
                bar: { groupWidth: '75%' },
                animation: { duration: 500, easing: "out" },
                isStacked: true,
                focusTarget: 'category'

            };
            private m_elementColors: string[][] = [["#efefff", "#15729b", "#dfdfff"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#fff6e0", "#f6a604", "#fef4c6"], ["#efffef", "#2fc433", "#dfffdf"]];
            private m_model: Model;
            private m_trashBin: Element[] = [];

            constructor(p_model: Model, p_handler: Handler) {
                this.m_handler = p_handler;
                this.saveChanges = this.saveChanges.bind(this);

                var mareframeGUI = this;
                if (p_model.m_bbnMode) {
                        $("#detailsDialog").dialog({
                            beforeClose: function (event, ui) {
                                if (mareframeGUI.m_unsavedChanges) {
                                    console.log("unsaved changes");
                                    if (!confirm("You have unsaved changes. Pressing OK will close the window and discard all changes.")) {
                                        return false;
                                    }
                                    $("#valuesTable_div").show();
                                }
                            }
                        });
                    $("#detailsDialog").on('dialogclose', function (event) {
                        console.log("closing window");
                        $("#valuesTable_div").hide();
                    });
                    
                    $("#submit").on("click", this.saveChanges);
                    $("#values").on("click", this.showValues);
                    this.setEditorMode = this.setEditorMode.bind(this);
                    this.setAutoUpdate = this.setAutoUpdate.bind(this);
                    $("#MCADataTable").hide();

                    $("#model_description").text("This is the Mareframe BBN tool. You may doubleclick on each element below, to access the properties tables for that element.");
                    this.m_mcaStageCanvas.width = $(window).width();
                    
                }
                else {
                    $("#model_description").text("This is the Mareframe MCA tool. Data has been loaded into the table on the right. You may doubleclick on each element below, to access the properties panel for that element. If you doubleclick on one of the red or green elements, you may adjust the weights of it's child elements, and thus the data it points to. In the chart at the bottom, you will see the result of the analysis, with the tallest column being the highest scoring one.");

                }
<<<<<<< HEAD
<<<<<<< HEAD

                this.allModeltoConsole = this.allModeltoConsole.bind(this);
=======
                this.click = this.click.bind(this);
>>>>>>> 3789d3cf4acb8261c676001f5d9e5e30a96cbe33
=======

>>>>>>> parent of 3789d3c... updates in pressmove, mousedown and click
                this.pressMove = this.pressMove.bind(this);
                this.mouseDown = this.mouseDown.bind(this);
                this.dblClick = this.dblClick.bind(this);
                this.clearSelection = this.clearSelection.bind(this);
                this.tick = this.tick.bind(this);
                this.importStage = this.importStage.bind(this);
                this.moveValFnCP = this.moveValFnCP.bind(this);
                this.updateValFnCP = this.updateValFnCP.bind(this);
                this.updateDataTableDiv = this.updateDataTableDiv.bind(this);
                this.flipValFn = this.flipValFn.bind(this);
                this.linearizeValFn = this.linearizeValFn.bind(this);
                this.updateTable = this.updateTable.bind(this);
                this.connectTo = this.connectTo.bind(this);
                this.updateConnection = this.updateConnection.bind(this);
                this.createNewChance = this.createNewChance.bind(this);
                this.createNewDec = this.createNewDec.bind(this);
                this.createNewValue = this.createNewValue.bind(this);
                this.createNewElement = this.createNewElement.bind(this);
                this.deleteSelected = this.deleteSelected.bind(this);
                this.quickLoad = this.quickLoad.bind(this);
                this.updateModel = this.updateModel.bind(this);
                this.mouseUp = this.mouseUp.bind(this);
                this.selectAll = this.selectAll.bind(this);
                this.saveModel = this.saveModel.bind(this);
                this.loadModel = this.loadModel.bind(this);
                this.clickedDecision = this.clickedDecision.bind(this);
                this.fullscreen = this.fullscreen.bind(this);
                this.cnctStatus = this.cnctStatus.bind(this);

                this.m_model = p_model;
                this.m_mcaBackground.name = "hitarea";

                this.updateEditorMode();
                this.m_mcaBackground.addEventListener("mousedown", this.mouseDown);
                //this.m_mcaBackground.addEventListener("stagemouseup", this.mouseUp);

                this.m_controlP.graphics.f("#0615b4").s("#2045ff").rr(0, 0, 6, 6, 2);
                this.m_valFnBackground.addEventListener("pressmove", this.moveValFnCP);
                this.m_valFnBackground.addEventListener("mousedown", this.downValFnCP);
                this.m_mcaBackground.addEventListener("pressmove", this.pressMove);
                this.m_controlP.mouseChildren = false;
                $("#debugButton").on("click", this.allModeltoConsole);
                $("#valueFn_Linear").on("click", this.linearizeValFn);
                $("#valueFn_Flip").on("click", this.flipValFn);
                $("#newElmt").on("click", this.createNewElement);
                $("#newChance").on("click", this.createNewChance);
                $("#newDec").on("click", this.createNewDec);
                $("#newValue").on("click", this.createNewValue);
                $("#deleteElmt").on("click", this.deleteSelected);
                $("#editorMode").on("click", this.setEditorMode);
                $("#showDescription").on("click", this.setShowDescription);
                $("#autoUpdate").on("click", this.setAutoUpdate);
                $("#resetDcmt").on("click", this.quickLoad);
                $("#updateMdl").on("click", this.updateModel);
                $("#selectAllElmt").on("click", this.selectAll);
                $("#savDcmt").on("click", this.saveModel);
                $("#downloadLink").on("click", function (evt) {
                    $("#saveFile_div").hide();
                });
                $("#fullscreen").on("click", this.fullscreen);
                $("#cnctTool").on("click", this.cnctStatus);
                this.m_mcaBackground.addEventListener("pressup", this.mouseUp);

                $("#lodDcmt").on("change", this.loadModel);
                $("#lodDcmt").on("click", function () {
                    this.value = null;
                });


                this.m_mcaStage.addChild(this.m_mcaBackground);
                this.m_mcaStage.addChild(this.m_mcaContainer);
                this.m_valueFnStage.addChild(this.m_valFnBackground);
                this.m_valueFnStage.addChild(this.m_valueFnLineCont);
                this.m_valueFnStage.addChild(this.m_valueFnContainer);
                this.m_valueFnStage.addChild(this.m_controlP);
                createjs.Ticker.addEventListener("tick", this.tick);
                createjs.Ticker.setFPS(60);
                //$("#debug").hide();

            }

            private allModeltoConsole(p_evt: Event) {
                console.log("All Model");
                //console.log("in local storage: " + localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                for (var i = 0; i < this.m_model.getElementArr().length; i++) {
                    console.log("Element: " + this.m_model.getElementArr()[i].getID());
                    for (var j = 0; j < this.m_model.getElementArr()[i].getConnections().length; j++) {
                        console.log("   Conn: " + this.m_model.getElementArr()[i].getConnections()[j].getID());
                    }
                }
                     
            }

            private cnctStatus(p_evt: Event) {
                if ($("#cnctTool").prop("checked")) {
                    $("#modeStatus").html("Connect Mode");
                }
                else {
                    $("#modeStatus").html("Editor Mode");
                }
            }

            private loadModel(p_evt: Event) {
                ////console.log(this);
                ////console.log(this.m_handler);
                this.m_handler.getFileIO().loadfromGenie(this.m_model, this.importStage);
            }

            private saveModel(p_evt: Event) {
                $("#saveFile_div").show();
                this.m_handler.getFileIO().saveModel(this.m_model);
                
            }

            private selectAll(p_evt: Event) {
                for (var i = 0; i < this.m_model.getElementArr().length; i++) {
                    this.addToSelection(this.m_model.getElementArr()[i].m_easelElmt);
                }
            }
                       
            private updateModel() {
                this.m_model.update();
                this.updateMiniTable(this.m_model.getElementArr());
            }

            private setSize(p_width: number, p_height: number): void {
                console.log("setting size");
                this.m_mcaStageCanvas.height = p_height;
                this.m_mcaStageCanvas.width = p_width;
                this.m_mcaBackground.scaleY = p_height / this.m_mcaSizeY
                this.m_mcaBackground.scaleX = p_width / this.m_mcaSizeX;
            }
            private increaseSize(p_x: number, p_y: number): void {
                this.m_mcaBackground.scaleY = (this.m_mcaStageCanvas.height + p_y) / this.m_mcaSizeY
                this.m_mcaBackground.scaleX = (this.m_mcaStageCanvas.width + p_x) / this.m_mcaSizeX;
                this.m_mcaStageCanvas.height += p_y;
                this.m_mcaStageCanvas.width += p_x;
            }

            private quickLoad() {
                console.log("quickLoad");
                this.m_model.fromJSON(this.m_handler.getFileIO().reset());
                this.importStage();
            }

            importStage(): void {
                //console.log("importing stage");
                this.m_mcaContainer.removeAllChildren();
                //console.log(this);
                var elmts = this.m_model.getElementArr();
                var conns = this.m_model.getConnectionArr();
                for (var i = 0; i < elmts.length; i++) {
                    //console.log("adding to stage:")
                    //console.log(elmts[i]);
                    this.addElementToStage(elmts[i]);
                }
                for (var i = 0; i < conns.length; i++) {
                    this.addConnectionToStage(conns[i]);
                }
                if (!this.m_model.m_bbnMode) {
                    this.updateFinalScores();
                    this.updateTable(this.m_model.getDataMatrix());

                } else {
                    this.updateMiniTable(elmts);
                }                
                this.m_updateMCAStage = true

                //this.m_handler.getFileIO().quickSave(this.m_model); //This is commented out the because it was preventing reset to work properly
            };

            private mouseUp(p_evt: createjs.MouseEvent) {
                console.log("mouse up");
                $("#mX").html("X: " + p_evt.stageX);
                $("#mY").html("Y: " + p_evt.stageY);
                $("#mAction").html("Action: mouseUp");
                $("#mTarget").html("Target: " + p_evt.target.name);
                //var tmp: any = this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0).name;
                //$("#mTarget").html("Target: " + tmp );
                this.m_updateMCAStage = true;

            }

            private mouseMove(p_evt: createjs.MouseEvent) {
                if ($("cnctTool").prop("checked")) {

                } 
            }

            private updateElement(p_elmt: Element) {
                p_elmt.m_easelElmt.removeAllChildren();

                var shape = new createjs.Shape();
                shape.graphics.f(this.m_elementColors[p_elmt.getType()][0]).s(this.m_elementColors[p_elmt.getType()][1]);

                var elmtShapeType: number = 2;
                if (this.m_model.m_bbnMode) {
                    elmtShapeType = p_elmt.getType();

                }
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
                        shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
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

                if (this.m_model.m_bbnMode) {                       
                }
            }
                        
            updateMiniTable(p_elmtArr: Element[]) {
                //console.log("updating minitable");
                for (var j = 0; j < p_elmtArr.length; j++) {
                    var elmt = p_elmtArr[j];
                    //console.log(elmt.getName());
                           // if (elmt.getType() !== 2) {
                     //  console.log(elmt.getName() + " minitable is being updated");
                        var backgroundColors = ["#c6c6c6", "#bfbfe0"]
                        var decisionCont: createjs.Container = elmt.m_minitableEaselElmt

                        decisionCont.removeAllChildren();

                            if (elmt.getValues()[0].length > 2) {
                                var decisTextBox: createjs.Text = new createjs.Text("Values is multidimensional", "0.8em trebuchet", "#303030");
                                decisionCont.addChild(decisTextBox);
                            }
                            else {
                        for (var i = 0; i < elmt.getValues().length; i++) {

                                var backgroundColor: string;
                                if (elmt.getDecision() == i && elmt.getType() == 1) {
                                    backgroundColor = "#CCFFCC";
                                }
                                else {
                                    backgroundColor = backgroundColors[i % 2];
                                }
                                var decisRect: createjs.Shape = new createjs.Shape(new createjs.Graphics().f(backgroundColor).s("#303030").ss(0.5).r(0, i * 12, 70, 12));

                                //   console.log("" + elmt.getValues());
                                //console.log("substring 0-12: " + elmt.getValues()[i][0]);
                                var decisName: createjs.Text = new createjs.Text(elmt.getValues()[i][0].substr(0, 12), "0.8em trebuchet", "#303030");
                                decisName.textBaseline = "middle";
                                decisName.maxWidth = 68;
                                decisName.x = 2;
                                decisName.y = 6 + (i * 12);

                                decisionCont.addChild(decisRect);
                                decisionCont.addChild(decisName);

                                var valueData: number = elmt.getValues()[i][1];

                                var decisBarBackgr: createjs.Shape = new createjs.Shape(new createjs.Graphics().f(backgroundColor).s("#303030").ss(0.5).r(70, i * 12, 60, 12));

                                var decisBar: createjs.Shape = new createjs.Shape(new createjs.Graphics().f(this.m_googleColors[i % this.m_googleColors.length]).r(96, 1 + (i * 12), 35 * valueData, 10));

                                if (elmt.getType() === 0) {
                                    var decisPercVal: createjs.Text = new createjs.Text(Math.floor(valueData * 100) + "%", "0.8em trebuchet", "#303030");
                                } else {
                                    decisBar.visible = false;
                                    var decisPercVal: createjs.Text = new createjs.Text("" + Tools.round(valueData), "0.8em trebuchet", "#303030");

                                }
                                decisPercVal.textBaseline = "middle";
                                decisPercVal.maxWidth = 22;
                                decisPercVal.x = 71;
                                decisPercVal.y = 6 + (i * 12);

                                decisionCont.addChild(decisBarBackgr);
                                decisionCont.addChild(decisBar);
                                decisionCont.addChild(decisPercVal);
                            }
                        }
                        decisionCont.addEventListener("click", this.clickedDecision);
                        decisionCont.x = elmt.m_easelElmt.x + 75;
                        decisionCont.y = elmt.m_easelElmt.y - 15;
                        decisionCont.name = elmt.getID();
                        elmt.m_minitableEaselElmt = decisionCont;
                        this.m_mcaContainer.addChild(decisionCont);

                        if (elmt.getType() == 2) {
                            decisionCont.visible = false;
                       }

                        this.m_updateMCAStage = true;
                    }
                //}
            }

            private clickedDecision(p_evt: createjs.MouseEvent) {
                //console.log("clicked a decision");
                //console.log(p_evt);
                this.m_model.setDecision(p_evt.currentTarget.name, Math.floor(p_evt.localY / 12));
                this.updateModel();
            }

            private updateEditorMode() {
                //console.log("updating editormode");
                if (this.m_editorMode) {
                    $(".advButton").show();
                    $("#reset").show();
                    if (this.m_model.m_bbnMode) {
                        $("#newElmt").hide();
                        $("#newDcmt").hide();
                        /*$("#newChance").hide();
                        $("#newDec").hide();
                        $("#newValue").hide();
                        $("#cnctTool").hide();*/
                    }
                    else {
                        $("#newChance").hide();
                        $("#newDec").hide();
                        $("#newValue").hide();
                    }
                } else {
                    $(".advButton").hide();
                    $("#reset").hide();
                    $("#cnctTool").prop("checked", false);
                }
                var elementArr = this.m_model.getElementArr();
                if (elementArr) {
                    for (var i = 0; i < elementArr.length; i++) {
                        if (this.m_editorMode) {
                            elementArr[i].m_easelElmt.addEventListener("pressmove", this.pressMove);
                        } else {
                            elementArr[i].m_easelElmt.removeEventListener("pressmove", this.pressMove);
                        }
                    }
                }
            }

            private setShowDescription = function (cb) {
                this.m_showDescription = cb.currentTarget.checked;
                if (this.m_showDescription) {
                    $("#description_div").show();
                    $("#showDescription").siblings('label').html("Hide description");
                }
                else {
                    $("#description_div").hide();
                    $("#showDescription").siblings('label').html("Show description");
                }
            }

            public setEditorMode = function (cb) {
                //console.log(cb);
                
                this.m_editorMode = cb.currentTarget.checked;
                if (this.m_editorMode) {
                    if ($("#cnctTool").prop("checked")) {
                        $("#modeStatus").html("Connect Mode");
                    }
                    else {
                        $("#modeStatus").html("Editor Mode");
                    }
                }
                else {
                    $("#modeStatus").html("");
                }

                this.updateEditorMode();
                console.log("editormode: " + this.m_editorMode);
            }
            private setAutoUpdate = function (cb) {
                //console.log(cb);
                
                this.m_model.setAutoUpdate(cb.currentTarget.checked);
                if (cb.currentTarget.checked) {
                    $("#autoUpdateStatus").html("Updating automatically");
                }
                else {
                    $("#autoUpdateStatus").html("");
                }
                //console.log("auto update: " + this.m_model.m_autoUpdate);
            }

            private fullscreen(p_evt: Event) {
                console.log("in local storage: " +localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                var model: Model = this.m_model;
               // this.m_handler.getFileIO().quickSave(model);
                //var modelIdent = model.getIdent();
                var json: string = JSON.stringify(model);
                sessionStorage.setItem(model.getIdent(), json);
                

                console.log("fullscreen pressed");
                if (!this.m_fullscreen) {
                    console.log("was not in fullscreen");
                    $(".row").hide();
                    this.setSize($(window).width(), $(window).height());
                    this.m_fullscreen = true;
                }
                else {
                    console.log("was in fullscreen");
                    $(".row").show();
                    this.updateSize();
                    this.m_fullscreen = false;
                }

                json = JSON.parse(sessionStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                //json = JSON.parse(sessionStorage.getItem(modelIdent));
                model.fromJSON(json);
                this.importStage();
                console.log("in local storage: " +localStorage.getItem(this.m_handler.getActiveModel().getIdent()));

            }

            private updateSize(): void {
                var gui = this;
                var lowestElement: number = this.m_mcaSizeY;
                var highestElement: number = $(window).height();
                console.log("hitarea position: " + this.m_mcaContainer.y);
                this.m_model.getElementArr().forEach(function (e) {
                    //console.log("e y = " + (e.m_easelElmt.y + gui.m_mcaContainer.y) + " and lowestElement: " + lowestElement);
                    if (e.m_easelElmt.y + gui.m_mcaContainer.y > lowestElement) {
                        lowestElement = gui.m_mcaContainer.y + e.m_easelElmt.y + 30;
                    }
                    if (e.m_easelElmt.y + gui.m_mcaContainer.y < highestElement) {
                        highestElement = e.m_easelElmt.y + gui.m_mcaContainer.y;
                    }
                });
                console.log("highest element: " + highestElement);
                if (highestElement > 50) {//Move elements up if highest element is too low
                    var moveDistance = highestElement - 50;
                    this.m_mcaContainer.y -= moveDistance;
                    this.m_updateMCAStage = true;
                    lowestElement -= moveDistance;
                }
                this.setSize(this.m_mcaSizeX, lowestElement); //Sets the height to be where the lowest element is
            }
            private createNewChance(p_evt: Event) {

                var elmt = this.m_model.createNewElement(0)
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTable([elmt]);
            }
            private createNewDec(p_evt: Event) {

                var elmt = this.m_model.createNewElement(1)
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTable([elmt]);
            }
            private createNewValue(p_evt: Event) {

                var elmt = this.m_model.createNewElement(2)
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTable([elmt]);
            }
            private createNewElement(p_evt: Event) {

                var elmt = this.m_model.createNewElement(undefined)
                this.addElementToStage(elmt);
               // elmt.update();
                this.updateMiniTable([elmt]);
            }

            private deleteSelected(p_evt: Event) {                
                console.log("deleting");
                for (var i = 0; i < this.m_selectedItems.length; i++) {
                    var elmt: Element = this.m_model.getElement(this.m_selectedItems[i].name);
                    //for (var index in elmt.getConnections()) {
                    //    console.log(elmt.getName() + "  Before: " + elmt.getConnections()[index].getID());
                    //}
                    if (this.addToTrash(elmt)) {
                        ////console.log(this.m_trashBin);
                        //alert("begin delete connections from " + elmt.getName() );
                        for (var j = 0; j < elmt.getConnections().length; j++) {
                            var conn: Connection = elmt.getConnections()[j];
                            if (conn.getOutputElement().getID() === elmt.getID()) {
                                conn.getInputElement().deleteConnection(conn.getID());
                            } else {
                                conn.getOutputElement().deleteConnection(conn.getID());
                            }
                        }
                        //alert("end delete connections");
                    }
                    //for (var index in elmt.getConnections()) {
                    //    console.log(elmt.getName() + "  After: " + elmt.getConnections()[index].getID());
                    //}
                }
                this.clearSelection();
                for (var i = 0; i < this.m_trashBin.length; i++) {
                    this.m_model.deleteElement(this.m_trashBin[i].getID());
                }
                //alert("before update");
                //this.m_mcaStage.update();
                //alert("after update");
                this.m_updateMCAStage = true;
                //console.log(this.m_model.getConnectionArr());
                //console.log(this.m_model.getElementArr());
                this.importStage();
                //console.log("deleting done");
            }

            private addToTrash(p_obj: any): boolean {
                ////console.log(this.m_trashBin.indexOf(p_obj));
                if (this.m_trashBin.indexOf(p_obj) === -1) {
                    this.m_trashBin.push(p_obj);
                    return true;

                } else {
                    return false;
                }             
            }

            private addElementToStage(p_elmt: Element) {
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
                ////console.log(this);
                if (p_evt.target.name.substr(0, 4) === "elmt") {
                    this.populateElmtDetails(this.m_model.getElement(p_evt.target.name));                   
                    $("#submit").hide();                    
                    $("#detailsDialog").dialog("open");
                }
            }

            private populateElmtDetails(p_elmt: Element): void {
                this.m_unsavedChanges = false;
                console.log("unsaved changes: " + this.m_unsavedChanges);
                console.log(p_elmt.getName() + " is updated: " + p_elmt.isUpdated());
                //console.log(p_elmt)
                //set dialog title
                $("#detailsDialog").dialog({
                    title: p_elmt.getName()
                });
                if (this.m_model.m_bbnMode) {
                    //bbn mode only
                    $("#detailsDialog").data("element", p_elmt);
                    $("#detailsDialog").data("model", this.m_model);
                    
                    var s = Tools.htmlTableFromArray("Definition", p_elmt.getData(), this.m_model);
                    console.log(p_elmt.getData());
                    $("#defTable_div").html(s);
                    $("#defTable_div").show();
                    this.addEditFunction(p_elmt, this.m_editorMode);
                    
                    if (this.m_showDescription) {
                        //set description
                        var description = p_elmt.getDescription();
                        if (description.length < 1) {
                            description = "empty";
                        }
                        document.getElementById("description_div").innerHTML = p_elmt.getDescription();
                        $("#description_div").show();
                    }
                    //set user description
                    if (p_elmt.getUserDescription().length < 1) {
                        document.getElementById("userDescription_div").innerHTML = "write your own description or comments here";
                    }
                    else {
                        document.getElementById("userDescription_div").innerHTML = p_elmt.getUserDescription();
                    }
                    $("#userDescription_div").show();
                    
                    if (p_elmt.isUpdated()) {
                        $("#values").prop('disabled', false);
                    } else {
                        $("#values").prop('disabled', true);
                    }

                } else {
                    //MCA mode only

                    //console.log(tableMat);
                    var chartOptions: Object = {
                        width: 700,
                        height: 400,
                        vAxis: { minValue: 0 },
                        legend: { position: 'none', maxLines: 3 },
                        bar: { groupWidth: '60%' }

                    };
                    switch (p_elmt.getType()) {
                        case 2://scenario
                            //show: tabledata,description
                            $("#description_div").show();
                            break;

                        case 0://attribute
                            //show: valueFn,direct(sliders),ahp
                            $("#weightingMethodSelector").show();
                            $("#datatable_div").show();
                            $("#chart_div").show();
                            // Create the data table.
                            // Instantiate and draw our chart, passing in some options.
                            var chartData = google.visualization.arrayToDataTable(this.m_model.getWeightedData(p_elmt, true));
                            var chart = new google.visualization.ColumnChart($("#chart_div").get(0));
                            chart.draw(chartData, chartOptions);

                            break;
                        case 3://objective
                        case 1://sub objective
                            //show: swing(sliders),direct(sliders),ahp
                            $("#weightingMethodSelector").show();
                            break;
                    }
                    switch (p_elmt.getMethod()) {
                        case 0://direct or undefined
                            break;
                        case 1://swing
                            var sliderHtml = "";
                            $("#sliders_div").empty();

                            for (var i = 0; i < p_elmt.getData(0).length; i++) {
                                var childEl = this.m_model.getConnection(p_elmt.getData(0, i)).getInputElement();
                                sliderHtml = "<div><p>" + childEl.getName() + ":<input id=\"inp_" + childEl.getID() + "\"type=\"number\" min=\"0\" max=\"100\"></p><div style=\"margin-top:5px ;margin-bottom:10px\"class =\"slider\"id=\"slid_" + childEl.getID() + "\"></div></div>";
                                $("#sliders_div").append(sliderHtml);
                                function makeSlider(count, id, _this) {
                                    $("#slid_" + id).slider({
                                        min: 0,
                                        max: 100,
                                        value: p_elmt.getData(1, count),
                                        slide: function (event, ui) {
                                            p_elmt.setData(ui.value, 1, count);
                                            $("#inp_" + id).val(ui.value);
                                            this.updateFinalScores();
                                        }.bind(_this)
                                    });
                                    $("#inp_" + id).val(p_elmt.getData(1, count));

                                    $("#inp_" + id).on("input", function () {
                                        var val = parseInt(this.value);
                                        if (val <= 100 && val >= 0) {
                                            p_elmt.setData(val, 1, count);
                                            $("#slid_" + id).slider("option", "value", val);
                                            _this.updateFinalScores();
                                        } else if (val > 100) {
                                            val = 100;
                                        } else {
                                            val = 0;
                                        }

                                        ////console.log(p_elmt.getData(1));
                                    });
                                }
                                makeSlider(i, childEl.getID(), this);
                            }
                            $("#sliders_div").show();

                            break;
                        case 2://valueFn
                            var tableMat = this.m_model.getWeightedData(p_elmt, false);
                            var cPX: number = p_elmt.getData(1);
                            var cPY: number = p_elmt.getData(2);
                            ////console.log("draw line");
                            this.m_valueFnLineCont.removeAllChildren();

                            this.m_controlP.regX = 3;
                            this.m_controlP.regY = 3;
                            this.m_controlP.x = cPX;
                            this.m_controlP.y = cPY;
                            this.m_valFnBackground.name = p_elmt.getID();
                            $("#valueFn_Flip").data("name", p_elmt.getID());
                            $("#valueFn_Linear").data("name", p_elmt.getID());
                            var maxVal = 0;
                            for (var i = 1; i < tableMat.length; i++) {
                                if (tableMat[i][1] > maxVal)
                                    maxVal = tableMat[i][1];
                            }

                            //set minimum and maximum values
                            var maxVal: number = p_elmt.getData(5);
                            var minVal: number = p_elmt.getData(4);

                            //check if data is within min-max values, and expand as necessary
                            for (var i = 1; i < tableMat.length - 1; i++) {
                                if (tableMat[i][1] > maxVal) {
                                    maxVal = tableMat[i][1];
                                }
                            }

                            for (var i = 1; i < tableMat.length - 1; i++) {
                                if (tableMat[i][1] < minVal) {
                                    minVal = tableMat[i][1];
                                }
                            }


                            for (var i = 1; i < tableMat.length; i++) {
                                ////console.log(tableMat[i][1]);
                                var vertLine = new createjs.Shape(this.getValueFnLine((tableMat[i][1] - minVal) / (maxVal - minVal) * this.m_valueFnSize, this.m_googleColors[i - 1]));

                                this.m_valueFnLineCont.addChild(vertLine);
                            }


                            this.updateValFnCP(cPX, cPY, p_elmt.getData(3));
                            this.updateDataTableDiv(p_elmt);



                            break;
                        case 3://ahp
                    }

                    //set description
                    document.getElementById("description_div").innerHTML = p_elmt.getDescription();
                }
            };

            private addEditFunction(p_elmt: Element, p_editorMode: boolean) {
                var originalDesc = p_elmt.getDescription();
                var originalUserComments = p_elmt.getUserDescription();
                console.log("Element: " + p_elmt.getName() + "ready for editing");
                var mareframeGUI = this;
               // $(function () {
                    $("#userDescription_div").dblclick(function () {
                        $("#submit").show();
                        $(this).addClass("editable");
                        console.log("original value : " + originalUserComments);
                        $(this).html("<input type='text' value='" + originalUserComments + "' />");
                        $(this).children().first().focus();
                        $(this).children().first().keypress(function (e) {
                            if (e.which == 13) {
                                var newText = $(this).val();
                                console.log("new text: " + newText);
                                if (newText.length < 1) { //Must not update the text if the new text string is empty
                                    $("#userDescription_div").html(originalUserComments);
                                    newText = originalUserComments;
                                }
                                $(this).parent().text(newText);
                                if (newText !== originalUserComments) {
                                    console.log("unsaved changes");
                                    mareframeGUI.m_unsavedChanges = true;
                                }
                                originalUserComments = newText; //This is needed if the user wants to change the text multiple times without saving inbetween
                            }
                            $(this).parent().removeClass("editable");
                        });
                        $(this).children().first().blur(function () {
                            var newText = $(this).val();
                            console.log("new text: " + newText);
                            if (newText.length < 1) { //Must not update the text if the new text string is empty
                                $("#userDescription_div").html(originalUserComments);
                                newText = originalUserComments;
                            }
                            $(this).parent().text(newText);
                            if (newText !== originalUserComments) {
                                mareframeGUI.m_unsavedChanges = true;
                            }
                            originalUserComments = newText; //This is needed if the user wants to change the text multiple times without saving inbetween
                            $(this).parent().removeClass("editable");
                        });

                    });
               // });
                if (p_editorMode) {
                   // $(function () {
                        console.log("original value: " + originalDesc);
                        $("#description_div").dblclick(function () {
                            $("#submit").show();
                            //var originalValue = $(this).text();
                            $(this).addClass("editable");
                            $(this).html("<input type='text' value='" + originalDesc + "' />"); //Prevents the box from becoming emtpy when clicked
                            $(this).children().first().focus();
                            $(this).children().first().keypress(function (e) {
                                if (e.which == 13) {//If enter is pressed
                                    var newText = $(this).val();
                                    $(this).parent().text(newText);
                                    if (newText.length < 1) { //Must not update the text if the new text string is empty
                                        $("#description_div").html(originalDesc);
                                        newText = originalDesc;
                                    }
                                    if (newText !== originalDesc) {
                                        mareframeGUI.m_unsavedChanges = true;
                                    }
                                    originalDesc = newText; //This is needed if the user wants to change the text multiple times without saving inbetween
                                }
                                $(this).parent().removeClass("editable");
                            });
                            $(this).children().first().blur(function () { //If user has clicked outside the box
                                var newText = $(this).val();
                                console.log("newtext = " + newText + " length: " + newText.length);
                                console.log("original text: " + originalDesc);
                                if (newText.length < 1) {
                                    $("#description_div").html(originalDesc);
                                    newText = originalDesc;
                                }
                                $(this).parent().text(newText);
                                if (newText !== originalDesc) {
                                    mareframeGUI.m_unsavedChanges = true;
                                }
                                originalDesc = newText; //This is needed if the user wants to change the text multiple times without saving inbetween
                                $(this).parent().removeClass("editable");
                            });
                       // });
                        });
                        $(".defStateName").button({
                            icons: { primary: "ui-icon-minus" }
                        });
                    //Data table
                        var editing = false;//this is used to make sure the text does not disapear when double clicking several times
                        $(function () {
                            $("td").dblclick(function () {
                                console.log("editing: " + editing);
                                if (!editing) {
                                    editing = true;
                                    $("#submit").show();
                                    var originalValue = $(this).text();
                                    console.log("original value : " + originalValue);
                                    $(this).addClass("editable");
                                    $(this).html("<input type='text' value='" + originalValue + "' />");
                                    $(this).children().first().focus();
                                    $(this).children().first().keypress(function (e) {//if enter is pressed
                                        if (e.which == 13) {
                                            var newText = $(this).val();
                                            console.log("new text: " + newText);
                                            if (isNaN(newText) || newText.length < 1) {
                                                console.log("value is not a number");
                                                // alert("Value must be a number");
                                                //TODO find better solution than alert
                                                $(this).parent().text(originalValue);
                                            } else {
                                                $(this).parent().text(newText);
                                                if (newText !== originalValue) {
                                                    mareframeGUI.m_unsavedChanges = true;
                                                }
                                            }
                                            $(this).parent().removeClass("editable");
                                            editing = false;
                                        }
                                    });
                                    $(this).children().first().blur(function () {//if the user has clicked outside the table
                                        var newText = $(this).val();
                                        if (isNaN(newText) || newText.length < 1) {
                                            //alert("Value must be a number");
                                            console.log("orignal value: " + originalValue);
                                            //TODO find better solution than alert
                                            $(this).parent().text(originalValue);
                                        } else {
                                            $(this).parent().text(newText);
                                            console.log(" new text: " + newText + " originalValue: " + originalValue);
                                            if (newText !== originalValue) {
                                                mareframeGUI.m_unsavedChanges = true;
                                            }
                                            else {
                                                mareframeGUI.m_unsavedChanges = false;
                                            }
                                        }
                                        $(this).parent().removeClass("editable");
                                        editing = false;
                                    });
                                }
                                });
                        //TODO Prevent user from editing the top rows. That data should come from the child elements
                            $("th").dblclick(function () {
                                console.log("editing: " + editing);
                                if (!editing) {
                                    editing = true;
                                    $("#submit").show();
                                    var originalText = $(this).text();
                                    $(this).addClass("editable");
                                    $(this).html("<input type='text' value='" + originalText + "' />");
                                    $(this).children().first().focus();
                                    $(this).children().first().keypress(function (e) {
                                        if (e.which == 13) {//if enter is pressed
                                            var newText = $(this).val();
                                            if (newText.length < 1) {
                                                //alert("Cell cannot be empty");
                                                console.log("cell cannot be emtpy");
                                                $(this).parent().text(originalText);
                                            }
                                            else {
                                                $(this).parent().text(newText);
                                                if (newText !== originalText) {
                                                    mareframeGUI.m_unsavedChanges = true;
                                                }
                                            }
                                            $(this).parent().removeClass("editable");
                                            editing = false;
                                        }
                                    });
                                    $(this).children().first().blur(function () {//if the user has click outside the cell
                                        var newText = $(this).val();
                                        if (newText.length < 1) {
                                            //alert("Cell cannot be empty");
                                            console.log("cell cannot be emtpy");
                                            $(this).parent().text(originalText);
                                        }
                                        else {
                                            $(this).parent().text(newText);
                                            if (newText !== originalText) {
                                                mareframeGUI.m_unsavedChanges = true;
                                            }
                                        }
                                        $(this).parent().removeClass("editable");
                                        editing = false;
                                    });
                                }
                        });

                    });
                }
            };

            private showValues() {
                var elmt: Element =  $("#detailsDialog").data("element");
                console.log("Data: " + elmt.getData());
                console.log("Values: " + elmt.getValues());
                console.log(elmt.getValues());
                console.log("size of values: " + math.size(elmt.getValues()));
                $("#valuesTable_div").html(Tools.htmlTableFromArray("Values", elmt.getValues(), $("#detailsDialog").data("model")));
                $("#valuesTable_div").show();
                $("#values").prop("disabled", true);
            }

            private saveChanges() {
                var elmt: Element = $("#detailsDialog").data("element");
                var oldData: any[][] = elmt.getData();
                var model: Model = this.m_model;
                //Save user description
                var userDescription = $("#userDescription_div").text();
                elmt.setUserDescription(userDescription);
                //Save description
                var description = $("#description_div").text();
                elmt.setDescription(description);
                //Save def table
                var table = $("#defTable_div");
                var newTable = [];
                var newRow = [];

                //console.log(this);
                table.find("tr").each(function () {
                    $(this).find("th,td").each(function () {
                        //console.log("text to be added: " + $(this).text());
                        //console.log("does it exsist: " + $.inArray($(this).text(), newRow) === -1)
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
                //console.log(newTable);
                //Remove header row with title the "Definition"
                newTable.splice(0, 1);
                //Reset the headerrows. (Better solution would be to prevent the user from editing them
                for (var i = 0; i < Tools.numOfHeaderRows(oldData); i++) {                  
                        for (var j = 0; j < oldData[0].length; j++) {
                            newTable[i][j] = oldData[i][j];
                    }
                    newTable[i][0] = oldData[i][0];
                }

                if (!Tools.columnSumsAreValid(newTable, Tools.numOfHeaderRows(elmt.getData())) && elmt.getType() == 0) {
                    //Should also show which row is unvalid (maybe right after the user has changed the value)
                    alert("The values in each column must add up to 1");
                } else {
                    elmt.setData(newTable);
                    if (model.getAutoUpdate()) {
                        this.updateModel();
                        console.log("auto update is on");
                    }
                    else {
                        elmt.setUpdated(false);
                        elmt.getAllDescendants().forEach(function (e) {
                            e.setUpdated(false);
                        });
                    }
                    //console.log("new table after submit:");
                    //console.log(elmt.getData());
                }
                this.m_unsavedChanges = false;
            }
            
            private updateValFnCP(p_controlPointX: number, p_controlPointY: number, p_flipped_numBool: number): void {
                //var functionSegments = 10;
                this.m_valueFnContainer.removeAllChildren();
                var line = new createjs.Graphics().beginStroke("#0f0f0f").mt(0, this.m_valueFnSize - (this.m_valueFnSize * p_flipped_numBool)).bt(p_controlPointX, p_controlPointY, p_controlPointX, p_controlPointY, this.m_valueFnSize, 0 + (this.m_valueFnSize * p_flipped_numBool));
                //for (var i = 1; i <= functionSegments; i++)
                //{
                //	line.lt(i * (valueFnSize / functionSegments), valueFnSize - (valueFnSize * getValueFn(i * (100 / functionSegments), cPX, valueFnSize-cPY)));
                //}
                var plot = new createjs.Shape(line);
                this.m_valueFnContainer.addChild(plot);
                this.m_valueFnStage.update();
                //update = true;
                $("#valueFn_div").show();
            }

            private updateDataTableDiv(p_elmt: Element): void {
                var tableMat = this.m_model.getWeightedData(p_elmt, false);
                tableMat.splice(0, 0, ["Scenario", "Value", "Weight"]);

                var tableData = google.visualization.arrayToDataTable(tableMat);
                var table = new google.visualization.Table(document.getElementById('datatable_div'));

                table.draw(tableData, { 'allowHtml': true, 'alternatingRowStyle': true, 'width': '100%', 'height': '100%' });
                $('.google-visualization-table-table').width("100%");
            }

            private downValFnCP(p_evt: createjs.MouseEvent): void {
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
            }


            private moveValFnCP(p_evt: createjs.MouseEvent) {
                var elmt = this.m_model.getElement(p_evt.target.name);
                this.m_controlP.x = p_evt.stageX;
                this.m_controlP.y = p_evt.stageY;
                elmt.getData()[1] = p_evt.stageX;
                elmt.getData()[2] = p_evt.stageY;
                this.updateValFnCP(p_evt.stageX, p_evt.stageY, elmt.getData()[3]);
                this.updateDataTableDiv(elmt);

                //update = true;
                this.updateFinalScores();
            }


            private linearizeValFn(): void {

                this.moveValFnCP(<createjs.MouseEvent>{ stageX: 50, stageY: 50, target: { name: $("#valueFn_Linear").data("name") } });

            }

            private flipValFn(): void {


                var elmt = this.m_model.getElement($("#valueFn_Flip").data("name")[0][0]);

                elmt.getData()[3] = Math.abs(elmt.getData()[3] - 1);
                this.updateValFnCP(elmt.getData()[1], elmt.getData()[2], elmt.getData()[3]);
                this.updateDataTableDiv(elmt);
                //update = true;
                this.updateFinalScores();
            }


            private getValueFnLine(p_xValue: number, p_color: string): createjs.Graphics {
                return new createjs.Graphics().beginStroke(p_color).mt(p_xValue, 0).lt(p_xValue, this.m_valueFnSize);
            }



            private updateFinalScores(): void {
                var data = google.visualization.arrayToDataTable(this.m_model.getFinalScore());
                data.removeRow(data.getNumberOfRows() - 1);
                this.m_finalScoreChart.draw(data, this.m_finalScoreChartOptions);
            }


            private updateTable(p_matrix: any[][]): void {
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
                ////console.log("original datamatrix");
                ////console.log(this.m_model.getDataMatrix());
            }

            private mouseDown(p_evt: createjs.MouseEvent): void {
                $("#mX").html("X: " + p_evt.stageX);
                $("#mY").html("Y: " + p_evt.stageY);
                $("#mAction").html("Action: mousedown");
                $("#mTarget").html("Target: " + p_evt.target.name);
                if (p_evt.target.name.substr(0, 4) === "elmt") {
                    var elmt: Element = this.m_model.getElement(p_evt.target.name);
                    console.log("");
                    console.log("*********************");
                    for (var i in elmt.getConnections()) {
                        console.log(elmt.getID() + "  " + elmt.getConnections()[i].getID())
                    }
                    console.log("Data: " + elmt.getData());
                    console.log("Values: " + elmt.getValues());
                }
                //////console.log("mouse down at: ("+e.stageX+","+e.stageY+")");
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                this.m_originalPressX = p_evt.stageX;
                this.m_originalPressY = p_evt.stageY;
                //////console.log("cnctool options: "+$("#cnctTool").button("option","checked"));
                if (p_evt.target.name.substr(0, 4) === "elmt") {
                   var cnctChkbox: HTMLInputElement = <HTMLInputElement>document.getElementById("cnctTool")   // What the hell no jQuery
                    if (cnctChkbox.checked) //check if connect tool is enabled
                    {
                        ////console.log("cnctTool enabled");
                        if ( !this.connectionExist(p_evt) ) {
                        this.connectTo(p_evt);
                        }
                        else {
                            this.disconnectFrom(p_evt);
                        }
                    } else {
                        this.select(p_evt);
                    }
                } else {
                    this.clearSelection();
                }
            }

            
            


            private select(p_evt: createjs.MouseEvent): void {
                //////console.log("ctrl key: " + e.nativeEvent.ctrlKey);
                if (!p_evt.nativeEvent.ctrlKey && this.m_selectedItems.indexOf(p_evt.target) === -1) {
                    this.clearSelection();
                }
                //console.log("adding to selection: " + p_evt.target);
                this.addToSelection(p_evt.target);
            }

            private pressMove(p_evt: createjs.MouseEvent): void {
                //console.log("press move on target " + p_evt.target.name);
                $("#mX").html("X: " + p_evt.stageX);
                $("#mY").html("Y: " + p_evt.stageY);
                $("#mAction").html("Action: PressMove");
                $("#mTarget").html("Target: " + p_evt.target.name);
                if (p_evt.target.name === "hitarea") {
                    if (p_evt.nativeEvent.ctrlKey) {
                        ////console.log("orig: " + this.m_originalPressX + ", " + this.m_originalPressY + ". curr: " + p_evt.stageX + ", " + p_evt.stageY);
                        this.setSelection(this.m_model.getEaselElementsInBox(this.m_originalPressX, this.m_originalPressY, p_evt.stageX, p_evt.stageY));
                        this.m_selectionBox.graphics.clear().s("rgba(0,0,0,0.7)").setStrokeDash([2, 2], createjs.Ticker.getTime()).drawRect(this.m_originalPressX, this.m_originalPressY, p_evt.stageX - this.m_originalPressX, p_evt.stageY - this.m_originalPressY);
                        this.m_mcaContainer.addChild(this.m_selectionBox)
                    } else if (this.m_editorMode) {
                        //console.log("elements off screen: " + this.elementOffScreen(p_evt.stageX - this.m_oldX, p_evt.stageY - this.m_oldY));
                        if (!this.elementOffScreen(undefined, p_evt.stageX - this.m_oldX, p_evt.stageY - this.m_oldY)) {
                        //console.log("panning");
                        $("#mAction").html("Action: Panning");
                        this.m_mcaContainer.x += p_evt.stageX - this.m_oldX;
                        this.m_mcaContainer.y += p_evt.stageY - this.m_oldY;
                            this.resizeWindow();
                        }
                    }
                } else if (p_evt.target.name.substr(0, 4) === "elmt") {
                    var connectTool = $("#cnctTool").prop("checked");
                    if (connectTool) {
                        //alert("connecting shit");
                        $("#mAction").html("connecting");
                    }
                    else {
                        if (!this.elementOffScreen(this.m_selectedItems, p_evt.stageX - this.m_oldX, p_evt.stageY - this.m_oldY)) {
                        for (var i = 0; i < this.m_selectedItems.length; i++) {
                            var elmt = this.m_selectedItems[i];

                            elmt.x += p_evt.stageX - this.m_oldX;
                            elmt.y += p_evt.stageY - this.m_oldY;

                            //console.log("selected elements: " + this.m_selectedItems);
                            //        console.log("element: " + elmt.name);
                            for (var j = 0; j < this.m_model.getElement(elmt.name).getConnections().length; j++) {
                                var c = this.m_model.getElement(elmt.name).getConnections()[j];
                                this.updateConnection(c);
                            }
                                this.resizeWindow();
                            }
                        }
                    }
                }
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                this.m_updateMCAStage = true;
            }
            private resizeWindow():void {
                var maxX: number = 0; // Right edge
                var maxY: number = 0; //Bottom edge
                var x: number;
                var y: number;
                var yEdge: number = 40; //The distance from the position to the bottom edge
                var xEdge: number = 200; //Distance from the center to the right edge
                var moveDistance: number = 10; //The distance to move the canvas in each step
                var gui = this;
                this.m_model.getElementArr().forEach(function (e) {
                    x = e.m_easelElmt.x + gui.m_mcaContainer.x;
                    y = e.m_easelElmt.y + gui.m_mcaContainer.y;
                    if (x + xEdge > maxX) {
                        maxX = x + xEdge;
                    }
                    if (y + yEdge> maxY) {
                        maxY = y + yEdge;
                    }
                });
                //console.log("max x: " + maxX + " canvas widht: " + this.m_mcaStageCanvas.width);
                if (maxX > this.m_mcaStageCanvas.width) {
                    this.increaseSize(moveDistance, 0);
                    window.scrollBy(moveDistance, 0);
                }
                /*else if (maxX < this.m_mcaStageCanvas.width - 100 && this.m_mcaStageCanvas.width > this.m_mcaSizeX) {
                    this.increaseSize(-moveDistance, 0);
                }*/
                //console.log("max y: " + maxY + " canvas heigth: " + this.m_mcaStageCanvas.height);
                if (maxY > this.m_mcaStageCanvas.height) {
                    this.increaseSize(0, moveDistance);
                    window.scrollBy(0,moveDistance);
                }
            }
            private elementOffScreen(array: any[] ,xMovement: number, yMovement:number): boolean {
                //console.log("checking if elements are off screen");
                var gui = this;
                var elementOffScreen: boolean = false;
                if (array === undefined) {//This means we have to check all elements
                    array = [];
                    this.m_model.getElementArr().forEach(function (e) {
                        array.push(e.m_easelElmt);
                        array.push(undefined); //This is needed because this is placeholder for minitables
                    });
                }
                var miniTable: boolean = false;
                array.forEach(function (e) {
                    if (!miniTable) {
                        // console.log("element x: " + (e.x + gui.m_mcaContainer.x));
                        if (e.x + gui.m_mcaContainer.x - 80 + xMovement < 0) {
                            //console.log("off screeen");
                            elementOffScreen = true;
                        } //console.log("element y: " + (e.y + gui.m_mcaContainer.y - 30 + yMovement));
                        if (e.y + gui.m_mcaContainer.y - 30 + yMovement < 0) {
                            elementOffScreen = true;
                        }
                    }
                   miniTable = !miniTable; //every second element is a minitable
                });
                return elementOffScreen;
            }
            private tick(): void {
                if (this.m_updateMCAStage) {
                    this.m_updateMCAStage = false;
                    this.m_mcaStage.update();
                    this.m_valueFnStage.update();
                    this.m_selectionBox.graphics.clear();
                }
            }

            private clear(): void {
                this.m_mcaContainer.removeAllChildren();
                this.m_updateMCAStage = true;
            }

            private disconnectFrom(p_evt): void {

            }

            private connectionExist(p_evt: createjs.MouseEvent): boolean {
                for (var i = 0; i < this.m_selectedItems.length; i += 2) {//The reason for only taking every second elemnt is that the others are minitables
                    var e = this.m_selectedItems[i];
                    var first: Element = this.m_model.getElement(e.name);
                    first.isChildOf(this.m_model.getElement(p_evt.target.name));
                    first.isParentOf(this.m_model.getElement(p_evt.target.name));

                }

                return false;
            }


            private connectTo(p_evt: createjs.MouseEvent): void {
                var elmtIdent = p_evt.target.name;
                var connected = false;
                //console.log("attempting connection "+elmtIdent);
                //console.log("selected length: " + this.m_selectedItems.length);
                for (var i = 0; i < this.m_selectedItems.length; i +=2) {//The reason for only taking every second elemnt is that the others are minitables
                    var e = this.m_selectedItems[i];
                    if (e.name.substr(0, 4) === "elmt" && e.name !== elmtIdent) {
                        var outputElmt: Element = this.m_model.getElement(elmtIdent);
                        var inputElmt: Element = this.m_model.getElement(e.name);
                        if (inputElmt.isAncestorOf(outputElmt)) { //Cannot connect to its ancestor. This would create a cycle
                            if (inputElmt.isChildOf(outputElmt)) {
                                //alert("Parent");
                                var conn = outputElmt.getConnectionFrom(inputElmt);
                                console.log("deleting connection: " + conn.getID() + "  From: " + outputElmt.getName() + "  To: " + inputElmt.getName());
                                //for (var index in outputElmt.getConnections()) {
                                //    console.log(outputElmt.getName() + "  Before: " + outputElmt.getConnections()[index].getID());
                                //}

                                //for (var index in inputElmt.getConnections()) {
                                //    console.log(inputElmt.getName() + "  Before: " + inputElmt.getConnections()[index].getID());
                                //}
                                //this.m_model.deleteConnection( inputElmt.getConnectionFrom(outputElmt).getID() );
                                
                                //this.m_model.deleteConnection(conn.getID());
                                //outputElmt.deleteConnection(inputElmt.getConnectionFrom(outputElmt).getID());
                                console.log("connection from " + outputElmt.getName() + " to " + inputElmt.getName() + " named " + inputElmt.getConnectionFrom(outputElmt));
                                console.log("connection from " + inputElmt.getName() + " to " + outputElmt.getName() + " named " + outputElmt.getConnectionFrom(inputElmt).getID());
                                inputElmt.deleteConnection(outputElmt.getConnectionFrom(inputElmt).getID());
                                outputElmt.deleteConnection(outputElmt.getConnectionFrom(inputElmt).getID());
                                //for (var index in outputElmt.getConnections()) {
                                //    console.log(outputElmt.getName() + "  After: " + outputElmt.getConnections()[index].getID());
                                //}
                                //for (var index in inputElmt.getConnections()) {
                                //    console.log(inputElmt.getName() + "  After: " + inputElmt.getConnections()[index].getID());
                                //}

                                inputElmt.setUpdated(false);
                                inputElmt.getAllDescendants().forEach(function (e) {
                                    e.setUpdated(false);
                                });


                                //this.m_mcaContainer.removeChild(conn);
                                //outputElmt.setUpdated(false);
                                //outputElmt.getAllDescendants().forEach(function (e) {
                                //    e.setUpdated(false);
                                //    this.clear();
                                //});
                                //alert("updating");
                                this.m_model.update();
                                
                                this.importStage();
                                this.m_mcaStage.update();
                                //alert("done updating");
                            } else {
                                alert("cannot create monkey a cycle");
                        }
                        }
                        else if (inputElmt.getType() === 2 && outputElmt.getType() !== 3 ) {//type 3 is reserved for super value nodes (not implemented yet)
                            alert("Value nodes cannot have children");
                        }
                        else if (inputElmt.getType() === 0 && outputElmt.getType() === 1) {
                            alert("Chance nodes can not have decsion node children");
                        }
                        else {
                            var c = this.m_model.createNewConnection(inputElmt, outputElmt);
                            //console.log("connection: " + c);
                            if (this.m_model.addConnection(c)) {
                                this.addConnectionToStage(c);
                                connected = true;
                            }
                            if (this.m_model.m_bbnMode) {
                                if (outputElmt.getType() !== 1) { //Dec nodes data does not rely on parents
                                    outputElmt.updateData();
                                }
                                outputElmt.setUpdated(false);
                                outputElmt.getAllDescendants().forEach(function (e) {
                                    e.setUpdated(false);
                                });
                            }
                        }
                    }
                }
                if (!connected) {
                    this.select(p_evt);
                }
                //this.m_mcaStage.update();
                //alert("connection is done");
                //this.select(elmtIdent);
            }

            private addConnectionToStage(p_connection: Connection): void {
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

            private updateConnection(p_connection: Connection): void {
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


            private addToSelection(p_easelElmt: createjs.Container): void {
                //console.log("selected: " + this.m_selectedItems);
                if (this.m_selectedItems.indexOf(p_easelElmt) === -1 && p_easelElmt.name.substr(0, 4) === "elmt") {
                    var elmt = this.m_model.getElement(p_easelElmt.name);
                    for (var i in elmt.getConnections) {
                        console.log(elmt.getName() + "  " + elmt.getConnections[i].getID()) 
                    }
                    this.m_selectedItems.push(p_easelElmt);
                    //console.log("pushed " + p_easelElmt);
                    if (this.m_model.m_bbnMode) {
                        this.m_selectedItems.push(elmt.m_minitableEaselElmt);
                    }
                    var elmtType = elmt.getType();
                    //////console.log(e);
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
                            shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                        default:
                            break;
                    }

                    this.m_updateMCAStage = true;
                }
                else if (this.m_model.m_bbnMode && this.m_selectedItems.indexOf(p_easelElmt) !== -1 && p_easelElmt.name.substr(0, 4) === "elmt") {//If element is already selected
                    //console.log("selected: " + this.m_selectedItems);
                    //console.log("element already selected");
                    var elmt = this.m_model.getElement(p_easelElmt.name);

                    var newSelected: any[] = [];
                    this.m_selectedItems.forEach(function (e) {
                        console.log("checking " + e + " against " + p_easelElmt);
                        if (e.toString() !== p_easelElmt.toString()) {
                            console.log("not a match");
                            newSelected.push(e);
                        }
                        else {
                            console.log("match");
                        }
                    });
                    this.m_selectedItems = newSelected;
                    console.log("new selected: " + this.m_selectedItems);
                    var easelElmt = p_easelElmt;
                    var elmtType = this.m_model.getElement(easelElmt.name).getType();
                    var shape: createjs.Shape = <createjs.Shape>easelElmt.getChildAt(0);
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
                            shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                            break;
                        default:
                            break;
                    }

                    this.m_updateMCAStage = true;
                }
                //for (var index in this.m_selectedItems) {
                //    console.log("selected: " + this.m_selectedItems[index]);
                //    for (var ind in this.m_selectedItems[index].
                //}
                
            }

            private setSelection(p_easelElmt: createjs.Container[]): void {
                this.clearSelection();
                ////console.log(p_easelElmt);
                for (var i = 0; i < p_easelElmt.length; i++) {
                    this.addToSelection(p_easelElmt[i]);
                }
            }

            getSelected(): any[] {
                return this.m_selectedItems;
            }

            private clearSelection(): void {
                console.log("clear");
                for (var i = 0; i < this.m_selectedItems.length; i++) {
                    var easelElmt = this.m_selectedItems[i];
                    if (easelElmt.id != this.m_model.getElement(easelElmt.name).m_minitableEaselElmt.id) {//if this is not the minitable
                        var elmtType = this.m_model.getElement(easelElmt.name).getType(); 
                        var shape: any = easelElmt.getChildAt(0);
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
                                shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                                break;
                            default:
                                break;
                        }
                    }                    
                }
                this.m_selectedItems = [];
                this.m_updateMCAStage = true;
            }            
        }
    }
}