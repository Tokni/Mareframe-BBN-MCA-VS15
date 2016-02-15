/// <reference path = "Declarations/math.min.d.ts"/>
/// <reference path = "Declarations/easeljs.d.ts" />
/// <reference path = "Declarations/createjs-lib.d.ts" />
/// <reference path="declarations/jquery.d.ts"/>
var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var Handler = (function () {
            function Handler() {
                this.m_modelArr = [];
                console.log("handler started");
                this.m_mareframeMode = false; //This sets the layout to Tokni mode
                this.m_fileHandler = new DST.FileIO();
                this.m_activeModel = this.addNewModel();
                this.m_gui = new DST.GUIHandler(this.m_activeModel, this);
                var loadModel = DST.Tools.getUrlParameter('model');
                if (this.m_mareframeMode) {
                }
                else {
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
                }
                else {
                    this.m_gui.setEditorMode(true);
                }
            }
            Handler.prototype.getResetModel = function () {
                return this.m_resetModel;
            };
            Handler.prototype.setResetModel = function (p_modelString) {
                this.m_resetModel = p_modelString;
            };
            Handler.prototype.getGUI = function () {
                return this.m_gui;
            };
            Handler.prototype.setGUI = function (p_gui) {
                this.m_gui = p_gui;
            };
            Handler.prototype.getFileIO = function () {
                return this.m_fileHandler;
            };
            Handler.prototype.addNewModel = function () {
                var bbnMode = (DST.Tools.getUrlParameter('bbn') == "true");
                //bbnMode = true;
                //bbnMode = false;
                var mdl = new DST.Model(bbnMode);
                console.log("BBN mode is: " + mdl.m_bbnMode);
                this.setActiveModel(mdl);
                return mdl;
            };
            Handler.prototype.setActiveModel = function (p_mdl) {
                this.m_activeModel = p_mdl;
            };
            //sdfghj
            Handler.prototype.getActiveModel = function () {
                return this.m_activeModel;
            };
            Handler.prototype.isMareframMode = function () {
                return this.m_mareframeMode;
            };
            return Handler;
        })();
        DST.Handler = Handler;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Handler.js.map