/// <reference path="Declarations\easeljs.d.ts" />
/// <reference path="Declarations\createjs-lib.d.ts" />

module Mareframe {
    export module DST {
        export class Dialog {
            //static ms_numberOfDialogsCreated = 0;
            private m_model: Model;
            private m_element: Element;
            public m_valueFnStage: createjs.Stage; // = new createjs.Stage("valueFn_canvas");
            public m_controlP: createjs.Shape = new createjs.Shape();
            private m_valueFnContainer: createjs.Container = new createjs.Container();
            public m_valueFnLineCont: createjs.Container = new createjs.Container();
            public m_valueFnSize: number = 100;
            private m_googleColors: string[] = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"];
            private m_valFnBackground: createjs.Shape = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.m_valueFnSize, this.m_valueFnSize));
            private m_oldX: number = 0;
            private m_oldY: number = 0;
            private m_readyToUpdate: boolean = true;
            public m_finalScoreChart: google.visualization.ColumnChart = new google.visualization.ColumnChart($("#finalScore_div").get(0));
            public m_finalScoreChartOptions: Object = {
                width: 1024,
                height: 400,
                vAxis: { minValue: 0 },
                legend: { position: 'top', maxLines: 3 },
                bar: { groupWidth: '75%' },
                animation: { duration: 500, easing: "out" },
                isStacked: true,
                focusTarget: 'category'

            };

            constructor(p_model: Model, p_elmt: Element) {
                this.m_model = new Model(p_model.m_bbnMode);
                this.m_model = p_model;
                this.m_element = new Element(p_elmt.getID(), this.m_model);
                this.m_element = p_elmt;
                //console.log("*****************************************************************************************");
                //console.log(this.m_element);
                //this.m_controlP.graphics.f("#0615b4").s("#2045ff").rr(0, 0, 6, 6, 2);
                //this.m_valFnBackground.addEventListener("pressmove", this.moveValFnCP);
                //this.m_valFnBackground.addEventListener("mousedown", this.downValFnCP);
                //this.m_controlP.mouseChildren = false;

                //this.pressMove = this.pressMove.bind(this);
                //this.mouseDown = this.mouseDown.bind(this);
                this.moveValFnCP = this.moveValFnCP.bind(this);
                this.updateValFnCP = this.updateValFnCP.bind(this);
                this.updateDataTableDiv = this.updateDataTableDiv.bind(this);
                this.flipValFn = this.flipValFn.bind(this);
                this.linearizeValFn = this.linearizeValFn.bind(this);

                this.m_valFnBackground.name = this.m_element.getID();

                //$("#valueFn_Linear").on("click", this.linearizeValFn);
                //$("#valueFn_Flip").on("click", this.flipValFn);

                if ($("#Dialog" + p_elmt.getID()).length == 0) {
                    //console.log($("#" + p_elmt.getID()).length);
                    $("#dd").append("<div id='Dialog" + p_elmt.getID() + "' title='" + p_elmt.getName() + "' class='detailsDialog'></div>");
                    $("#Dialog" + p_elmt.getID()).append("<div id='WMS" + p_elmt.getID() + "'></div>");
                    $("#Dialog" + p_elmt.getID()).append("<div id='VFN" + p_elmt.getID() + "'></div>");
                    $("#Dialog" + p_elmt.getID()).append("<div id='Slide" + p_elmt.getID() + "'></div>");
                    $("#Dialog" + p_elmt.getID()).append("<div id='DataTable" + p_elmt.getID() + "'></div>");
                    $("#Dialog" + p_elmt.getID()).append("<div id='Desc" + p_elmt.getID() + "'>" + p_elmt.getDescription() + "</div>");
                    $("#Dialog" + p_elmt.getID()).append("<div id='Chart" + p_elmt.getID() + "'></div>");

                    $("#VFN" + p_elmt.getID()).append("<canvas id='valueFn_canvas" + p_elmt.getID() + "' width= '100' height= '100' > </canvas>");
                    $("#VFN" + p_elmt.getID()).append("<button class='button' id= 'valueFn_Linear" + p_elmt.getID() + "' > Linearize </button>");
                    $("#VFN" + p_elmt.getID()).append("<button class='button' id= 'valueFn_Flip" + p_elmt.getID() + "' > Flip Direction</button > ");

                    $("#Dialog" + p_elmt.getID()).dialog({
                        title: p_elmt.getName()
                        , autoOpen: true
                    //,resizable: true
                        , height: 600
                        , width: 800
                    });

                    this.m_valueFnStage = new createjs.Stage("valueFn_canvas" + p_elmt.getID());

                    this.m_valueFnStage.addChild(this.m_valFnBackground);
                    this.m_valueFnStage.addChild(this.m_valueFnLineCont);
                    this.m_valueFnStage.addChild(this.m_valueFnContainer);
                    this.m_valueFnStage.addChild(this.m_controlP);
                    //this.m_valueFnStage.update();
                    //this.update();
                    this.m_controlP.graphics.f("#0615b4").s("#2045ff").rr(0, 0, 6, 6, 2);
                    this.m_valFnBackground.addEventListener("pressmove", this.moveValFnCP);
                    this.m_valFnBackground.addEventListener("mousedown", this.downValFnCP);
                    this.m_controlP.mouseChildren = false;

                    $("#valueFn_Linear" + p_elmt.getID()).on("click", this.linearizeValFn);
                    $("#valueFn_Flip" + p_elmt.getID()).on("click", this.flipValFn);

                    this.getContent();
                }
            }

