/// <reference path = "declarations/math.min.d.ts"/>

module Mareframe {
    export module DST {
        export class Handler {
            private m_modelArr: Model[]=[];
            private m_activeModel: Model;
            private m_fileHandler: FileIO;
            private m_gui: GUIHandler;
            constructor() {
                
                this.m_fileHandler = new FileIO();
                console.log(this);
                this.m_activeModel = this.addNewModel();
                this.m_gui = new GUIHandler(this.m_activeModel);

                console.log("handler started");
                var loadModel: string = Tools.getUrlParameter('model');
                loadModel = "scotland";
                if (loadModel !== null) {
                    this.m_fileHandler.loadModel(loadModel, this.m_activeModel, this.m_gui.importStage);
                    
                } else {
                    this.m_gui.m_editorMode = true;
                }


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
                bbnMode = true;
                var mdl = new Model(bbnMode);
                this.setActiveModel(mdl);
                //this.getGUI().clear();
                return mdl;
            }
            setActiveModel(p_mdl: Model): void {
                this.m_activeModel = p_mdl;
            }
        }
    }
}