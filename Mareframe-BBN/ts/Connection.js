var Mareframe;
(function (Mareframe) {
    var DST;
    (function (DST) {
        var Connection = (function () {
            function Connection(p_inputElmt, p_outputElmt, p_bbnMode, p_connID) {
                this.m_easelElmt = new createjs.Container();
                this.m_color = "black";
                this.m_inputElement = p_inputElmt;
                this.m_outputElement = p_outputElmt;
                if (p_connID) {
                    this.m_id = p_connID;
                }
                if (p_bbnMode && p_inputElmt.getType() === 1 && p_outputElmt.getType() === 1) {
                    this.m_color = "gray";
                }
            }
            Connection.prototype.getColor = function () {
                return this.m_color;
            };
            Connection.prototype.getID = function () {
                return this.m_id;
            };
            Connection.prototype.setID = function (p_id) {
                if (p_id.substr(0, 4) == "elmt") {
                    this.m_id = p_id;
                }
                else {
                    this.m_id = "elmt" + p_id;
                }
                return this.m_id;
            };
            Connection.prototype.getInputElement = function () {
                return this.m_inputElement;
            };
            Connection.prototype.setInputElement = function (p_inputElmt) {
                this.m_inputElement = p_inputElmt;
            };
            Connection.prototype.getOutputElement = function () {
                return this.m_outputElement;
            };
            Connection.prototype.setOutputElement = function (p_outputElmt) {
                this.m_outputElement = p_outputElmt;
            };
            Connection.prototype.flip = function () {
                var e = this.m_inputElement;
                this.m_inputElement = this.m_outputElement;
                this.m_outputElement = e;
                this.m_inputElement.deleteConnection(this.m_id);
                this.m_outputElement.addConnection(this);
            };
            Connection.prototype.toJSON = function () {
                return { connInput: this.m_inputElement.getID(), connOutput: this.m_outputElement.getID(), connID: this.m_id };
            };
            Connection.prototype.fromJSON = function (p_jsonElmt) {
                this.m_id = p_jsonElmt.connID;
            };
            return Connection;
        }());
        DST.Connection = Connection;
    })(DST = Mareframe.DST || (Mareframe.DST = {}));
})(Mareframe || (Mareframe = {}));
//# sourceMappingURL=Connection.js.map