            public update(): void {
                //console.log("dialog tick*******************************************");
                this.m_valueFnStage.update();
            }

            public setReadyToUpdate(p_set: boolean): void {
                this.m_readyToUpdate = p_set;
            }

            public getReadyToUpdate(): boolean {
                return this.m_readyToUpdate;
            }

            public updateValFnCP(p_controlPointX: number, p_controlPointY: number, p_flipped_numBool: number): void {
                //var functionSegments = 10;
		
                
                this.m_valueFnContainer.removeAllChildren();
                var line = new createjs.Graphics().beginStroke("#0f0f0f").mt(0, this.m_valueFnSize - (this.m_valueFnSize * p_flipped_numBool)).bt(p_controlPointX, p_controlPointY, p_controlPointX, p_controlPointY, this.m_valueFnSize, 0 + (this.m_valueFnSize * p_flipped_numBool));
                //for (var i = 1; i <= functionSegments; i++)
                //{
                //	line.lt(i * (valueFnSize / functionSegments), valueFnSize - (valueFnSize * getValueFn(i * (100 / functionSegments), cPX, valueFnSize-cPY)));
                //}
                var plot = new createjs.Shape(line);
                this.m_valueFnContainer.addChild(plot);
                //this.m_valueFnStage.update();                                                                             
                //update = true;
                //$("#valueFn_div").show(); //moved should not show in a update function
            }

            public updateDataTableDiv(p_elmt: Element): void {
                var tableMat = this.m_model.getWeightedData(p_elmt, false);
                tableMat.splice(0, 0, ["Scenario", "Value", "Weight"]);

                var tableData = google.visualization.arrayToDataTable(tableMat);
                //var table = new google.visualization.Table(document.getElementById('datatable_div'));
                var table = new google.visualization.Table(document.getElementById("DataTable" + p_elmt.getID()));

                table.draw(tableData, { 'allowHtml': true, 'alternatingRowStyle': true, 'width': '100%', 'height': '100%' });
                $('.google-visualization-table-table').width("100%");
            }

            private downValFnCP(p_evt: createjs.MouseEvent): void {
                //console.log("moudsedowm");
                //console.log(p_evt);
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;

            }

            private moveValFnCP(p_evt: createjs.MouseEvent): void {
                console.log("mousesmove");
                console.log(p_evt.target.name);
                //console.log(this.m_model);
                var elmt = this.m_model.getElement(p_evt.target.name);
                console.log(elmt);
                //var elmt = p_evt.target;
                this.m_controlP.x = p_evt.stageX;
                this.m_controlP.y = p_evt.stageY;
                elmt.getData()[1] = p_evt.stageX;
                elmt.getData()[2] = p_evt.stageY;
                this.updateValFnCP(p_evt.stageX, p_evt.stageY, elmt.getData()[3]);
                this.updateDataTableDiv(elmt);

                //update = true;
                this.updateFinalScores(this.m_model);
                console.log("mousesmoved");
                this.m_readyToUpdate = true;
            }

            linearizeValFn(): void {
                console.log("lineraze");
                this.moveValFnCP(<createjs.MouseEvent>{ stageX: 50, stageY: 50, target: { name: $("#valueFn_Linear" + this.m_element.getID()).data("name") } });
                this.m_readyToUpdate = true;
            }

