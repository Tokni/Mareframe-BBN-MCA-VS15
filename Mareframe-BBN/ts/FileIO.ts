/// <reference path="declarations\jquery.d.ts"/>
module Mareframe {
    export module DST {
        export class FileIO {

            private m_handler: Handler;
            private m_lastPath: string = "";

            constructor(p_handler: Handler) {
                this.m_handler = p_handler;

                this.quickLoad = this.quickLoad.bind(this);
            }
            saveModel(p_model: Model): void {

                // encode the data into base64
                var base64: string = window.btoa(p_model.saveModel());
                

                // create an a tag
                var a = document.createElement('a');
                a.href = 'data:application/octet-stream;base64,' + base64;
                a.innerHTML = 'Download';

                // add to the body
                document.body.appendChild(a);

            }
            quickSave(p_model: Model): void {
                var json: string = JSON.stringify(p_model);
                localStorage.setItem(p_model.getIdent(), json);
            }
            quickLoad(): any {

                var modelIdent: string = this.m_handler.m_activeModel.getIdent();
                var jsonMdl: any = JSON.parse(localStorage.getItem(modelIdent));
                if (jsonMdl) {
                    return jsonMdl;
                }
                else {
                    return null;
                }
            }
            loadModel(p_modelStringIdent: string, p_activeModelInstance: Model, p_updateGui: Function): any {
                console.log("attempting to load " + p_modelStringIdent);
                var path: string = "JSON/";
                if (p_activeModelInstance.m_bbnMode) {
                    path += "BBN/";
                } else {
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

            }
        }
    }
}