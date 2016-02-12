module Mareframe {
    export module DST {
        export class TKN_Widget {
            constructor(canvasID: string, fileIO: FileIO) {
                //creating stage and background
                this.m_stage = new createjs.Stage(canvasID);
                this.m_fileIO = fileIO; 
                //this.m_backGroundGraphics = new createjs.Graphics().beginFill(this.m_backGroundColor).drawRect(0, 0, this.m_width, this.m_height);
                //this.m_backGround = new createjs.Shape(this.m_backGroundGraphics);
                //this.m_stage.addChild(this.m_backGround);
                //this.m_stage.update();
                
                this.handleDoubleClick = this.handleDoubleClick.bind(this);
                this.handleMouseDown = this.handleMouseDown.bind(this);
                this.handlePressMove = this.handlePressMove.bind(this);
                this.handleDeleteButton = this.handleDeleteButton.bind(this);
                this.handleFlipHorizontal = this.handleFlipHorizontal.bind(this);
                this.handleFlipVeritical = this.handleFlipVeritical.bind(this);
                this.handleLinearize = this.handleLinearize.bind(this);
                this.handleLoadFromFile = this.handleLoadFromFile.bind(this);
                this.handleSaveToFile = this.handleSaveToFile.bind(this);
                this.handleDeleteAllPoints = this.handleDeleteAllPoints.bind(this);
                this.setSize(this.m_width, this.m_height);
                this.addPWLToStage = this.addPWLToStage.bind(this);
                $("#selectedPointInfo").hide();
                $("#deleteButton").button().click( this.handleDeleteButton );
                $("#flipHorizontal").button().click( this.handleFlipHorizontal );
                $("#flipVertical").button().click( this.handleFlipVeritical );
                $("#linearize").button().click( this.handleLinearize );
                $("#loadFromFileDiv").button().change( this.handleLoadFromFile );
                $("#saveToFile").button().click( this.handleSaveToFile );
                $("#deleteAllPoints").button().click( this.handleDeleteAllPoints );
                $("#showAlternatives").button().click(this.handleShowAlternatives);
                $("#saveFile_div").hide();
                //$(".not_done").prop("disable", true);
                $(".not_done").button("disable");
            };

            private m_stage: createjs.Stage;
            private m_fileIO: FileIO;
            private m_backGround: createjs.Shape;
            private m_backGroundGraphics: createjs.Graphics;
            private m_backGroundColor: string = "#fff0f0";
            private m_container: createjs.Container;
            private m_width: number = 200;
            private m_height: number = 200;
            private m_unitX: number;
            private m_unitY: number;
            private m_selectedPointIndex: number = null;
            private m_selectedPoint: createjs.Shape = null;
            private m_flipHorizontal: boolean = false;
            private m_flipVertical: boolean = false;

            private m_valueFunction: ValueFunction;
            private m_pwl: PiecewiseLinear;

            //setters and getters
            getBackGroundColor(): string {
                return this.m_backGroundColor;
            }
            setBackGroundColor(newColor: string) {
                this.m_backGroundColor = newColor;
            }
            getHeight(): number {
                return this.m_height;
            }
            getWidth(): number {
                return this.m_width;
            }
            setSize(p_width: number, p_height: number) {
                this.m_width = p_width;
                this.m_height = p_height;
                //this.m_backGroundGraphics.height = p_height
                this.m_stage.removeChild(this.m_backGround);
                this.m_backGroundGraphics = new createjs.Graphics().beginFill(this.m_backGroundColor).drawRect(0, 0, p_width, p_height);
                this.m_backGround = new createjs.Shape(this.m_backGroundGraphics);
                this.m_stage.addChild(this.m_backGround);
                if (this.m_pwl !== undefined) {
                    this.m_unitX = this.m_width / (this.m_pwl.m_endPoint.x - this.m_pwl.m_startPoint.x);
                    this.m_unitY = this.m_height / (this.m_pwl.m_maxValue - this.m_pwl.m_minValue);
                }
                //EventListeners for the background
                this.m_backGround.addEventListener("mousedown", this.handleMouseDown);
                //this.m_backGround.addEventListener("pressmove", this.handlePressMove);
                this.m_backGround.addEventListener("dblclick", this.handleDoubleClick);
                
            }

            getValueFunction(): ValueFunction {
                return this.m_valueFunction;
            }
            setValueFunction(newValueFunction) {
                this.m_valueFunction = newValueFunction;
            }
            getPwl(): ValueFunction {
                return this.m_pwl;
            }
            setPwl(newValueFunction) {
                this.m_pwl = newValueFunction;
                this.m_unitX = this.m_width / (this.m_pwl.m_endPoint.x - this.m_pwl.m_startPoint.x);
                this.m_unitY = this.m_height / (this.m_pwl.m_maxValue - this.m_pwl.m_minValue);
            }

            //Event handlers
            handlePressMove() {
                alert("PressMove");
            }
            handleMouseDown(e: createjs.MouseEvent, data:any) {
                //alert("mouseDown");
                console.log("mousedown on " + e.target.id);
                //var tt = e.target;
                //e.data;
                if (this.m_selectedPointIndex !== null) {
                    var s1 = this.getStageX(this.m_selectedPointIndex);
                    var s2 = this.getStageY(this.m_selectedPointIndex);

                    //this.m_selectedPoint.graphics.clear().beginFill("green").drawCircle(this.getStageX(this.m_selectedPointIndex), this.getStageY(this.m_selectedPointIndex), 8);                   
                    //this.m_selectedPoint.graphics.clear().beginFill("green").drawCircle((this.m_pwl.getPoints()[this.m_selectedPointIndex].x - this.m_pwl.getPoints()[0].x) * this.m_unitX, (this.m_pwl.m_maxValue - this.m_pwl.getPoints()[this.m_selectedPointIndex].y) * this.m_unitY, 8);
                    //this.m_selectedPoint.graphics.clear().beginFill("green").drawCircle(data.PosX - this.m_pwl.getPoints()[0].x * this.m_unitX, this.m_pwl.m_maxValue * this.m_unitY - data.PosY, 8);
                }
                if (data !== undefined) {
                    

                    $("#selectedPointInfo").show();
                    
                    $("#posX").val(this.m_pwl.getPoints()[data.clickedPointIndex].x.toString());
                    $("#posY").val(this.m_pwl.getPoints()[data.clickedPointIndex].y.toString());
                    this.m_selectedPoint = e.target;
                    
                    this.m_selectedPointIndex = data.clickedPointIndex.valueOf();
                    if (data.selectedPointIndex === 0) {
                        $("#posX").prop("disabled");
                    }
                    if (data.selectedPointIndex === this.m_pwl.getPoints.length) {
                        $("#posX").prop("disabled");
                    }
                    var s3 = this.getStageX(this.m_selectedPointIndex);
                    var s4 = this.getStageY(this.m_selectedPointIndex);
                    //e.target.graphics.clear().beginFill("red").drawCircle(this.getStageX(data.clickedPointIndex), this.getStageY(data.clickedPointIndex), 6);

                    //e.target.graphics.clear().beginFill("red").drawCircle((this.m_pwl.getPoints()[data.clickedPointIndex].x - this.m_pwl.getPoints()[0].x) * this.m_unitX, (this.m_pwl.m_maxValue - this.m_pwl.getPoints()[data.clickedPointIndex].y) * this.m_unitY, 6);
                }
                else {
                    $("#selectedPointInfo").hide();
                    this.m_selectedPointIndex = null;
                }
                this.addPWLToStage();
                console.log("selectedIndex: " + this.m_selectedPointIndex); 
                this.update();
            }
            hd(e: createjs.MouseEvent, data: any) { }
            handleDoubleClick(e: createjs.MouseEvent) {
                var tmpx = this.m_pwl.getPoints()[0].x * this.m_unitX;
                if (this.m_flipHorizontal) {
                    if (this.m_flipVertical) {
                        this.m_pwl.addPoint(((this.m_width - e.stageX) + this.m_pwl.getPoints()[0].x * this.m_unitX) / this.m_unitX, (e.stageY) / this.m_unitY);
                    }
                    else {
                        this.m_pwl.addPoint((e.stageX + this.m_pwl.getPoints()[0].x * this.m_unitX) / this.m_unitX, (e.stageY) / this.m_unitY);
                    }
                }
                else {
                    if (this.m_flipVertical) {
                        this.m_pwl.addPoint(((this.m_width - e.stageX) + this.m_pwl.getPoints()[0].x * this.m_unitX) / this.m_unitX, (this.m_pwl.m_maxValue * this.m_unitY - e.stageY) / this.m_unitY);
                    }
                    else {
                        this.m_pwl.addPoint((e.stageX + this.m_pwl.getPoints()[0].x * this.m_unitX) / this.m_unitX, (this.m_pwl.m_maxValue * this.m_unitY - e.stageY) / this.m_unitY);
                    }
                }

                this.m_selectedPointIndex = null;
                $("#selectedPointInfo").hide();
                this.m_pwl.sortPointsByX();
                this.addPWLToStage();
                this.update();
            }
            handleDeleteButton(e: createjs.MouseEvent) {
                console.log("houh");
                this.m_pwl.removePointAtIndex(this.m_selectedPointIndex);
                this.m_selectedPointIndex = null;
                $("#selectedPointInfo").hide();
                this.addPWLToStage();
                this.m_stage.update();
            }
            handleFlipHorizontal(e: createjs.MouseEvent) {
                if (this.m_flipHorizontal)
                    this.m_flipHorizontal = false;
                else
                    this.m_flipHorizontal = true;
                this.addPWLToStage();
            }
            handleFlipVeritical(e: createjs.MouseEvent) {
                if (this.m_flipVertical)
                    this.m_flipVertical = false;
                else
                    this.m_flipVertical = true;
                this.addPWLToStage();
            }
            handleLinearize(e: createjs.MouseEvent) {
                var a = (this.m_pwl.getPoints()[this.m_pwl.getPoints().length-1].y - this.m_pwl.getPoints()[0].y) / (this.m_pwl.getPoints()[this.m_pwl.getPoints().length-1].x - this.m_pwl.getPoints()[0].x);
                var b = this.m_pwl.getPoints()[0].y - a * this.m_pwl.getPoints()[0].y;
                for (var i = 1; i < this.m_pwl.getPoints().length - 1; i++) {
                    this.m_pwl.getPoints()[i].y = a * this.m_pwl.getPoints()[i].x + b; 
                }
            
                this.addPWLToStage();
            }
            handleLoadFromFile(e: createjs.MouseEvent) {
                console.log("not done yet, no not yet");
                this.m_fileIO.loadPWLFromFile(this.m_pwl, this.addPWLToStage);
                
            }
            handleSaveToFile(e: createjs.MouseEvent) {
                console.log("not done yet");
                var fileIO = this.m_fileIO;
                var widget = this;
                fileIO.savePiecewiseLinearFunction(widget.m_pwl);
                $("#saveFile_div").show();
                $("#saveFile_div").show().dblclick(function () {
                    //console.log("DC filname");
                
                    var $filename = $("#filename");

                    var oldText = $filename.html();
                    $filename.html("<input type='text' value= '" + oldText + "'>");
                    $filename.children().first().focus();
                    $filename.children().first().keypress(function (e) {
                        if (e.which == 13) {
                            var newText = $(this).val();
                            console.log("new text: " + newText);
                            if (newText.length < 1) { //Must not update the text if the new text string is empty
                                $filename.html(oldText);
                                newText = oldText;
                            }
                            $filename.text(newText);

                            oldText = newText; //This is needed if the user wants to change the text multiple times without saving inbetween
                            var saveName = oldText + ".tkn";
                            console.log("saveName: " + saveName);
                            fileIO.savePiecewiseLinearFunction(widget.m_pwl);
                        }

                    });
                });
                              
            }
            handleDeleteAllPoints(e: createjs.MouseEvent) {
                console.log("not done yet");
                this.m_pwl.getPoints().splice(1, this.m_pwl.getPoints().length - 2);
                this.addPWLToStage();
            }
            handleShowAlternatives(e: createjs.MouseEvent) {
                console.log("not done yet");
            }
            update() {
                this.m_stage.update();
            }
            addValueFunctionToStage() {
                //for (var i = 1; i < this.m_valueFunction.
                alert("not imp yet");
            }
            addPWLToStage() {
                this.m_stage.removeAllChildren();
                this.setSize(this.m_width, this.m_height);
                var points: createjs.Point[] = this.m_pwl.getPoints();
                var linePieceWise = new createjs.Graphics().beginStroke("#0000ff");
                linePieceWise.moveTo(0, (this.m_pwl.m_maxValue-points[0].y) * this.m_unitY);
                for (var i = 0; i < points.length; i++) {

                    //linePieceWise.lineTo((points[i].x - points[0].x) * this.m_unitX, (this.m_pwl.m_maxValue - points[i].y) * this.m_unitY);
                    linePieceWise.lineTo(this.getStageX(i), this.getStageY(i));
                    //var point = new createjs.Shape(new createjs.Graphics().beginFill("green").drawCircle((points[i].x - points[0].x) * this.m_unitX, (this.m_pwl.m_maxValue - points[i].y) * this.m_unitY, 8));
                    
                    if (this.m_flipVertical ) {
                        if (i !== this.m_selectedPointIndex) {
                            var point = new createjs.Shape(new createjs.Graphics().beginFill("green").drawCircle(this.getStageX(this.m_pwl.getPoints().length - 1 - i), this.getStageY(this.m_pwl.getPoints().length - 1 - i), 8));
                        }
                        else {
                            var point = new createjs.Shape(new createjs.Graphics().beginFill("red").drawCircle(this.getStageX(this.m_pwl.getPoints().length - 1 - i), this.getStageY(this.m_pwl.getPoints().length - 1 - i), 6));
                        }
                    }
                    else {
                        if (i !== this.m_selectedPointIndex) {
                            var point = new createjs.Shape(new createjs.Graphics().beginFill("green").drawCircle(this.getStageX(i), this.getStageY(i), 8));
                        }
                        else {
                            var point = new createjs.Shape(new createjs.Graphics().beginFill("red").drawCircle(this.getStageX(i), this.getStageY(i), 6));
                        }
                    }
                    point.on("click", this.handleMouseDown, null, false, { clickedPointIndex: i, selectIndex: this.m_selectedPointIndex, select: this.m_selectedPoint });
                    
                    //point.addEventListener("mousedown", this.hd);
                    //point.addEventListener("mousedown", this.m_eventHandleAndData);
                    //point.on("mousedown", (e: createjs.MouseEvent) => this.handleMouseDown(e), this, false, { PosX: points[i].x, posY: points[i].y });
                    //point.on("click", this.hd; 
                    this.m_stage.addChild(point);               
                }
                this.m_stage.addChild(new createjs.Shape(linePieceWise));
                this.m_stage.update();
            }

            getStageX(p_index: number): number {
                var ret = 0;
                if (this.m_flipVertical) {
                    //ret = (this.m_pwl.getPoints()[this.m_pwl.getPoints().length - 1].x - (this.m_pwl.getPoints()[p_index].x - this.m_pwl.getPoints()[0].x)) * this.m_unitX
                    var t = this.m_pwl.getPoints()[this.m_pwl.getPoints().length - 1 - p_index].x;
                    var t2 = this.m_pwl.getPoints()[this.m_pwl.getPoints().length - 1].x
                    ret = (-this.m_pwl.getPoints()[this.m_pwl.getPoints().length - 1 - p_index].x + this.m_pwl.getPoints()[this.m_pwl.getPoints().length - 1].x) * this.m_unitX
                }
                else {
                    ret = (this.m_pwl.getPoints()[p_index].x - this.m_pwl.getPoints()[0].x) * this.m_unitX
                }
                return ret;
            }
            getStageY(p_index: number): number {
                var ret = 0;
                if (this.m_flipHorizontal) {
                    if (this.m_flipVertical) {
                        var t = this.m_pwl.getPoints().length - 1 - p_index
                        ret = this.m_pwl.getPoints()[this.m_pwl.getPoints().length - 1 - p_index].y * this.m_unitY;
                    }
                    else {
                        ret = this.m_pwl.getPoints()[p_index].y * this.m_unitY;
                    }
                }
                else {
                    if (this.m_flipVertical) {
                        ret = (this.m_pwl.m_maxValue - this.m_pwl.getPoints()[this.m_pwl.getPoints().length - 1 - p_index].y) * this.m_unitY;
                    }
                    else {
                        ret = (this.m_pwl.m_maxValue - this.m_pwl.getPoints()[p_index].y) * this.m_unitY;
                    }
                }
                return ret;
            }


            
            
        }
    }
}