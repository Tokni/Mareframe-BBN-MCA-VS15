/// <reference path = "Declarations/math.min.d.ts"/>
/// <reference path = "Declarations/easeljs.d.ts" />
/// <reference path = "Declarations/createjs-lib.d.ts" />
/// <reference path="declarations/jquery.d.ts"/>



module Mareframe {
    export module DST {
        export class Handler {
            private m_modelArr: Model[]=[];
            private m_activeModel: Model;
            private m_fileHandler: FileIO;
            private m_gui: GUIHandler;
            private m_resetModel: String;
            private m_mareframeMode: Boolean;
            constructor() {
                console.log("handler started");
                this.m_mareframeMode = false;  //This sets the layout to Tokni mode
                

                

                this.m_fileHandler = new FileIO();
                this.m_activeModel = this.addNewModel();
                this.m_gui = new GUIHandler(this.m_activeModel,this);

                
                var loadModel: string = Tools.getUrlParameter('model');
                if (this.m_mareframeMode) {
                    //loadModel = "scotland";
                //loadModel = "sicily";
                    //loadModel = "baltic";
                //loadModel = "northSea";
                //loadModel = "blackSea";
                //loadModel = "iceland";
                //loadModel = "cadiz";
                //loadModel = "test";
                }
                else {//Tokni mode
                    //loadModel = "resturant";
                    //loadModel = "happiness";
                    //loadModel = "investment";
                }

                //console.log("using model: " + loadModel);
                if (loadModel != null) {
                    this.m_fileHandler.loadModel(loadModel, this.m_activeModel, this.m_gui.importStage);
                    var tmp = this.m_activeModel.getMainObjective();
                    if (this.m_activeModel.getMainObjective() != undefined) {
                        this.m_gui.setHasGoal(true);
                    }
                    //console.log("model loaded")
                    this.m_resetModel = JSON.stringify(this.m_activeModel);
                    //console.log("reset model: " + this.m_resetModel);
                } else {
                    this.m_gui.setEditorMode(true);
                }
            }
            getResetModel(): String {
                return this.m_resetModel;
            }
            setResetModel(p_modelString: String): void {
                this.m_resetModel = p_modelString;
            }
            getGUI(): GUIHandler {
                return this.m_gui;
            }
            setGUI(p_gui: GUIHandler): void {
                this.m_gui = p_gui
            }
            getFileIO(): FileIO {
                return this.m_fileHandler;
            }
            addNewModel(): Model {
                var bbnMode = (Tools.getUrlParameter('bbn') == "true");
                //bbnMode = true;
                //bbnMode = false;
                var mdl = new Model(bbnMode);
                console.log("BBN mode is: " + mdl.m_bbnMode);
                this.setActiveModel(mdl);
                return mdl;
            }
            setActiveModel(p_mdl: Model): void {
                this.m_activeModel = p_mdl;
            }
            //sdfghj
            getActiveModel(): Model {
                return this.m_activeModel;
            }
            isMareframMode(): Boolean {
                return this.m_mareframeMode;
            }
        }
    }
}