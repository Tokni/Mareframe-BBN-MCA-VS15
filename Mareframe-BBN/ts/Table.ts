module Mareframe {
    export module DST {
        export class Table {
            private headers: String[] = [];
            private mainValues: String[] = [];
            private data: number[][] = []; 

            constructor(p_headers: String[], p_mainValues: String[], p_data: number[][]) {
                this.headers = p_headers;
                this.mainValues = p_mainValues;
                this.data = p_data;
            }

            //Multiplies two matrices
            private multiply(p_table: Table): number[][] {
                return math.multiply(this.data, p_table.data);
            }
        }
    }
}