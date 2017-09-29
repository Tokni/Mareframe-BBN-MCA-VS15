var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var FileIO = (function () {
            function FileIO(p_handler) {
                this.m_lastPath = "";
                this.m_handler = p_handler;
                this.reset = this.reset.bind(this);
            }
            FileIO.prototype.saveModel = function (p_model) {
                console.log("generating download link");
                // encode the data into base64
                var datastream = p_model.saveModel();
                var base64 = window.btoa(datastream);
                // create an a tag
                var a = $("#downloadLink").get(0);
                a.href = 'data:application/octet-stream;base64,' + base64;
                a.download = "model.xdsl";
                a.innerHTML = 'Download';
            };
            FileIO.prototype.loadfromGenie = function (p_activeModelInstance, p_updateGui) {
                var win = window;
                // Check for the various File API support.
                if (win.File && win.FileReader && win.FileList && win.Blob) {
                    // Great success! All the File APIs are supported.
                    var fileInputObj = $("#lodDcmt").get(0);
                    var loadedFile = fileInputObj.files[0];
                    ////console.log(loadedFile);
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            ////console.log(e.target.result);
                            var file = e.target.result;
                            var connCounter = 1;
                            var JSONObj = { elements: [], connections: [], mdlName: "", dataMat: [], mdlIdent: "", mdlDesc: "" };
                            var xml = $($.parseXML(file)), $title = xml.find("smile"), $nodes = xml.find("nodes"), $extensions = xml.find("genie");
                            //console.log($nodes[0].childNodes);
                            JSONObj.mdlIdent = $title[0].id;
                            JSONObj.mdlName = $extensions[0].attributes["name"].nodeValue;
                            for (var i = 0; i < $nodes[0].childNodes.length; i++) {
                                if ($nodes[0].childNodes[i].nodeName != "#text") {
                                    var node = $($nodes[0].childNodes)[i];
                                    ////console.log(node.childNodes);
                                    var elmt = { posX: 0, posY: 0, elmtID: "", elmtName: "", elmtDesc: "", elmtType: 0, elmtData: [] };
                                    elmt.elmtID = "elmt" + node.id;
                                    var extensionNode = $($extensions.find("#" + node.id)[0]);
                                    //console.log(extensionNode);
                                    //console.log(extensionNode.find("name")[0].innerHTML);
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
                                        //case "superValue":
                                        case "mau":
                                            elmt.elmtType = 3;
                                            break;
                                        default:
                                            alert("file contains unsupported node types");
                                    }
                                    for (var j = 0; j < node.children.length; j++) {
                                        var subnode = $(node.children)[j];
                                        ////console.log($(node.children));
                                        switch (subnode.nodeName) {
                                            case "parents":
                                                var parentsList = subnode.innerHTML.split(" ");
                                                for (var k = 0; k < parentsList.length; k++) {
                                                    var conn = { connInput: "", connOutput: "", connID: "" };
                                                    conn.connID = "conn" + connCounter;
                                                    connCounter++;
                                                    conn.connInput = "elmt" + parentsList[k];
                                                    conn.connOutput = elmt.elmtID;
                                                    JSONObj.connections.unshift(conn);
                                                    if (elmt.elmtType == 3) {
                                                        elmt.elmtData[k] = [];
                                                        elmt.elmtData[k].push(parentsList[k]);
                                                    }
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
                                                    ////console.log(elmt.elmtData);
                                                    elmt.elmtData[m].push(probData[l]);
                                                }
                                                ////console.log(probData);
                                                break;
                                            case "weights":
                                                var weightData = subnode.innerHTML.split(" ");
                                                for (var o = 0; o < weightData.length; o++) {
                                                    weightData[o] = parseFloat(weightData[o]);
                                                }
                                                for (var l = 0, m = 0; l < weightData.length; l++, m++) {
                                                    if (m == elmt.elmtData.length) {
                                                        m = 0;
                                                    }
                                                    elmt.elmtData[l].push(weightData[l]);
                                                }
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
                            //    //console.log(part);
                            console.log(JSON.stringify(JSONObj));
                            //    currentStartIndex = indexOfSmileClose;
                            //}
                            p_activeModelInstance.fromJSON(JSONObj, true);
                            p_activeModelInstance.initialize();
                            p_updateGui();
                        };
                    })(loadedFile);
                    fileInputObj.val = '';
                    console.log("loadfile " + loadedFile);
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
            FileIO.prototype.reset = function () {
                var modelIdent = this.m_handler.getActiveModel().getIdent();
                console.log("in local storage: " + localStorage.getItem(this.m_handler.getActiveModel().getIdent()));
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
                    case "testcase":
                        path += "BalticSea3.json";
                        break;
                    case "baltic_a":
                        path += "BalticSea_stkhld_A.json";
                        break;
                    case "baltic_b":
                        path += "BalticSea_stkhld_B.json";
                        break;
                    case "baltic_c":
                        path += "BalticSea_stkhld_C.json";
                        break;
                    default:
                        console.log("NO such file exists!");
                        break;
                }
                console.log("resulting path is: " + path);
                jQuery.getJSON(path, function (data) {
                    //console.log(JSON.stringify(data));
                    p_activeModelInstance.fromJSON(data, true);
                    p_activeModelInstance.initialize();
                    p_updateGui();
                });
            };
            return FileIO;
        }());
        DST.FileIO = FileIO;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=FileIO.js.map