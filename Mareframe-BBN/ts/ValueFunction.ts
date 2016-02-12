module Mareframe {
    export module DST {
        export abstract class ValueFunction {
            abstract getValue(p_x: number): number;
            abstract flipVertical();
            abstract flipHorizontally();
            abstract linearize();

        }

        export class PiecewiseLinear extends ValueFunction {
            //from ValueFunction
            getValue(p_x: number): number {
                var ret = 0;
                var i = 0;
                var firstIndex = 0;
                var secondIndex = 0;
                // checks whether p_x is between startPoint and endPoint
                if (p_x >= this.m_startPoint.x && p_x <= this.m_endPoint.x) {
                    // finds what interval p_x is in
                    while (i < this.m_middlepoints.length - 1) {
                        ////var tmp1 = this.m_middlepoints[i + 1].x;
                        ////var tmp2 = this.m_middlepoints[i].x;
                        ////var tmp3 = p_x <= this.m_middlepoints[i + 1].x;
                        ////var tmp4 = p_x >= this.m_middlepoints[i].x;
                        ////var tmp5 = this.m_middlepoints[i + 1].x;
                        ////var tmp6 = this.m_middlepoints[i].x;
                        if (p_x <= this.m_middlepoints[i + 1].x && p_x >= this.m_middlepoints[i].x) {
                            firstIndex = i;
                            secondIndex = i + 1;
                        }
                        i++;
                    }
                    this.m_middlepoints[firstIndex]; // x1, y1
                    this.m_middlepoints[secondIndex]; // x2,y2                    
                    //var a = (y2-y1)//x2-x1)
                    // ret = a*p_x+y1-a*x1
                    ret = (this.m_middlepoints[secondIndex].y - this.m_middlepoints[firstIndex].y) / (this.m_middlepoints[secondIndex].x - this.m_middlepoints[firstIndex].x) * p_x + this.m_middlepoints[firstIndex].y - (this.m_middlepoints[secondIndex].y - this.m_middlepoints[firstIndex].y) / (this.m_middlepoints[secondIndex].x - this.m_middlepoints[firstIndex].x) * this.m_middlepoints[firstIndex].x;
                }
                else {
                    ret = null;
                }
                return ret;
            }
            //from ValueFunction
            flipVertical() {
                alert("Not Implemenrted");
            }
            //from ValueFunction
            flipHorizontally() {
                alert("Not Implemenrted");
            }
            //from ValueFunction
            linearize() {
                alert("Not Implemenrted");
            }

            constructor(p_startX: number, p_startY: number, p_endX: number, p_endY: number, p_minValue: number, p_maxValue: number) {
                super();
                this.addPoint(p_startX, p_startY);
                this.addPoint(p_endX, p_endY);
                if (p_minValue !== undefined) {
                    this.m_minValue = p_minValue;
                }
                if (p_maxValue !== undefined) {
                    this.m_maxValue = p_maxValue;
                }
            }

            //member variables
            m_maxValue: number = 100;
            m_minValue: number = 100;
            m_middlepoints: createjs.Point[] = [];
            m_startPoint: createjs.Point;
            m_endPoint: createjs.Point;

            //methods
            setStartPoint(p_x, p_y) {
                this.m_startPoint.setValues(p_x, p_y);
            }
            getStartPoint() {
                return this.m_startPoint;
            };
            setEndPoint = function (p_x, p_y) {
                this.m_endPoint.setValues(p_x, p_y);
            };
            getEndPoint () {
                return this.m_endPoint;
            };
            addPoint(p_x, p_y) {
                if (this.m_middlepoints.length) {
                    //checks if there already is a point with same x-value
                    for (var i in this.m_middlepoints) {
                        if (p_x === this.m_middlepoints[i].x) {
                            this.m_middlepoints[i].setValues(p_x, p_y);
                            break;
                        }
                    }
                    if (i == this.m_middlepoints.length - 1) {
                        this.m_middlepoints.push(new createjs.Point(p_x, p_y));
                    }
                }
                else {
                    this.m_middlepoints.push(new createjs.Point(p_x, p_y));
                }
            };
            removePointAtIndex(p_index) {
                this.m_middlepoints.splice(p_index, 1);
            };
            removePoint(p_point) {
                alert("not Implemented");
            };
            sortPointsByX() {
                var index = 0;
                var tmp = this.m_middlepoints.slice();
                //selection sort
                while (tmp.length) {
                    var minIndex = tmp.length - 1;
                    for (var p in tmp) {
                        if (tmp[p].x < tmp[minIndex].x)
                            minIndex = p;
                    }
                    this.m_middlepoints[index++] = tmp[minIndex];
                    tmp.splice(minIndex, 1);
                }
                this.m_startPoint = this.m_middlepoints[0];
                this.m_endPoint = this.m_middlepoints[this.m_middlepoints.length - 1];
            }
            toJSON(): any {
                return { points: this.m_middlepoints };
            }
            fromJSON(p_JSONObject: any) {
                this.m_middlepoints = p_JSONObject.points;
            }

            getPoints(): createjs.Point[] {
                return this.m_middlepoints;
            }
            savePWL(): string {
                var datastream = JSON.stringify(this);
                console.log("ValueFunction Stream: " + datastream);
                return datastream;;
            }
        
    
        }

    }
}