            flipValFn(): void {

                console.log("flipping");
                //console.log(this); 
                console.log(this.m_element);
                console.log(this.m_element.getID());
                console.log($("#valueFn_Flip" + this.m_element.getID()).data("name"));
                var elmt = this.m_model.getElement($("#valueFn_Flip" + this.m_element.getID()).data("name"));
                console.log(elmt);
                elmt.getData()[3] = Math.abs(elmt.getData()[3] - 1);
                this.updateValFnCP(elmt.getData()[1], elmt.getData()[2], elmt.getData()[3]);
                this.updateDataTableDiv(elmt);
                //update = true;
                this.updateFinalScores(this.m_model);
                this.m_readyToUpdate = true;
            }

            public getValueFnLine(p_xValue: number, p_color: string): createjs.Graphics {
                return new createjs.Graphics().beginStroke(p_color).mt(p_xValue, 0).lt(p_xValue, this.m_valueFnSize);
            }

            updateFinalScores(p_model: Model): void {
                console.log("updating final scores");
                var data = google.visualization.arrayToDataTable(p_model.getFinalScore());
                data.removeRow(data.getNumberOfRows() - 1);
                this.m_finalScoreChart.draw(data, this.m_finalScoreChartOptions);
                console.log("updated final scores");
            }

            private getContent(): void {
                if (this.m_model.m_bbnMode) {
                    //bbn mode only
                    $("#" + this.m_element.getID()).data("element", this.m_element);


                    var s = Tools.htmlTableFromArray("Definition", this.m_element.getData());
                    $("#defTable_div").html(s);
                    $("#defTable_div").show();
                    //if (this.m_editorMode) {
                    //    this.addEditFunction();
                    //}
    
                    //set description
                    document.getElementById("description_div").innerHTML = this.m_element.getDescription();
                    $("#description_div").show();
                    if (this.m_element.isUpdated()) {
                        $("#values").prop('disabled', false);
                    } else {
                        $("#values").prop('disabled', true);
                    }

                } else {
                    //MCA mode only
    
                    //console.log(tableMat);
                    //console.log("*****************************************************************************");
                    var chartOptions: Object = {
                        width: 700,
                        height: 400,
                        vAxis: { minValue: 0 },
                        legend: { position: 'none', maxLines: 3 },
                        bar: { groupWidth: '60%' }

                    };

                    console.log("Get elmt tyoe: " + this.m_element.getType());
                    switch (this.m_element.getType()) {
                        case 2://scenario
                            //show: tabledata,description
                            //$("#description_div").show();
                            $("#Desc" + this.m_element.getID()).show();
                            break;

                        case 0://attribute
                            //show: valueFn,direct(sliders),ahp
                            console.log("Dialog open case 0");
                            //$("#weightingMethodSelector").show();
                            $("#WMS" + this.m_element.getID()).show();
                            //$("#datatable_div").show();
                            $("#DataTable" + this.m_element.getID()).show();
                            //$("#chart_div").show();
                            $("#Chart" + this.m_element.getID()).show();
                            // Create the data table.
                            // Instantiate and draw our chart, passing in some options.
                            console.log("case 0: before chartDAta");
                            console.log(this.m_model.getWeightedData(this.m_element, true));
                            var chartData = google.visualization.arrayToDataTable(this.m_model.getWeightedData(this.m_element, true));
                            console.log("case 0: after chartDAta before charrt");
                            //var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
                            var chart = new google.visualization.ColumnChart(document.getElementById("Chart" + this.m_element.getID()));
                            console.log("case 0: after charrt");
                            chart.draw(chartData, chartOptions);

                            break;

                        case 3://objective
                        case 1://sub objective
                            //show: swing(sliders),direct(sliders),ahp
                            $("#WMS" + this.m_element.getID()).show();
                            break;



                    }
                    console.log("Get method: " + this.m_element.getMethod());
                    switch (this.m_element.getMethod()) {

                        case 0://direct or undefined
                            console.log("direct or undef");
                            break;
                        case 1://swing
                            console.log("swing");
                            var sliderHtml = "";
                            $("#Slide" + this.m_element.getID()).empty();

                            for (var i = 0; i < this.m_element.getData(0).length; i++) {
                                var childEl = this.m_model.getConnection(this.m_element.getData(0, i)).getInputElement();
                                sliderHtml = "<div><p>" + childEl.getName() + ":<input id=\"inp_" + childEl.getID() + "\"type=\"number\" min=\"0\" max=\"100\"></p><div style=\"margin-top:5px ;margin-bottom:10px\"class =\"slider\"id=\"slid_" + childEl.getID() + "\"></div></div>";
                                $("#Slide" + this.m_element.getID()).append(sliderHtml);

                                function makeSlider(count, id, _this) {
                                    $("#slid_" + id).slider({
                                        min: 0,
                                        max: 100,
                                        value: this.m_element.getData(1, count),
                                        slide: function (event, ui) {
                                            this.m_element.setData(ui.value, 1, count);
                                            $("#inp_" + id).val(ui.value);
                                            this.updateFinalScores();
                                        }.bind(_this)

                                    });
                                    $("#inp_" + id).val(this.m_element.getData(1, count));

                                    $("#inp_" + id).on("input", function () {
                                        var val = parseInt(this.value);
                                        if (val <= 100 && val >= 0) {
                                            this.m_element.setData(val, 1, count);
                                            $("#slid_" + id).slider("option", "value", val);
                                            _this.updateFinalScores();
                                        } else if (val > 100) {
                                            val = 100;
                                        } else {
                                            val = 0;
                                        }

                                        console.log("get Data: " + this.m_element.getData(1));
                                    });
                                }
                                makeSlider(i, childEl.getID(), this);

                            }
                            $("#Slide" + this.m_element.getID()).show();

                            break;
                        case 2://valueFn
                            console.log("valueFn");
                            var tableMat = this.m_model.getWeightedData(this.m_element, false);
                            //console.log(tableMat);
                            var cPX: number = this.m_element.getData(1);
                            var cPY: number = this.m_element.getData(2);
                            console.log("draw line");
                            //this.m_valueFnLineCont.removeAllChildren();
                            //console.log(this.m_dialogs);
                            this.m_valueFnLineCont.removeAllChildren();

                            console.log("draw line");
                            //this.m_controlP.regX = 3;
                            this.m_controlP.regX = 3;
                            //this.m_controlP.regY = 3;
                            this.m_controlP.regY = 3;
                            
                            //this.m_controlP.x = cPX;
                            this.m_controlP.x = cPX;
                            //this.m_controlP.y = cPY;
                            this.m_controlP.y = cPY;
                            //this.m_valFnBackground.name = p_elmt.getID();
                            $("#valueFn_Flip" + this.m_element.getID()).data("name", this.m_element.getID());
                            $("#valueFn_Linear" + this.m_element.getID()).data("name", this.m_element.getID());
                            console.log("giving names");
                            var maxVal = 0;
                            for (var i = 1; i < tableMat.length; i++) {
                                if (tableMat[i][1] > maxVal)
                                    maxVal = tableMat[i][1];
                            }
    
                            //set minimum and maximum values
                            var maxVal: number = this.m_element.getData(5);
                            var minVal: number = this.m_element.getData(4);
    
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
                                //console.log("tableMat[i][1]: " + tableMat[i][1]);
                                //var vertLine = new createjs.Shape(this.getValueFnLine((tableMat[i][1] - minVal) / (maxVal - minVal) * this.m_valueFnSize, this.m_googleColors[i - 1]));
                                var vertLine = new createjs.Shape(this.getValueFnLine((tableMat[i][1] - minVal) / (maxVal - minVal) * this.m_valueFnSize, this.m_googleColors[i - 1]));

                                this.m_valueFnLineCont.addChild(vertLine);
                            }
    
    
                            //this.updateValFnCP(cPX, cPY, p_elmt.getData(3));
                            this.updateValFnCP(cPX, cPY, this.m_element.getData(3));
                            $("#VFN" + this.m_element.getID()).show();

                            //this.updateDataTableDiv(p_elmt);
                            this.updateDataTableDiv(this.m_element);


                            break;
                        case 3://ahp
                    }
    
                    //set description
                    //document.getElementById("description_div").innerHTML = p_elmt.getDescription();
                    //console.log("<div id='Desc" + p_elmt.getID() + "'>" + p_elmt.getDescription() + "</div>");
                    //$("#dd").append("<div id='Desc" + p_elmt.getID() + "'>" + p_elmt.getDescription() +"</div>");
                    //$("#Desc" + p_elmt.getID() )
                }
                console.log("mca end");

            }
                
        
    

            /*
            private mouseDown(p_evt: createjs.MouseEvent): void {
                //console.log("mouse down at: ("+e.stageX+","+e.stageY+")");
                this.m_oldX = p_evt.stageX;
                this.m_oldY = p_evt.stageY;
                //console.log("cnctool options: "+$("#cnctTool").button("option","checked"));
                /*
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

            private pressMove(p_evt: createjs.MouseEvent): void {
                //console.log("press move");
                /*
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
                //this.m_updateMCAStage = true;
                //GUIHandler.
            }
        */
        }
    }
}
