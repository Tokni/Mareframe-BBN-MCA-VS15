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
                this.m_fileHandler = new DST.FileIO(this);
                this.m_activeModel = this.addNewModel();
                this.m_gui = new DST.GUIHandler(this.m_activeModel, this);
                console.log("handler started");
                var loadModel = DST.Tools.getUrlParameter('model');
                loadModel = "scotland";
                if (loadModel !== null) {
                    this.m_fileHandler.loadModel(loadModel, this.m_activeModel, this.m_gui.importStage);
                }
                else {
                    this.m_gui.m_editorMode = true;
                }
            }
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
            return Handler;
        })();
        DST.Handler = Handler;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Handler.js.map