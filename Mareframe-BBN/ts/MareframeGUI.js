var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var GUIHandler = (function () {
            function GUIHandler(p_model, p_handler) {
                this.m_editorMode = false;
                this.m_showDescription = true;
                this.m_unsavedChanges = false;
                this.m_fullscreen = false;
                this.m_mcaStage = new createjs.Stage("MCATool");
                this.m_valueFnStage = new createjs.Stage("valueFn_canvas");
                this.m_controlP = new createjs.Shape();
                this.m_valueFnContainer = new createjs.Container();
                this.m_valueFnLineCont = new createjs.Container();
                this.m_valueFnSize = 100;
                this.m_mcaStageCanvas = this.m_mcaStage.canvas;
                this.m_selectionBox = new createjs.Shape();
                this.m_mcaSizeX = 800;
                this.m_mcaSizeY = 480;
                this.m_mcaContainer = new createjs.Container();
                this.m_googleColors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"];
                this.m_mcaBackground = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.m_mcaSizeX, this.m_mcaSizeY));
                this.m_valFnBackground = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.m_valueFnSize, this.m_valueFnSize));
                this.m_updateMCAStage = true;
                this.m_chartsLoaded = false;
                this.m_oldX = 0;
                this.m_oldY = 0;
                this.m_originalPressX = 0;
                this.m_originalPressY = 0;
                this.m_selectedItems = [];
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
                this.m_elementColors = [["#efefff", "#15729b", "#dfdfff"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#fff6e0", "#f6a604", "#fef4c6"], ["#efffef", "#2fc433", "#dfffdf"]];
                this.m_trashBin = [];
                this.setShowDescription = function (cb) {
                    this.m_showDescription = cb.currentTarget.checked;
                    if (this.m_showDescription) {
                        $("#description_div").show();
                        $("#showDescription").siblings('label').html("Hide description");
                    }
                    else {
                        $("#description_div").hide();
                        $("#showDescription").siblings('label').html("Show description");
                    }
                };
                this.setEditorMode = function (cb) {
                    console.log(cb);
                    this.m_editorMode = cb.currentTarget.checked;
                    this.updateEditorMode();
                    console.log("editormode: " + this.m_editorMode);
                };
                this.setAutoUpdate = function (cb) {
                    console.log(cb);
                    this.m_model.setAutoUpdate(cb.currentTarget.checked);
                    console.log("auto update: " + this.m_model.m_autoUpdate);
                };
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
                this.m_model = p_model;
                this.m_mcaBackground.name = "hitarea";
                this.updateEditorMode();
                this.m_mcaBackground.addEventListener("mousedown", this.mouseDown);
                this.m_controlP.graphics.f("#0615b4").s("#2045ff").rr(0, 0, 6, 6, 2);
                this.m_valFnBackground.addEventListener("pressmove", this.moveValFnCP);
                this.m_valFnBackground.addEventListener("mousedown", this.downValFnCP);
                this.m_mcaBackground.addEventListener("pressmove", this.pressMove);
                this.m_controlP.mouseChildren = false;
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
            }
            GUIHandler.prototype.loadModel = function (p_evt) {
                ////console.log(this);
                ////console.log(this.m_handler);
                this.m_handler.getFileIO().loadfromGenie(this.m_model, this.importStage);
            };
            GUIHandler.prototype.saveModel = function (p_evt) {
                $("#saveFile_div").show();
                this.m_handler.getFileIO().saveModel(this.m_model);
            };
            GUIHandler.prototype.selectAll = function (p_evt) {
                for (var i = 0; i < this.m_model.getElementArr().length; i++) {
                    this.addToSelection(this.m_model.getElementArr()[i].m_easelElmt);
                }
            };
            GUIHandler.prototype.updateModel = function () {
                this.m_model.update();
                this.updateMiniTable(this.m_model.getElementArr());
            };
            GUIHandler.prototype.setSize = function (p_width, p_height) {
                this.m_mcaStageCanvas.height = p_height;
                this.m_mcaStageCanvas.width = p_width;
            };
            GUIHandler.prototype.quickLoad = function () {
                console.log("quickLoad");
                this.m_model.fromJSON(this.m_handler.getFileIO().reset());
                this.importStage();
            };
            GUIHandler.prototype.importStage = function () {
                console.log("importing stage");
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
                    this.updateMiniTable(elmts);
                }
                this.m_updateMCAStage = true;
                this.m_handler.getFileIO().quickSave(this.m_model);
            };
            ;
            GUIHandler.prototype.mouseUp = function (p_evt) {
                //console.log("mouse up");
                this.m_updateMCAStage = true;
            };
            GUIHandler.prototype.updateElement = function (p_elmt) {
                p_elmt.m_easelElmt.removeAllChildren();
                var shape = new createjs.Shape();
                shape.graphics.f(this.m_elementColors[p_elmt.getType()][0]).s(this.m_elementColors[p_elmt.getType()][1]);
                var elmtShapeType = 2;
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
            };
            GUIHandler.prototype.updateMiniTable = function (p_elmtArr) {
                console.log("updating minitable");
                for (var j = 0; j < p_elmtArr.length; j++) {
                    var elmt = p_elmtArr[j];
                    //console.log(elmt.getName());
                    // if (elmt.getType() !== 2) {
                    //  console.log(elmt.getName() + " minitable is being updated");
                    var backgroundColors = ["#c6c6c6", "#bfbfe0"];
                    var decisionCont = elmt.m_decisEaselElmt;
                    decisionCont.removeAllChildren();
                    if (elmt.getValues()[0].length > 2) {
                        var decisTextBox = new createjs.Text("Values is multidimensional", "0.8em trebuchet", "#303030");
                        decisionCont.addChild(decisTextBox);
                    }
                    else {
                        for (var i = 0; i < elmt.getValues().length; i++) {
                            var backgroundColor;
                            if (elmt.getDecision() == i && elmt.getType() == 1) {
                                backgroundColor = "#CCFFCC";
                            }
                            else {
                                backgroundColor = backgroundColors[i % 2];
                            }
                            var decisRect = new createjs.Shape(new createjs.Graphics().f(backgroundColor).s("#303030").ss(0.5).r(0, i * 12, 70, 12));
                            //   console.log("" + elmt.getValues());
                            //console.log("substring 0-12: " + elmt.getValues()[i][0]);
                            var decisName = new createjs.Text(elmt.getValues()[i][0].substr(0, 12), "0.8em trebuchet", "#303030");
                            decisName.textBaseline = "middle";
                            decisName.maxWidth = 68;
                            decisName.x = 2;
                            decisName.y = 6 + (i * 12);
                            decisionCont.addChild(decisRect);
                            decisionCont.addChild(decisName);
                            var valueData = elmt.getValues()[i][1];
                            var decisBarBackgr = new createjs.Shape(new createjs.Graphics().f(backgroundColor).s("#303030").ss(0.5).r(70, i * 12, 60, 12));
                            var decisBar = new createjs.Shape(new createjs.Graphics().f(this.m_googleColors[i % this.m_googleColors.length]).r(96, 1 + (i * 12), 35 * valueData, 10));
                            if (elmt.getType() === 0) {
                                var decisPercVal = new createjs.Text(Math.floor(valueData * 100) + "%", "0.8em trebuchet", "#303030");
                            }
                            else {
                                decisBar.visible = false;
                                var decisPercVal = new createjs.Text("" + DST.Tools.round(valueData), "0.8em trebuchet", "#303030");
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
                    elmt.m_decisEaselElmt = decisionCont;
                    this.m_mcaContainer.addChild(decisionCont);
                    if (elmt.getType() == 2) {
                        decisionCont.visible = false;
                    }
                    this.m_updateMCAStage = true;
                }
                //}
            };
            GUIHandler.prototype.clickedDecision = function (p_evt) {
                //console.log("clicked a decision");
                //console.log(p_evt);
                this.m_model.setDecision(p_evt.currentTarget.name, Math.floor(p_evt.localY / 12));
                this.updateModel();
            };
            GUIHandler.prototype.updateEditorMode = function () {
                console.log("updating editormode");
                if (this.m_editorMode) {
                    $(".advButton").show();
                    $("#reset").show();
                    if (this.m_model.m_bbnMode) {
                        $("#newElmt").hide();
                        $("#newDcmt").hide();
                    }
                    else {
                        $("#newChance").hide();
                        $("#newDec").hide();
                        $("#newValue").hide();
                    }
                }
                else {
                    $(".advButton").hide();
                    $("#reset").hide();
                    $("#cnctTool").prop("checked", false);
                }
                var elementArr = this.m_model.getElementArr();
                if (elementArr) {
                    for (var i = 0; i < elementArr.length; i++) {
                        if (this.m_editorMode) {
                            elementArr[i].m_easelElmt.addEventListener("pressmove", this.pressMove);
                        }
                        else {
                            elementArr[i].m_easelElmt.removeEventListener("pressmove", this.pressMove);
                        }
                    }
                }
            };
            GUIHandler.prototype.fullscreen = function (p_evt) {
                var model = this.m_model;
                this.m_handler.getFileIO().quickSave(model);
                console.log("in local storage: " + localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
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
                    this.setSize($(window).width(), 500);
                    this.m_fullscreen = false;
                }
                var json = JSON.parse(localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                model.fromJSON(json);
                this.importStage();
            };
            GUIHandler.prototype.createNewChance = function (p_evt) {
                var elmt = this.m_model.createNewElement(0);
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTable([elmt]);
            };
            GUIHandler.prototype.createNewDec = function (p_evt) {
                var elmt = this.m_model.createNewElement(1);
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTable([elmt]);
            };
            GUIHandler.prototype.createNewValue = function (p_evt) {
                var elmt = this.m_model.createNewElement(2);
                this.addElementToStage(elmt);
                elmt.update();
                this.updateMiniTable([elmt]);
            };
            GUIHandler.prototype.createNewElement = function (p_evt) {
                var elmt = this.m_model.createNewElement(undefined);
                this.addElementToStage(elmt);
                // elmt.update();
                this.updateMiniTable([elmt]);
            };
            GUIHandler.prototype.deleteSelected = function (p_evt) {
                console.log("deleting");
                for (var i = 0; i < this.m_selectedItems.length; i++) {
                    var elmt = this.m_model.getElement(this.m_selectedItems[i].name);
                    if (this.addToTrash(elmt)) {
                        ////console.log(this.m_trashBin);
                        for (var j = 0; j < elmt.getConnections().length; j++) {
                            var conn = elmt.getConnections()[j];
                            if (conn.getOutputElement().getID() === elmt.getID()) {
                                conn.getInputElement().deleteConnection(conn.getID());
                            }
                            else {
                                conn.getOutputElement().deleteConnection(conn.getID());
                            }
                        }
                    }
                }
                this.clearSelection();
                for (var i = 0; i < this.m_trashBin.length; i++) {
                    this.m_model.deleteElement(this.m_trashBin[i].getID());
                }
                this.importStage();
                ////console.log(this.m_model.getConnectionArr());
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
                }
                p_elmt.m_easelElmt.addEventListener("mousedown", this.mouseDown);
                p_elmt.m_easelElmt.on("dblclick", this.dblClick);
                p_elmt.m_easelElmt.mouseChildren = false;
                p_elmt.m_easelElmt.name = p_elmt.getID();
                this.m_mcaContainer.addChild(p_elmt.m_easelElmt);
                this.m_updateMCAStage = true;
            };
            GUIHandler.prototype.dblClick = function (p_evt) {
                ////console.log(this);
                if (p_evt.target.name.substr(0, 4) === "elmt") {
                    this.populateElmtDetails(this.m_model.getElement(p_evt.target.name));
                    $("#submit").hide();
                    $("#detailsDialog").dialog("open");
                }
            };
            GUIHandler.prototype.populateElmtDetails = function (p_elmt) {
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
                    var s = DST.Tools.htmlTableFromArray("Definition", p_elmt.getData(), this.m_model);
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
                    }
                    else {
                        $("#values").prop('disabled', true);
                    }
                }
                else {
                    //MCA mode only
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
                            break;
                        case 1:
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
                            var tableMat = this.m_model.getWeightedData(p_elmt, false);
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
                    document.getElementById("description_div").innerHTML = p_elmt.getDescription();
                }
            };
            ;
            GUIHandler.prototype.addEditFunction = function (p_elmt, p_editorMode) {
                var originalDesc = p_elmt.getDescription();
                var originalUserComments = p_elmt.getUserDescription();
                console.log("ready for editing");
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
                            if (newText.length < 1) {
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
                        if (newText.length < 1) {
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
                            if (e.which == 13) {
                                var newText = $(this).val();
                                $(this).parent().text(newText);
                                if (newText.length < 1) {
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
                        $(this).children().first().blur(function () {
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
                    //Data table
                    $(function () {
                        $("td").dblclick(function () {
                            $("#submit").show();
                            var originalValue = $(this).text();
                            console.log("original value : " + originalValue);
                            $(this).addClass("editable");
                            $(this).html("<input type='text' value='" + originalValue + "' />");
                            $(this).children().first().focus();
                            $(this).children().first().keypress(function (e) {
                                if (e.which == 13) {
                                    var newText = $(this).val();
                                    console.log("new text: " + newText);
                                    if (isNaN(newText)) {
                                        console.log("value is not a number");
                                        // alert("Value must be a number");
                                        //TODO find better solution than alert
                                        $(this).parent().text(originalValue);
                                    }
                                    else {
                                        $(this).parent().text(newText);
                                        if (newText !== originalValue) {
                                            mareframeGUI.m_unsavedChanges = true;
                                        }
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
                                }
                                else {
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
                            });
                        });
                        //TODO Prevent user from editing the top rows. That data should come from the child elements
                        $("th").dblclick(function () {
                            $("#submit").show();
                            var originalText = $(this).text();
                            $(this).addClass("editable");
                            $(this).html("<input type='text' value='" + originalText + "' />");
                            $(this).children().first().focus();
                            $(this).children().first().keypress(function (e) {
                                if (e.which == 13) {
                                    var newText = $(this).val();
                                    $(this).parent().text(newText);
                                    if (newText !== originalText) {
                                        mareframeGUI.m_unsavedChanges = true;
                                    }
                                    $(this).parent().removeClass("editable");
                                }
                            });
                            $(this).children().first().blur(function () {
                                var newText = $(this).val();
                                $(this).parent().text(newText);
                                if (newText !== originalText) {
                                    mareframeGUI.m_unsavedChanges = true;
                                }
                                $(this).parent().removeClass("editable");
                            });
                        });
                    });
                }
            };
            ;
            GUIHandler.prototype.showValues = function () {
                var elmt = $("#detailsDialog").data("element");
                console.log("Data: " + elmt.getData());
                console.log("Values: " + elmt.getValues());
                console.log(elmt.getValues());
                console.log("size of values: " + math.size(elmt.getValues()));
                $("#valuesTable_div").html(DST.Tools.htmlTableFromArray("Values", elmt.getValues(), $("#detailsDialog").data("model")));
                $("#valuesTable_div").show();
                $("#values").prop("disabled", true);
            };
            GUIHandler.prototype.saveChanges = function () {
                var elmt = $("#detailsDialog").data("element");
                var oldData = elmt.getData();
                var model = this.m_model;
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
                        var value = $(this).text();
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
                for (var i = 0; i < DST.Tools.numOfHeaderRows(oldData); i++) {
                    for (var j = 0; j < oldData[0].length; j++) {
                        newTable[i][j] = oldData[i][j];
                    }
                    newTable[i][0] = oldData[i][0];
                }
                if (!DST.Tools.columnSumsAreValid(newTable, DST.Tools.numOfHeaderRows(elmt.getData())) && elmt.getType() == 0) {
                    //Should also show which row is unvalid (maybe right after the user has changed the value)
                    alert("The values in each column must add up to 1");
                }
                else {
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
                }
                this.m_unsavedChanges = false;
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
                ////console.log("original datamatrix");
                ////console.log(this.m_model.getDataMatrix());
            };
            GUIHandler.prototype.mouseDown = function (p_evt) {
                //////console.log("mouse down at: ("+e.stageX+","+e.stageY+")");
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                this.m_originalPressX = p_evt.stageX;
                this.m_originalPressY = p_evt.stageY;
                //////console.log("cnctool options: "+$("#cnctTool").button("option","checked"));
                if (p_evt.target.name.substr(0, 4) === "elmt") {
                    var cnctChkbox = document.getElementById("cnctTool");
                    if (cnctChkbox.checked) {
                        ////console.log("cnctTool enabled");
                        this.connectTo(p_evt);
                    }
                    else {
                        this.select(p_evt);
                    }
                }
                else {
                    this.clearSelection();
                }
            };
            GUIHandler.prototype.select = function (p_evt) {
                //////console.log("ctrl key: " + e.nativeEvent.ctrlKey);
                if (!p_evt.nativeEvent.ctrlKey && this.m_selectedItems.indexOf(p_evt.target) === -1) {
                    this.clearSelection();
                }
                console.log("adding to selection: " + p_evt.target);
                this.addToSelection(p_evt.target);
            };
            GUIHandler.prototype.pressMove = function (p_evt) {
                console.log("press move on target " + p_evt.target.name);
                if (p_evt.target.name === "hitarea") {
                    if (p_evt.nativeEvent.ctrlKey) {
                        ////console.log("orig: " + this.m_originalPressX + ", " + this.m_originalPressY + ". curr: " + p_evt.stageX + ", " + p_evt.stageY);
                        this.setSelection(this.m_model.getEaselElementsInBox(this.m_originalPressX, this.m_originalPressY, p_evt.stageX, p_evt.stageY));
                        this.m_selectionBox.graphics.clear().s("rgba(0,0,0,0.7)").setStrokeDash([2, 2], createjs.Ticker.getTime()).drawRect(this.m_originalPressX, this.m_originalPressY, p_evt.stageX - this.m_originalPressX, p_evt.stageY - this.m_originalPressY);
                        this.m_mcaContainer.addChild(this.m_selectionBox);
                    }
                    else if (this.m_editorMode) {
                        //console.log("panning");
                        this.m_mcaContainer.x += p_evt.stageX - this.m_oldX;
                        this.m_mcaContainer.y += p_evt.stageY - this.m_oldY;
                    }
                }
                else if (p_evt.target.name.substr(0, 4) === "elmt") {
                    for (var i = 0; i < this.m_selectedItems.length; i++) {
                        var elmt = this.m_selectedItems[i];
                        elmt.x += p_evt.stageX - this.m_oldX;
                        elmt.y += p_evt.stageY - this.m_oldY;
                        console.log("selected elements: " + this.m_selectedItems);
                        console.log("element: " + elmt.name);
                        for (var j = 0; j < this.m_model.getElement(elmt.name).getConnections().length; j++) {
                            var c = this.m_model.getElement(elmt.name).getConnections()[j];
                            this.updateConnection(c);
                        }
                    }
                }
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                this.m_updateMCAStage = true;
            };
            GUIHandler.prototype.tick = function () {
                if (this.m_updateMCAStage) {
                    this.m_updateMCAStage = false;
                    this.m_mcaStage.update();
                    this.m_valueFnStage.update();
                    this.m_selectionBox.graphics.clear();
                }
            };
            GUIHandler.prototype.clear = function () {
                this.m_mcaContainer.removeAllChildren();
                this.m_updateMCAStage = true;
            };
            GUIHandler.prototype.connectTo = function (p_evt) {
                var elmtIdent = p_evt.target.name;
                var connected = false;
                //console.log("attempting connection "+elmtIdent);
                for (var i = 0; i < this.m_selectedItems.length; i++) {
                    var e = this.m_selectedItems[i];
                    if (e.name.substr(0, 4) === "elmt" && e.name !== elmtIdent) {
                        var outputElmt = this.m_model.getElement(elmtIdent);
                        var inputElmt = this.m_model.getElement(e.name);
                        if (inputElmt.isAncestorOf(outputElmt)) {
                            alert("cannot create a cycle");
                        }
                        else if (inputElmt.getType() === 2 && outputElmt.getType() !== 3) {
                            alert("Value cannot one have super-value children");
                        }
                        else {
                            var c = this.m_model.createNewConnection(inputElmt, outputElmt);
                            //console.log("connection: " + c);
                            if (this.m_model.addConnection(c)) {
                                this.addConnectionToStage(c);
                                connected = true;
                            }
                            if (this.m_model.m_bbnMode) {
                                if (outputElmt.getType() !== 1) {
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
                //this.select(elmtIdent);
            };
            GUIHandler.prototype.addConnectionToStage = function (p_connection) {
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
            };
            GUIHandler.prototype.updateConnection = function (p_connection) {
                //stage.removeChild(c.easelElmt);
                var temp = p_connection.m_easelElmt.getChildAt(1);
                temp.graphics.clear().beginStroke(p_connection.getColor()).mt(p_connection.getInputElement().m_easelElmt.x, p_connection.getInputElement().m_easelElmt.y).lt(p_connection.getOutputElement().m_easelElmt.x, p_connection.getOutputElement().m_easelElmt.y);
                p_connection.m_easelElmt.getChildAt(0).x = ((p_connection.getInputElement().m_easelElmt.x - p_connection.getOutputElement().m_easelElmt.x) / 2) + p_connection.getOutputElement().m_easelElmt.x;
                p_connection.m_easelElmt.getChildAt(0).y = ((p_connection.getInputElement().m_easelElmt.y - p_connection.getOutputElement().m_easelElmt.y) / 2) + p_connection.getOutputElement().m_easelElmt.y;
                p_connection.m_easelElmt.getChildAt(0).rotation = (180 / Math.PI) * Math.atan((p_connection.getInputElement().m_easelElmt.y - p_connection.getOutputElement().m_easelElmt.y) / (p_connection.getInputElement().m_easelElmt.x - p_connection.getOutputElement().m_easelElmt.x));
                if (p_connection.getInputElement().m_easelElmt.x < p_connection.getOutputElement().m_easelElmt.x) {
                    p_connection.m_easelElmt.getChildAt(0).rotation = 180 + p_connection.m_easelElmt.getChildAt(0).rotation;
                }
                //stage.addChildAt(c.easelElmt, 0);
                //update = true;
            };
            GUIHandler.prototype.addToSelection = function (p_easelElmt) {
                if (this.m_selectedItems.indexOf(p_easelElmt) === -1 && p_easelElmt.name.substr(0, 4) === "elmt") {
                    var elmt = this.m_model.getElement(p_easelElmt.name);
                    this.m_selectedItems.push(p_easelElmt);
                    console.log("pushed " + p_easelElmt);
                    if (this.m_model.m_bbnMode) {
                        this.m_selectedItems.push(elmt.m_decisEaselElmt);
                    }
                    var elmtType = elmt.getType();
                    //////console.log(e);
                    var shape = p_easelElmt.getChildAt(0);
                    shape.graphics.clear().f(this.m_elementColors[elmtType][2]).s(this.m_elementColors[elmtType][1]);
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
                            shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                        default:
                            break;
                    }
                    this.m_updateMCAStage = true;
                }
            };
            GUIHandler.prototype.setSelection = function (p_easelElmt) {
                this.clearSelection();
                ////console.log(p_easelElmt);
                for (var i = 0; i < p_easelElmt.length; i++) {
                    this.addToSelection(p_easelElmt[i]);
                }
            };
            GUIHandler.prototype.getSelected = function () {
                return this.m_selectedItems;
            };
            GUIHandler.prototype.clearSelection = function () {
                for (var i = 0; i < this.m_selectedItems.length; i++) {
                    var easelElmt = this.m_selectedItems[i];
                    if (easelElmt.id != this.m_model.getElement(easelElmt.name).m_decisEaselElmt.id) {
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
                                shape.graphics.drawRoundRect(0, 0, 150, 30, 10);
                                break;
                            default:
                                break;
                        }
                    }
                }
                this.m_selectedItems = [];
                this.m_updateMCAStage = true;
            };
            return GUIHandler;
        })();
        DST.GUIHandler = GUIHandler;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=MareframeGUI.js.map