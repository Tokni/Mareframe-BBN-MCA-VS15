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
                //var table1conn: any[][] = [
                //    ["name1", "Monkey", "Tiger"],
                //    ["True", 0.2, 0.4],
                //    ["false", 0.7, 0.4],
                //    ["ups", 0.1, 0.2]
                //];
                //var table3conn: any[][] = [
                //    ["name1", "true", "true", "true", "true", "true", "true", "true", "true", "true", "true", "true", "true", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false", "false"],
                //    ["name2", "Monkey", "Monkey", "Monkey", "Snake", "Snake", "Snake", "Crane", "Crane", "Crane", "Tiger", "Tiger", "Tiger", "Monkey", "Monkey", "Monkey", "Snake", "Snake", "Snake", "Crane", "Crane", "Crane", "Tiger", "Tiger", "Tiger"],
                //    ["name3", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low", "high", "medium", "low"],
                //    ["On", 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15 ,0.1, 0.05],
                //    ["Off", 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4,0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]
                //];
                this.m_modelArr = [];
                ////var 
                //var tableDims: number[] = [2,4,3];
                //Tools.removeHeaderRow("name3", table3conn);
                //Tools.removeHeaderRow("name1", table1conn);
                console.log("handler started");
                this.m_mareframeMode = true; //False sets the layout to Tokni mode
                this.m_fileHandler = new DST.FileIO(this);
                this.m_activeModel = this.addNewModel();
                this.m_gui = new DST.GUIHandler(this.m_activeModel, this);
                var loadModel = DST.Tools.getUrlParameter('model');
                if (this.m_mareframeMode) {
                }
                else {
                    //loadModel = "resturant";
                    //loadModel = "happiness";
                    loadModel = "investment";
                }
                console.log("using model: " + loadModel);
                if (loadModel !== null) {
                    this.m_fileHandler.loadModel(loadModel, this.m_activeModel, this.m_gui.importStage);
                    console.log("model loaded");
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
                bbnMode = true;
                //bbnMode = false;
                var mdl = new DST.Model(bbnMode);
                console.log("BBN mode is: " + mdl.m_bbnMode);
                this.setActiveModel(mdl);
                return mdl;
            };
            Handler.prototype.setActiveModel = function (p_mdl) {
                this.m_activeModel = p_mdl;
            };
            Handler.prototype.getActiveModel = function () {
                return this.m_activeModel;
            };
            Handler.prototype.isMareframMode = function () {
                return this.m_mareframeMode;
            };
            return Handler;
        }());
        DST.Handler = Handler;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Handler.js.map