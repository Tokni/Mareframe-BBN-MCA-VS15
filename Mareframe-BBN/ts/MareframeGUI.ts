

module Mareframe {
    export module DST {
        export class GUIHandler {
            private m_settingsDiv;
            private m_updating: boolean = false;
            private m_noOfDialogsOpen: number = 0;
            private m_windowResizable: boolean = false;
            private m_editorMode: boolean = false;
            private m_fullscreen: boolean = false;
            private m_handler: Handler;
            private m_mcaStage: createjs.Stage = new createjs.Stage("MCATool");
            private m_valueFnStage: createjs.Stage = new createjs.Stage("valueFn_canvas");
            private m_controlP: createjs.Shape = new createjs.Shape();
            private m_valueFnContainer: createjs.Container = new createjs.Container();
            private m_valueFnLineCont: createjs.Container = new createjs.Container();
            private m_valueFnSize: number = 100;
            private m_mcaStageCanvas: HTMLCanvasElement = <HTMLCanvasElement>this.m_mcaStage.canvas;
            private m_selectionBox: createjs.Shape = new createjs.Shape();
            private m_mcaSizeX: number = $(window).width();
            private m_mcaSizeY: number = $(window).height();
            private m_mcaContainer: createjs.Container = new createjs.Container()
            private m_drawingCont: createjs.Container = new createjs.Container()
            private m_googleColors: string[] = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"];
            private m_mcaBackground: createjs.Shape = new createjs.Shape(new createjs.Graphics().beginFill("white").drawRect(0, 0, this.m_mcaSizeX, this.m_mcaSizeY));
            private m_valFnBackground: createjs.Shape = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.m_valueFnSize, this.m_valueFnSize));
            public m_updateStage: boolean = true;
            private m_chartsLoaded: boolean = false;
            private m_oldX: number = 0;
            private m_oldY: number = 0;
            private m_originalPressX: number = 0;
            private m_originalPressY: number = 0;
            private m_selectedItems: createjs.Container[] = [];
            private m_selectedConnections = [];
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
            private m_elementColors: string[][] = [["#efefff", "#15729b", "#dfdfff", ], ["#fff6e0", "#f6a604", "#fef4c6"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#efffef", "#2fc433", "#dfffdf"]];
            private m_model: Model;
            private m_trashBin: Element[] = [];

            constructor(p_model: Model, p_handler: Handler) {
                this.m_handler = p_handler;
                this.saveChanges = this.saveChanges.bind(this);
                //Change layout if it is not in marefram mode
                if (!this.m_handler.isMareframMode()) {
                    $("#logo").attr("src", "img/tokni_logo.png");
                    $("#logo").attr("style", "height:80px");
                    $("#webpage").attr("href", "http://www.tokni.com");
                    $(".europe-map-back").hide();
                    $("#model_description").text("This is the BBN tool. Yellow nodes represent decision nodes, blue nodes represent chance nodes, and red nodes represent utility nodes. You may doubleclick on each node below, to access the properties tables for that node. To set a decision click on a choice in the table next to decision nodes.");
                    $(".europe-map-zoom").hide();
                    $(".col-md-2").hide();
                    $(".col-md-6").hide();
                    $("#ui_css").attr("href", "jQueryUI/jquery-ui_light.css");
                    $("#dialog_css").attr("href", "css/dialog_tokni.css");
                }
                else {
                    $("#selectModel").hide();
                    $("#selectModelLabel").hide();
                }

                var mareframeGUI = this;
                if (p_model.m_bbnMode) {
                    this.setEditorMode = this.setEditorMode.bind(this);
                    this.setAutoUpdate = this.setAutoUpdate.bind(this);
                    $("#MCADataTable").hide();
                    $("#addDataRow").hide();
                    this.m_mcaStageCanvas.width = $(window).width();
                }
                else {
                    $("#model_description").text("This is the Mareframe MCA tool. Data has been loaded into the table on the right. You may doubleclick on each element below, to access the properties panel for that element. If you doubleclick on one of the red or green elements, you may adjust the weights of it's child elements, and thus the data it points to. In the chart at the bottom, you will see the result of the analysis, with the tallest column being the highest scoring one.");
                    this.setEditorMode = this.setEditorMode.bind(this);
                    this.m_editorMode = false;
                    $("#elementType").hide();
                    //$("#MCAelmtType").hide();
                    //$("#MCAweightingMethod").hide();
                }

                this.allModeltoConsole = this.allModeltoConsole.bind(this);
                this.allConnectionstoConsole = this.allConnectionstoConsole.bind(this);
                this.addDataRowClick = this.addDataRowClick.bind(this);
                this.fitToModel = this.fitToModel.bind(this);
                this.pressMove = this.pressMove.bind(this);
                this.pressUp = this.pressUp.bind(this);
                this.mouseDown = this.mouseDown.bind(this);
                this.dblClick = this.dblClick.bind(this);
                this.mouseEnter = this.mouseEnter.bind(this);
                
                this.clearSelection = this.clearSelection.bind(this);
                this.tick = this.tick.bind(this);
                this.importStage = this.importStage.bind(this);
                this.moveValFnCP = this.moveValFnCP.bind(this);
                this.updateValFnCP = this.updateValFnCP.bind(this);
                this.updateDataTableDiv = this.updateDataTableDiv.bind(this);
                this.flipValFn = this.flipValFn.bind(this);
                this.linearizeValFn = this.linearizeValFn.bind(this);
                this.updateTable = this.updateTable.bind(this);
                this.updateConnection = this.updateConnection.bind(this);
                this.createNewChance = this.createNewChance.bind(this);
                this.createNewDec = this.createNewDec.bind(this);
                this.createNewValue = this.createNewValue.bind(this);
                this.createNewElement = this.createNewElement.bind(this);
                this.deleteSelected = this.deleteSelected.bind(this);
                this.resetDcmt = this.resetDcmt.bind(this); 
                this.newDcmt = this.newDcmt.bind(this); 
                this.updateModel = this.updateModel.bind(this); 
                this.addLoadingCursor = this.addLoadingCursor.bind(this);
                this.openSettings = this.openSettings.bind(this);
                this.openVIO = this.openVIO.bind(this);
                this.mouseUp = this.mouseUp.bind(this);
                this.selectAll = this.selectAll.bind(this);
                this.saveModel = this.saveModel.bind(this);
                this.loadModel = this.loadModel.bind(this);
                this.selectModel = this.selectModel.bind(this);
                this.clickedDecision = this.clickedDecision.bind(this);
                this.clickedEvidence = this.clickedEvidence.bind(this);
                this.inputChanged = this.inputChanged.bind(this);
                
                this.fullscreen = this.fullscreen.bind(this);
                this.cnctStatus = this.cnctStatus.bind(this);
                this.optionTypeChange = this.optionTypeChange.bind(this);
                this.optionMethodChange = this.optionMethodChange.bind(this);

                this.m_model = p_model;
                this.m_mcaBackground.name = "hitarea";

                this.updateEditorMode = this.updateEditorMode.bind(this);
                this.m_mcaBackground.addEventListener("mousedown", this.mouseDown);
                //this.m_mcaBackground.addEventListener("stagemouseup", this.mouseUp);

                this.m_controlP.graphics.f("#0615b4").s("#2045ff").rr(0, 0, 6, 6, 2);
                this.m_valFnBackground.addEventListener("pressmove", this.moveValFnCP);
                this.m_valFnBackground.addEventListener("mousedown", this.downValFnCP);
                this.m_mcaBackground.addEventListener("pressmove", this.pressMove);
                this.m_mcaBackground.addEventListener("pressup", this.pressUp);
                this.m_controlP.mouseChildren = false;
               $("#selectModel").on("change", this.selectModel);
                $("#MCAelmtType").on("change", this.optionTypeChange);
                $("#MCAWeightingMethod").on("change", this.optionMethodChange);
                $("#debugButton").on("click", this.allModeltoConsole);
                $("#debugConnect").on("click", this.allConnectionstoConsole);
                $("#valueFn_Linear").on("click", this.linearizeValFn);
                $("#valueFn_Flip").on("click", this.flipValFn);
                $("#newElmt").on("click", this.createNewElement);
                $("#newChance").on("click", this.createNewChance);
                $("#newDec").on("click", this.createNewDec);
                $("#newValue").on("click", this.createNewValue);
                $("#deleteElmt").on("click", this.deleteSelected);
                $("#editorMode").on("click", this.setEditorMode);

                $("#autoUpdate").on("click", this.setAutoUpdate);
                $("#resetDcmt").on("click", this.resetDcmt);
                $("#newDcmt").on("click", this.newDcmt);
                $("#updateMdl").on("mouseup", this.updateModel);
                //$("#updateMdl").on("mousedown", this.addLoadingCursor);//This does not work
                $("#settings").on("click", this.openSettings);
                $("#voi").on("click", this.openVIO);
                $("#fitToModel").on("click", this.fitToModel);
                $("#selectAllElmt").on("click", this.selectAll);
                $("#savDcmt").on("click", this.saveModel);
                $("#downloadLink").on("click", function (evt) {
                    $("#saveFile_div").hide();
                });
                $("#fullscreen").on("click", this.fullscreen);
                $("#cnctTool").on("click", this.cnctStatus);


                $("#lodDcmt").on("change", this.loadModel);
                $("#lodDcmt").on("click", function () {
                    console.log("click");
                    this.value = null;
                });
               


                this.m_mcaStage.addChild(this.m_mcaBackground);
                this.m_mcaStage.enableMouseOver(20);//Enable mouse over
                this.m_mcaStage.addChild(this.m_mcaContainer);
                this.m_valueFnStage.addChild(this.m_valFnBackground);
                this.m_valueFnStage.addChild(this.m_valueFnLineCont);
                this.m_valueFnStage.addChild(this.m_valueFnContainer);
                this.m_valueFnStage.addChild(this.m_controlP);
                createjs.Ticker.addEventListener("tick", this.tick);
                createjs.Ticker.setFPS(60);
                $("#debug").hide();
                $(".advButton").hide();
                $(".button").show();
                $("#lodDcmtDiv").hide();
                if (this.m_model.getAutoUpdate()) {
                    $("#updateMdl").hide();
                }
                $("#settings").show();
                $("#modeStatus").hide();
                this.m_mcaContainer.addChild(this.m_drawingCont);

                
            }

            private createProgressbarDialog() {
                var progressBarDialog = document.createElement("div");
                $('body').append(progressBarDialog);
                progressBarDialog.setAttribute("id", "progressbarDialog");

                var div = document.createElement("div");
                div.setAttribute("id", "progressText");
                div.innerHTML = "Updating Model";
                progressBarDialog.appendChild(div);
                var progressBar = document.createElement("div");
                progressBar.setAttribute("id", "progressBar");
                progressBarDialog.appendChild(progressBar);
                $("#progressBar").progressbar();
                $("#progressBar").progressbar("option", "max", 100);

                var button = document.createElement("button");
                button.setAttribute("id", "cancelProgress");
                button.innerHTML = "Cancel";
                button.style.marginTop = "6px";
                progressBarDialog.appendChild(button);
                
                
            }
            
            private optionTypeChange(p_evt: Event) {

                //console.log("Element name: " + p_evt.target.id);
                var elmt: any = $("#detailsDialog").data("element");
                 
                //elmt.setType(p_evt.target.value);

                
            }
            private optionMethodChange(p_evt: Event) {
                var elmt: any = $("#detailsDialog").data("element");
                //elmt.setMethod(p_evt.target.value);
            }
            private allConnectionstoConsole(p_evt: Event) {
                for (var i = 0; i < this.m_model.getConnectionArr().length; i++) {
                    console.log("Id: " + this.m_model.getConnectionArr()[i].getID() + "  InElmt: " + this.m_model.getConnectionArr()[i].getInputElement().getName() + "  OutElmt: " + this.m_model.getConnectionArr()[i].getOutputElement().getName());
                }
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
                //for (var i = 0; i < this.m_model.getConnectionArr().length; i++) {
                //    console.log("Id: " + this.m_model.getConnectionArr()[i].getID + "  InElmt: " + this.m_model.getConnectionArr()[i].getInputElement + "  OutElmt: " + this.m_model.getConnectionArr()[i].getOutputElement);
                //}
                     
            }
            private cnctStatus(p_evt: Event) {
                    $(".cnctTool").removeClass("ui-state-focus"); 
                if ($("#cnctTool").prop("checked")) {
                    $("#modeStatus").html("Connect Mode");
                    document.body.style.cursor = "alias";
                }
                else {
                    $("#modeStatus").html("Editor Mode");
                    document.body.style.cursor = "default";
                }
            }
            private selectModel(p_evt: Event) {
                this.m_model.closeDown();
                this.clearSelection();
                this.m_handler.getFileIO().loadModel($("#selectModel").val(), this.m_model, this.importStage);
            }
            private loadModel(p_evt: Event) {
                $("#lodDcmt").removeClass("ui-state-focus");
                $("#selectModel").prop("selectedIndex", 0);
                this.m_model.closeDown();
                console.log("load model");
                this.m_handler.getFileIO().loadfromGenie(this.m_model, this.importStage);
                this.updateSize();
            }
            private saveModel(p_evt: Event) {
                $("#savDcmt").removeClass("ui-state-focus");
                $("#saveFile_div").show();
                this.m_handler.getFileIO().saveModel(this.m_model);
            }
            private selectAll(p_evt: Event) {
                this.clearSelection();
                for (var i = 0; i < this.m_model.getElementArr().length; i++) {
                    this.addToSelection(this.m_model.getElementArr()[i].m_easelElmt);
                }
            }
            //This method is not being used at the moment
            private addLoadingCursor() {
                console.log("changing to progress");
                document.getElementsByTagName("body")[0].style.cursor = "progress";
            }
            private cancelWorker = (p_evt: Event): void => {
                var worker: Worker = p_evt.data.worker;
                Tools.stopWorker(worker);
                this.goToUpdateMode(false);
            }
            private cancelTwoWorkers = (p_evt: Event): void => {
                var worker: Worker = p_evt.data.worker1;
                (p_evt.data.worker2).terminate
                Tools.stopWorker(worker);
                this.gotToVOICalcMode(false);
            }
            public updateModel() {
                /*$("#updateMdl").removeClass("ui-state-focus");
                this.goToUpdateMode(true);
                this.m_model.update();
                this.updateMiniTables(this.m_model.getElementArr());
                this.updateOpenDialogs();
                this.goToUpdateMode(false);*/
                this.updateModelUsingWebWorkers();
            }
            public updateModelUsingWebWorkers() {
                if ($("#progressbarDialog").length == 0) {
                    //Create progressbar if it has not been created
                    this.createProgressbarDialog();
                }
                //this.updateModelParallel();
                var gui: GUIHandler = this;
                $("#updateMdl").removeClass("ui-state-focus");

                var worker = Tools.startWorker(true);
                this.goToUpdateMode(true);
                $("#progressText").text("Updating model");
                $("#cancelProgress").click({ worker: worker }, this.cancelWorker);
                $("#progressbarDialog").on("dialogclose", { worker: worker }, this.cancelWorker);
                var t = this.m_model.toJSON()
                worker.postMessage({
                    model: JSON.stringify(this.m_model.toJSON())
                });
                 
                var status: number = 0;
                worker.onmessage = function (evt) {
                    switch (evt.data.command) {
                        case "finnished":
                            var model: Model = new Model(true)
                            model.fromJSON(JSON.parse(evt.data.model), false);
                            //gui.m_model = model;
                            //this.m_model.update();
                            gui.m_model.getElementArr().forEach(function (e) {
                                e.setValues(model.getElement(e.getID()).getValues());
                                e.addMinitable();
                                e.addEaselElmt();
                                e.setUpdated(true);
                            });
                            gui.updateMiniTables(gui.m_model.getElementArr());
                            gui.updateOpenDialogs();
                            gui.importStage();
                            Tools.stopWorker(worker);
                            gui.goToUpdateMode(false);
                            break;
                        case "progress":
                            status += evt.data.progress;
                            $("#progressBar").progressbar({
                                value: status
                            });
                            break;
                    }
                };

            }

            public updateModelParallel() {
                var gui: GUIHandler = this;
                $("#updateMdl").removeClass("ui-state-focus");
                this.goToUpdateMode(true);

                var worker1: Worker = Tools.startWorker("../updater.js", true);
                var worker2: Worker = Tools.startWorker("../updater.js", true);
                worker1.postMessage({
                    command: "createTable",
                    model: JSON.stringify(this.m_model.toJSON())
                });
                $("#cancelProgress").click({ worker1: worker1, worker2: worker2 }, this.cancelWorker);
                var elmtNo: number = 0;
                var elments: Element[] = this.m_model.getElementArr();
                var sampleTable: any[];
                var updatingModel: Model;
                var firstWorkerDone: boolean = false;
                worker1.onmessage = function (evt) {
                    switch (evt.data.command) {
                        case "tableCreated":
                            //First part of updating is done
                            var model: Model = new Model(true)
                            model.fromJSON(JSON.parse(evt.data.model), false);
                            updatingModel = model;
                            var table = evt.data.table;
                            sampleTable = table;
                            worker1.postMessage({
                                command: "updateElmt",
                                elmt: JSON.stringify(elments[elmtNo].toJSON()),
                                table: table
                            });
                            elmtNo++;
                            worker2.postMessage({
                                command: "updateElmt",
                                elmt: JSON.stringify(elments[elmtNo].toJSON()),
                                table: table
                            });
                            elmtNo++;
                            break;
                        case "elementUpdated":
                            //Update values table of updated element
                            var elmt: Element = new Element("elmt", undefined, undefined);
                            elmt.fromJSON(JSON.parse(evt.data.elmt));
                            var e = gui.m_model.getElement(elmt.getID());
                            e.setValues(elmt.getValues());
                            e.setUpdated(true);
                            if (elmtNo === elments.length) {
                                //If this was the last element, move on to decisions
                                if (firstWorkerDone) {
                                    worker1.postMessage({
                                        command: "updateDecisions",
                                        model: JSON.stringify(gui.m_model.toJSON())
                                    });
                                }
                                else {
                                    Tools.stopWorker(worker1);
                                    firstWorkerDone = true;
                                }
                            }
                            else {
                                //start updating next element
                                worker1.postMessage({
                                    command: "updateElmt",
                                    elmt: JSON.stringify(elments[elmtNo].toJSON()),
                                    table: sampleTable
                                });
                                elmtNo++;
                            }
                            break;
                        case "decisionsUpdated":
                            gui.m_model.closeDown();
                            var model: Model = new Model(true)
                            model.fromJSON(JSON.parse(evt.data.model), false);
                            gui.m_model = model;
                            //this.m_model.update();
                            gui.m_model.getElementArr().forEach(function (e) {
                                e.addMinitable();
                                e.addEaselElmt();
                                e.setUpdated(true);
                            });
                            gui.updateMiniTables(gui.m_model.getElementArr());
                            gui.updateOpenDialogs();
                            gui.importStage();
                            Tools.stopWorker(worker1);
                            gui.goToUpdateMode(false);
                            break;
                        default: console.log("unknown command");

                    }
                }
                worker2.onmessage = function (evt) {
                    switch (evt.data.command) {
                        case "elementUpdated":
                            //Update values table of updated element
                            var elmt: Element = new Element("elmt", undefined, undefined);
                            elmt.fromJSON(JSON.parse(evt.data.elmt));
                            var e = gui.m_model.getElement(elmt.getID());
                            e.setValues(elmt.getValues());
                            e.setUpdated(true);
                            if (elmtNo === elments.length) {
                                if (firstWorkerDone) {
                                    worker2.postMessage({
                                        command: "updateDecisions",
                                        model: JSON.stringify(gui.m_model.toJSON())
                                    });
                                }
                                else {
                                    Tools.stopWorker(worker2);
                                    firstWorkerDone = true;
                                }
                            }
                            else {
                                //start updating next element
                                worker2.postMessage({
                                    command: "updateElmt",
                                    elmt: JSON.stringify(elments[elmtNo].toJSON()),
                                    table: sampleTable
                                });
                                elmtNo++;
                            }
                            break;
                        case "decisionsUpdated":
                            gui.m_model.closeDown();
                            var model: Model = new Model(true)
                            model.fromJSON(JSON.parse(evt.data.model), false);
                            gui.m_model = model;
                            //this.m_model.update();
                            gui.m_model.getElementArr().forEach(function (e) {
                                e.addMinitable();
                                e.addEaselElmt();
                                e.setUpdated(true);
                            });
                            gui.updateMiniTables(gui.m_model.getElementArr());
                            gui.updateOpenDialogs();
                            gui.importStage();
                            Tools.stopWorker(worker2);
                            gui.goToUpdateMode(false);
                            break;
                        default: console.log("unknown command");
                    }
                }
            }
            private updateDecAndEvidenceVisually() {
                this.updateMiniTables(this.m_model.getElementArr());
                this.updateOpenDialogs();
            }
            private fitToModel() {
                this.repositionModel();
                this.updateSize();
            }
            private setSize(p_width: number, p_height: number): void {
                //console.log("setting size to " + p_width + " , " + p_height);
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
            private newDcmt() {
                $("#newDcmt").removeClass("ui-state-focus");
                $("#selectModel").prop("selectedIndex", 0);
                console.log("new document clicked");
                this.clearSelection();
                this.m_model = this.m_handler.addNewModel();
                this.importStage();
            }
            private resetDcmt() {
                console.log("in local storage: " + localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                this.clearSelection();
                if (this.m_handler.getFileIO().reset() === null) {
                    var loadModel: string = Tools.getUrlParameter('model');
                    loadModel = this.m_model.getIdent();
                    console.log("using model: " + loadModel);
                    this.m_handler.getFileIO().loadModel(loadModel, this.m_handler.getActiveModel(), this.importStage);
                }
                else {
                    this.m_model.fromJSON(this.m_handler.getFileIO().reset(), true);
                    this.importStage();
                    if (!this.m_model.getElementArr().length) {
                        var loadModel: string = Tools.getUrlParameter('model');
                        loadModel = "scotland";
                        console.log("using model: " + loadModel);
                        this.m_handler.getFileIO().loadModel(loadModel, this.m_handler.getActiveModel(), this.importStage);
                    }
                }
                this.m_model.closeDown();
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
                    this.updateMiniTables(elmts);
                }
                this.m_updateStage = true
                $("#modelHeader").html(this.m_model.getName());
                //this.repositionModel();
                this.updateSize();
                //this.m_handler.getFileIO().quickSave(this.m_model); //This is commented out the because it was preventing reset from working properly
            };
            private mouseUp(p_evt: createjs.MouseEvent) {
               // console.log("mouse up");
                $("#mX").html("X: " + p_evt.stageX);
                $("#mY").html("Y: " + p_evt.stageY);
                $("#mAction").html("Action: mouseUp");
                $("#mTarget").html("Target: " + p_evt.target.name);
                //var tmp: any = this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0).name;
                //$("#mTarget").html("Target: " + tmp );
                this.m_updateStage = true;
                

            }
            private pressUp(p_evt: createjs.MouseEvent) {
                console.log("target: " + p_evt.target.name);
                console.log("x: " + p_evt.rawX + " y " + p_evt.rawY);
                if (this.m_mcaContainer.getChildByName("drawCont") !== null) {
                    //If we are in the processes of connecting
                    if (this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0) !== null
                        && this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0).parent.name.substr(0, 4) === "elmt") {
                        console.log("element");
                        //If the mouse is being released over an element
                        var outputElmt: Element = this.m_model.getElement(this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0).parent.name);
                        var inputElmt: Element = this.m_model.getElement(p_evt.target.name);
                        this.connect(inputElmt, outputElmt);
                        this.m_mcaContainer.removeChild(this.m_mcaContainer.getChildByName("drawCont"));

                    }
                    else {
                        //If mouse is released anywhere else
                        console.log("not element");
                        this.m_mcaContainer.removeChild(this.m_mcaContainer.getChildByName("drawCont"));
                    }
                    var gui = this;
                    //Resets the visually selected elements
                    this.m_model.getElementArr().forEach(function (e) {
                        if (e.getVisuallySelected()) {
                            gui.drawElementNotSelected(e);
                        }
                    });
                    this.m_updateStage = true;
                }
            }
            private mouseMove(p_evt: createjs.MouseEvent) {
                if ($("cnctTool").prop("checked")) {

                }
            }
            private updateElement(p_elmt: Element) {
                p_elmt.m_easelElmt.removeAllChildren();
                var elmtShapeType: number = 2;
                if (this.m_model.m_bbnMode) {
                    elmtShapeType = p_elmt.getType();
                }

                var shape = new createjs.Shape();
                shape.graphics.f(this.m_elementColors[elmtShapeType][0]).s(this.m_elementColors[elmtShapeType][1]);

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
                        this.drawPolygon(shape, this.m_elementColors[elmtShapeType][1]);
                        //shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                        break;
                    case 3:
                        //Super Value
                        this.drawPolygon(shape, this.m_elementColors[elmtShapeType][1]);
                        //shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                        break;
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
            updateMiniTables(p_elmtArr: Element[]) {
                //console.log("updating minitable");
                for (var j = 0; j < p_elmtArr.length; j++) {
                    var elmt = p_elmtArr[j];
                    //console.log(elmt.getName() + " minitable is being updated");
                    var backgroundColors = ["#c6c6c6", "#bfbfe0"]
                    var decisionCont: createjs.Container = elmt.m_minitableEaselElmt;

                    decisionCont.removeAllChildren();
                    var max = elmt.getData().length - Tools.numOfHeaderRows(elmt.getData());
                    if ((elmt.getType() === 2 || elmt.getType() === 3) && Tools.numOfHeaderRows(elmt.getValues()) === 1) {// Values can be shown vertically in utility nodes with only one headerrow
                        max = elmt.getValues()[0].length-1;
                    }
                    for (var i = 0; i < max; i++) {
                            var barBackgroundColor: string = backgroundColors[i % 2];
                            var nameBackgroundColor: string;
                            if (elmt.getType() === 1 && elmt.getDecision() === i
                                || elmt.getType() === 0 && elmt.getEvidence() === i) {//Color set decision or evidence
                                nameBackgroundColor = "#CCFFCC";
                            }
                            else {
                                nameBackgroundColor = backgroundColors[i % 2];
                            }
                            var decisRect: createjs.Shape = new createjs.Shape(new createjs.Graphics().f(nameBackgroundColor).s("#303030").ss(0.5).r(0, i * 12, 70, 12));

                            //   console.log("" + elmt.getValues());
                            //console.log("substring 0-12: " + elmt.getValues()[i][0]);

                            //Choice or state name
                            if ((elmt.getType() === 2 || elmt.getType() === 3) && Tools.numOfHeaderRows(elmt.getValues()) === 1) {
                                var decisName: createjs.Text = new createjs.Text(elmt.getValues()[0][i+1].substr(0, 12), "0.8em trebuchet", "#303030");
                            }
                            else {
                                var decisName: createjs.Text = new createjs.Text(elmt.getData()[i+Tools.numOfHeaderRows(elmt.getData())][0].substr(0, 12), "0.8em trebuchet", "#303030");
                            }
                            decisName.textBaseline = "middle";
                            decisName.maxWidth = 68;
                            decisName.x = 2;
                            decisName.y = 6 + (i * 12);

                            decisionCont.addChild(decisRect);
                            decisionCont.addChild(decisName);

                            if (elmt.isUpdated() && (elmt.getValues()[0].length <= 2 || ((elmt.getType() === 2 || elmt.getType() === 3) && Tools.numOfHeaderRows(elmt.getValues()) === 1))) {
                                if ((elmt.getType() === 2 || elmt.getType() === 3) && Tools.numOfHeaderRows(elmt.getValues()) === 1) {
                                    var valueData: number = elmt.getValues()[1][1+i]; //Values are shown vertical
                                }
                                else {
                                    var valueData: number = elmt.getValues()[i + Tools.numOfHeaderRows(elmt.getValues())][1];
                                }
                            if (valueData == -Infinity) {
                                valueData = 0;
                            }
                            var decisBarBackgr: createjs.Shape = new createjs.Shape(new createjs.Graphics().f(barBackgroundColor).s("#303030").ss(0.5).r(70, i * 12, 60, 12));
                            
                                if (elmt.getType() === 0) {//Chance
                                    var decisBar: createjs.Shape = new createjs.Shape(new createjs.Graphics().f(this.m_googleColors[i % this.m_googleColors.length]).r(96, 1 + (i * 12), 35 * valueData, 10));
                                    var decisPercVal: createjs.Text = new createjs.Text(Math.round(valueData * 100) + "%", "0.8em trebuchet", "#303030");

                                    decisPercVal.maxWidth = 22;
                                } else  {//Decision or value
                                    var decisPercVal: createjs.Text = new createjs.Text("" + Tools.round2(valueData), "0.8em trebuchet", "#303030");
                                    decisPercVal.maxWidth = 68;
                                }
                                decisPercVal.textBaseline = "middle";
                                decisPercVal.x = 71;
                                decisPercVal.y = 6 + (i * 12);

                                decisionCont.addChild(decisBarBackgr);
                                decisionCont.addChild(decisPercVal);
                                if (elmt.getType() === 0) {
                                    decisionCont.addChild(decisBar);
                                }
                            }
                        }
                        if (!elmt.isUpdated()) {
                            var height: number = elmt.getValues().length - Tools.numOfHeaderRows(elmt.getValues());
                            //Set text box to show "Update to show values" if element is not updated
                            //var decisBarBackgr: createjs.Shape = new createjs.Shape(new createjs.Graphics().f(barBackgroundColor).s("#303030").ss(0.5).r(70, 12 * Tools.numOfHeaderRows(elmt.getValues()), 60, 12 * height));
                            var decisPercVal: createjs.Text = new createjs.Text("Update to\nshow\nvalues", "0.8em trebuchet", "#303030");
                            decisPercVal.maxWidth = 68;
                            decisPercVal.textBaseline = "middle";
                            decisPercVal.textAlign = "center";
                            decisPercVal.x = 100;
                            decisPercVal.y =  8;
                            //decisionCont.addChild(decisBarBackgr);
                            decisionCont.addChild(decisPercVal);
                        }
                        else if ((elmt.getValues()[0].length > 2 && (elmt.getType() !== 2 && elmt.getType() !== 3)) ||
                            elmt.getValues().length > 2 && elmt.getType() !==0 && elmt.getType() !== 1 ) {
                            var height: number = elmt.getValues().length - Tools.numOfHeaderRows(elmt.getValues());
                            //Set text box to show "Values are multi-dimensional" if element is not updated
                             var decisPercVal: createjs.Text = new createjs.Text("Values\nare multi-\ndimensional", "0.8em trebuchet", "#303030");
                            decisPercVal.maxWidth = 68;
                            decisPercVal.textBaseline = "middle";
                            decisPercVal.textAlign = "center";
                            decisPercVal.x = 100;
                            decisPercVal.y = 8;
                            decisionCont.addChild(decisPercVal);

                        }
                    
                    if (elmt.getType() === 1) {

                        decisionCont.addEventListener("click", this.clickedDecision);
                    }
                    else if (elmt.getType() === 0) {
                        decisionCont.addEventListener("click", this.clickedEvidence);
                    }
                    decisionCont.x = elmt.m_easelElmt.x + 75;
                    decisionCont.y = elmt.m_easelElmt.y - 15;
                    decisionCont.name = elmt.getID();
                    elmt.m_minitableEaselElmt = decisionCont;
                    this.m_mcaContainer.addChild(decisionCont);

                    this.m_updateStage = true;
                }
                //}
            }
            private clickedDecision(p_evt: createjs.MouseEvent) {
                if (!this.m_editorMode && this.m_noOfDialogsOpen == 0 && !this.m_updating) {// Setting decision while in editor mode messes with the calculations
                    //console.log("clicked a decision");
                    //console.log(p_evt);
                    var elmt: Element = this.m_model.getElement(p_evt.currentTarget.name);
                    this.m_model.setDecision(elmt, Math.floor(p_evt.localY / 12)/*- Tools.numOfHeaderRows(elmt.getValues(), elmt)*/);
                    if (this.m_model.getAutoUpdate()) {
                        this.updateModel();
                    }
                    this.updateDecAndEvidenceVisually();
                }
            }
            private clickedEvidence(p_evt: createjs.MouseEvent) {
                if (!this.m_editorMode && this.m_noOfDialogsOpen == 0 && !this.m_updating) {// Setting evidence while in editor mode messes with the calculations
                    var elmt: Element = this.m_model.getElement(p_evt.currentTarget.name);
                    console.log("Local: " + p_evt.localY / 12 + " header rows: " + Tools.numOfHeaderRows(elmt.getValues(), elmt));
                    this.m_model.setEvidence(elmt, Math.floor(p_evt.localY / 12));// - Tools.numOfHeaderRows(elmt.getValues(),elmt));
                    if (this.m_model.getAutoUpdate()) {
                        this.updateModel();
                    }
                    this.updateDecAndEvidenceVisually();
                }
            }
            private gotToVOICalcMode(p_bool: boolean): void {
                if (p_bool) {
                    $(".notAllowedDuringVOI").addClass("disabled");
                    $(".notAllowedDuringVOI").addClass("ui-state-disabled");
                    $(".notAllowedDuringVOI").attr("disabled", "disabled");
                }
                else {
                    $(".notAllowedDuringVOI").removeClass("disabled");
                    $(".notAllowedDuringVOI").removeClass("ui-state-disabled");
                    $(".notAllowedDuringVOI").removeAttr("disabled");
                }
            }

            private goToUpdateMode(p_bool: boolean): void {
                if (p_bool) {
                    $(".editorBut").addClass("disabled"); 
                    $(".editorBut").addClass("ui-state-disabled");
                    $(".editorBut").attr("disabled", "disabled"); 
                    $(".notAllowedDuringUpdate").addClass("disabled"); 
                    $(".notAllowedDuringUpdate").attr("disabled", "disabled"); 
                    $(".notAllowedDuringUpdate").addClass("ui-state-disabled");
                }
                else {
                    $(".editorBut").removeClass("disabled");
                    $(".editorBut").removeClass("ui-state-disabled");
                    $(".editorBut").removeAttr("disabled");
                    $(".notAllowedDuringUpdate").removeClass("disabled");
                    $(".notAllowedDuringUpdate").removeAttr("disabled"); 
                    $(".notAllowedDuringUpdate").removeClass("ui-state-disabled");
                }
            }
            private updateEditorMode() {
                $(".editorMode").removeClass("ui-state-focus");
                console.log("updating editormode");
                var mareframe = this;
                if (this.m_editorMode) {
                    $(".advButton").show();
                    $("#resetDcmt").hide();
                    $("#selectAllElmt").hide();
                    if (this.m_model.m_bbnMode) {
                        $("#lodDcmtDiv").css("display", "inline-block"); //cannot use show here, because in firefox it adds the attribute "block" and the button is not inline
                        $("#newElmt").hide();
                        /*$("#newChance").hide();
                        $("#newDec").hide();
                        $("#newValue").hide();
                        $("#cnctTool").hide();*/
                        if (this.m_model.getAutoUpdate()) {
                            $("#updateMdl").hide();
                        }
                    }
                    else {
                        $("#newChance").hide();
                        $("#newDec").hide();
                        $("#newValue").hide();
                        $("#elementType").show();
                    }
                } else {
                    $(".advButton").hide();
                    $(".button").show();
                    $("#lodDcmtDiv").hide();
                    $("#cnctTool").prop("checked", false);
                    document.body.style.cursor = "default";
                    if (!this.m_model.getAutoUpdate()) {
                        $("#updateMdl").show();
                    }
                }
                if (this.m_editorMode) {
                    this.m_mcaBackground.addEventListener("pressup", this.pressUp);
                }
                else {

                    this.m_mcaBackground.removeEventListener("pressup", this.pressUp);
                }
                var connArr = this.m_model.getConnectionArr();
                if (connArr) {
                    for (var i = 0; i < connArr.length; i++) {
                        console.log(connArr[i].m_easelElmt.name);
                        if (this.m_editorMode) {
                            connArr[i].m_easelElmt.children.forEach(function (c) {
                                c.addEventListener("mousedown", mareframe.mouseDown);
                            });
                        } else {
                            connArr[i].m_easelElmt.children.forEach(function (c) {

                                c.removeEventListener("mousedown", mareframe.mouseDown);
                            });
                        }
                    }
                }
                var elementArr = this.m_model.getElementArr();
                if (elementArr) {
                    for (var i = 0; i < elementArr.length; i++) {
                        if (this.m_editorMode) {
                            elementArr[i].m_easelElmt.addEventListener("pressmove", this.pressMove);
                            elementArr[i].m_easelElmt.addEventListener("pressup", this.pressUp);
                            if (elementArr[i].getType() === 1) {
                                this.m_model.setDecision(elementArr[i], elementArr[i].getDecision());//Unsets all decisions
                            }
                            if (elementArr[i].getType() === 0) {
                                this.m_model.setEvidence(elementArr[i], elementArr[i].getEvidence());//Unset all evidence
                            }
                        } else {
                            elementArr[i].m_easelElmt.removeEventListener("pressmove", this.pressMove);
                            elementArr[i].m_easelElmt.removeEventListener("pressup", this.pressUp);
                        }
                        elementArr[i].update();
                        elementArr[i].setUpdated(false);
                    }
                    this.updateMiniTables(this.m_model.getElementArr());
                }
            }
            private setShowDescription(p_evt: Event) {
                console.log("HERE");
                var id: string = p_evt.data.param1.getID();

                $("#detailsDialog_" + id).data("showDescription", !$("#detailsDialog_" + id).data("showDescription"));
                console.log("show description: " + $("#detailsDialog_" + id).data("showDescription"));
                if ($("#detailsDialog_" + id).data("showDescription")) {
                    $("#description_div_" + id).show();
                    $("#showDescription_" + id).html("Hide description");
                    $("#showDescription_" + id).prop("title", "Click to hide the description of the element");
                }
                else {
                    $("#description_div_" + id).hide();
                    $("#showDescription_" + id).html("Show description");
                    $("#showDescription_" + id).prop("title", "Click to show a description of the element");
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
                $(".autoUpdate").removeClass("ui-state-focus");
                this.m_model.setAutoUpdate(cb.currentTarget.checked);
                if (cb.currentTarget.checked) {
                    //$("#autoUpdateStatus").html("Updating automatically");
                    $("#updateMdl").hide();
                }
                else {
                    $("#autoUpdateStatus").html("");
                    $("#updateMdl").show();
                }

                //console.log("auto update: " + this.m_model.m_autoUpdate);
            }
            private fullscreen(p_evt: Event) {
                $(".fullscreen").removeClass("ui-state-focus");
                console.log("in local storage: " + localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                var model: Model = this.m_model;
                // this.m_handler.getFileIO().quickSave(model);
                //var modelIdent = model.getIdent();
                //var json: string = JSON.stringify(model);
                //sessionStorage.setItem(model.getIdent(), json);
                
                console.log("fullscreen pressed");
                if (!this.m_fullscreen) {
                    //console.log("was not in fullscreen");
                    $(".row").hide();
                    $(".footer").hide();
                    var modelPos: number[] = this.getModelPos();
                    this.setSize(Math.max(modelPos[3], $(window).width()), Math.max(modelPos[1], $(window).height()));
                    this.m_fullscreen = true;
                }
                else {
                    //console.log("was in fullscreen");
                    $(".row").show();
                    $(".footer").show();
                    this.repositionModel();
                    this.updateSize();
                    this.m_fullscreen = false;
                }
                //json = JSON.parse(sessionStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                //json = JSON.parse(sessionStorage.getItem(modelIdent));
                //model.fromJSON(json);
                // this.importStage(); 
                this.m_updateStage = true;
            }
            //Moves all elements to a reasonable position
            private repositionModel(): void {
                var modelPos: number[] = this.getModelPos();
                var lowestElement: number = modelPos[0];
                var highestElement: number = modelPos[1];
                var leftmostElement: number = modelPos[2];
                var rightmostElement: number = modelPos[3];
                var moveDistanceX: number = 0;
                var moveDistanceY: number = 0;
                if (highestElement > 50) {//Move elements up if highest element is too low
                    moveDistanceY = -highestElement + 50;
                }
                if (this.getModelSize()[0] > $(window).width()) {//If model width is larger than window widht
                    if (leftmostElement > 100) {//Move model if leftmost element is to far from the left edge
                        moveDistanceX = -leftmostElement + 100;
                    }
                }
                else {//Otherwise center the model horizontally
                    moveDistanceX = $(window).width() / 2 - (leftmostElement + (rightmostElement - leftmostElement) / 2);
                }
                this.moveAllElements(moveDistanceX, moveDistanceY);
            }
            private updateSize(): void {
                console.log("updating size");
                var modelPos: number[] = this.getModelPos();
                var lowestElement: number = modelPos[0];
                var highestElement: number = modelPos[1];
                var leftmostElement: number = modelPos[2];
                var rightmostElement: number = modelPos[3];
                var moveDistanceX: number = 0;
                var moveDistanceY: number = 0;
                //   console.log("highest element: " + highestElement);
                // console.log("lowest element: " + lowestElement);
                // console.log("rightmost element: " + rightmostElement);
                //console.log("leftmost element: " + leftmostElement);
               
                this.m_updateStage = true;
                this.setSize(Math.max($(window).width(), rightmostElement), Math.max($(window).height(), lowestElement)); //Sets size 
            }
            private getModelSize(): number[] {
                var modelPos: number[] = this.getModelPos();
                return [modelPos[3] - modelPos[2], modelPos[1] - modelPos[0]];
            }
            //Returns a list containing lowest, highest, leftmost and rightmost element in that order
            private getModelPos(): number[] {
                var gui = this;
                var lowestElement: number = 0;
                var highestElement: number = $(window).height();
                var leftmostElement: number = $(window).width();
                var rightmostElement: number = 0;
                this.m_model.getElementArr().forEach(function (e) {
                    //console.log("e y = " + (e.m_easelElmt.y + gui.m_mcaContainer.y) + " and lowestElement: " + lowestElement);
                    if (e.m_easelElmt.y + gui.m_mcaContainer.y > lowestElement) {
                        lowestElement = gui.m_mcaContainer.y + e.m_easelElmt.y + 40;
                    }
                    if (e.m_easelElmt.y + gui.m_mcaContainer.y < highestElement) {
                        highestElement = e.m_easelElmt.y + gui.m_mcaContainer.y;
                    }
                    if (e.m_easelElmt.x + gui.m_mcaContainer.x < leftmostElement) {
                        leftmostElement = e.m_easelElmt.x + gui.m_mcaContainer.x;
                    }
                    if (e.m_easelElmt.x + gui.m_mcaContainer.x > rightmostElement) {
                        rightmostElement = e.m_easelElmt.x + gui.m_mcaContainer.x + 250;
                    }
                });
                return [lowestElement, highestElement, leftmostElement, rightmostElement];
            }
            private getSelectedPos(): number[] {
                var gui = this;
                var lowestElement: number = 0;
                var highestElement: number = $(window).height();
                var leftmostElement: number = $(window).width();
                var rightmostElement: number = 0;
                var selected: any[] = this.getSelected();
                for (var i = 0; i < selected.length; i += 2) {//Every second element is a minitable and should not be considered
                    //console.log("e y = " + (e.m_easelElmt.y + gui.m_mcaContainer.y) + " and lowestElement: " + lowestElement);
                    var e = selected[i];
                    if (e.y + gui.m_mcaContainer.y > lowestElement) {
                        lowestElement = gui.m_mcaContainer.y + e.y + 40;
                    }
                    if (e.y + gui.m_mcaContainer.y < highestElement) {
                        highestElement = e.y + gui.m_mcaContainer.y;
                    }
                    if (e.x + gui.m_mcaContainer.x < leftmostElement) {
                        leftmostElement = e.x + gui.m_mcaContainer.x;
                    }
                    if (e.x + gui.m_mcaContainer.x > rightmostElement) {
                        rightmostElement = e.x + gui.m_mcaContainer.x + 250;
                    }
                }
                // console.log("highest: " + highestElement + " lowest: " + lowestElement + " leftmost: " + leftmostElement + " rightmost: " + rightmostElement);
                return [lowestElement, highestElement, leftmostElement, rightmostElement];
            }
            private createNewChance(p_evt: Event) {
                $("#newChance").removeClass("ui-state-focus");
                var elmt = this.m_model.createNewElement(0)
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTables([elmt]);
            }
            private createNewDec(p_evt: Event) {
                $("#newDec").removeClass("ui-state-focus");
                var elmt = this.m_model.createNewElement(1)
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTables([elmt]);
            }
            private createNewValue(p_evt: Event) {
                $("#newValue").removeClass("ui-state-focus");
                var elmt = this.m_model.createNewElement(2)
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTables([elmt]);
            }
            private createNewElement(p_evt: Event) {

                var elmt = this.m_model.createNewElement(undefined)
                this.addElementToStage(elmt);
                // elmt.update();
                this.updateMiniTables([elmt]);
            }
            public deleteSelected(p_evt: Event, selectedElmts?: Element[], selectedCon?: Connection[]) {
                $("#deleteElmt").removeClass("ui-state-focus");
                console.log("deleting");
                if (selectedElmts) {
                    var elmts: any[] = selectedElmts;
                }
                else {
                    var elmts: any[] = this.m_selectedItems;
                }
                for (var i = 0; i < elmts.length; i++) {
                    if (selectedElmts) {
                        var elmt: Element = selectedElmts[i];
                    }
                    else {
                        var elmt: Element = this.m_model.getElement(this.m_selectedItems[i].name);
                    }
                    console.log("deleting: " + elmt.getName());
                    //for (var index in elmt.getConnections()) {
                    //    console.log(elmt.getName() + "  Before: " + elmt.getConnections()[index].getID());
                    //}
                    if (this.addToTrash(elmt)) {
                        ////console.log(this.m_trashBin);
                        //alert("begin delete connections from " + elmt.getName() );
                        for (var j = 0; j < elmt.getConnections().length; j++) {
                            var conn: Connection = elmt.getConnections()[j];
                            console.log("deleting connection " + conn.getID());
                            if (conn.getOutputElement().getID() === elmt.getID()) {
                                if (conn.getInputElement().deleteConnection(conn.getID())) {
                                    this.addToTrash(conn);
                                }
                            } else {
                                if (conn.getOutputElement().deleteConnection(conn.getID())) {
                                    this.addToTrash(conn);
                                }
                            }
                        }
                        //alert("end delete connections");
                    }
                    //for (var index in elmt.getConnections()) {
                    //    console.log(elmt.getName() + "  After: " + elmt.getConnections()[index].getID());
                    //}
                }
                var gui = this;
                if (selectedCon) {
                    selectedCon.forEach(function (c) {
                        var conn = gui.m_model.getConnection(c.getID());
                        gui.addToTrash(conn);
                    });
                } else {
                    this.m_selectedConnections.forEach(function (c) {
                        gui.addToTrash(gui.m_model.getConnection(c.name));
                    });
                }
                this.clearSelection();
                for (var i = 0; i < this.m_trashBin.length; i++) {
                    var itemID = this.m_trashBin[i].getID();
                    if (itemID.substr(0, 4) == "elmt") {

                        this.m_model.deleteElement(itemID);
                    }
                    else if (itemID.substr(0, 4) === "conn") {
                        this.m_model.deleteConnection(itemID);
                    }
                }
                this.m_trashBin = [];// empty trashbin
                //alert("before update");
                //this.m_mcaStage.update();
                //alert("after update");
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
                    p_elmt.m_easelElmt.addEventListener("pressup", this.pressUp);
                }
                p_elmt.m_easelElmt.addEventListener("mousedown", this.mouseDown);
                p_elmt.m_easelElmt.addEventListener("mouseover", this.mouseEnter);
                p_elmt.m_easelElmt.on("dblclick", this.dblClick);
                p_elmt.m_easelElmt.mouseChildren = false;
                p_elmt.m_easelElmt.name = p_elmt.getID();

                this.m_mcaContainer.addChild(p_elmt.m_easelElmt);
                this.m_updateStage = true;
            }
            private dblClick(p_evt: createjs.MouseEvent) {
                ////console.log(this);
                if (p_evt.target.name.substr(0, 4) === "elmt") {
                    this.populateElmtDetails(this.m_model.getElement(p_evt.target.name));

                }
            }
            //Does not work because pointer is not updated until released
            private mouseEnter(p_evt: createjs.MouseEvent) {
                console.log("entering element");
                if (this.m_mcaContainer.getChildByName("drawCont") !== null) {
                    console.log("entering illegal");
                    //document.body.style.cursor = "not-allowed";
                }
            }
            private addSetDecFunction(p_elmt: Element) {
                console.log("adding decision function");
                var gui = this;
                $(".decCell_" + p_elmt.getID()).click(function () {
                    console.log("decision cell clicked");
                    gui.m_model.setDecision(p_elmt, Number(this.id));
                    if (gui.m_model.getAutoUpdate()) {
                        gui.updateModel();
                    }
                    else {
                        gui.updateMiniTables([p_elmt]);
                    }
                    //Create the table again
                    $("#defTable_div_" + p_elmt.getID()).empty();
                    document.getElementById("defTable_div_" + p_elmt.getID()).appendChild(gui.htmlTableFromArray("Definition", p_elmt, gui.m_model, gui.m_editorMode));
                    //Add the edit functions again
                    gui.addEditFunction(p_elmt, gui.m_editorMode);
                });

            }

            private addSetEvidenceFunction(p_elmt: Element) {
                console.log("adding evidence function");
                var gui = this;
                $(".evidenceCell_"+p_elmt.getID()).click(function () {
                    console.log("evidence cell clicked");
                    gui.m_model.setEvidence(p_elmt, Number(this.id.substring(0, 1)));
                    if (gui.m_model.getAutoUpdate()) {
                        gui.updateModel();
                    }
                    else {
                        gui.updateMiniTables([p_elmt]);
                    }
                    //Create the table again
                    $("#defTable_div_" + p_elmt.getID()).empty();
                    document.getElementById("defTable_div_" + p_elmt.getID()).appendChild(gui.htmlTableFromArray("Definition", p_elmt, gui.m_model, gui.m_editorMode));
                    //Hide values table
                    $("#valuesTable_div_" + p_elmt.getID()).hide();
                    $("#values_" + p_elmt.getID()).show();
                    if (!p_elmt.isUpdated()) {
                        gui.updateValueButton(true, p_elmt.getID());
                    }
                    //Add the edit functions again
                    gui.addEditFunction(p_elmt, gui.m_editorMode);
                });

            }

            private createSettingsDiv() {
                console.log("creating settings dialog");
                var settingsDiv = document.createElement("div");
                settingsDiv.setAttribute("id", "settingsDiv");
                
                var numOfIterations_div = document.createElement("div");
                numOfIterations_div.style.overflow = "hidden";

                var numOfIterations_label = document.createElement("div");
                numOfIterations_label.style.width = "250px";
                numOfIterations_label.style.cssFloat = "left";
                numOfIterations_label.innerHTML = "Number of iterations in calculation:";
                numOfIterations_div.appendChild(numOfIterations_label);

                var numOfIterations = document.createElement("input");
                numOfIterations.setAttribute("id", "numberOfIterations");
                numOfIterations.style.marginLeft = "10px";
                numOfIterations.style.width = "100px";
                numOfIterations.type = "number";
                numOfIterations.max = "200000";
                numOfIterations.min = "100";
                numOfIterations.step = "100";
                numOfIterations.value = this.m_model.getmumOfIteraions()+"";
                numOfIterations_div.appendChild(numOfIterations);
                settingsDiv.appendChild(numOfIterations_div);


                var mdlName_div = document.createElement("div");
                mdlName_div.setAttribute("id", "mdlName_div");
                mdlName_div.style.overflow = "hidden";

                var mdlName_label = document.createElement("div");
                mdlName_label.style.width = "100px";
                mdlName_label.style.cssFloat = "left";
                mdlName_label.innerHTML = "Model name:";
                mdlName_div.appendChild(mdlName_label);

                var mdlNameInput = document.createElement("input");
                mdlNameInput.setAttribute("id", "mdlName");
                mdlNameInput.style.marginLeft = "10px";
                mdlNameInput.style.width = "200px";
                mdlNameInput.type = "text";
                mdlNameInput.value = this.m_model.getName();
                mdlName_div.appendChild(mdlNameInput);
                settingsDiv.appendChild(mdlName_div);

                /*var autoUpdateForm = document.createElement("form");
                var radioDiv = document.createElement("div");
                radioDiv.setAttribute("class", "advButton button");
                radioDiv.setAttribute("id", "autoUpdateRadio");
                var updateOn = document.createElement("input");
                updateOn.type = "radio";
                updateOn.setAttribute("id", "autoUpdateOn");
                updateOn.name = "radio";
                var label1 = document.createElement("label");
                label1.setAttribute("class", "advButton button");
                label1.innerHTML = "On:";
                label1.htmlFor = "autoUpdateOn";
                radioDiv.appendChild(label1);
                radioDiv.appendChild(updateOn);
                autoUpdateForm.appendChild(radioDiv);
                
                settingsDiv.appendChild(autoUpdateForm);*/

                $('body').append(settingsDiv);
                               
                return settingsDiv.id;
            }
            private openSettings() {
                var gui:GUIHandler = this;
                if (this.m_settingsDiv === undefined) {
                    var settingsID: String = "#" + this.createSettingsDiv();
                    this.m_settingsDiv = $(settingsID).dialog(opt);
                }
                console.log(this.m_settingsDiv);
                if (this.m_editorMode) {
                    $("#mdlName").text(this.m_model.getName());
                    $("#mdlName_div").show();
                }
                else {
                    $("#mdlName_div").hide();
                }

                $("#numberOfIterations").val(this.m_model.getmumOfIteraions() + "");
                this.m_settingsDiv.dialog("open");
                this.m_settingsDiv.dialog({
                    width: 500,
                    height: 200,
                    buttons: {
                        Ok: function () {
                            gui.m_model.setNumOfIterations($("#numberOfIterations").val());
                            gui.m_model.setName($("#mdlName").val());
                            gui.importStage();
                            $(this).dialog("close"); //closing and saving settings when clicking ok
                        },
                        cancel: function () {
                            $(this).dialog("close");
                        }
                    },
                });
                var opt = {
                    title: "Settings",
                     
                }
            }
            private openVIO(): void {
                var voiID: String = "#" + this.createVOIDialog();
                var voi = $(voiID).dialog(opt);
                var opt = {
                    title: "Value of Information",
                }
                voi.dialog({
                    width: 500,
                    height: 500
                });
                this.disableButtons(true);
                var gui: GUIHandler = this;
                $(voiID).on('dialogclose', function (event) {
                    gui.disableButtons(false);
                });
            }
            private createVOIDialog(): String {
                if (!$("#voiDialog").length) {
                    var dialog = document.createElement("div");
                    dialog.classList.add("dialogDiv");
                    dialog.setAttribute("id", "voiDialog");
                    $('body').append(dialog);
                }
                else {
                    var dialog = <HTMLDivElement>document.getElementById("voiDialog");
                    $("#voiDialog").empty();
                }
                var mainDiv = document.createElement("div");
                mainDiv.classList.add("mainVOIDiv");
                var div = document.createElement("div");
                mainDiv.appendChild(div);
                var fieldset = document.createElement("fieldset");
                div.appendChild(fieldset);
                div.style.cssFloat = "left";
                div.classList.add("voiDiv");
                dialog.appendChild(mainDiv);
                fieldset.classList.add("voicell");
                fieldset.style.padding = "15px";
                var legend = document.createElement("legend");
                fieldset.appendChild(legend);
                legend.innerHTML = "Of Chance nodes:";
                //Create the check boxes for chance elements
                var table: HTMLTableElement = document.createElement("table");
                fieldset.appendChild(table);
                this.m_model.getElementArr().forEach(function (e: Element) {
                    if (e.getType() === 0) {//Chance
                        var row: HTMLTableRowElement = table.insertRow();
                        var cell = row.insertCell();
                        var input = document.createElement("input");
                        input.setAttribute("type", "checkbox");
                        input.setAttribute("id", "voiCB_" + e.getID());
                        input.setAttribute("name", "voiCB_" + e.getID());
                        cell.appendChild(input);
                        cell = row.insertCell();
                        var label = document.createElement("label");
                        label.htmlFor = "voiCB_" + e.getID();
                        label.innerHTML = e.getName();
                        cell.appendChild(label);
                    }
                });
                var div = document.createElement("div");
                div.style.padding = "15px";
                mainDiv.appendChild(div);
                var table: HTMLTableElement = document.createElement("table");
                div.appendChild(table);
                //Create dropdown for decision nodes
                var row = table.insertRow();
                var cell = row.insertCell();
                var fieldset = document.createElement("fieldset");
                cell.appendChild(fieldset);
                var legend = document.createElement("legend");
                fieldset.appendChild(legend);
                var label = document.createElement("label");
                legend.innerHTML = "For decision node:";
                cell.appendChild(label);
                label.htmlFor = "forDec";
                var select = document.createElement("select");
                select.setAttribute("id", "forDec");
                fieldset.appendChild(select);
                var decNodesExist: boolean = false;
                var valueNodeExist: boolean = false;
                this.m_model.getElementArr().forEach(function (e) {
                    if (e.getType() === 1) {//Dec
                        decNodesExist = true;
                        var option = document.createElement("option");
                        option.setAttribute("selected", "selected");
                        option.setAttribute("value", e.getID());
                        option.innerHTML = e.getName();
                        select.appendChild(option);
                    }
                    else if (e.getType() === 2) {
                        valueNodeExist = true;
                    }
                });
                //Create dropdown for point of view
                var row = table.insertRow();
                var cell = row.insertCell();
                var fieldset = document.createElement("fieldset");
                cell.appendChild(fieldset);
                var legend = document.createElement("legend");
                fieldset.appendChild(legend);
                var label = document.createElement("label");
                label.innerHTML = "From point of View:";
                legend.appendChild(label);
                label.htmlFor = "fromPointOfView";
                var select = document.createElement("select");
                select.setAttribute("id", "fromPointOfView");
                fieldset.appendChild(select);
                this.m_model.getElementArr().forEach(function (e) {
                    if (e.getType() === 1 || e.isInformative()) {//Dec
                        var option = document.createElement("option");
                        option.setAttribute("selected", "selected");
                        option.setAttribute("value", e.getID());
                        option.innerHTML = e.getName();
                        select.appendChild(option);
                    }
                });

                //Result table
                var div = document.createElement("div");
                dialog.appendChild(div);
                div.setAttribute("id", "voiTable");
                var table: HTMLTableElement = document.createElement("table");
                div.appendChild(table);
                table.classList.add("defTable_div");
                var row = table.insertRow();
                var th = document.createElement("th");
                row.appendChild(th);
                th.innerHTML = "Result";
                row = table.insertRow();
                var cell = row.insertCell();
                var div = document.createElement("div");
                cell.appendChild(div);
                div.innerHTML = 'Click "Value of Information" to calculate';

                //Update button
                var buttonDiv = document.createElement("div");
                buttonDiv.style.padding = "10px";
                dialog.appendChild(buttonDiv);
                var button = document.createElement("button");
                buttonDiv.appendChild(button);
                buttonDiv.classList.add("buttonFooter");
                button.setAttribute("id", "voiButton");
                button.innerHTML = "Value of Information";
                button.setAttribute("title", "Click to show the value of information for the selected nodes");
                button.classList.add("notAllowedDuringVOI");

                if (valueNodeExist && decNodesExist) {

                    //$("#voiButton").click(this.updateVOI)
                    $("#voiButton").click(this.updateVOIUsingWebWorkers)

                }
                else {
                    $("#voiButton").prop("disabled", true);
                    $("#voiButton").text("Cannot calculate");
                    $("#voiButton").prop("title", "Cannot calculate because decision or utility node missing");
                }

                return "voiDialog";
            }
            private updateVOI = (p_evt: Event): void => {
                var pov: Element = this.m_model.getElement($("#fromPointOfView").val());
                var forDec: Element = this.m_model.getElement($("#forDec").val());
                var chanceElmts: Element[] = [];
                this.m_model.getElementArr().forEach(function (e) {
                    if (e.getType() === 0 && $("#voiCB_" + e.getID()).is(":checked")) {
                        chanceElmts.push(e);
                    }
                });

                var resultMatrix = Tools.valueOfInformation(this.m_model, pov, forDec, chanceElmts, this);
                $("#voiTable").empty();//First remove the previous table
                var table: HTMLTableElement = document.createElement("table");
                table.classList.add("defTable_div");
                var row = table.insertRow();
                var th = document.createElement("th");
                row.appendChild(th);
                th.innerHTML = "Result";
                for (var i = 0; i < resultMatrix.length; i++) {
                    var row = table.insertRow();
                    for (var j = 0; j < resultMatrix[0].length; j++) {
                        var cell = row.insertCell();
                        var div = document.createElement("div");
                        cell.appendChild(div);
                        div.innerHTML = resultMatrix[i][j].toPrecision(4);
                    }
                }
                $("#voiTable").append(table);
            }
            private updateVOIUsingWebWorkers = (p_evt: Event): void => {
                
                var gui: GUIHandler = this;
                var pov: Element = this.m_model.getElement($("#fromPointOfView").val());
                var forDec: Element = this.m_model.getElement($("#forDec").val());
                var chanceElmts: Element[] = [];
                this.m_model.getElementArr().forEach(function (e) {
                    if (e.getType() === 0 && $("#voiCB_" + e.getID()).is(":checked")) {
                        chanceElmts.push(e);
                    }
                });
                var VOIResults: any[] = Tools.getVIOMatrices(this.m_model, pov, forDec, chanceElmts, this);
                if (VOIResults) {//Only start workers if it is possible to calc voi
                    this.gotToVOICalcMode(true);
                    var worker1: Worker = Tools.startWorker(true);
                    var worker2: Worker = Tools.startWorker(false);
                    if ($("#progressbarDialog").length == 0) {
                        //Create progress bar dialog if it has not been created
                        this.createProgressbarDialog();
                    }
                    $("#progressbarDialog").dialog();
                    $("#progressText").text("Calculating value of information");
                    $("#cancelProgress").click({ worker1: worker1, worker2: worker2 }, this.cancelTwoWorkers);
                    $("#progressbarDialog").on("dialogclose", { worker1: worker1, worker2: worker2 }, this.cancelTwoWorkers);
                    var resultMatrix: any[][];
                    worker1.postMessage({
                        model: JSON.stringify(VOIResults[0])
                    });
                    worker2.postMessage({
                        model: JSON.stringify(VOIResults[1])
                    });
                    var tempDecID: string = VOIResults[2];
                    var firstWorkerDone = false;
                    var matrix1: any[];
                    var matrix2: any[];
                    var status: number = 0;
                    worker1.onmessage = function (evt) {
                        switch (evt.data.command) {
                            case "finnished":
                                var model: Model = new Model(true);
                                model.fromJSON(JSON.parse(evt.data.model), false);
                                matrix1 = Tools.getMatrixWithoutHeader(model.getElement(tempDecID).getValues());
                                if (firstWorkerDone) {
                                    Tools.stopWorker(worker1);
                                    resultMatrix = Tools.calcVOIResult(matrix1, matrix2);
                                    gui.updateVOIVisual(resultMatrix);
                                    gui.gotToVOICalcMode(false);
                                }
                                else {
                                    worker1.terminate();
                                    firstWorkerDone = true;
                                }
                                break;
                            case "progress":
                                status += evt.data.progress / 2;
                                $("#progressBar").progressbar({
                                    value: status
                                });
                                break;
                        }
                    };
                    worker2.onmessage = function (evt) {
                        switch (evt.data.command) {
                            case "finnished":
                                var model: Model = new Model(true);
                                model.fromJSON(JSON.parse(evt.data.model), false);
                                matrix2 = Tools.getMatrixWithoutHeader(model.getElement(tempDecID).getValues());
                                if (firstWorkerDone) {
                                    Tools.stopWorker(worker2);
                                    resultMatrix = Tools.calcVOIResult(matrix1, matrix2);
                                    gui.updateVOIVisual(resultMatrix);
                                    gui.gotToVOICalcMode(false);
                                }
                                else {
                                    worker2.terminate();
                                    firstWorkerDone = true;
                                }
                                break;
                            case "progress":
                                status += evt.data.progress / 2;
                                $("#progressBar").progressbar({
                                    value: status
                                });
                                break;
                        }
                    };
                }
                else {
                    this.updateVOIVisual([[0]]);
                }
            }
            private updateVOIVisual(p_result): void {
                $("#voiTable").empty();//First remove the previous table
                var table: HTMLTableElement = document.createElement("table");
                table.classList.add("defTable_div");
                var row = table.insertRow();
                var th = document.createElement("th");
                row.appendChild(th);
                th.innerHTML = "Result";
                for (var i = 0; i < p_result.length; i++) {
                    var row = table.insertRow();
                    for (var j = 0; j < p_result[0].length; j++) {
                        var cell = row.insertCell();
                        var div = document.createElement("div");
                        cell.appendChild(div);
                        div.innerHTML = p_result[i][j].toPrecision(4);
                    }
                }
                $("#voiTable").append(table);
            }
            private createDetailsDialog(p_elmt: Element): String {
                //console.log("creating dialog for " + p_elmt.getName());
                var mareframeGUI = this; 
                var id: string = p_elmt.getID();
                var newDialog = document.createElement("div");
                newDialog.setAttribute("id", "detailsDialog_" + id);
                newDialog.setAttribute("class", "removebleDialog");

                var info_div = document.createElement("div");
                info_div.setAttribute("class", "info_div");
                info_div.style.overflow = "hidden";

                var nameDiv = document.createElement("div");
                nameDiv.setAttribute("class", "info_div");
                nameDiv.style.width = "80px";
                nameDiv.style.cssFloat = "left";
                nameDiv.innerHTML = "Name:";
                info_div.appendChild(nameDiv);

                var info_Name = document.createElement("div");
                nameDiv.setAttribute("class", "info_div");
                info_Name.setAttribute("id", "info_name_" + id);
                info_Name.style.marginLeft = "50px";
                info_div.appendChild(info_Name);

                var info_type_tag = document.createElement("div");
                nameDiv.setAttribute("class", "info_div");
                info_type_tag.style.width = "80px";
                info_type_tag.style.cssFloat = "left";
                info_type_tag.innerHTML = "Type:";
                info_div.appendChild(info_type_tag);

                var info_type = document.createElement("div");
                info_type.setAttribute("class", "info_div");
                info_type.setAttribute("id", "info_type_" + id);
                info_type.style.marginLeft = "50px";
                info_div.appendChild(info_type);
                newDialog.appendChild(info_div);

                var mcaClass = document.createElement("div");
                mcaClass.setAttribute("class", "mcaClass");

                var elementType = document.createElement("div");
                elementType.setAttribute("id", "elementType");
                var form = document.createElement("form");
                var fieldset = document.createElement("fieldset");
                var label1 = document.createElement("label");
                label1.innerHTML = "Type of Element";
                label1.htmlFor = "MCAelmtType";
                fieldset.appendChild(label1);
                var select = document.createElement("select");
                select.setAttribute("name", "MCAelmtType");
                select.setAttribute("id", "MCAelmtType");

                var option1 = document.createElement("option");
                option1.setAttribute("id", "optionAttribute");
                option1.setAttribute("value", "0");
                option1.innerHTML = "Attribute";
                select.appendChild(option1);

                var option2 = document.createElement("option");
                option2.setAttribute("id", "optionObjective");
                option2.setAttribute("value", "1");
                option2.innerHTML = "Objective";
                select.appendChild(option2);

                var option3 = document.createElement("option");
                option3.setAttribute("id", "optionAlternative");
                option3.setAttribute("value", "2");
                option3.innerHTML = "Alternative";
                select.appendChild(option3);
                fieldset.appendChild(select);

                var label2 = document.createElement("label");
                label2.innerHTML = "Type of Weighting Method";
                label2.htmlFor = "MCAWeightingMethod";
                fieldset.appendChild(label2);
                var select2 = document.createElement("select");
                select2.setAttribute("name", "MCAWeightingMethod");
                select2.setAttribute("id", "MCAWeightingMethod");

                var option4 = document.createElement("option");
                option4.setAttribute("id", "optionSwingDirect");
                option4.setAttribute("value", "1");
                option4.innerHTML = "Swing / Direct";
                select2.appendChild(option4);

                var option5 = document.createElement("option");
                option5.setAttribute("id", "optionValueFunction");
                option5.setAttribute("value", "2");
                option5.innerHTML = "Value Function";
                select2.appendChild(option5);
                fieldset.appendChild(select2);
                form.appendChild(fieldset);
                elementType.appendChild(form);
                mcaClass.appendChild(elementType);

                var weightingMethodSelector = document.createElement("div");
                weightingMethodSelector.setAttribute("id", "weightingMethodSelector");
                mcaClass.appendChild(weightingMethodSelector);

                var valueFn_div = document.createElement("div");
                valueFn_div.setAttribute("id", "valueFn_div");
                var valueFn_canvas = document.createElement("canvas");
                valueFn_canvas.setAttribute("id", "valueFn_canvas");
                valueFn_canvas.style.width = "100";
                valueFn_canvas.style.height = "100";
                valueFn_div.appendChild(valueFn_canvas);

                var valueFn_Linear = document.createElement("button");
                valueFn_Linear.setAttribute("class", "button");
                valueFn_Linear.setAttribute("id", "valueFn_Linear");
                valueFn_Linear.innerHTML = "Linearize";
                valueFn_div.appendChild(valueFn_Linear);

                var valueFn_Flip = document.createElement("button");
                valueFn_Flip.setAttribute("class", "button");
                valueFn_Flip.setAttribute("id", "valueFn_Flip");
                valueFn_Flip.innerHTML = "Flip Direction";
                valueFn_div.appendChild(valueFn_Flip);
                mcaClass.appendChild(valueFn_div);

                var sliders_div = document.createElement("div");
                sliders_div.setAttribute("id", "sliders_div");
                mcaClass.appendChild(sliders_div);


                var datatable_div = document.createElement("div");
                datatable_div.setAttribute("id", "datatable_div");
                mcaClass.appendChild(datatable_div);

                var description_div = document.createElement("div");
                description_div.setAttribute("id", "description_div_" + id);
                newDialog.appendChild(description_div);

                var chart_div = document.createElement("div");
                chart_div.setAttribute("id", "chart_div");
                mcaClass.appendChild(chart_div);

                newDialog.appendChild(mcaClass);

                var showDescription = document.createElement("button");
                showDescription.setAttribute("class", "dialogButton");
                showDescription.setAttribute("id", "showDescription_" + id);
                showDescription.innerHTML = "Hide descrition";
                showDescription.title = "Click to hide the description of the element";
                newDialog.appendChild(showDescription);

                var defTable_div_outer = document.createElement("div");
                defTable_div_outer.setAttribute("class", "editable defTable_div");
                var defTable_div = document.createElement("div");
                defTable_div.setAttribute("id", "defTable_div_" + id);
                defTable_div.setAttribute("class", "defTable_div");
                
                defTable_div_outer.appendChild(defTable_div);
                newDialog.appendChild(defTable_div_outer);

                var addDataRow = document.createElement("button");
                addDataRow.setAttribute("class", "dialogButton");
                addDataRow.setAttribute("id", "addDataRow_" + id);
                addDataRow.innerHTML = "Add Data Row";
                addDataRow.title = "Click to add a new data row to the table";
                newDialog.appendChild(addDataRow);

                var submit = document.createElement("button");
                submit.setAttribute("class", "dialogButton");
                submit.setAttribute("id", "submit_" + id);
                submit.innerHTML = "Submit Changes";
                submit.title = "Click to save all changes made in the element";
                newDialog.appendChild(submit);

                var values = document.createElement("button");
                values.setAttribute("class", "dialogButton");
                values.style.marginBottom = "20px";
                values.setAttribute("id", "values_" + id);
                values.innerHTML = "Show Values";
                values.title = "Click to show the values table";
                newDialog.appendChild(values);

                var valuesTable_div = document.createElement("div");
                valuesTable_div.setAttribute("id", "valuesTable_div_" + id);
                valuesTable_div.setAttribute("class", "valuesTable_div");
                newDialog.appendChild(valuesTable_div);

                var userDescription_div = document.createElement("div");
                userDescription_div.setAttribute("id", "userDescription_div_" + id);
                newDialog.appendChild(userDescription_div);

                $("#detailsDialogs").append(newDialog);
                $("#detailsDialog_" + id).dialog({
                    beforeClose: function (event, ui) {
                        if ($("#detailsDialog_" + p_elmt.getID()).data("unsavedChanges")) {
                            console.log("unsaved changes");
                            if (!confirm("You have unsaved changes. Pressing OK will close the window and discard all changes.")) {
                                return false;
                            }
                            else {
                                $("#detailsDialog_" + p_elmt.getID()).data("unsavedChanges", false);//If ok is pressed, set unsaved changes to false
                            }
                            $("#valuesTable_div_" + id).show();
                        }
                    }
                });
                $("#detailsDialog_" + id).on('dialogclose', function (event) {
                    console.log("closing window");
                    mareframeGUI.m_noOfDialogsOpen--;
                    console.log("number of dialogs open: " + mareframeGUI.m_noOfDialogsOpen);
                    $("#valuesTable_div_" + id).hide();
                    $("#detailsDialog_" + id).data("isOpen", false);
                    if (mareframeGUI.m_noOfDialogsOpen == 0) {
                        console.log("all dialogs closed");
                        mareframeGUI.disableButtons(false);
                    }
                    // $("#detailsDialogs").empty();
                });
                $("#detailsDialog_" + id).data("isOpen", false);
                $("#submit_" + id).click({ param1: p_elmt }, this.saveChanges);
                $("#values_" + id).click({ param1: p_elmt, param2: this }, this.showValues);
                //$("#values_" + id).hover(({ param1: p_elmt, param2: this },this.showValueErrorMessage), this.removeValueErrorMessage);
                $("#addDataRow_" + id).click({ param1: p_elmt }, this.addDataRowClick);
                $("#showDescription_" + id).click({ param1: p_elmt }, this.setShowDescription);
                return newDialog.id;
            }
            private populateElmtDetails(p_elmt: Element): void {
                 var id: String = p_elmt.getID();
                if (p_elmt.getDialog() == null) {
                    console.log("creating new dialog");
                    var dialogID: String = "#" + this.createDetailsDialog(p_elmt);
                    var dialog = $(dialogID).dialog(opt);
                    p_elmt.setDialog(dialog);
                }
                else {
                    console.log("dialog does already exist");
                    var dialog = p_elmt.getDialog();
                    console.log(dialog);
                }
                if (dialog.data("isOpen") === false) {

                    dialog.data("isOpen", true)
                    this.disableButtons(true);
                    this.m_noOfDialogsOpen++;
                    console.log("number of dialogs open: " + this.m_noOfDialogsOpen);
                    var opt = {
                        title: p_elmt.getName()
                    }
                    var width = p_elmt.getData()[0].length * 70 + 50;
                    if (width < 400) {
                        width = 400
                    }
                    if (width > 1100) {
                        width = 1100;
                    }
                    dialog.dialog("open");
                    dialog.dialog({
                        width: width,
                        height: 500
                    });
                    $("#submit_" + id).hide();
                    $("#values_" + id).show();
                    $("#detailsDialog_" + p_elmt.getID()).data("unsavedChanges", false);
                    //console.log("unsaved changes: " + this.m_unsavedChanges);
                    //console.log(p_elmt.getName() + " type: " + p_elmt.getType() + " is updated: " + p_elmt.isUpdated());
                    //console.log(p_elmt)
                    //set dialog title
                    // $("#detailsDialog").dialog("open");
                    if (this.m_model.m_bbnMode) {
                        //bbn mode only
                        //console.log($("#elementType"));
                        $(".mcaClass").hide();
                        //$("#valueFn_div").hide();
                        //console.log("hiding selector");
                        dialog.data("element", p_elmt);
                        dialog.data("model", this.m_model);
                        dialog.data("showDescription", true);
                        
                        dialog.data("defTable", Tools.copy(p_elmt.getData()));//Save an instance of the def table 
                        dialog.data("deletedRows", []);//Save which rows are deleted
                        dialog.data("newStates", []);//Save the new states that are added
                        
                   
                        //console.log("data: " + dialog.data("defTable"));

                       // var s = Tools.htmlTableFromArray("Definition", p_elmt, this.m_model, this.m_editorMode, $("#detailsDialog_" + id).data("defTable"));
                        // $("#defTable_div_" + id).html(s);
                        $("#defTable_div_" + id).empty();
                        document.getElementById("defTable_div_" + id).appendChild(this.htmlTableFromArray("Definition", p_elmt, this.m_model, this.m_editorMode, $("#detailsDialog_" + id).data("defTable")));


                        $("#defTable_div_" + id).show();
                        var typeText: string;
                        switch (p_elmt.getType()) {
                            case 0:
                                typeText = "Chance";
                                break;
                            case 1:
                                typeText = "Decision";
                                break;
                            case 2:
                                typeText = "Value";
                                break;
                            case 3:
                                typeText = "Super Value";
                                break;
                            default:
                                break;
                        }
                        document.getElementById("info_name_" + id).innerHTML = p_elmt.getName();
                        document.getElementById("info_type_" + id).innerHTML = typeText;

                        console.log(" description: " + p_elmt.getDescription());
                        if (dialog.data("showDescription")) {
                            //set description
                            var description = p_elmt.getDescription();
                            if (description.length < 1) {
                                description = "There is no descirption";
                            }
                            document.getElementById("description_div_" + id).innerHTML = description;
                            $("#description_div_" + id).show();
                        }
                        //set user description
                        console.log("user description: " + p_elmt.getUserDescription());
                        if (p_elmt.getUserDescription().length < 1) {
                            document.getElementById("userDescription_div_" + id).innerHTML = "write your own description or comments here";
                        }
                        else {
                            document.getElementById("userDescription_div_" + id).innerHTML = p_elmt.getUserDescription();
                        }
                        $("#userDescription_div_" + id).show();
                        
                        this.updateValueButton(!p_elmt.isUpdated(), id);
                        this.addEditFunction(p_elmt, this.m_editorMode);
                    } else {
                        //MCA mode only
                        $("#info_type").hide();
                        $("#info_type_tag").hide();
                        $("#detailsDialog").data("element", p_elmt);
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
                                console.log("WeigthMethodDirect");
                                console.log("Weigthed data: " + this.m_model.getWeightedData(p_elmt, false));
                                break;
                            case 1://swing
                                console.log("WeigthMethodSwing");
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
                                                console.log("Slide: " + ui.value);
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
                                console.log("WeigthMethodValueFn");
                                var tableMat = this.m_model.getWeightedData(p_elmt, false);
                                console.log("getWeigthedData: " + tableMat);
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
                        document.getElementById("description_div_" + id).innerHTML = p_elmt.getDescription();
                    }
                }
            };
            private getElementWithUnsavedChanges(): Element {
                var elmt: Element = null;
                this.m_model.getElementArr().forEach(function (e) {
                    //if (e.actualRowsDoesNotEqualVisualRows()) {
                    if (e.getDialog() !== undefined && e.getDialog().data("unsavedChanges")) {
                        if (elmt !== null) {
                            throw "ERROR Multiple elements with unsaved changes";
                        }
                        elmt = e;
                    }
                });
                return elmt;
            }
            private updateValue(p_elmt: Element, p_div: any, p_field: any, p_originalValue: string, p_newValue: string) {
                if (p_newValue.length < 1) { //Must not update the text if the new text string is empty
                    p_div.html(p_originalValue);
                    p_newValue = p_originalValue;
                }
                p_field.parent().text(p_newValue);
                if (p_newValue !== p_originalValue) {
                    $("#detailsDialog_" + p_elmt.getID()).data("unsavedChanges", true);
                    this.updateUpdateButton(true);
                }
                p_originalValue = p_newValue; //This is needed if the user wants to change the value multiple times without saving inbetween
                p_field.parent().removeClass("editable");
                return p_originalValue;
            }
            //This function is not being used at the time since it does not work properly for some reason
            /* private editFunction(p_elmt: Element, p_div: any, p_field: any, p_originalValue: string) {
                 var mareframeGUI = this;
                 $("#submit").show();
                 //var originalValue = $(this).text();
                 p_field.addClass("editable");
                 p_field.html("<input type='text' value='" + p_originalValue + "' />"); //Prevents the box from becoming emtpy when clicked
                 p_field.children().first().focus();
                 p_field.children().first().keypress(function (e) {
                     if (e.which == 13) {//If enter is pressed
                         var newText = p_field.val();
                         p_originalValue = mareframeGUI.updateValue(p_elmt, p_div, p_field, p_originalValue, newText);
                     }
                 });
                 p_field.children().first().blur(function () { //If user has clicked outside the box
                     var newText = p_field.val();
                     p_originalValue = mareframeGUI.updateValue(p_elmt, p_div, p_field, p_originalValue, newText);
                 });
             }*/
            private updateValueButton(disable: boolean, id: String) {
                if (disable) {
                    $("#values_" + id).prop("disabled", true);
                    $("#values_" + id).prop("title", "Disabled because model is not updated");
                }
                else {
                    $("#values_" + id).prop("disabled", false);
                    $("#values_" + id).prop("title", "Click to show the values table");
                }
            }
            private updateUpdateButton(disable: boolean) {
                if (disable) {
                    $("#updateMdl").prop("disabled", true);
                    $("#updateMdl").prop("title", "Disabled because there are unsaved changes");
                }
                else {
                    $("#updateMdl").prop("disabled", false);
                    $("#updateMdl").prop("title", "Click to update model");
                }
            }
            private addEditFunction(p_elmt: Element, p_editorMode: boolean) {
                console.log("adding edit function");
                if (!(p_editorMode)) {//User can only set decision and evidence if the user is not in editormode {
                    this.addSetDecFunction(p_elmt);
                    this.addSetEvidenceFunction(p_elmt);
                }
                var originalName: string = p_elmt.getName();
                var mareframeGUI = this;
                var model: Model = this.m_model;
                var elementWithUnsavedChanges: Element = null;
                var id: string = p_elmt.getID();
                if (this.m_model.m_bbnMode) {
                    var originalDesc = p_elmt.getDescription();
                    var originalUserComments = p_elmt.getUserDescription();
                    console.log("Element: " + p_elmt.getName() + "ready for editing");
                    // User description
                    $("#userDescription_div_" + id).dblclick(function () {
                        
                        //mareframeGUI.editFunction(p_elmt, $("#userDescription_div"), $(this), originalUserComments); //This is for some reason not working
                        $("#submit_" + id).show();
                        $(this).addClass("editable");
                        console.log("original value : " + originalUserComments);
                        $(this).html("<textarea rows='4' cols='50' '>" + originalUserComments+"</textarea>" );
                        //$(this).html("<input type='text' value='" + originalUserComments + "' />");
                        $(this).children().first().focus();
                        $(this).children().first().keypress(function (e) {
                            if (e.which == 13) {
                                var newText = $(this).val();
                                originalUserComments = mareframeGUI.updateValue(p_elmt, $("#userDescription_div_" + id), $(this), originalUserComments, newText);
                            }
                        });
                        $(this).children().first().blur(function () {
                            var newText = $(this).val();
                            originalUserComments = mareframeGUI.updateValue(p_elmt, $("#userDescription_div_" + id), $(this), originalUserComments, newText);
                        });
                    });
                    
                    if (p_editorMode) {
                        //Minus button
                        if (p_elmt.getType() === 0 || p_elmt.getType() === 1) {//If it is a chance or a decision node
                            $("#addDataRow_" + id).show();
                            $(".minus_" + id).button({
                                icons: { primary: "ui-icon-minus" }
                            });
                            //Add function to minus button
                            $(".minus_" + id).click(function () {
                                elementWithUnsavedChanges = mareframeGUI.getElementWithUnsavedChanges();
                                if (elementWithUnsavedChanges === null || elementWithUnsavedChanges === p_elmt) {
                                    $("#valuesTable_div_" + id).hide();

                                    mareframeGUI.updateUpdateButton(true);
                                    var row: number = this.id
                                    if (mareframeGUI.removeRowVisually(p_elmt, row)) {
                                       
                                        //Add the edit function again
                                        mareframeGUI.addEditFunction(p_elmt, p_editorMode);
                                        $("#detailsDialog_" + p_elmt.getID()).data("unsavedChanges", true);
                                        mareframeGUI.updateValueButton(true, id);
                                        $("#values_" + id).show();
                                        $("#submit_" + id).show();
                                    }
                                }
                                else {
                                    alert("Please submit changes in " + elementWithUnsavedChanges.getName() + " before editing this data table");
                                }
                            });
                        }
                        else {//If it is a value node
                            $("#addDataRow_" + id).hide();
                        }
                        //edit name
                        $("#info_name_" + id).dblclick(function () {
                            $("#submit_" + id).show();
                            $(this).addClass("editable");
                            $(this).html("<input style='width:80%' type='text' value='" + originalName + "' />");
                            $(this).children().first().focus();
                            $(this).children().first().keypress(function (e) {
                                if (e.which == 13) {
                                    var newText = $(this).val();
                                    originalName = mareframeGUI.updateValue(p_elmt, $("#info_name_" + id), $(this), originalName, newText);
                                }
                            });
                            $(this).children().first().blur(function () {
                                var newText = $(this).val();
                                originalName = mareframeGUI.updateValue(p_elmt, $("#info_name_" + id), $(this), originalName, newText);
                            });

                        });
                        //edit description
                        $("#description_div_" + id).dblclick(function () {
                            $("#submit_" + id).show();
                            //var originalValue = $(this).text();
                            $(this).addClass("editable");
                            $(this).html("<textarea rows='4' cols='50' >" + originalDesc + "</textarea>");
                            //$(this).html("<input type='text' value='" + originalDesc + "' />"); //Prevents the box from becoming emtpy when clicked
                            $(this).children().first().focus();
                            $(this).children().first().keypress(function (e) {
                                if (e.which == 13) {//If enter is pressed
                                    var newText = $(this).val();
                                    originalDesc = mareframeGUI.updateValue(p_elmt, $("#description_div_" + id), $(this), originalDesc, newText);
                                }
                            });
                            $(this).children().first().blur(function () { //If user has clicked outside the box
                                var newText = $(this).val();
                                originalDesc = mareframeGUI.updateValue(p_elmt, $("#description_div_" + id), $(this), originalDesc, newText);
                            });
                        });
                    }
                    else {//If editor mode is not on
                        $("#addDataRow_" + id).hide();
                    }
                }
                //MCA
                else {
                    if (p_editorMode) {
                        $("#info_name").dblclick(function () {
                            $("#submit").show();
                            $(this).addClass("editable");
                            $(this).html("<input type='text' value='" + originalName + "' />");
                            $(this).children().first().focus();
                            $(this).children().first().keypress(function (e) {
                                if (e.which == 13) {
                                    var newText = $(this).val();
                                    //console.log("new text: " + newText);
                                    if (newText.length < 1) { //Must not update the text if the new text string is empty
                                        $("#info_name").html(originalName);
                                        newText = originalName;
                                    }
                                    $(this).parent().text(newText);
                                    if (newText !== originalName) {
                                        p_elmt.setName(newText);
                                        mareframeGUI.addElementToStage(p_elmt);//repaints the element
                                    }
                                    originalName = newText; //This is needed if the user wants to change the text multiple times without saving inbetween
                                }
                                $(this).parent().removeClass("editable");
                            });
                            $(this).children().first().blur(function () {
                                var newText = $(this).val();
                                //console.log("new text: " + newText);
                                if (newText.length < 1) { //Must not update the text if the new text string is empty
                                    $("#info_name").html(originalName);
                                    newText = originalName;
                                }
                                $(this).parent().text(newText);
                                if (newText !== originalName) {
                                    p_elmt.setName(newText);
                                    mareframeGUI.addElementToStage(p_elmt);//repaints the element
                                }
                                originalName = newText; //This is needed if the user wants to change the text multiple times without saving inbetween
                                $(this).parent().removeClass("editable");
                            });

                        });
                    }
                }
            }
            //This updates the state name if it is one of the new states
            private updateNewStates(p_elmt: Element, originalText: String, newText: String) {
                var states: String[] = $("#detailsDialog_" + p_elmt.getID()).data("newStates");
                for (var i = 0; i < states.length; i++) {
                    console.log("checking " + states[i] + " against " + originalText);
                    if (states[i].trim() === originalText.trim()) { //If the original text is found in the list
                        states[i] = newText; //Update the state name
                        console.log("match");
                    }
                }
                $("#detailsDialog").data("newStates", states);
                console.log($("#detailsDialog").data("newStates"));
            }
            private showValues(p_evt: Event) {
                var elmt: Element = p_evt.data.param1;
                var gui: GUIHandler = p_evt.data.param2;
                console.log("showing values");
                var id: string = elmt.getID();
                //console.log("Data: " + elmt.getData());
                //console.log("Values: " + elmt.getValues());
                //console.log(elmt.getValues());
                //console.log("size of values: " + math.size(elmt.getValues()));
                $("#valuesTable_div_" + id).empty();
                document.getElementById("valuesTable_div_" + id).appendChild(gui.htmlTableFromArray("Values", elmt, $("#detailsDialog_" + id).data("model"), this.m_editorMode));
                //$("#valuesTable_div_" + id).html(Tools.htmlTableFromArray2("Values", elmt, $("#detailsDialog_" + id).data("model"), this.m_editorMode));
                $("#valuesTable_div_" + id).show();
                $("#values_" + id).hide();
            }

            private showValueErrorMessage(p_evt: Event) {
                
            }
            private updateDefTable(p_elmt: Element): any[][] {
                var newTable = [];
                var newRow = [];
                var oldData: any[][] = p_elmt.getData();
                var table = $("#defTable_div_" + p_elmt.getID());
                //Add the header rows
                for (var i = 0; i < Tools.numOfHeaderRows(oldData, p_elmt); i++) {
                    newTable.push(oldData[i]);
                }
                console.log(newTable);
                var rowNumber = -1; //We start at minus 1 because the first row, that just says "Definition" is not used
                table.find("tr").each(function () {
                    console.log("row");
                    $(this).find("input").each(function () {
                        //console.log("td or th");
                        console.log("text to be added: " + $(this).text());
                        if ($(this).val().length > 0) {//This prevents the function from adding the minus column
                            //console.log("does it exsist: " + $.inArray($(this).text(), newRow) === -1)
                            var value: any = $(this).val();
                            //Don't add the same value twice if it is in one of the main value cells
                            //(Better solution: check before the text is saved in the cell)
                            if ($.inArray(value, newRow) === -1 || !isNaN(value)) {	
                                //Convert to number
                                if (!isNaN(value)) {
                                    value = Number(value);
                                }
                                console.log("pushing " + value);
                                console.log("row number " + rowNumber);
                                if (p_elmt.getType() === 3) {
                                    newRow.push(oldData[rowNumber][0]);//if this is a super value the element must be pushed first in the row
                                }
                                newRow.push(value);

                            }
                        }
                    });
                    if (newRow.length > 0) {//Do not add an empty row
                        console.log("pushing row: " + newRow);

                        newTable.push(newRow);
                        newRow = [];
                    }
                    rowNumber++;
                });
                return newTable;
            }
            private saveChanges(p_evt: Event) {
                var elmt: Element = p_evt.data.param1;
                console.log("saving changes");
                var id: string = elmt.getID();
                var oldData: any[][] = elmt.getData();
                var model: Model = this.m_model;
                //Save user description
                var userDescription = $("#userDescription_div_" + id).text();
                elmt.setUserDescription(userDescription);
                //Save description
                var description = $("#description_div_" + id).text();
                elmt.setDescription(description);
                
                
                elmt.setName($("#info_name_" + id).text());
                //console.log(this);
                console.log("number of header rows: " + Tools.numOfHeaderRows(oldData, elmt));
                
                //Save def table
                var newTable = this.updateDefTable(elmt);
                console.log("new table: "+ newTable);
                //Remove header row with the title "Definition"
                //newTable.splice(0, 1);
                if ((elmt.getType() === 0 || elmt.getType() === 1) && !Tools.allStatesAreDestrinct(newTable)) {
                    alert("State names must be unique");
                }
                 else if (elmt.getType() === 0 && Tools.dataContainsNegative(newTable)) {
                    alert("Negative values are not allowed");
                }
                 else if (elmt.getType() == 0 && !Tools.columnSumsAreValid(newTable, Tools.numOfHeaderRows(newTable))) {
                     //Should also show which row is unvalid (maybe right after the user has changed the value)
                     alert("The values in each column must add up to 1");
                 }
                    else {
                    if (this.m_editorMode) {
                        //Delete the deleted states from the child elements
                        var rowsToDelete: any[] = $("#detailsDialog_" + id).data("deletedRows");
                        console.log("rows to delete: " + rowsToDelete);
                        elmt.getChildrenElements().forEach(function (e) {
                            for (var i = 0; i < rowsToDelete.length; i++) {
                                console.log(elmt.getData());
                                console.log("updating child  " + e.getName());
                                e.setData(Tools.removeState(e.getData(), elmt, elmt.getData()[rowsToDelete[i]][0]));
                            }
                        });
                        elmt.setData(newTable);

                        console.log("new data: " + elmt.getData());
                        console.log(newTable);
                        //This updates the children accourding to the new states
                        this.saveAddedRows(elmt, $("#detailsDialog_" + id).data("newStates"));
                    }
                    elmt.setUpdated(false);
                    elmt.getChildrenElements().forEach(function (e) {
                        e.updateData();
                    });
                    elmt.getAllDescendants().forEach(function (e) {
                        e.setUpdated(false);
                    });
                    elmt.getAllDecisionAncestors().forEach(function (e) {
                        e.setUpdated(false);
                    });
                    if (model.getAutoUpdate()) {
                        this.updateModel();
                        this.updateValueButton(false, id);//Make the value button clickable again
                        console.log("auto update is on");
                    }
                    //console.log("new table after submit:");
                    //console.log(elmt.getData());
                    //The lists need to be emptied
                    $("#detailsDialog_" + id).data("deletedRows", []);
                    $("#detailsDialog_" + id).data("newStates", []);
                    $("#detailsDialog_" + id).data("unsavedChanges", false);
                    $("#submit_" + id).hide();
                    this.updateUpdateButton(false);
                    this.updateOpenDialogs();
                    this.updateMiniTables([elmt].concat(elmt.getAllDescendants()).concat(elmt.getAllDecisionAncestors()));
                }
                //this.m_updateMCAStage = true;
                //this.m_mcaContainer.removeChild(elmt.m_easelElmt);
                this.addElementToStage(elmt);//repaint the element. This is necessary if the name of the elemnt has been changed
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
                console.log("tableMat: " + tableMat);
                //alert("pause");
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
                console.log("ElementData: " + elmt.getData());
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
                //console.log("original datamatrix" + this.m_model.getDataMatrix());
                ////console.log(this.m_model.getDataMatrix());
            }
            private mouseDown(p_evt: createjs.MouseEvent): void {

                console.log("mouse down on " + p_evt.target.name);
                $("#mX").html("X: " + p_evt.stageX);
                $("#mY").html("Y: " + p_evt.stageY);
                $("#mAction").html("Action: mousedown");
                $("#mTarget").html("Target: " + p_evt.target.name);

                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                this.m_originalPressX = p_evt.stageX;
                this.m_originalPressY = p_evt.stageY;
                //console.log("cnctool options: "+$("#cnctTool").button("option","checked"));
                if (!$("#cnctTool").prop("checked")) {
                    //If connect tool is not enabled
                    if (p_evt.target.name.substr(0, 4) === "elmt") {

                        this.select(p_evt);

                    } else if (p_evt.target.name.substr(0, 4) === "conn") {
                        console.log("connection pressed");
                        var connection: Connection = this.m_model.getConnection(p_evt.target.name);
                        //this.addConnectionToStage(connection, true);
                        this.selectConnection(p_evt);
                    }
                    else {
                        this.clearSelection();
                    }
                }
            }
            private select(p_evt: createjs.MouseEvent): void {
                //console.log("ctrl key: " + e.nativeEvent.ctrlKey);
                if (!p_evt.nativeEvent.ctrlKey && this.m_selectedItems.indexOf(p_evt.target) === -1) {
                    this.clearSelection();
                }
                console.log("adding to selection " + p_evt.target);
                this.addToSelection(p_evt.target);

            }

            private selectConnection(p_evt: createjs.MouseEvent): void {
                console.log(this.m_selectedConnections);
                console.log(p_evt.target);
                console.log("checking " + this.m_selectedConnections[0] + " against " + p_evt.target + ": " + (this.m_selectedConnections[0] == p_evt.target));
                if (!p_evt.nativeEvent.ctrlKey && this.m_selectedConnections.indexOf(p_evt.target) === -1) {
                    console.log("clearing");
                   this.clearSelection();
                }
                console.log("adding to selection " + p_evt.target);
                this.addToSelection(p_evt.target);
            }
            private pressMove(p_evt: createjs.MouseEvent): void {
                var gui = this;
                //console.log("press move on target " + p_evt.target.name);
                $("#mX").html("X: " + p_evt.stageX);
                $("#mY").html("Y: " + p_evt.stageY);
                $("#mAction").html("Action: PressMove");
                $("#mTarget").html("Target: " + p_evt.target.name);
                if (p_evt.target.name === "hitarea") {
                    //console.log("editorMode: " + this.m_editorMode);
                    if (p_evt.nativeEvent.ctrlKey) {
                        ////console.log("orig: " + this.m_originalPressX + ", " + this.m_originalPressY + ". curr: " + p_evt.stageX + ", " + p_evt.stageY);
                        this.setSelection(this.m_model.getEaselElementsInBox(this.m_originalPressX, this.m_originalPressY, p_evt.stageX, p_evt.stageY));
                        this.m_selectionBox.graphics.clear().s("rgba(0,0,0,0.7)").setStrokeDash([2, 2], createjs.Ticker.getTime()).drawRect(this.m_originalPressX, this.m_originalPressY, p_evt.stageX - this.m_originalPressX, p_evt.stageY - this.m_originalPressY);
                        this.m_mcaContainer.addChild(this.m_selectionBox)
                    } else if (this.m_editorMode) {
                        //console.log("elements off screen: "+ this.elementOffScreen( p_evt.stageX - this.m_oldX, p_evt.stageY - this.m_oldY));
                        if (!this.elementOffScreen(p_evt.stageX - this.m_oldX, p_evt.stageY - this.m_oldY, this.getModelPos())) {
                            //document.body.style.cursor = "auto"; 
                            //console.log("panning");
                            $("#mAction").html("Action: Panning");
                            //This moves all elements instead of the background
                            this.moveAllElements(p_evt.stageX - gui.m_oldX, p_evt.stageY - gui.m_oldY);
                            
                            /*this.m_mcaContainer.x += p_evt.stageX - this.m_oldX;
                            this.m_mcaContainer.y += p_evt.stageY - this.m_oldY;
                                */
                        }
                        /*else {
                            console.log("not allowed");
                            document.body.style.cursor = "not-allowed";
                        }*/
                    }
                } else if (p_evt.target.name.substr(0, 4) === "elmt") {
                    var connectTool = $("#cnctTool").prop("checked");
                    if (connectTool) {
                        //If we are in the process of connecting
                        var element = this.m_model.getElement(p_evt.target.name);
                        //this.m_drawingCont.removeAllChildren();

                        //Resets the visually selected elements
                        this.m_model.getElementArr().forEach(function (e) {
                            if (e.getVisuallySelected()) {
                                gui.drawElementNotSelected(e);
                            }
                        });


                        this.m_mcaContainer.removeChild(this.m_mcaContainer.getChildByName("drawCont"));
                        this.drawElementSelected(element);//Draws the input element as selected
                        var line = new createjs.Graphics().beginStroke("black").mt(element.m_easelElmt.x, element.m_easelElmt.y).lt(p_evt.stageX, p_evt.stageY);
                        var conn = new createjs.Shape(line);
                        var arrow = new createjs.Graphics().beginFill("black").mt(-5, 0).lt(5, 5).lt(5, -5).cp();
                        var arrowCont = new createjs.Shape(arrow);
                        var cont = new createjs.Container();

                        arrowCont.x = ((element.m_easelElmt.x - p_evt.stageX) / 2) + p_evt.stageX;
                        arrowCont.y = ((element.m_easelElmt.y - p_evt.stageY) / 2) + p_evt.stageY;
                        arrowCont.rotation = (180 / Math.PI) * Math.atan((element.m_easelElmt.y - p_evt.stageY) / (element.m_easelElmt.x - p_evt.stageX));
                        if (element.m_easelElmt.x < p_evt.stageX) {
                            arrowCont.rotation = 180 + arrowCont.rotation;
                        }


                        cont.name = "drawCont";
                        cont.addChild(conn);
                        cont.addChild(arrowCont);
                        this.m_mcaContainer.addChildAt(cont, 0);
                        var gui = this;


                        if (this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0) !== null
                            && this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0).parent.name.substr(0, 4) === "elmt") {
                            console.log("over element");
                            //If the mouse is over an element
                            var outputElmt = this.m_model.getElement(this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0).parent.name);
                            if (Tools.validConnection(element, outputElmt)) {
                                this.drawElementSelected(outputElmt);
                            }
                            else {
                                //console.log("illegal connection");
                                /*document.body.style.cursor = "not-allowed";
                                var mouseText = document.createElement("div");
                                mouseText.innerHTML = "Cannot create connection";
                                mouseText.style.top =  (p_evt.stageY - 10) +"px";
                                mouseText.style.left = p_evt.stageX+ "px";
                                $("#MCAContainer").append(mouseText);*/
                            }
                        }
                        // }
                        $("#mAction").html("connecting");
                    }
                    else {
                        //console.log("elements off screen: " + this.elementOffScreen(p_evt.stageX - this.m_oldX, p_evt.stageY - this.m_oldY));
                        if (!this.elementOffScreen(p_evt.stageX - this.m_oldX, p_evt.stageY - this.m_oldY, this.getSelectedPos())) {
                            //document.body.style.cursor = "auto";
                            for (var i = 0; i < this.m_selectedItems.length; i++) {
                                var elmt = this.m_selectedItems[i];

                                elmt.x += p_evt.stageX - this.m_oldX;
                                elmt.y += p_evt.stageY - this.m_oldY;

                                //console.log("selected elements: " + this.m_selectedItems);
                                console.log("element: " + elmt.name);
                                //Updating connections to moved elemeents
                                for (var j = 0; j < this.m_model.getElement(elmt.name).getConnections().length; j++) {
                                    var c = this.m_model.getElement(elmt.name).getConnections()[j];
                                    this.updateConnection(c);
                                }
                            }
                        }
                        /*else {
                            console.log("not allowed");
                            document.body.style.cursor = "not-allowed";
                        }*/
                    }
                }
                this.resizeWindow();
                this.scrollWindow(p_evt);
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                // console.log("this.m_mcaSizeX " + this.m_mcaSizeX);
                this.m_updateStage = true;
            }

            private scrollWindow(p_evt: createjs.MouseEvent): void {
                //console.log("x: " + p_evt.rawX + " y: " + p_evt.rawY);
                var y: number = p_evt.rawY + (1126 - 763);
                var x: number = p_evt.rawX;
                var pxFromTop: number = $(parent.window).scrollTop();
                var pxFromLeft: number = $(parent.window).scrollLeft();
                var screenWidth: number = $(parent.window).width();
                var userScreenHeight: number = $(parent.window).height();
                if (y > ((userScreenHeight + pxFromTop - 30))) {
                    //console.log("scroll");
                    if (pxFromTop > 0) {
                        parent.window.scrollBy(0, (userScreenHeight / 50));
                    }
                }
                else if (y < (pxFromTop + 20)) {

                    parent.window.scrollBy(0, -(userScreenHeight / 50));

                }
                //console.log(p_evt.rawY, y, pxFromTop, userScreenHeight);

                if (x > ((screenWidth + pxFromLeft - 130))) {
                    //console.log("scroll");
                    parent.window.scrollBy((screenWidth / 50), 0);
                }
                else if (x < (pxFromLeft + 30)) {

                    parent.window.scrollBy(-(screenWidth / 50), 0);

                }
                //console.log(p_evt.rawX, x, pxFromLeft, screenWidth);
            }
            private moveAllElements(xDistance: number, yDistance: number): void {
                var gui = this;
                this.m_model.getElementArr().forEach(function (e) {
                    //console.log("moving element from " + e.m_easelElmt.y + " to " + (e.m_easelElmt.y + yDistance));
                    e.m_easelElmt.x += xDistance;
                    e.m_easelElmt.y += yDistance;
                    e.m_minitableEaselElmt.x += xDistance;
                    e.m_minitableEaselElmt.y += yDistance;

                    for (var j = 0; j < e.getConnections().length; j++) {
                        var c = e.getConnections()[j];
                        gui.updateConnection(c);
                    }
                });
            }
            resizeWindow(): void {
                $("#fitToModel").removeClass("ui-state-focus");
                var maxX: number = 0; // Right edge
                var maxY: number = 0; //Bottom edge
                var x: number;
                var y: number;
                var yEdge: number = 40; //The distance from the position to the bottom edge of elements
                var xEdge: number = 200; //Distance from the center to the right edge of elements
                var moveDistance: number = 10; //The distance to move the canvas in each step
                var gui = this;
                this.m_model.getElementArr().forEach(function (e) {
                    x = e.m_easelElmt.x + gui.m_mcaContainer.x;
                    y = e.m_easelElmt.y + gui.m_mcaContainer.y;
                    if (x + xEdge > maxX) {
                        maxX = x + xEdge;
                    }
                    if (y + yEdge > maxY) {
                        maxY = y + yEdge;
                    }
                });
                //console.log("max x: " + maxX + " canvas widht: " + this.m_mcaStageCanvas.width);
                if (maxX > this.m_mcaStageCanvas.width) {
                    this.increaseSize(moveDistance, 0);
                    window.scrollBy(moveDistance, 0);
                }
                /*else if (maxX < this.m_mcaStageCanvas.width - 100) {
                    this.increaseSize(-moveDistance, 0);
                }*/
                //console.log("max y: " + maxY + " canvas heigth: " + this.m_mcaStageCanvas.height);
                if (maxY > this.m_mcaStageCanvas.height) {
                    this.increaseSize(0, moveDistance);
                    window.scrollBy(0, moveDistance);
                }
            }
            private elementOffScreen(xMovement: number, yMovement: number, positions: number[]): boolean {
                var SelectedPos: number[] = this.getSelectedPos();
                var lowestElement: number = positions[0];
                var highestElement: number = positions[1];
                var leftmostElement: number = positions[2];
                var rightmostElement: number = positions[3];
                //console.log(highestElement - 30);
                return highestElement - 30 + yMovement < 0 || leftmostElement - 80 + xMovement < 0 || lowestElement + yMovement - 30 > this.m_mcaStageCanvas.height || rightmostElement - 80 + xMovement > this.m_mcaStageCanvas.width;
            }
            private tick(): void {
                if (this.m_updateStage) {
                    this.m_updateStage = false;
                    this.m_mcaStage.update();
                    this.m_valueFnStage.update();
                    this.m_selectionBox.graphics.clear();
                }
            }
            private clear(): void {
                this.m_mcaContainer.removeAllChildren();
                this.m_updateStage = true;
            }
            private disconnectFrom(p_evt): void {

            }
            private connectionExist(p_evt: createjs.MouseEvent): boolean {
                console.log("selected: " + this.m_selectedItems);
                for (var i = 0; i < this.m_selectedItems.length; i += 2) {//The reason for only taking every second elemnt is that the others are minitables
                    var e = this.m_selectedItems[i];
                    var first: Element = this.m_model.getElement(e.name);
                    first.isChildOf(this.m_model.getElement(p_evt.target.name));
                    first.isParentOf(this.m_model.getElement(p_evt.target.name));

                }

                return false;
            }

            private connect(inputElmt: Element, outputElmt: Element): void {
                var successfull = false;
                //console.log("attempting connection " + outputElmt.getID());
                        if (inputElmt.getID() !== outputElmt.getID()) {
                        //console.log("outputElmt: " + outputElmt.getID() + " inputElmt: " + inputElmt.getID());

                        if (Tools.validConnection(inputElmt, outputElmt)) {

                            if ((inputElmt.getType() === 2 || inputElmt.getType() === 3) && outputElmt.getType() === 2) {//Output element should be converted to a super value node
                                outputElmt.convertToSuperValue();
                            }
                            var c = this.m_model.createNewConnection(inputElmt, outputElmt);
                            console.log("connection: " + c);
                            if (this.m_model.addConnection(c)) {
                                this.addConnectionToStage(c);
                                successfull = true;
                            }
                            if (this.m_model.m_bbnMode) {
                                if (outputElmt.getType() !== 1) { //Dec nodes data does not rely on parents
                                    outputElmt.updateData();
                                }
                                outputElmt.setUpdated(false);
                                outputElmt.getAllDescendants().forEach(function (e) {
                                    e.setUpdated(false);
                                });
                                outputElmt.getAllAncestors().forEach(function (e) {
                                    e.setUpdated(false);
                                });
                                inputElmt.setUpdated(false);
                                console.log("connection created from " + outputElmt.getID() + " to " + inputElmt.getID());
                                this.updateMiniTables(outputElmt.getAllDescendants().concat(outputElmt.getAllAncestors()));

                            }
                        }


                    
                }
                this.clearSelection();
                if (this.m_model.getAutoUpdate()) {//If auto update is on, update the model
                    this.updateModel();
                }
                /*if (!successfull) {
                    this.select(p_evt);
                }*/
                //this.m_mcaStage.update();
                //alert("connection is done");
                //this.select(elmtIdent);
            }

            
            private addConnectionToStage(p_connection: Connection, selected?: boolean): void {
                if (selected) {
                    var line = new createjs.Graphics().setStrokeStyle(3).beginStroke(p_connection.getColor()).mt(p_connection.getInputElement().m_easelElmt.x, p_connection.getInputElement().m_easelElmt.y).lt(p_connection.getOutputElement().m_easelElmt.x, p_connection.getOutputElement().m_easelElmt.y);
                }
                else {
                    var line = new createjs.Graphics().beginStroke(p_connection.getColor()).mt(p_connection.getInputElement().m_easelElmt.x, p_connection.getInputElement().m_easelElmt.y).lt(p_connection.getOutputElement().m_easelElmt.x, p_connection.getOutputElement().m_easelElmt.y);
                }
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
                arrowCont.name = p_connection.getID();;
                conn.name = p_connection.getID();
                //Add event listener to the arrow
                if (this.m_editorMode) {
                    arrowCont.addEventListener("mousedown", this.mouseDown);
                    conn.addEventListener("mousedown", this.mouseDown);
                }
                this.m_mcaContainer.addChildAt(cont, 0);
                p_connection.m_easelElmt = cont;
               
                this.m_updateStage = true;
            }
            private updateConnection(p_connection: Connection, selected?: boolean): void {
                //stage.removeChild(c.easelElmt);
                var temp: createjs.Shape = <createjs.Shape>p_connection.m_easelElmt.getChildAt(1);

                temp.graphics.clear();
                if (selected) {
                    temp.graphics.setStrokeStyle(3);
                }
                temp.graphics.beginStroke(p_connection.getColor()).mt(p_connection.getInputElement().m_easelElmt.x, p_connection.getInputElement().m_easelElmt.y).lt(p_connection.getOutputElement().m_easelElmt.x, p_connection.getOutputElement().m_easelElmt.y);
                p_connection.m_easelElmt.getChildAt(0).x = ((p_connection.getInputElement().m_easelElmt.x - p_connection.getOutputElement().m_easelElmt.x) / 2) + p_connection.getOutputElement().m_easelElmt.x;
                p_connection.m_easelElmt.getChildAt(0).y = ((p_connection.getInputElement().m_easelElmt.y - p_connection.getOutputElement().m_easelElmt.y) / 2) + p_connection.getOutputElement().m_easelElmt.y;
                p_connection.m_easelElmt.getChildAt(0).rotation = (180 / Math.PI) * Math.atan((p_connection.getInputElement().m_easelElmt.y - p_connection.getOutputElement().m_easelElmt.y) / (p_connection.getInputElement().m_easelElmt.x - p_connection.getOutputElement().m_easelElmt.x));
                if (p_connection.getInputElement().m_easelElmt.x < p_connection.getOutputElement().m_easelElmt.x) {
                    p_connection.m_easelElmt.getChildAt(0).rotation = 180 + p_connection.m_easelElmt.getChildAt(0).rotation;
                }
                //stage.addChildAt(c.easelElmt, 0);
                //update = true;
            }

            private drawElementSelected(elmt: Element) {
                elmt.setVisuallySelected(true);
                var elmtType = elmt.getType();
                //////console.log(e);
                var shape: createjs.Shape = <createjs.Shape>elmt.m_easelElmt.getChildAt(0);
                shape.graphics.clear().f(this.m_elementColors[elmtType][2]).s(this.m_elementColors[elmtType][1]).setStrokeStyle(2.5);

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
                        this.drawPolygon(shape, this.m_elementColors[elmtType][1]);
                        //shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                        break;
                    case 3:
                        //Super value
                        this.drawPolygon(shape, this.m_elementColors[elmtType][1]);
                        //shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                        break;
                    default:
                        break;
                }
            }
            private drawElementNotSelected(elmt: Element) {
                elmt.setVisuallySelected(false);
                var easelElmt = elmt.m_easelElmt;
                var elmtType = elmt.getType()
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
                        this.drawPolygon(shape, this.m_elementColors[elmtType][1]);
                        //shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                        break;
                    case 3:
                        //Super Value
                        this.drawPolygon(shape, this.m_elementColors[elmtType][1]);
                        //shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                        break;
                    default:
                        break;
                }
            }
            private addToSelection(p_easelElmt: createjs.Container): void {
                //console.log("selected: " + this.m_selectedItems);
                if (this.m_selectedItems.indexOf(p_easelElmt) === -1 && p_easelElmt.name.substr(0, 4) === "elmt") {
                    var elmt = this.m_model.getElement(p_easelElmt.name);
                    for (var i in elmt.getConnections) {
                        console.log(elmt.getName() + "  " + elmt.getConnections[i].getID())
                    }
                    this.m_selectedItems.push(p_easelElmt);
                    if (this.m_model.m_bbnMode) {
                        this.m_selectedItems.push(elmt.m_minitableEaselElmt);
                    }
                    
                    this.drawElementSelected(elmt);

                    this.m_updateStage = true;
                }
                else if (this.m_model.m_bbnMode && this.m_selectedItems.indexOf(p_easelElmt) !== -1 && p_easelElmt.name.substr(0, 4) === "elmt") {//If element is already selected
                    //console.log("selected: " + this.m_selectedItems);
                    //console.log("element already selected");
                    var elmt = this.m_model.getElement(p_easelElmt.name);

                    var newSelected: any[] = [];
                    this.m_selectedItems.forEach(function (e) {
                        //console.log("checking " + e + " against " + p_easelElmt);
                        if (e.toString() !== p_easelElmt.toString()) {
                            //console.log("not a match");
                            newSelected.push(e);
                        }
                        else {
                            //console.log("match");
                        }
                    });
                    this.m_selectedItems = newSelected;
                    //console.log("new selected: " + this.m_selectedItems);
                    this.drawElementNotSelected(this.m_model.getElement(p_easelElmt.name));

                    
                }
                //for (var index in this.m_selectedItems) {
                //    console.log("selected: " + this.m_selectedItems[index]);
                //    for (var ind in this.m_selectedItems[index].
                //}
                else if (this.m_selectedConnections.indexOf(p_easelElmt) === -1 && p_easelElmt.name.substr(0, 4) === "conn") { //If it is a connection
                    console.log(this.m_selectedConnections);
                    this.m_selectedConnections.push(p_easelElmt);
                    console.log(this.m_selectedConnections);
                    this.updateConnection(this.m_model.getConnection(p_easelElmt.name), true);
                    //this.addConnectionToStage(this.m_model.getConnection(p_easelElmt.name), true);
                }
                else if (this.m_model.m_bbnMode && this.m_selectedConnections.indexOf(p_easelElmt) !== -1 && p_easelElmt.name.substr(0, 4) === "conn") { //If it already selected
                    console.log("already selected");
                    console.log("checking " + this.m_selectedConnections[0] + " against " + p_easelElmt + ": " + (this.m_selectedConnections[0] == p_easelElmt));
                var newSelected: any[] = [];
                    this.m_selectedConnections.forEach(function (c) {
                        //console.log("checking " + e + " against " + p_easelElmt);
                        if (c.toString() !== p_easelElmt.toString()) {
                            //console.log("not a match");
                            newSelected.push(c);
                        }
                        else {
                            //console.log("match");
                        }
                    });
                    this.m_selectedConnections = newSelected;
                    this.updateConnection(this.m_model.getConnection(p_easelElmt.name));
                }

                this.m_updateStage = true;
            }

            private drawPolygon(shape: createjs.Shape, color: string) {
                var heigth: number = 30;
                var length: number = 150;
                shape.graphics.beginStroke(color);
                shape.graphics.moveTo(length / 10, 0).lineTo(length - (length / 10), 0).lineTo(length, heigth / 2);
                shape.graphics.lineTo(length - (length / 10), heigth).lineTo(length / 10, heigth).lineTo(0, heigth / 2).lineTo(length / 10, 0);
            }
            private setSelection(p_easelElmts: createjs.Container[]): void {
                this.clearSelection();
                ////console.log(p_easelElmt);
                for (var i = 0; i < p_easelElmts.length; i++) {
                    this.addToSelection(p_easelElmts[i]);
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
                                this.drawPolygon(shape, this.m_elementColors[elmtType][1]);
                                //shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                                break;
                            case 3:
                                //Super Value
                                this.drawPolygon(shape, this.m_elementColors[elmtType][1]);
                                //shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                                break;
                            default:
                                break;
                        }
                    }
                }
                for (var i = 0; i < this.m_selectedConnections.length; i++) {
                    this.updateConnection(this.m_model.getConnection(this.m_selectedConnections[i].name));
                }
                this.m_selectedItems = [];
                this.m_selectedConnections = [];
                this.m_selectedConnections = [];
                this.m_updateStage = true;
            }
            private addDataRowClick(p_evt: Event) {
                console.log("adding data row");
                var elmt: Element = p_evt.data.param1;
                var id: string = elmt.getID();
                $("#valuesTable_div_" + id).hide();//Hides the value table
                this.updateValueButton(true, id); //Disables the show values button until element is updated
                //console.log("add row");
                $("#detailsDialog_" + id).data("defTable", Tools.addDataRow(elmt, $("#detailsDialog_" + id).data("defTable")));
                var newState: String = $("#detailsDialog_" + id).data("defTable")[$("#detailsDialog_" + id).data("defTable").length - 1][0];
                var states: String[] = $("#detailsDialog_" + id).data("newStates");
                states.push(newState);
                $("#detailsDialog_" + id).data("newStates", states);
                //Create the html tabel again and add the edit function again
                $("#defTable_div_" + id).empty();
                document.getElementById("defTable_div_" + id).appendChild(this.htmlTableFromArray("Definition", elmt, this.m_model, this.m_editorMode, $("#detailsDialog_" + id).data("defTable")));
                console.log("new data table: " + $("#detailsDialog_" + id).data("defTable"));
                //var s = Tools.htmlTableFromArray("Definition", elmt, this.m_model, this.m_editorMode, $("#detailsDialog_" + id).data("defTable"));
                //$("#defTable_div_" + id).html(s);
                this.addEditFunction(elmt, this.m_editorMode);
                $("#detailsDialog_" + id).data("unsavedChanges", true);
                this.updateUpdateButton(true);
                $("#values_" + id).show();
                $("#submit_" + id).show();
            }
            private saveAddedRows(p_elmt: Element, p_states: any[]) {
                console.log("new States: " + p_states);
                for (var i = 0; i < p_states.length; i++) {
                    var newStateName: String = p_states[i];
                
                    //Add default values for the new state in all children
                    p_elmt.getChildrenElements().forEach(function (e) {
                         console.log("updating header for " + e.getName());
                        e.setData(e.updateHeaderRows(e.getData()));
                        console.log("new Data: " + e.getData());
                        e.setData(e.addDefaultDataInEmptyCells(e.getData(), p_elmt, newStateName));
                    });
                }
            }
            private removeRowVisually(p_element: Element, p_row: number):boolean {
                var id: string = p_element.getID();
                //console.log("delete row: " + rowToDelete);
                if ($("#detailsDialog_" + id).data("defTable").length - Tools.numOfHeaderRows($("#detailsDialog_" + id).data("defTable")) < 3) {//The user is not allowed to delete the two last rows
                    alert("Must be at least two outcomes");
                    return false;
                }
                else {
                    var rowToDelete: any[] = $("#detailsDialog_" + id).data("defTable")[p_row];
                    $("#detailsDialog_" + id).data("defTable", Tools.removeRow($("#detailsDialog_" + id).data("defTable"), p_row));

                    var statesToAdd: String[] = $("#detailsDialog_" + id).data("newStates");
                    var deletedRowState: String = rowToDelete[0];
                    var newStatesToAdd: String[] = [];
                    if (statesToAdd !== undefined && statesToAdd.indexOf(deletedRowState) > -1) {//If the row is a new row, remove it from the statesToAdd list
                        console.log("deleted row is a new row");
                        for (var i = 0; i < statesToAdd.length; i++) {
                            if (statesToAdd[i] !== deletedRowState) {//This is not the deleted state and it should be added to the new list
                                newStatesToAdd.push(statesToAdd[i]);
                            }
                        }
                        $("#detailsDialog_" + id).data("newStates", newStatesToAdd);//Update the new states
                    }
                    else {//Otherwise add the row to deletedRows
                        console.log("deleted row is not a new row");
                        var rowsToDelete: number[] = $("#detailsDialog_" + id).data("deletedRows");
                        rowsToDelete.push(p_row);
                        $("#detailsDialog_" + id).data("deletedRows", rowsToDelete);
                    }
                    //create the html table again
                    $("#defTable_div_" + id).empty();
                    document.getElementById("defTable_div_" + id).appendChild(this.htmlTableFromArray("Definition", p_element, this.m_model, this.m_editorMode, $("#detailsDialog_" + id).data("defTable")));
                    //var s = Tools.htmlTableFromArray("Definition", p_element, this.m_model, this.m_editorMode, $("#detailsDialog_" + id).data("defTable"));
                    //$("#defTable_div_" + id).html(s);
                    return true;
                }
            }


            private disableButtons(b: boolean): void {
                $("#lodDcmt").prop('disabled', b);
                $("#savDcmt").prop('disabled', b);
                $("#resetDcmt").prop('disabled', b); 
                $("#newDcmt").prop('disabled', b); 
                $("#newElmt").prop('disabled', b);
                $("#newChance").prop('disabled', b);
                $("#newDec").prop('disabled', b);
                $("#newValue").prop('disabled', b);
                $("#deleteElmt").prop('disabled', b);
                $("#selectAllElmt").prop('disabled', b);
                $("#cnctTool").prop('disabled', b);
                $("#fitToModel").prop('disabled', b);
                $("#fullscreen").prop('disabled', b);
                $("#editorMode").prop('disabled', b);
                $("#autoUpdate").prop('disabled', b);
                //$("#updateMdl").prop('disabled', b);

                $("#selectModel").prop('disabled', b);
            }
            private updateOpenDialogs(): void {
                var mareframGUI = this;
                this.m_model.getElementArr().forEach(function (e) {
                    if (e.getDialog() !== undefined && e.getDialog().data("isOpen")) {
                        e.getDialog().dialog("open");
                        console.log("updating tables for: " + e.getName());
                        if (!(e.isUpdated())) {
                            mareframGUI.updateValueButton(true, e.getID());
                            $("#values_" + e.getID()).show();
                        }
                        else {
                            mareframGUI.updateValueButton(false, e.getID());
                        }
                        mareframGUI.updateTablesVisually(e);
                    }
                });
            }

            private updateTablesVisually(p_elmt: Element): void {
                var id: string = p_elmt.getID();
                $("#defTable_div_" + id).empty();
                document.getElementById("defTable_div_" + id).appendChild(this.htmlTableFromArray("Definition", p_elmt, this.m_model, this.m_editorMode));
                //var s = Tools.htmlTableFromArray("Definition", p_elmt, this.m_model, this.m_editorMode);
                //$("#defTable_div_" + id).html(s);
                // $("#defTable_div_" + id).show();
                console.log("is values visible: " + $("#valuesTable_div_" + id).is(":visible"));
                $("#valuesTable_div_" + id).empty();
                document.getElementById("valuesTable_div_" + id).appendChild(this.htmlTableFromArray("Values", p_elmt, this.m_model, this.m_editorMode));
                //$("#valuesTable_div_" + id).html(Tools.htmlTableFromArray("Values", p_elmt, this.m_model, this.m_editorMode));
                if (!($("#values_" + id).is(":visible"))) {
                    $("#valuesTable_div_" + id).show();
                }
                else {
                    $("#valuesTable_div_" + id).hide();
                }
                this.addEditFunction(p_elmt, this.m_editorMode);
            }
            private htmlTableFromArray(p_header: string, p_elmt: Element, p_model: Model, p_editorMode: boolean, p_data?: any[][]) {
                //console.log("header: " + p_header);
                //console.log("type of elmt: " + p_elmt.getType());
                console.log("creating htmlTable");
                var data: any[][];
                var gui: GUIHandler = this;
                if (p_data === undefined) {
                    if (p_header === "Definition") {
                        data = p_elmt.getData();
                    }
                    else if (p_header === "Values") {
                        data = p_elmt.getValues();
                    }
                }
                else {
                    data = p_data;
                }
                var numOfHeaderRows = Tools.numOfHeaderRows(data);
                if (p_elmt.getType() === 1 && p_header === "Values") {//Find best decision by finding the highest value in dec value table
                    var highestValue: number = 1;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i][1] > data[highestValue][1]) {
                            highestValue = i;
                        }
                    }
                    console.log("highest is : " + highestValue);
                }
                if (p_elmt.getType() == 2 && p_header === "Values") {//Find best decision by finding the highest value in value values table
                    var bestDecCol: number = 1;
                    // console.log("data length: " + data.length);
                    // console.log("data [0] length: " + data[0].length);
                    for (var j = 2; j < data[0].length; j++) {
                        if (data[numOfHeaderRows][j] > data[numOfHeaderRows][bestDecCol]) {
                            bestDecCol = j;
                        }
                    }
                    console.log("best column " + bestDecCol + " value: " + data[numOfHeaderRows][bestDecCol]);
                }
                
                var table = document.createElement("table");
                var rowPlaceholder;
                rowPlaceholder = table.insertRow(-1)
                var cellPlaceholder = document.createElement("th");
                cellPlaceholder.style.textAlign = "center";
                if (data[0] !== undefined) {
                    cellPlaceholder.colSpan = (data[0].length + 1);

                }
                cellPlaceholder.innerHTML = p_header;
                rowPlaceholder.appendChild(cellPlaceholder);
                if (p_elmt.getType() === 3 && math.size(data)[1] < 1) {//The data table is empty in the super value node
                    //console.log("super value with empty def");
                    rowPlaceholder = table.insertRow(-1);
                    cellPlaceholder = rowPlaceholder.insertCell(-1);
                    cellPlaceholder.innerHTML = "This super value node has no parents";
                }
                else {

                    //Create the header rows
                
                    for (var i = 0; i < numOfHeaderRows; i++) {
                        rowPlaceholder = table.insertRow(-1);
                        if (p_editorMode && p_header === "Definition" && (p_elmt.getType() === 0 || p_elmt.getType() === 1)) {//Create empty cell above minus cells
                            var emptyCell = document.createElement("th");
                           
                            rowPlaceholder.appendChild(emptyCell);
                        }
                        for (var j = 0; j < (data[0].length); j++) {//Create a new header element for each element
                            var headerCell = document.createElement("th");
                            if (j === 0) {
                                headerCell.innerHTML = p_model.getElement(data[i][j]).getName();
                                headerCell.style.minWidth = "90px";
                            }
                            else {
                                headerCell.innerHTML = data[i][j];
                            }
                            rowPlaceholder.appendChild(headerCell);
                        }
                    }
                    //Create the data rows
                    for (var i = numOfHeaderRows; i < data.length; i++) {
                        rowPlaceholder = table.insertRow(-1);
                        if (p_editorMode && p_header === "Definition" && (p_elmt.getType() === 0 || p_elmt.getType() === 1)) {//add minus button
                            var minusCell = document.createElement("th");
                            var button = document.createElement("button");
                            button.setAttribute("class", "minus minus_" + p_elmt.getID());
                            button.setAttribute("id", i + "");
                            button.title = "Click to delete this row";
                            minusCell.appendChild(button);
                            rowPlaceholder.appendChild(minusCell);
                        }
                        for (var j = 0; j < data[0].length; j++) {
                            var value: any = data[i][j];
                            if (value === -Infinity) {//In decision nodes the default value is -infinity, but this should be 0 to the user
                                value = 0;
                            }
                            if (j === 0) {//If this is first column this is main values
                                if (p_elmt.getType() === 3 && p_header === "Definition") {//This is because super value nodes have parents horizontial in def table
                                    cellPlaceholder = document.createElement("th");
                                    cellPlaceholder.innerHTML = p_model.getElement(data[i][j]).getName();
                                    rowPlaceholder.appendChild(cellPlaceholder);
                                }
                                else {
                                    cellPlaceholder = document.createElement("th");
                                    if (p_editorMode && p_header === "Definition") {
                                        var input = document.createElement("input");
                                        input.type = "text";
                                        input.value = value.trim();
                                        $(input).on("input",{ field: input, elmt: p_elmt, gui: gui }, gui.inputChanged);//Add on input change function to the cell
                                        $(input).data("originalValue", value.trim()); // Save the original value in the cell
                                        cellPlaceholder.appendChild(input);
                                    }
                                    else {
                                        var classes: string = "editable_cell editable_cell_" + p_elmt.getID();
                                        var div = document.createElement("div");
                                        div.setAttribute("id", (i - numOfHeaderRows) + "");
                                        if (p_elmt.getType() === 1) {//If element is a dec element add the decCell class
                                            classes += " decCell_" + p_elmt.getID();
                                            if ((i - numOfHeaderRows) == p_elmt.getDecision()) { //Mark the set decision
                                                classes += " setDecision";
                                            }
                                        }
                                        else if (p_elmt.getType() === 0) {//If this is a chance element add the evidenceCell class
                                            classes += " evidenceCell_" + p_elmt.getID();
                                            if ((i-numOfHeaderRows) == p_elmt.getEvidence()) {//Mark the set evidence
                                                classes += " setEvidence";
                                            }
                                        }
                                        div.setAttribute("class", classes);
                                        div.innerHTML = value;
                                        cellPlaceholder.appendChild(div);
                                    }
                                    rowPlaceholder.appendChild(cellPlaceholder);
                                }
                            } else {
                                if (i === highestValue || j == bestDecCol) {//mark highest if it is the value table of a value node or a decision node
                                    cellPlaceholder = rowPlaceholder.insertCell(-1);//insert cell at the end of row
                                    cellPlaceholder.innerHTML = (Tools.round(value) + "").bold();
                                }
                                else if (p_editorMode && p_header === "Definition") {
                                    cellPlaceholder = rowPlaceholder.insertCell(-1);//insert cell at the end of row
                                    var input = document.createElement("input");
                                    input.setAttribute("class", "data_" + p_elmt.getID());
                                    input.type = "number";
                                    if (p_elmt.getType() === 0) {//Chance
                                        input.max = "1";
                                        input.min = "0";
                                        input.step = "0.05";
                                    }
                                    input.value = Tools.round(value) + "";
                                    $(input).on("input", { field: input, elmt: p_elmt, gui: gui }, gui.inputChanged);//Add on input change function to the cell
                                    $(input).data("originalValue", Tools.round(value)); // Save the original value in the cell
                                    cellPlaceholder.appendChild(input);
                                }
                                else {
                                    cellPlaceholder = rowPlaceholder.insertCell(-1);//insert cell at the end of row
                                    var div = document.createElement("div");
                                    div.setAttribute("class", "data_" + p_elmt.getID());
                                    div.innerHTML = Tools.round(value) + "";
                                    cellPlaceholder.appendChild(div);
                                }
                            }
                        }
                    }
                }
                return table;

            }
            private inputChanged(p_evt: Event): void {
                console.log("evt: " + p_evt);
                var field = p_evt.data.field;
                var elmt: Element = p_evt.data.elmt;
                var gui: GUIHandler = p_evt.data.gui;
                var id: string = elmt.getID();
                var originalValue: string = $(field).data("originalValue") + "";
                console.log("original value: " + originalValue);
                console.log("input changed");
                var elementWithUnsavedChanges = gui.getElementWithUnsavedChanges();
                console.log("elementWithUnsavedChanges: " + elementWithUnsavedChanges);
                if (elmt.getType() === 0 && parseFloat(field.value) < 0) {
                    field.value = $(field).data("originalValue");
                    alert("Negative values are not allowed");
                }
                else if (elementWithUnsavedChanges === null || elementWithUnsavedChanges === elmt) {
                    var newText = field.value;
                    $("#valuesTable_div_" + id).hide();
                    $("#values_" + id).show();
                    $("#submit_" + id).show();
                    $("#detailsDialog_" + elmt.getID()).data("unsavedChanges", true);
                    this.updateUpdateButton(true);
                    console.log("setting unsaved changes = true in " + elmt.getID());
                    this.updateValueButton(true, id);
                    $(field).data("originalValue", newText);
                    $("#detailsDialog_" + id).data("defTable", gui.updateDefTable(elmt)); //This saves the temporary data table
                }
                else {
                    field.value = $(field).data("originalValue");
                    alert("Please submit changes in " + elementWithUnsavedChanges.getName() + " before editing this data table");
                }
            }
            
        }
    }
}