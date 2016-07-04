var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var GUIHandler = (function () {
            function GUIHandler(p_model, p_handler) {
                this.m_noOfDialogsOpen = 0;
                this.m_windowResizable = false;
                this.m_editorMode = false;
                this.m_fullscreen = false;
                this.m_mcaStage = new createjs.Stage("MCATool");
                this.m_valueFnStage = new createjs.Stage("valueFn_canvas");
                this.m_controlP = new createjs.Shape();
                this.m_valueFnContainer = new createjs.Container();
                this.m_valueFnLineCont = new createjs.Container();
                this.m_valueFnSize = 100;
                this.m_mcaStageCanvas = this.m_mcaStage.canvas;
                this.m_selectionBox = new createjs.Shape();
                this.m_mcaSizeX = $(window).width();
                this.m_mcaSizeY = $(window).height();
                this.m_mcaContainer = new createjs.Container();
                this.m_drawingCont = new createjs.Container();
                this.m_googleColors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"];
                this.m_mcaBackground = new createjs.Shape(new createjs.Graphics().beginFill("white").drawRect(0, 0, this.m_mcaSizeX, this.m_mcaSizeY));
                this.m_valFnBackground = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.m_valueFnSize, this.m_valueFnSize));
                this.m_updateStage = true;
                this.m_chartsLoaded = false;
                this.m_oldX = 0;
                this.m_oldY = 0;
                this.m_originalPressX = 0;
                this.m_originalPressY = 0;
                this.m_selectedItems = [];
                this.m_selectedConnections = [];
                this.m_finalScoreChart = new google.visualization.ColumnChart($("#finalScore_div").get(0));
                this.m_finalScoreChartOptions = {
                    width: 1024,
                    height: 400,
                    vAxis: { minValue: 0 },
                    legend: { position: 'top', maxLines: 3 },
                    bar: { groupWidth: '75%' },
                    animation: { duration: 500, easing: "out" },
                    isStacked: true,
                    focusTarget: 'category'
                };
                this.m_elementColors = [["#efefff", "#15729b", "#dfdfff",], ["#fff6e0", "#f6a604", "#fef4c6"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#efffef", "#2fc433", "#dfffdf"]];
                this.m_trashBin = [];
                this.setEditorMode = function (cb) {
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
                };
                this.setAutoUpdate = function (cb) {
                    //console.log(cb);
                    this.m_model.setAutoUpdate(cb.currentTarget.checked);
                    if (cb.currentTarget.checked) {
                        $("#autoUpdateStatus").html("Updating automatically");
                        $("#updateMdl").hide();
                    }
                    else {
                        $("#autoUpdateStatus").html("");
                        $("#updateMdl").show();
                    }
                    //console.log("auto update: " + this.m_model.m_autoUpdate);
                };
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
                this.m_mcaStage.enableMouseOver(20); //Enable mouse over
                this.m_mcaStage.addChild(this.m_mcaContainer);
                this.m_valueFnStage.addChild(this.m_valFnBackground);
                this.m_valueFnStage.addChild(this.m_valueFnLineCont);
                this.m_valueFnStage.addChild(this.m_valueFnContainer);
                this.m_valueFnStage.addChild(this.m_controlP);
                createjs.Ticker.addEventListener("tick", this.tick);
                createjs.Ticker.setFPS(60);
                $("#debug").hide();
                this.updateEditorMode();
                if (this.m_model.getAutoUpdate()) {
                    $("#updateMdl").hide();
                }
                $("#settings").show();
                this.m_mcaContainer.addChild(this.m_drawingCont);
            }
            GUIHandler.prototype.optionTypeChange = function (p_evt) {
                //console.log("Element name: " + p_evt.target.id);
                var elmt = $("#detailsDialog").data("element");
                //elmt.setType(p_evt.target.value);
            };
            GUIHandler.prototype.optionMethodChange = function (p_evt) {
                var elmt = $("#detailsDialog").data("element");
                //elmt.setMethod(p_evt.target.value);
            };
            GUIHandler.prototype.allConnectionstoConsole = function (p_evt) {
                for (var i = 0; i < this.m_model.getConnectionArr().length; i++) {
                    console.log("Id: " + this.m_model.getConnectionArr()[i].getID() + "  InElmt: " + this.m_model.getConnectionArr()[i].getInputElement().getName() + "  OutElmt: " + this.m_model.getConnectionArr()[i].getOutputElement().getName());
                }
            };
            GUIHandler.prototype.allModeltoConsole = function (p_evt) {
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
            };
            GUIHandler.prototype.cnctStatus = function (p_evt) {
                if ($("#cnctTool").prop("checked")) {
                    $("#modeStatus").html("Connect Mode");
                    document.body.style.cursor = "alias";
                }
                else {
                    $("#modeStatus").html("Editor Mode");
                    document.body.style.cursor = "default";
                }
            };
            GUIHandler.prototype.selectModel = function (p_evt) {
                this.m_model.closeDown();
                this.clearSelection();
                this.m_handler.getFileIO().loadModel($("#selectModel").val(), this.m_model, this.importStage);
            };
            GUIHandler.prototype.loadModel = function (p_evt) {
                $("#selectModel").prop("selectedIndex", -1);
                this.m_model.closeDown();
                console.log("load model");
                this.m_handler.getFileIO().loadfromGenie(this.m_model, this.importStage);
                this.updateSize();
            };
            GUIHandler.prototype.saveModel = function (p_evt) {
                $("#saveFile_div").show();
                this.m_handler.getFileIO().saveModel(this.m_model);
            };
            GUIHandler.prototype.selectAll = function (p_evt) {
                this.clearSelection();
                for (var i = 0; i < this.m_model.getElementArr().length; i++) {
                    this.addToSelection(this.m_model.getElementArr()[i].m_easelElmt);
                }
            };
            //This method is not being used at the moment
            GUIHandler.prototype.addLoadingCursor = function () {
                console.log("changing to progress");
                document.getElementsByTagName("body")[0].style.cursor = "progress";
            };
            GUIHandler.prototype.updateModel = function () {
                //console.log("model: " + this.m_model.getName());
                this.m_model.update();
                this.updateMiniTables(this.m_model.getElementArr());
                this.updateOpenDialogs();
                /* console.log("changing back to auto");
                 document.getElementsByTagName("body")[0].style.cursor = "auto";*/ //Not working
            };
            GUIHandler.prototype.updateDecAndEvidenceVisually = function () {
                this.updateMiniTables(this.m_model.getElementArr());
                this.updateOpenDialogs();
            };
            GUIHandler.prototype.fitToModel = function () {
                this.repositionModel();
                this.updateSize();
            };
            GUIHandler.prototype.setSize = function (p_width, p_height) {
                //console.log("setting size to " + p_width + " , " + p_height);
                this.m_mcaStageCanvas.height = p_height;
                this.m_mcaStageCanvas.width = p_width;
                this.m_mcaBackground.scaleY = p_height / this.m_mcaSizeY;
                this.m_mcaBackground.scaleX = p_width / this.m_mcaSizeX;
            };
            GUIHandler.prototype.increaseSize = function (p_x, p_y) {
                this.m_mcaBackground.scaleY = (this.m_mcaStageCanvas.height + p_y) / this.m_mcaSizeY;
                this.m_mcaBackground.scaleX = (this.m_mcaStageCanvas.width + p_x) / this.m_mcaSizeX;
                this.m_mcaStageCanvas.height += p_y;
                this.m_mcaStageCanvas.width += p_x;
            };
            GUIHandler.prototype.newDcmt = function () {
                console.log("new document clicked");
                this.m_model = this.m_handler.addNewModel();
                this.importStage();
            };
            GUIHandler.prototype.resetDcmt = function () {
                console.log("in local storage: " + localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                this.clearSelection();
                if (this.m_handler.getFileIO().reset() === null) {
                    var loadModel = DST.Tools.getUrlParameter('model');
                    loadModel = this.m_model.getIdent();
                    console.log("using model: " + loadModel);
                    this.m_handler.getFileIO().loadModel(loadModel, this.m_handler.getActiveModel(), this.importStage);
                }
                else {
                    this.m_model.fromJSON(this.m_handler.getFileIO().reset());
                    this.importStage();
                    if (!this.m_model.getElementArr().length) {
                        var loadModel = DST.Tools.getUrlParameter('model');
                        loadModel = "scotland";
                        console.log("using model: " + loadModel);
                        this.m_handler.getFileIO().loadModel(loadModel, this.m_handler.getActiveModel(), this.importStage);
                    }
                }
                this.m_model.closeDown();
            };
            GUIHandler.prototype.importStage = function () {
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
                }
                else {
                    this.updateMiniTables(elmts);
                }
                this.m_updateStage = true;
                $("#modelHeader").html(this.m_model.getName());
                //this.repositionModel();
                this.updateSize();
                //this.m_handler.getFileIO().quickSave(this.m_model); //This is commented out the because it was preventing reset from working properly
            };
            ;
            GUIHandler.prototype.mouseUp = function (p_evt) {
                // console.log("mouse up");
                $("#mX").html("X: " + p_evt.stageX);
                $("#mY").html("Y: " + p_evt.stageY);
                $("#mAction").html("Action: mouseUp");
                $("#mTarget").html("Target: " + p_evt.target.name);
                //var tmp: any = this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0).name;
                //$("#mTarget").html("Target: " + tmp );
                this.m_updateStage = true;
            };
            GUIHandler.prototype.pressUp = function (p_evt) {
                console.log("target: " + p_evt.target.name);
                console.log("x: " + p_evt.rawX + " y " + p_evt.rawY);
                if (this.m_mcaContainer.getChildByName("drawCont") !== null) {
                    //If we are in the processes of connecting
                    if (this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0) !== null
                        && this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0).parent.name.substr(0, 4) === "elmt") {
                        console.log("element");
                        //If the mouse is being released over an element
                        var outputElmt = this.m_model.getElement(this.m_mcaContainer.getObjectUnderPoint(p_evt.stageX, p_evt.stageY, 0).parent.name);
                        var inputElmt = this.m_model.getElement(p_evt.target.name);
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
            };
            GUIHandler.prototype.mouseMove = function (p_evt) {
                if ($("cnctTool").prop("checked")) {
                }
            };
            GUIHandler.prototype.updateElement = function (p_elmt) {
                p_elmt.m_easelElmt.removeAllChildren();
                var elmtShapeType = 2;
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
            };
            GUIHandler.prototype.updateMiniTables = function (p_elmtArr) {
                //console.log("updating minitable");
                for (var j = 0; j < p_elmtArr.length; j++) {
                    var elmt = p_elmtArr[j];
                    //console.log(elmt.getName() + " minitable is being updated");
                    var backgroundColors = ["#c6c6c6", "#bfbfe0"];
                    var decisionCont = elmt.m_minitableEaselElmt;
                    decisionCont.removeAllChildren();
                    var max = elmt.getData().length - DST.Tools.numOfHeaderRows(elmt.getData());
                    if ((elmt.getType() === 2 || elmt.getType() === 3) && DST.Tools.numOfHeaderRows(elmt.getValues()) === 1) {
                        max = elmt.getValues()[0].length - 1;
                    }
                    for (var i = 0; i < max; i++) {
                        var barBackgroundColor = backgroundColors[i % 2];
                        var nameBackgroundColor;
                        if (elmt.getType() === 1 && elmt.getDecision() === i
                            || elmt.getType() === 0 && elmt.getEvidence() === i) {
                            nameBackgroundColor = "#CCFFCC";
                        }
                        else {
                            nameBackgroundColor = backgroundColors[i % 2];
                        }
                        var decisRect = new createjs.Shape(new createjs.Graphics().f(nameBackgroundColor).s("#303030").ss(0.5).r(0, i * 12, 70, 12));
                        //   console.log("" + elmt.getValues());
                        //console.log("substring 0-12: " + elmt.getValues()[i][0]);
                        //Choice or state name
                        if ((elmt.getType() === 2 || elmt.getType() === 3) && DST.Tools.numOfHeaderRows(elmt.getValues()) === 1) {
                            var decisName = new createjs.Text(elmt.getValues()[0][i + 1].substr(0, 12), "0.8em trebuchet", "#303030");
                        }
                        else {
                            var decisName = new createjs.Text(elmt.getData()[i + DST.Tools.numOfHeaderRows(elmt.getData())][0].substr(0, 12), "0.8em trebuchet", "#303030");
                        }
                        decisName.textBaseline = "middle";
                        decisName.maxWidth = 68;
                        decisName.x = 2;
                        decisName.y = 6 + (i * 12);
                        decisionCont.addChild(decisRect);
                        decisionCont.addChild(decisName);
                        if (elmt.isUpdated() && (elmt.getValues()[0].length <= 2 || ((elmt.getType() === 2 || elmt.getType() === 3) && DST.Tools.numOfHeaderRows(elmt.getValues()) === 1))) {
                            if ((elmt.getType() === 2 || elmt.getType() === 3) && DST.Tools.numOfHeaderRows(elmt.getValues()) === 1) {
                                var valueData = elmt.getValues()[1][1 + i]; //Values are shown vertical
                            }
                            else {
                                var valueData = elmt.getValues()[i + DST.Tools.numOfHeaderRows(elmt.getValues())][1];
                            }
                            if (valueData == -Infinity) {
                                valueData = 0;
                            }
                            var decisBarBackgr = new createjs.Shape(new createjs.Graphics().f(barBackgroundColor).s("#303030").ss(0.5).r(70, i * 12, 60, 12));
                            if (elmt.getType() === 0) {
                                var decisBar = new createjs.Shape(new createjs.Graphics().f(this.m_googleColors[i % this.m_googleColors.length]).r(96, 1 + (i * 12), 35 * valueData, 10));
                                var decisPercVal = new createjs.Text(Math.round(valueData * 100) + "%", "0.8em trebuchet", "#303030");
                                decisPercVal.maxWidth = 22;
                            }
                            else {
                                var decisPercVal = new createjs.Text("" + DST.Tools.round2(valueData), "0.8em trebuchet", "#303030");
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
                        var height = elmt.getValues().length - DST.Tools.numOfHeaderRows(elmt.getValues());
                        //Set text box to show "Update to show values" if element is not updated
                        //var decisBarBackgr: createjs.Shape = new createjs.Shape(new createjs.Graphics().f(barBackgroundColor).s("#303030").ss(0.5).r(70, 12 * Tools.numOfHeaderRows(elmt.getValues()), 60, 12 * height));
                        var decisPercVal = new createjs.Text("Update to\nshow\nvalues", "0.8em trebuchet", "#303030");
                        decisPercVal.maxWidth = 68;
                        decisPercVal.textBaseline = "middle";
                        decisPercVal.textAlign = "center";
                        decisPercVal.x = 100;
                        decisPercVal.y = 8;
                        //decisionCont.addChild(decisBarBackgr);
                        decisionCont.addChild(decisPercVal);
                    }
                    else if (elmt.getValues()[0].length > 2 && (elmt.getType() !== 2 && elmt.getType() !== 3)) {
                        var height = elmt.getValues().length - DST.Tools.numOfHeaderRows(elmt.getValues());
                        //Set text box to show "Values are multi-dimensional" if element is not updated
                        var decisPercVal = new createjs.Text("Values\nare multi-\ndimensional", "0.8em trebuchet", "#303030");
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
            };
            GUIHandler.prototype.clickedDecision = function (p_evt) {
                if (!this.m_editorMode && this.m_noOfDialogsOpen == 0) {
                    //console.log("clicked a decision");
                    //console.log(p_evt);
                    var elmt = this.m_model.getElement(p_evt.currentTarget.name);
                    this.m_model.setDecision(elmt, Math.floor(p_evt.localY / 12) - DST.Tools.numOfHeaderRows(elmt.getValues(), elmt));
                    if (this.m_model.getAutoUpdate()) {
                        this.updateModel();
                    }
                    this.updateDecAndEvidenceVisually();
                }
            };
            GUIHandler.prototype.clickedEvidence = function (p_evt) {
                if (!this.m_editorMode && this.m_noOfDialogsOpen == 0) {
                    var elmt = this.m_model.getElement(p_evt.currentTarget.name);
                    console.log("Local: " + p_evt.localY / 12 + " header rows: " + DST.Tools.numOfHeaderRows(elmt.getValues(), elmt));
                    this.m_model.setEvidence(elmt, Math.floor(p_evt.localY / 12)); // - Tools.numOfHeaderRows(elmt.getValues(),elmt));
                    if (this.m_model.getAutoUpdate()) {
                        this.updateModel();
                    }
                    this.updateDecAndEvidenceVisually();
                }
            };
            GUIHandler.prototype.updateEditorMode = function () {
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
                }
                else {
                    $(".advButton").hide();
                    $(".button").show();
                    $("#lodDcmtDiv").hide();
                    $("#cnctTool").prop("checked", false);
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
                        }
                        else {
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
                                this.m_model.setDecision(elementArr[i], elementArr[i].getDecision()); //Unsets all decisions
                            }
                            if (elementArr[i].getType() === 0) {
                                this.m_model.setEvidence(elementArr[i], elementArr[i].getEvidence()); //Unset all evidence
                            }
                        }
                        else {
                            elementArr[i].m_easelElmt.removeEventListener("pressmove", this.pressMove);
                            elementArr[i].m_easelElmt.removeEventListener("pressup", this.pressUp);
                        }
                    }
                    this.updateModel();
                }
            };
            GUIHandler.prototype.setShowDescription = function (p_evt) {
                var id = p_evt.data.param1.getID();
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
            };
            GUIHandler.prototype.fullscreen = function (p_evt) {
                console.log("in local storage: " + localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                var model = this.m_model;
                // this.m_handler.getFileIO().quickSave(model);
                //var modelIdent = model.getIdent();
                //var json: string = JSON.stringify(model);
                //sessionStorage.setItem(model.getIdent(), json);
                console.log("fullscreen pressed");
                if (!this.m_fullscreen) {
                    //console.log("was not in fullscreen");
                    $(".row").hide();
                    $(".footer").hide();
                    var modelPos = this.getModelPos();
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
            };
            //Moves all elements to a reasonable position
            GUIHandler.prototype.repositionModel = function () {
                var modelPos = this.getModelPos();
                var lowestElement = modelPos[0];
                var highestElement = modelPos[1];
                var leftmostElement = modelPos[2];
                var rightmostElement = modelPos[3];
                var moveDistanceX = 0;
                var moveDistanceY = 0;
                if (highestElement > 50) {
                    moveDistanceY = -highestElement + 50;
                }
                if (this.getModelSize()[0] > $(window).width()) {
                    if (leftmostElement > 100) {
                        moveDistanceX = -leftmostElement + 100;
                    }
                }
                else {
                    moveDistanceX = $(window).width() / 2 - (leftmostElement + (rightmostElement - leftmostElement) / 2);
                }
                this.moveAllElements(moveDistanceX, moveDistanceY);
            };
            GUIHandler.prototype.updateSize = function () {
                console.log("updating size");
                var modelPos = this.getModelPos();
                var lowestElement = modelPos[0];
                var highestElement = modelPos[1];
                var leftmostElement = modelPos[2];
                var rightmostElement = modelPos[3];
                var moveDistanceX = 0;
                var moveDistanceY = 0;
                //   console.log("highest element: " + highestElement);
                // console.log("lowest element: " + lowestElement);
                // console.log("rightmost element: " + rightmostElement);
                //console.log("leftmost element: " + leftmostElement);
                this.m_updateStage = true;
                this.setSize(Math.max($(window).width(), rightmostElement), Math.max($(window).height(), lowestElement)); //Sets size 
            };
            GUIHandler.prototype.getModelSize = function () {
                var modelPos = this.getModelPos();
                return [modelPos[3] - modelPos[2], modelPos[1] - modelPos[0]];
            };
            //Returns a list containing lowest, highest, leftmost and rightmost element in that order
            GUIHandler.prototype.getModelPos = function () {
                var gui = this;
                var lowestElement = 0;
                var highestElement = $(window).height();
                var leftmostElement = $(window).width();
                var rightmostElement = 0;
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
            };
            GUIHandler.prototype.getSelectedPos = function () {
                var gui = this;
                var lowestElement = 0;
                var highestElement = $(window).height();
                var leftmostElement = $(window).width();
                var rightmostElement = 0;
                var selected = this.getSelected();
                for (var i = 0; i < selected.length; i += 2) {
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
            };
            GUIHandler.prototype.createNewChance = function (p_evt) {
                var elmt = this.m_model.createNewElement(0);
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTables([elmt]);
            };
            GUIHandler.prototype.createNewDec = function (p_evt) {
                var elmt = this.m_model.createNewElement(1);
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTables([elmt]);
            };
            GUIHandler.prototype.createNewValue = function (p_evt) {
                var elmt = this.m_model.createNewElement(2);
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTables([elmt]);
            };
            GUIHandler.prototype.createNewElement = function (p_evt) {
                var elmt = this.m_model.createNewElement(undefined);
                this.addElementToStage(elmt);
                // elmt.update();
                this.updateMiniTables([elmt]);
            };
            GUIHandler.prototype.deleteSelected = function (p_evt) {
                console.log("deleting");
                for (var i = 0; i < this.m_selectedItems.length; i++) {
                    var elmt = this.m_model.getElement(this.m_selectedItems[i].name);
                    console.log("deleting: " + elmt.getName());
                    //for (var index in elmt.getConnections()) {
                    //    console.log(elmt.getName() + "  Before: " + elmt.getConnections()[index].getID());
                    //}
                    if (this.addToTrash(elmt)) {
                        ////console.log(this.m_trashBin);
                        //alert("begin delete connections from " + elmt.getName() );
                        for (var j = 0; j < elmt.getConnections().length; j++) {
                            var conn = elmt.getConnections()[j];
                            console.log("deleting connection " + conn.getID());
                            if (conn.getOutputElement().getID() === elmt.getID()) {
                                if (conn.getInputElement().deleteConnection(conn.getID())) {
                                    this.addToTrash(conn);
                                }
                            }
                            else {
                                if (conn.getOutputElement().deleteConnection(conn.getID())) {
                                    this.addToTrash(conn);
                                }
                            }
                        }
                    }
                }
                var gui = this;
                this.m_selectedConnections.forEach(function (c) {
                    gui.addToTrash(gui.m_model.getConnection(c.name));
                });
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
                this.m_trashBin = []; // empty trashbin
                //alert("before update");
                //this.m_mcaStage.update();
                //alert("after update");
                //console.log(this.m_model.getConnectionArr());
                //console.log(this.m_model.getElementArr());
                this.importStage();
                //console.log("deleting done");
            };
            GUIHandler.prototype.addToTrash = function (p_obj) {
                ////console.log(this.m_trashBin.indexOf(p_obj));
                if (this.m_trashBin.indexOf(p_obj) === -1) {
                    this.m_trashBin.push(p_obj);
                    return true;
                }
                else {
                    return false;
                }
            };
            GUIHandler.prototype.addElementToStage = function (p_elmt) {
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
            };
            GUIHandler.prototype.dblClick = function (p_evt) {
                ////console.log(this);
                if (p_evt.target.name.substr(0, 4) === "elmt") {
                    this.populateElmtDetails(this.m_model.getElement(p_evt.target.name));
                }
            };
            //Does not work because pointer is not updated until released
            GUIHandler.prototype.mouseEnter = function (p_evt) {
                console.log("entering element");
                if (this.m_mcaContainer.getChildByName("drawCont") !== null) {
                    console.log("entering illegal");
                }
            };
            GUIHandler.prototype.addSetDecFunction = function (p_elmt) {
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
            };
            GUIHandler.prototype.addSetEvidenceFunction = function (p_elmt) {
                console.log("adding evidence function");
                var gui = this;
                $(".evidenceCell_" + p_elmt.getID()).click(function () {
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
            };
            GUIHandler.prototype.createSettingsDiv = function () {
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
                numOfIterations.max = "50000";
                numOfIterations.min = "100";
                numOfIterations.step = "100";
                numOfIterations.value = this.m_model.getmumOfIteraions() + "";
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
            };
            GUIHandler.prototype.openSettings = function () {
                var gui = this;
                if (this.m_settingsDiv === undefined) {
                    var settingsID = "#" + this.createSettingsDiv();
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
                };
            };
            GUIHandler.prototype.createDetailsDialog = function (p_elmt) {
                console.log("creating dialog for " + p_elmt.getName());
                var mareframeGUI = this;
                var id = p_elmt.getID();
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
                                $("#detailsDialog_" + p_elmt.getID()).data("unsavedChanges", false); //If ok is pressed, set unsaved changes to false
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
            };
            GUIHandler.prototype.populateElmtDetails = function (p_elmt) {
                //Tools.calcValueOfInformation(this.m_model.getElement("elmtDecsion"), p_elmt, this.m_model); //This is just a test for VOI
                var id = p_elmt.getID();
                if (p_elmt.getDialog() == null) {
                    console.log("creating new dialog");
                    var dialogID = "#" + this.createDetailsDialog(p_elmt);
                    var dialog = $(dialogID).dialog(opt);
                    p_elmt.setDialog(dialog);
                }
                else {
                    console.log("dialog does already exist");
                    var dialog = p_elmt.getDialog();
                    console.log(dialog);
                }
                if (dialog.data("isOpen") === false) {
                    dialog.data("isOpen", true);
                    this.disableButtons(true);
                    this.m_noOfDialogsOpen++;
                    console.log("number of dialogs open: " + this.m_noOfDialogsOpen);
                    var opt = {
                        title: p_elmt.getName()
                    };
                    var width = p_elmt.getData()[0].length * 70 + 50;
                    if (width < 400) {
                        width = 400;
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
                        dialog.data("defTable", DST.Tools.copy(p_elmt.getData())); //Save an instance of the def table 
                        dialog.data("deletedRows", []); //Save which rows are deleted
                        dialog.data("newStates", []); //Save the new states that are added
                        //console.log("data: " + dialog.data("defTable"));
                        // var s = Tools.htmlTableFromArray("Definition", p_elmt, this.m_model, this.m_editorMode, $("#detailsDialog_" + id).data("defTable"));
                        // $("#defTable_div_" + id).html(s);
                        $("#defTable_div_" + id).empty();
                        document.getElementById("defTable_div_" + id).appendChild(this.htmlTableFromArray("Definition", p_elmt, this.m_model, this.m_editorMode, $("#detailsDialog_" + id).data("defTable")));
                        $("#defTable_div_" + id).show();
                        var typeText;
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
                    }
                    else {
                        //MCA mode only
                        $("#info_type").hide();
                        $("#info_type_tag").hide();
                        $("#detailsDialog").data("element", p_elmt);
                        //console.log(tableMat);
                        var chartOptions = {
                            width: 700,
                            height: 400,
                            vAxis: { minValue: 0 },
                            legend: { position: 'none', maxLines: 3 },
                            bar: { groupWidth: '60%' }
                        };
                        switch (p_elmt.getType()) {
                            case 2:
                                //show: tabledata,description
                                $("#description_div").show();
                                break;
                            case 0:
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
                            case 3: //objective
                            case 1:
                                //show: swing(sliders),direct(sliders),ahp
                                $("#weightingMethodSelector").show();
                                break;
                        }
                        switch (p_elmt.getMethod()) {
                            case 0:
                                console.log("WeigthMethodDirect");
                                console.log("Weigthed data: " + this.m_model.getWeightedData(p_elmt, false));
                                break;
                            case 1:
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
                                            }
                                            else if (val > 100) {
                                                val = 100;
                                            }
                                            else {
                                                val = 0;
                                            }
                                            ////console.log(p_elmt.getData(1));
                                        });
                                    }
                                    makeSlider(i, childEl.getID(), this);
                                }
                                $("#sliders_div").show();
                                break;
                            case 2:
                                console.log("WeigthMethodValueFn");
                                var tableMat = this.m_model.getWeightedData(p_elmt, false);
                                console.log("getWeigthedData: " + tableMat);
                                var cPX = p_elmt.getData(1);
                                var cPY = p_elmt.getData(2);
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
                                var maxVal = p_elmt.getData(5);
                                var minVal = p_elmt.getData(4);
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
                            case 3: //ahp
                        }
                        //set description
                        document.getElementById("description_div_" + id).innerHTML = p_elmt.getDescription();
                    }
                }
            };
            ;
            GUIHandler.prototype.getElementWithUnsavedChanges = function () {
                var elmt = null;
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
            };
            GUIHandler.prototype.updateValue = function (p_elmt, p_div, p_field, p_originalValue, p_newValue) {
                if (p_newValue.length < 1) {
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
            };
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
            GUIHandler.prototype.updateValueButton = function (disable, id) {
                if (disable) {
                    $("#values_" + id).prop("disabled", true);
                    $("#values_" + id).prop("title", "Disabled because model is not updated");
                }
                else {
                    $("#values_" + id).prop("disabled", false);
                    $("#values_" + id).prop("title", "Click to show the values table");
                }
            };
            GUIHandler.prototype.updateUpdateButton = function (disable) {
                if (disable) {
                    $("#updateMdl").prop("disabled", true);
                    $("#updateMdl").prop("title", "Disabled because there are unsaved changes");
                }
                else {
                    $("#updateMdl").prop("disabled", false);
                    $("#updateMdl").prop("title", "Click to update model");
                }
            };
            GUIHandler.prototype.addEditFunction = function (p_elmt, p_editorMode) {
                console.log("adding edit function");
                if (!(p_editorMode)) {
                    this.addSetDecFunction(p_elmt);
                    this.addSetEvidenceFunction(p_elmt);
                }
                var originalName = p_elmt.getName();
                var mareframeGUI = this;
                var model = this.m_model;
                var elementWithUnsavedChanges = null;
                var id = p_elmt.getID();
                if (this.m_model.m_bbnMode) {
                    var originalDesc = p_elmt.getDescription();
                    var originalUserComments = p_elmt.getUserDescription();
                    console.log("Element: " + p_elmt.getName() + "ready for editing");
                    // $(function () {
                    $("#userDescription_div_" + id).dblclick(function () {
                        //mareframeGUI.editFunction(p_elmt, $("#userDescription_div"), $(this), originalUserComments); //This is for some reason not working
                        $("#submit_" + id).show();
                        $(this).addClass("editable");
                        console.log("original value : " + originalUserComments);
                        $(this).html("<textarea rows='4' cols='50' '>" + originalUserComments + "</textarea>");
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
                        if (p_elmt.getType() === 0 || p_elmt.getType() === 1) {
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
                                    var row = this.id;
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
                        else {
                            $("#addDataRow_" + id).hide();
                        }
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
                        //    console.log("original value: " + originalDesc);
                        $("#description_div_" + id).dblclick(function () {
                            $("#submit_" + id).show();
                            //var originalValue = $(this).text();
                            $(this).addClass("editable");
                            $(this).html("<textarea rows='4' cols='50' >" + originalDesc + "</textarea>");
                            //$(this).html("<input type='text' value='" + originalDesc + "' />"); //Prevents the box from becoming emtpy when clicked
                            $(this).children().first().focus();
                            $(this).children().first().keypress(function (e) {
                                if (e.which == 13) {
                                    var newText = $(this).val();
                                    originalDesc = mareframeGUI.updateValue(p_elmt, $("#description_div_" + id), $(this), originalDesc, newText);
                                }
                            });
                            $(this).children().first().blur(function () {
                                var newText = $(this).val();
                                originalDesc = mareframeGUI.updateValue(p_elmt, $("#description_div_" + id), $(this), originalDesc, newText);
                            });
                        });
                    }
                    else {
                        $("#addDataRow_" + id).hide();
                    }
                }
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
                                    if (newText.length < 1) {
                                        $("#info_name").html(originalName);
                                        newText = originalName;
                                    }
                                    $(this).parent().text(newText);
                                    if (newText !== originalName) {
                                        p_elmt.setName(newText);
                                        mareframeGUI.addElementToStage(p_elmt); //repaints the element
                                    }
                                    originalName = newText; //This is needed if the user wants to change the text multiple times without saving inbetween
                                }
                                $(this).parent().removeClass("editable");
                            });
                            $(this).children().first().blur(function () {
                                var newText = $(this).val();
                                //console.log("new text: " + newText);
                                if (newText.length < 1) {
                                    $("#info_name").html(originalName);
                                    newText = originalName;
                                }
                                $(this).parent().text(newText);
                                if (newText !== originalName) {
                                    p_elmt.setName(newText);
                                    mareframeGUI.addElementToStage(p_elmt); //repaints the element
                                }
                                originalName = newText; //This is needed if the user wants to change the text multiple times without saving inbetween
                                $(this).parent().removeClass("editable");
                            });
                        });
                    }
                }
            };
            //This updates the state name if it is one of the new states
            GUIHandler.prototype.updateNewStates = function (p_elmt, originalText, newText) {
                var states = $("#detailsDialog_" + p_elmt.getID()).data("newStates");
                for (var i = 0; i < states.length; i++) {
                    console.log("checking " + states[i] + " against " + originalText);
                    if (states[i].trim() === originalText.trim()) {
                        states[i] = newText; //Update the state name
                        console.log("match");
                    }
                }
                $("#detailsDialog").data("newStates", states);
                console.log($("#detailsDialog").data("newStates"));
            };
            GUIHandler.prototype.showValues = function (p_evt) {
                var elmt = p_evt.data.param1;
                var gui = p_evt.data.param2;
                console.log("showing values");
                var id = elmt.getID();
                //console.log("Data: " + elmt.getData());
                //console.log("Values: " + elmt.getValues());
                //console.log(elmt.getValues());
                //console.log("size of values: " + math.size(elmt.getValues()));
                $("#valuesTable_div_" + id).empty();
                document.getElementById("valuesTable_div_" + id).appendChild(gui.htmlTableFromArray("Values", elmt, $("#detailsDialog_" + id).data("model"), this.m_editorMode));
                //$("#valuesTable_div_" + id).html(Tools.htmlTableFromArray2("Values", elmt, $("#detailsDialog_" + id).data("model"), this.m_editorMode));
                $("#valuesTable_div_" + id).show();
                $("#values_" + id).hide();
            };
            GUIHandler.prototype.showValueErrorMessage = function (p_evt) {
            };
            GUIHandler.prototype.updateDefTable = function (p_elmt) {
                var newTable = [];
                var newRow = [];
                var oldData = p_elmt.getData();
                var table = $("#defTable_div_" + p_elmt.getID());
                //Add the header rows
                for (var i = 0; i < DST.Tools.numOfHeaderRows(oldData, p_elmt); i++) {
                    newTable.push(oldData[i]);
                }
                console.log(newTable);
                var rowNumber = -1; //We start at minus 1 because the first row, that just says "Definition" is not used
                table.find("tr").each(function () {
                    console.log("row");
                    $(this).find("input").each(function () {
                        //console.log("td or th");
                        console.log("text to be added: " + $(this).text());
                        if ($(this).val().length > 0) {
                            //console.log("does it exsist: " + $.inArray($(this).text(), newRow) === -1)
                            var value = $(this).val();
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
                                    newRow.push(oldData[rowNumber][0]); //if this is a super value the element must be pushed first in the row
                                }
                                newRow.push(value);
                            }
                        }
                    });
                    if (newRow.length > 0) {
                        console.log("pushing row: " + newRow);
                        newTable.push(newRow);
                        newRow = [];
                    }
                    rowNumber++;
                });
                return newTable;
            };
            GUIHandler.prototype.saveChanges = function (p_evt) {
                var elmt = p_evt.data.param1;
                console.log("saving changes");
                var id = elmt.getID();
                var oldData = elmt.getData();
                var model = this.m_model;
                //Save user description
                var userDescription = $("#userDescription_div_" + id).text();
                elmt.setUserDescription(userDescription);
                //Save description
                var description = $("#description_div_" + id).text();
                elmt.setDescription(description);
                elmt.setName($("#info_name_" + id).text());
                //console.log(this);
                console.log("number of header rows: " + DST.Tools.numOfHeaderRows(oldData, elmt));
                //Save def table
                var newTable = this.updateDefTable(elmt);
                console.log("new table: " + newTable);
                //Remove header row with the title "Definition"
                //newTable.splice(0, 1);
                if (elmt.getType() == 0 && !DST.Tools.columnSumsAreValid(newTable, DST.Tools.numOfHeaderRows(newTable))) {
                    //Should also show which row is unvalid (maybe right after the user has changed the value)
                    alert("The values in each column must add up to 1");
                }
                else {
                    if (this.m_editorMode) {
                        //Delete the deleted states from the child elements
                        var rowsToDelete = $("#detailsDialog_" + id).data("deletedRows");
                        console.log("rows to delete: " + rowsToDelete);
                        elmt.getChildrenElements().forEach(function (e) {
                            for (var i = 0; i < rowsToDelete.length; i++) {
                                console.log(elmt.getData());
                                console.log("updating child  " + e.getName());
                                e.setData(DST.Tools.removeState(e.getData(), elmt, elmt.getData()[rowsToDelete[i]][0]));
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
                        this.updateValueButton(false, id); //Make the value button clickable again
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
                this.addElementToStage(elmt); //repaint the element. This is necessary if the name of the elemnt has been changed
            };
            GUIHandler.prototype.updateValFnCP = function (p_controlPointX, p_controlPointY, p_flipped_numBool) {
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
            };
            GUIHandler.prototype.updateDataTableDiv = function (p_elmt) {
                console.log("tableMat: " + tableMat);
                //alert("pause");
                var tableMat = this.m_model.getWeightedData(p_elmt, false);
                tableMat.splice(0, 0, ["Scenario", "Value", "Weight"]);
                var tableData = google.visualization.arrayToDataTable(tableMat);
                var table = new google.visualization.Table(document.getElementById('datatable_div'));
                table.draw(tableData, { 'allowHtml': true, 'alternatingRowStyle': true, 'width': '100%', 'height': '100%' });
                $('.google-visualization-table-table').width("100%");
            };
            GUIHandler.prototype.downValFnCP = function (p_evt) {
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
            };
            GUIHandler.prototype.moveValFnCP = function (p_evt) {
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
            };
            GUIHandler.prototype.linearizeValFn = function () {
                this.moveValFnCP({ stageX: 50, stageY: 50, target: { name: $("#valueFn_Linear").data("name") } });
            };
            GUIHandler.prototype.flipValFn = function () {
                var elmt = this.m_model.getElement($("#valueFn_Flip").data("name")[0][0]);
                elmt.getData()[3] = Math.abs(elmt.getData()[3] - 1);
                this.updateValFnCP(elmt.getData()[1], elmt.getData()[2], elmt.getData()[3]);
                this.updateDataTableDiv(elmt);
                //update = true;
                this.updateFinalScores();
            };
            GUIHandler.prototype.getValueFnLine = function (p_xValue, p_color) {
                return new createjs.Graphics().beginStroke(p_color).mt(p_xValue, 0).lt(p_xValue, this.m_valueFnSize);
            };
            GUIHandler.prototype.updateFinalScores = function () {
                var data = google.visualization.arrayToDataTable(this.m_model.getFinalScore());
                data.removeRow(data.getNumberOfRows() - 1);
                this.m_finalScoreChart.draw(data, this.m_finalScoreChartOptions);
            };
            GUIHandler.prototype.updateTable = function (p_matrix) {
                var tableHTML = "";
                var topRow = true;
                for (var j = 0; j < p_matrix.length; j++) {
                    var row = p_matrix[j];
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
            };
            GUIHandler.prototype.mouseDown = function (p_evt) {
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
                    }
                    else if (p_evt.target.name.substr(0, 4) === "conn") {
                        console.log("connection pressed");
                        var connection = this.m_model.getConnection(p_evt.target.name);
                        //this.addConnectionToStage(connection, true);
                        this.selectConnection(p_evt);
                    }
                    else {
                        this.clearSelection();
                    }
                }
            };
            GUIHandler.prototype.select = function (p_evt) {
                //console.log("ctrl key: " + e.nativeEvent.ctrlKey);
                if (!p_evt.nativeEvent.ctrlKey && this.m_selectedItems.indexOf(p_evt.target) === -1) {
                    this.clearSelection();
                }
                console.log("adding to selection " + p_evt.target);
                this.addToSelection(p_evt.target);
            };
            GUIHandler.prototype.selectConnection = function (p_evt) {
                console.log(this.m_selectedConnections);
                console.log(p_evt.target);
                console.log("checking " + this.m_selectedConnections[0] + " against " + p_evt.target + ": " + (this.m_selectedConnections[0] == p_evt.target));
                if (!p_evt.nativeEvent.ctrlKey && this.m_selectedConnections.indexOf(p_evt.target) === -1) {
                    console.log("clearing");
                    this.clearSelection();
                }
                console.log("adding to selection " + p_evt.target);
                this.addToSelection(p_evt.target);
            };
            GUIHandler.prototype.pressMove = function (p_evt) {
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
                        this.m_mcaContainer.addChild(this.m_selectionBox);
                    }
                    else if (this.m_editorMode) {
                        //console.log("elements off screen: "+ this.elementOffScreen( p_evt.stageX - this.m_oldX, p_evt.stageY - this.m_oldY));
                        if (!this.elementOffScreen(p_evt.stageX - this.m_oldX, p_evt.stageY - this.m_oldY, this.getModelPos())) {
                            //document.body.style.cursor = "auto"; 
                            //console.log("panning");
                            $("#mAction").html("Action: Panning");
                            //This moves all elements instead of the background
                            this.moveAllElements(p_evt.stageX - gui.m_oldX, p_evt.stageY - gui.m_oldY);
                        }
                    }
                }
                else if (p_evt.target.name.substr(0, 4) === "elmt") {
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
                        this.drawElementSelected(element); //Draws the input element as selected
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
                            if (DST.Tools.validConnection(element, outputElmt)) {
                                this.drawElementSelected(outputElmt);
                            }
                            else {
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
                    }
                }
                this.resizeWindow();
                this.scrollWindow(p_evt);
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                // console.log("this.m_mcaSizeX " + this.m_mcaSizeX);
                this.m_updateStage = true;
            };
            GUIHandler.prototype.scrollWindow = function (p_evt) {
                //console.log("x: " + p_evt.rawX + " y: " + p_evt.rawY);
                var y = p_evt.rawY + (1126 - 763);
                var x = p_evt.rawX;
                var pxFromTop = $(parent.window).scrollTop();
                var pxFromLeft = $(parent.window).scrollLeft();
                var screenWidth = $(parent.window).width();
                var userScreenHeight = $(parent.window).height();
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
            };
            GUIHandler.prototype.moveAllElements = function (xDistance, yDistance) {
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
            };
            GUIHandler.prototype.resizeWindow = function () {
                var maxX = 0; // Right edge
                var maxY = 0; //Bottom edge
                var x;
                var y;
                var yEdge = 40; //The distance from the position to the bottom edge of elements
                var xEdge = 200; //Distance from the center to the right edge of elements
                var moveDistance = 10; //The distance to move the canvas in each step
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
            };
            GUIHandler.prototype.elementOffScreen = function (xMovement, yMovement, positions) {
                var SelectedPos = this.getSelectedPos();
                var lowestElement = positions[0];
                var highestElement = positions[1];
                var leftmostElement = positions[2];
                var rightmostElement = positions[3];
                //console.log(highestElement - 30);
                return highestElement - 30 + yMovement < 0 || leftmostElement - 80 + xMovement < 0 || lowestElement + yMovement - 30 > this.m_mcaStageCanvas.height || rightmostElement - 80 + xMovement > this.m_mcaStageCanvas.width;
            };
            GUIHandler.prototype.tick = function () {
                if (this.m_updateStage) {
                    this.m_updateStage = false;
                    this.m_mcaStage.update();
                    this.m_valueFnStage.update();
                    this.m_selectionBox.graphics.clear();
                }
            };
            GUIHandler.prototype.clear = function () {
                this.m_mcaContainer.removeAllChildren();
                this.m_updateStage = true;
            };
            GUIHandler.prototype.disconnectFrom = function (p_evt) {
            };
            GUIHandler.prototype.connectionExist = function (p_evt) {
                console.log("selected: " + this.m_selectedItems);
                for (var i = 0; i < this.m_selectedItems.length; i += 2) {
                    var e = this.m_selectedItems[i];
                    var first = this.m_model.getElement(e.name);
                    first.isChildOf(this.m_model.getElement(p_evt.target.name));
                    first.isParentOf(this.m_model.getElement(p_evt.target.name));
                }
                return false;
            };
            GUIHandler.prototype.connect = function (inputElmt, outputElmt) {
                var successfull = false;
                //console.log("attempting connection " + outputElmt.getID());
                if (inputElmt.getID() !== outputElmt.getID()) {
                    //console.log("outputElmt: " + outputElmt.getID() + " inputElmt: " + inputElmt.getID());
                    if (DST.Tools.validConnection(inputElmt, outputElmt)) {
                        if ((inputElmt.getType() === 2 || inputElmt.getType() === 3) && outputElmt.getType() === 2) {
                            outputElmt.convertToSuperValue();
                        }
                        var c = this.m_model.createNewConnection(inputElmt, outputElmt);
                        console.log("connection: " + c);
                        if (this.m_model.addConnection(c)) {
                            this.addConnectionToStage(c);
                            successfull = true;
                        }
                        if (this.m_model.m_bbnMode) {
                            if (outputElmt.getType() !== 1) {
                                outputElmt.updateData();
                            }
                            outputElmt.setUpdated(false);
                            outputElmt.getAllDescendants().forEach(function (e) {
                                e.setUpdated(false);
                            });
                            inputElmt.setUpdated(false);
                            console.log("connection created from " + outputElmt.getID() + " to " + inputElmt.getID());
                        }
                    }
                }
                this.clearSelection();
                if (this.m_model.getAutoUpdate()) {
                    this.updateModel();
                }
                /*if (!successfull) {
                    this.select(p_evt);
                }*/
                //this.m_mcaStage.update();
                //alert("connection is done");
                //this.select(elmtIdent);
            };
            GUIHandler.prototype.addConnectionToStage = function (p_connection, selected) {
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
                arrowCont.name = p_connection.getID();
                ;
                conn.name = p_connection.getID();
                //Add event listener to the arrow
                if (this.m_editorMode) {
                    arrowCont.addEventListener("mousedown", this.mouseDown);
                    conn.addEventListener("mousedown", this.mouseDown);
                }
                this.m_mcaContainer.addChildAt(cont, 0);
                p_connection.m_easelElmt = cont;
                this.m_updateStage = true;
            };
            GUIHandler.prototype.updateConnection = function (p_connection, selected) {
                //stage.removeChild(c.easelElmt);
                var temp = p_connection.m_easelElmt.getChildAt(1);
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
            };
            GUIHandler.prototype.drawElementSelected = function (elmt) {
                elmt.setVisuallySelected(true);
                var elmtType = elmt.getType();
                //////console.log(e);
                var shape = elmt.m_easelElmt.getChildAt(0);
                shape.graphics.clear().f(this.m_elementColors[elmtType][2]).s(this.m_elementColors[elmtType][1]).setStrokeStyle(2.5);
                var elmtShapeType = 2;
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
            };
            GUIHandler.prototype.drawElementNotSelected = function (elmt) {
                elmt.setVisuallySelected(false);
                var easelElmt = elmt.m_easelElmt;
                var elmtType = elmt.getType();
                var shape = easelElmt.getChildAt(0);
                shape.graphics.clear().f(this.m_elementColors[elmtType][0]).s(this.m_elementColors[elmtType][1]);
                var elmtShapeType = 2;
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
            };
            GUIHandler.prototype.addToSelection = function (p_easelElmt) {
                //console.log("selected: " + this.m_selectedItems);
                if (this.m_selectedItems.indexOf(p_easelElmt) === -1 && p_easelElmt.name.substr(0, 4) === "elmt") {
                    var elmt = this.m_model.getElement(p_easelElmt.name);
                    for (var i in elmt.getConnections) {
                        console.log(elmt.getName() + "  " + elmt.getConnections[i].getID());
                    }
                    this.m_selectedItems.push(p_easelElmt);
                    if (this.m_model.m_bbnMode) {
                        this.m_selectedItems.push(elmt.m_minitableEaselElmt);
                    }
                    this.drawElementSelected(elmt);
                    this.m_updateStage = true;
                }
                else if (this.m_model.m_bbnMode && this.m_selectedItems.indexOf(p_easelElmt) !== -1 && p_easelElmt.name.substr(0, 4) === "elmt") {
                    //console.log("selected: " + this.m_selectedItems);
                    //console.log("element already selected");
                    var elmt = this.m_model.getElement(p_easelElmt.name);
                    var newSelected = [];
                    this.m_selectedItems.forEach(function (e) {
                        //console.log("checking " + e + " against " + p_easelElmt);
                        if (e.toString() !== p_easelElmt.toString()) {
                            //console.log("not a match");
                            newSelected.push(e);
                        }
                        else {
                        }
                    });
                    this.m_selectedItems = newSelected;
                    //console.log("new selected: " + this.m_selectedItems);
                    this.drawElementNotSelected(this.m_model.getElement(p_easelElmt.name));
                }
                else if (this.m_selectedConnections.indexOf(p_easelElmt) === -1 && p_easelElmt.name.substr(0, 4) === "conn") {
                    console.log(this.m_selectedConnections);
                    this.m_selectedConnections.push(p_easelElmt);
                    console.log(this.m_selectedConnections);
                    this.updateConnection(this.m_model.getConnection(p_easelElmt.name), true);
                }
                else if (this.m_model.m_bbnMode && this.m_selectedConnections.indexOf(p_easelElmt) !== -1 && p_easelElmt.name.substr(0, 4) === "conn") {
                    console.log("already selected");
                    console.log("checking " + this.m_selectedConnections[0] + " against " + p_easelElmt + ": " + (this.m_selectedConnections[0] == p_easelElmt));
                    var newSelected = [];
                    this.m_selectedConnections.forEach(function (c) {
                        //console.log("checking " + e + " against " + p_easelElmt);
                        if (c.toString() !== p_easelElmt.toString()) {
                            //console.log("not a match");
                            newSelected.push(c);
                        }
                        else {
                        }
                    });
                    this.m_selectedConnections = newSelected;
                    this.updateConnection(this.m_model.getConnection(p_easelElmt.name));
                }
                this.m_updateStage = true;
            };
            GUIHandler.prototype.drawPolygon = function (shape, color) {
                var heigth = 30;
                var length = 150;
                shape.graphics.beginStroke(color);
                shape.graphics.moveTo(length / 10, 0).lineTo(length - (length / 10), 0).lineTo(length, heigth / 2);
                shape.graphics.lineTo(length - (length / 10), heigth).lineTo(length / 10, heigth).lineTo(0, heigth / 2).lineTo(length / 10, 0);
            };
            GUIHandler.prototype.setSelection = function (p_easelElmts) {
                this.clearSelection();
                ////console.log(p_easelElmt);
                for (var i = 0; i < p_easelElmts.length; i++) {
                    this.addToSelection(p_easelElmts[i]);
                }
            };
            GUIHandler.prototype.getSelected = function () {
                return this.m_selectedItems;
            };
            GUIHandler.prototype.clearSelection = function () {
                console.log("clear");
                for (var i = 0; i < this.m_selectedItems.length; i++) {
                    var easelElmt = this.m_selectedItems[i];
                    if (easelElmt.id != this.m_model.getElement(easelElmt.name).m_minitableEaselElmt.id) {
                        var elmtType = this.m_model.getElement(easelElmt.name).getType();
                        var shape = easelElmt.getChildAt(0);
                        shape.graphics.clear().f(this.m_elementColors[elmtType][0]).s(this.m_elementColors[elmtType][1]);
                        var elmtShapeType = 2;
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
            };
            GUIHandler.prototype.addDataRowClick = function (p_evt) {
                console.log("adding data row");
                var elmt = p_evt.data.param1;
                var id = elmt.getID();
                $("#valuesTable_div_" + id).hide(); //Hides the value table
                this.updateValueButton(true, id); //Disables the show values button until element is updated
                //console.log("add row");
                $("#detailsDialog_" + id).data("defTable", DST.Tools.addDataRow(elmt, $("#detailsDialog_" + id).data("defTable")));
                var newState = $("#detailsDialog_" + id).data("defTable")[$("#detailsDialog_" + id).data("defTable").length - 1][0];
                var states = $("#detailsDialog_" + id).data("newStates");
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
            };
            GUIHandler.prototype.saveAddedRows = function (p_elmt, p_states) {
                console.log("new States: " + p_states);
                for (var i = 0; i < p_states.length; i++) {
                    var newStateName = p_states[i];
                    //Add default values for the new state in all children
                    p_elmt.getChildrenElements().forEach(function (e) {
                        console.log("updating header for " + e.getName());
                        e.setData(e.updateHeaderRows(e.getData()));
                        console.log("new Data: " + e.getData());
                        e.setData(e.addDefaultDataInEmptyCells(e.getData(), p_elmt, newStateName));
                    });
                }
            };
            GUIHandler.prototype.removeRowVisually = function (p_element, p_row) {
                var id = p_element.getID();
                //console.log("delete row: " + rowToDelete);
                if ($("#detailsDialog_" + id).data("defTable").length - DST.Tools.numOfHeaderRows($("#detailsDialog_" + id).data("defTable")) < 3) {
                    alert("Must be at least two outcomes");
                    return false;
                }
                else {
                    var rowToDelete = $("#detailsDialog_" + id).data("defTable")[p_row];
                    $("#detailsDialog_" + id).data("defTable", DST.Tools.removeRow($("#detailsDialog_" + id).data("defTable"), p_row));
                    var statesToAdd = $("#detailsDialog_" + id).data("newStates");
                    var deletedRowState = rowToDelete[0];
                    var newStatesToAdd = [];
                    if (statesToAdd !== undefined && statesToAdd.indexOf(deletedRowState) > -1) {
                        console.log("deleted row is a new row");
                        for (var i = 0; i < statesToAdd.length; i++) {
                            if (statesToAdd[i] !== deletedRowState) {
                                newStatesToAdd.push(statesToAdd[i]);
                            }
                        }
                        $("#detailsDialog_" + id).data("newStates", newStatesToAdd); //Update the new states
                    }
                    else {
                        console.log("deleted row is not a new row");
                        var rowsToDelete = $("#detailsDialog_" + id).data("deletedRows");
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
            };
            GUIHandler.prototype.disableButtons = function (b) {
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
            };
            GUIHandler.prototype.updateOpenDialogs = function () {
                var mareframGUI = this;
                this.m_model.getElementArr().forEach(function (e) {
                    if (e.getDialog() !== undefined && e.getDialog().data("isOpen")) {
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
            };
            GUIHandler.prototype.updateTablesVisually = function (p_elmt) {
                var id = p_elmt.getID();
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
            };
            GUIHandler.prototype.htmlTableFromArray = function (p_header, p_elmt, p_model, p_editorMode, p_data) {
                //console.log("header: " + p_header);
                //console.log("type of elmt: " + p_elmt.getType());
                console.log("creating htmlTable");
                var data;
                var gui = this;
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
                var numOfHeaderRows = DST.Tools.numOfHeaderRows(data);
                if (p_elmt.getType() === 1 && p_header === "Values") {
                    var highestValue = 1;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i][1] > data[highestValue][1]) {
                            highestValue = i;
                        }
                    }
                    console.log("highest is : " + highestValue);
                }
                if (p_elmt.getType() == 2 && p_header === "Values") {
                    var bestDecCol = 1;
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
                rowPlaceholder = table.insertRow(-1);
                var cellPlaceholder = document.createElement("th");
                cellPlaceholder.style.textAlign = "center";
                if (data[0] !== undefined) {
                    cellPlaceholder.colSpan = (data[0].length + 1);
                }
                cellPlaceholder.innerHTML = p_header;
                rowPlaceholder.appendChild(cellPlaceholder);
                if (p_elmt.getType() === 3 && math.size(data)[1] < 1) {
                    //console.log("super value with empty def");
                    rowPlaceholder = table.insertRow(-1);
                    cellPlaceholder = rowPlaceholder.insertCell(-1);
                    cellPlaceholder.innerHTML = "This super value node has no parents";
                }
                else {
                    //Create the header rows
                    for (var i = 0; i < numOfHeaderRows; i++) {
                        rowPlaceholder = table.insertRow(-1);
                        if (p_editorMode && p_header === "Definition" && (p_elmt.getType() === 0 || p_elmt.getType() === 1)) {
                            var emptyCell = document.createElement("th");
                            rowPlaceholder.appendChild(emptyCell);
                        }
                        for (var j = 0; j < (data[0].length); j++) {
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
                        if (p_editorMode && p_header === "Definition" && (p_elmt.getType() === 0 || p_elmt.getType() === 1)) {
                            var minusCell = document.createElement("th");
                            var button = document.createElement("button");
                            button.setAttribute("class", "minus minus_" + p_elmt.getID());
                            button.setAttribute("id", i + "");
                            button.title = "Click to delete this row";
                            minusCell.appendChild(button);
                            rowPlaceholder.appendChild(minusCell);
                        }
                        for (var j = 0; j < data[0].length; j++) {
                            var value = data[i][j];
                            if (value === -Infinity) {
                                value = 0;
                            }
                            if (j === 0) {
                                if (p_elmt.getType() === 3 && p_header === "Definition") {
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
                                        $(input).on("input", { field: input, elmt: p_elmt, gui: gui }, gui.inputChanged); //Add on input change function to the cell
                                        $(input).data("originalValue", value.trim()); // Save the original value in the cell
                                        cellPlaceholder.appendChild(input);
                                    }
                                    else {
                                        var classes = "editable_cell editable_cell_" + p_elmt.getID();
                                        var div = document.createElement("div");
                                        div.setAttribute("id", (i - numOfHeaderRows) + "");
                                        if (p_elmt.getType() === 1) {
                                            classes += " decCell_" + p_elmt.getID();
                                            if ((i - numOfHeaderRows) == p_elmt.getDecision()) {
                                                classes += " setDecision";
                                            }
                                        }
                                        else if (p_elmt.getType() === 0) {
                                            classes += " evidenceCell_" + p_elmt.getID();
                                            if ((i - numOfHeaderRows) == p_elmt.getEvidence()) {
                                                classes += " setEvidence";
                                            }
                                        }
                                        div.setAttribute("class", classes);
                                        div.innerHTML = value;
                                        cellPlaceholder.appendChild(div);
                                    }
                                    rowPlaceholder.appendChild(cellPlaceholder);
                                }
                            }
                            else {
                                if (i === highestValue || j == bestDecCol) {
                                    cellPlaceholder = rowPlaceholder.insertCell(-1); //insert cell at the end of row
                                    cellPlaceholder.innerHTML = (DST.Tools.round(value) + "").bold();
                                }
                                else if (p_editorMode && p_header === "Definition") {
                                    cellPlaceholder = rowPlaceholder.insertCell(-1); //insert cell at the end of row
                                    var input = document.createElement("input");
                                    input.setAttribute("class", "data_" + p_elmt.getID());
                                    input.type = "number";
                                    if (p_elmt.getType() === 0) {
                                        input.max = "1";
                                        input.min = "0";
                                        input.step = "0.05";
                                    }
                                    input.value = DST.Tools.round(value) + "";
                                    $(input).on("input", { field: input, elmt: p_elmt, gui: gui }, gui.inputChanged); //Add on input change function to the cell
                                    $(input).data("originalValue", DST.Tools.round(value)); // Save the original value in the cell
                                    cellPlaceholder.appendChild(input);
                                }
                                else {
                                    cellPlaceholder = rowPlaceholder.insertCell(-1); //insert cell at the end of row
                                    var div = document.createElement("div");
                                    div.setAttribute("class", "data_" + p_elmt.getID());
                                    div.innerHTML = DST.Tools.round(value) + "";
                                    cellPlaceholder.appendChild(div);
                                }
                            }
                        }
                    }
                }
                return table;
            };
            GUIHandler.prototype.inputChanged = function (p_evt) {
                console.log("evt: " + p_evt);
                var field = p_evt.data.field;
                var elmt = p_evt.data.elmt;
                var gui = p_evt.data.gui;
                var id = elmt.getID();
                var originalValue = $(field).data("originalValue") + "";
                console.log("original value: " + originalValue);
                console.log("input changed");
                var elementWithUnsavedChanges = gui.getElementWithUnsavedChanges();
                console.log("elementWithUnsavedChanges: " + elementWithUnsavedChanges);
                if (elementWithUnsavedChanges === null || elementWithUnsavedChanges === elmt) {
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
            };
            return GUIHandler;
        })();
        DST.GUIHandler = GUIHandler;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=MareframeGUI.js.map