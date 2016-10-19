var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var FileIO = (function () {
            //constructor(p_handler: Handler) {
            function FileIO() {
                //this.m_handler = p_handler;
                this.m_lastPath = "";
                this.reset = this.reset.bind(this);
            }
            FileIO.prototype.saveModel = function (p_model, p_filename) {
                ////console.log("generating download link");
                // encode the data into base64
                //var regDigit = /\d/;
                //for (var e in p_model.getElementArr()) {
                //    var tmp3 = p_model.getElementArr();
                //    var tmp = p_model.getElementArr()[e].getID().substr(0, 4);
                //    var tmp4 = p_model.getElementArr()[e].getID().substr(4, 1);
                //    var tmp5 = regDigit.test(p_model.getElementArr()[e].getID().substr(4, 1));
                //    if (p_model.getElementArr()[e].getID().substr(0, 4) === "elmt" && regDigit.test(p_model.getElementArr()[e].getID().substr(4, 1))) { 
                //        var tmp2 = p_model.getElementArr()[e].getID().substring(0, 4) + 's' + p_model.getElementArr()[e].getID().substring(4);
                //        p_model.getElementArr()[e].setID(p_model.getElementArr()[e].getID().substring(0, 4) + 's' + p_model.getElementArr()[e].getID().substring(4) );
                //    }
                //}
                var datastream = p_model.saveModel();
                //var base64: string = window.btoa(datastream);
                var savedContent = encodeURIComponent(datastream);
                // create an a tag
                var a = $("#downloadLink").get(0);
                //a.href = 'data:application/octet-stream;base64,' + base64;
                a.href = 'data:application/octet-stream,' + savedContent;
                if (p_filename == undefined) {
                    a.download = "test.xdsl";
                }
                else {
                    a.download = p_filename;
                }
                a.innerHTML = 'Download';
                //おやすみ愛するヨナタンさん
            };
            FileIO.prototype.savePiecewiseLinearFunction = function (p_pwl, p_filename) {
                var datastream = p_pwl.savePWL();
                var base64 = window.btoa(datastream);
                // create an a tag
                var a = $("#downloadLinkValueFunction").get(0);
                a.href = 'data:application/octet-stream;base64,' + base64;
                if (p_filename == undefined) {
                    a.download = "valueFn.xdsl";
                }
                else {
                    a.download = p_filename;
                }
                a.innerHTML = 'Download';
            };
            FileIO.prototype.loadfromGenie = function (p_activeModelInstance, p_updateGui) {
                ////console.log("loadFromGenie");
                var win = window;
                // Check for the various File API support.
                if (win.File && win.FileReader && win.FileList && win.Blob) {
                    // Great success! All the File APIs are supported.
                    var fileInputObj = $("#lodDcmt").get(0);
                    var loadedFile = fileInputObj.files[0];
                    //loadedFile.path 
                    //////console.log(loadedFile);
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            //////console.log(e.target.result);
                            var file = e.target.result;
                            var connCounter = 1;
                            var JSONObj = { elements: [], connections: [], mdlName: "", dataMat: [], mdlIdent: "", mdlDesc: "" };
                            var xml = $($.parseXML(file)), $title = xml.find("smile"), $nodes = xml.find("nodes"), $extensions = xml.find("genie");
                            ////console.log($nodes[0].childNodes);
                            JSONObj.mdlIdent = $title[0].id;
                            JSONObj.mdlName = $extensions[0].attributes["name"].nodeValue;
                            for (var i = 0; i < $nodes[0].childNodes.length; i++) {
                                if ($nodes[0].childNodes[i].nodeName != "#text") {
                                    var node = $($nodes[0].childNodes)[i];
                                    //////console.log(node.childNodes);
                                    var elmt = { posX: 0, posY: 0, elmtID: "", elmtName: "", elmtDesc: "", elmtType: 0, elmtData: [] };
                                    elmt.elmtID = node.id;
                                    var extensionNode = $($extensions.find("#" + node.id)[0]);
                                    ////console.log(extensionNode);
                                    ////console.log(extensionNode.find("name")[0].innerHTML);
                                    elmt.elmtName = extensionNode.find("name")[0].innerHTML;
                                    var position = extensionNode.find("position")[0].innerHTML.split(" ");
                                    elmt.posX = (parseInt(position[0]) + parseInt(position[2])) / 2;
                                    elmt.posY = (parseInt(position[1]) + parseInt(position[3])) / 2;
                                    switch (node.tagName) {
                                        case "cpt":
                                            elmt.elmtType = 0;
                                            break;
                                        case "decision":
                                            elmt.elmtType = 1;
                                            break;
                                        case "utility":
                                            elmt.elmtType = 2;
                                            break;
                                        default:
                                            alert("file contains unsupported node types");
                                    }
                                    for (var j = 0; j < node.children.length; j++) {
                                        var subnode = $(node.children)[j];
                                        //////console.log($(node.children));
                                        switch (subnode.nodeName) {
                                            case "parents":
                                                var parentsList = subnode.innerHTML.split(" ");
                                                for (var k = 0; k < parentsList.length; k++) {
                                                    var conn = { connInput: "", connOutput: "", connID: "" };
                                                    conn.connID = "conn" + connCounter;
                                                    connCounter++;
                                                    conn.connInput = parentsList[k];
                                                    conn.connOutput = elmt.elmtID;
                                                    JSONObj.connections.unshift(conn);
                                                }
                                                break;
                                            case "state":
                                                //if ($nodes[0].childNodes[i].nodeName === "decision") {
                                                elmt.elmtData.push([subnode.id]);
                                                //}
                                                break;
                                            case "utilities":
                                                var valueData = ["Value"].concat(subnode.innerHTML.split(" ")); //TODO: might need to rearrange these values
                                                for (var n = 1; n < valueData.length; n++) {
                                                    valueData[n] = parseFloat(valueData[n]);
                                                }
                                                elmt.elmtData.push(valueData);
                                                break;
                                            case "probabilities":
                                                var probData = subnode.innerHTML.split(" ");
                                                for (var o = 0; o < probData.length; o++) {
                                                    probData[o] = parseFloat(probData[o]);
                                                }
                                                for (var l = 0, m = 0; l < probData.length; l++, m++) {
                                                    if (m == elmt.elmtData.length) {
                                                        m = 0;
                                                    }
                                                    //////console.log(elmt.elmtData);
                                                    elmt.elmtData[m].push(probData[l]);
                                                }
                                                //////console.log(probData);
                                                break;
                                        }
                                    }
                                    JSONObj.elements.push(elmt);
                                }
                            }
                            //var indexOfSmileClose = file.lastIndexOf("</smile>");
                            //var currentStartIndex = file.indexOf("<smile>") + 3;
                            //JSONObj.mdlIdent = file.substring(file.indexOf('id="', currentStartIndex) + 4, file.indexOf('"', file.indexOf('id="', currentStartIndex) + 4));
                            //while (currentStartIndex < indexOfSmileClose) {
                            //    var part = file.substr(file.indexOf("<", currentStartIndex), 4);
                            //    switch (part) {
                            //        case "<dec":
                            //            break;
                            //        case "<cpt":
                            //            break;
                            //        case "<uti":
                            //            break;
                            //        default:
                            //            break;
                            //    }
                            //    ////console.log(part);
                            ////console.log(JSON.stringify(JSONObj));
                            //    currentStartIndex = indexOfSmileClose;
                            //}
                            p_activeModelInstance.fromJSON(JSONObj);
                            p_updateGui();
                        };
                    })(loadedFile);
                    fileInputObj.val = '';
                    ////console.log("loadfile " + loadedFile);
                    reader.readAsText(loadedFile);
                }
                else {
                    alert('The File APIs are not fully supported in this browser.');
                }
            };
            FileIO.prototype.quickSave = function (p_model) {
                var json = JSON.stringify(p_model);
                localStorage.setItem(p_model.getIdent(), json);
            };
            FileIO.prototype.reset = function (p_resetModel) {
                //var modelIdent: string = this.m_handler.getActiveModel().getIdent();
                if (p_resetModel) {
                    var modelIdent = p_resetModel.getIdent();
                    ////console.log("in local storage: " + localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
                    var jsonMdl = JSON.parse(localStorage.getItem(modelIdent));
                }
                if (jsonMdl) {
                    return jsonMdl;
                }
                else {
                    return null;
                }
            };
            FileIO.prototype.loadModel = function (p_modelStringIdent, p_activeModelInstance, p_updateGui) {
                ////console.log("attempting to load " + p_modelStringIdent);
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
                    case "resturant":
                        path += "ResturantExample.json";
                        break;
                    case "happiness":
                        path += "HappinessExample.json";
                        break;
                    case "investment":
                        path += "InvestmentExample.json";
                        break;
                    case "test":
                        path += "test.json";
                        break;
                    case "test1":
                        path += "test1.json";
                        break;
                    case "newCar8":
                        path += "newCar8.json";
                        break;
                    case "sfsCampaign001":
                        path += "sfsCampaign001.json";
                        break;
                    default:
                        //console.log("NO such file exists!!   " + p_modelStringIdent);
                        break;
                }
                ////console.log("resulting path is: " + path);
                jQuery.getJSON(path, function (data) {
                    ////console.log("stringyfied Json: " + JSON.stringify(data));
                    ////console.log("Pure json: " + data);
                    p_activeModelInstance.fromJSON(data);
                    p_updateGui();
                });
            };
            FileIO.prototype.loadMCAModelFromFile = function (p_activeModelInstance, p_updateGui) {
                ////console.log("Loading MCA model from file");
                var fileInputElement = $("#lodDcmt").get(0);
                fileInputElement.files[0];
                var file = fileInputElement.files[0];
                ////console.log("file: " + file);
                ////console.log("filename: " + file.name);
                var fileReader = new FileReader();
                fileReader.onload = function (p_evt) {
                    var text = fileReader.result;
                    ////console.log("loaded file: " + text);
                    var jsonObj = JSON.parse(text);
                    ////console.log("jsonObj: " + jsonObj);
                    p_activeModelInstance.fromJSON(jsonObj);
                    p_updateGui();
                };
                fileReader.readAsText(file);
                ////console.log("Result: " + fileReader.result);
            };
            FileIO.prototype.loadValueFunctionFromFile = function () {
                var ret;
                return ret;
            };
            FileIO.prototype.loadPWLFromFile = function (p_pwl, p_updateGui, p_path) {
                //var ret: PiecewiseLinear = new PiecewiseLinear(0,0,0,0,0,0);
                ////console.log("Loading MCA model from file");
                var fileInputElement = $("#loadFromFile").get(0);
                fileInputElement.files[0];
                var file = fileInputElement.files[0];
                ////console.log("file: " + file);
                ////console.log("filename: " + file.name);
                var fileReader = new FileReader();
                fileReader.onload = function (p_evt) {
                    var text = fileReader.result;
                    ////console.log("loaded file: " + text);
                    var jsonObj = JSON.parse(text);
                    ////console.log("jsonObj: " + jsonObj);
                    //ret.fromJSON(jsonObj);
                    p_pwl.fromJSON(jsonObj);
                    p_updateGui();
                };
                fileReader.readAsText(file);
                ////console.log("Result: " + fileReader.result);
                //return ret;
            };
            FileIO.prototype.saveValueFunctionToFile = function (p_vfn) {
                throw ("Not imp yet");
            };
            FileIO.prototype.importAttributesAndAlternativesFromCSV = function (p_activeModelInstance, p_updateGui) {
                var fileInputElement = $("#loadFromFile").get(0);
                fileInputElement.files[0];
                var file = fileInputElement.files[0];
                var fileReader = new FileReader();
                fileReader.onload = function (p_evt) {
                    var text = fileReader.result;
                    p_updateGui();
                };
            };
            return FileIO;
        }());
        DST.FileIO = FileIO;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=FileIO.js.map