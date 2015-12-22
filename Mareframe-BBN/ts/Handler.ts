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
            constructor() {
                var table1conn: any[][] = [
                    ["name1", "Monkey", "Tiger"],
                    ["True", 0.2, 0.4],
                    ["false", 0.7, 0.4],
                    ["ups", 0.1, 0.2]
                ];
                var table3conn: any[][] = [
                    ["name1", "true", "true", "true", "true", "true", "true", "true", "true", "true", "true", "true", "true", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
                    ["name2", "Monkey", "Monkey", "Monkey", "Snake", "Snake", "Snake", "Crane", "Crane", "Crane", "Tiger", "Tiger", "Tiger", "Monkey", "Monkey", "Monkey", "Snake", "Snake", "Snake", "Crane", "Crane", "Crane", "Tiger", "Tiger", "Tiger"],
                    ["name3", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low"],
                    ["On", 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15 ,0.1, 0.05],
                    ["Off", 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4,0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]
                ];

                //var 
                var tableDims: number[] = [2,4,3];
                Tools.removeHeaderRow("name3", table3conn);
                Tools.removeHeaderRow("name1", table1conn);

                console.log("handler started");
                this.m_fileHandler = new FileIO(this);
                this.m_activeModel = this.addNewModel();
                this.m_gui = new GUIHandler(this.m_activeModel,this);

                
                var loadModel: string = Tools.getUrlParameter('model');
                loadModel = "scotland";
                console.log("using model: " + loadModel);
                if (loadModel !== null) {
                    this.m_fileHandler.loadModel(loadModel, this.m_activeModel, this.m_gui.importStage);
                    this.m_resetModel = JSON.stringify(this.m_activeModel);
                    console.log("reset model: " + this.m_resetModel);
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
                var mdl = new Model(bbnMode);
                //console.log("BBN mode is: " + mdl.m_bbnMode);
                this.setActiveModel(mdl);
                return mdl;
            }
            setActiveModel(p_mdl: Model): void {
                this.m_activeModel = p_mdl;
            }
            getActiveModel(): Model {
                return this.m_activeModel;
            }
        }
    }
}