/// <reference path="declarations\jquery.d.ts"/>
var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var FileIO = (function () {
            function FileIO(p_handler) {
                this.m_lastPath = "";
                this.m_handler = p_handler;
                this.quickLoad = this.quickLoad.bind(this);
            }
            FileIO.prototype.saveModel = function (p_model) {
                // encode the data into base64
                var base64 = window.btoa(p_model.saveModel());
                // create an a tag
                var a = document.createElement('a');
                a.href = 'data:application/octet-stream;base64,' + base64;
                a.innerHTML = 'Download';
                // add to the body
                document.body.appendChild(a);
            };
            FileIO.prototype.quickSave = function (p_model) {
                var json = JSON.stringify(p_model);
                localStorage.setItem(p_model.getIdent(), json);
            };
            FileIO.prototype.quickLoad = function () {
                var modelIdent = this.m_handler.m_activeModel.getIdent();
                var jsonMdl = JSON.parse(localStorage.getItem(modelIdent));
                if (jsonMdl) {
                    return jsonMdl;
                }
                else {
                    return null;
                }
            };
            FileIO.prototype.loadModel = function (p_modelStringIdent, p_activeModelInstance, p_updateGui) {
                console.log("attempting to load " + p_modelStringIdent);
                var path = "JSON/";
                if (p_activeModelInstance.m_bbnMode) {
                    path += "BBN/";
                }
                else {
                    path += "MCA/";
                }
                switch (p_modelStringIdent) {
                    case "baltic":
                        path += "baltic.json";
                        break;
                    case "blackSea":
                        path += "blackSea.json";
                        break;
                    case "cadiz":
                        path += "cadiz.json";
                        break;
                    case "iceland":
                        path += "iceland.json";
                        break;
                    case "northSea":
                        path += "northSea.json";
                        break;
                    case "scotland":
                        path += "scotland.json";
                        break;
                    case "sicily":
                        path += "sicily.json";
                        break;
                    default:
                        break;
                }
                console.log("resulting path is: " + path);
                jQuery.getJSON(path, function (data) {
                    p_activeModelInstance.fromJSON(data);
                    p_updateGui();
                });
            };
            return FileIO;
        })();
        DST.FileIO = FileIO;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=FileIO.js.map