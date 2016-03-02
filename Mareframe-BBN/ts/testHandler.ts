module Mareframe {
    export module DST {
        export class TestHandler {
            constructor() {
                var elm1: ElementOO = new ElementOOBase("hello");
                var elm2: ElementOO = new ElementOOBase("world");
                var w1 = elm1.getName();
                var w2 = elm2.getName();
                elm1.setName("newNmae");
                var w3 = elm1.getName();
                
            }
        }
    }
}
