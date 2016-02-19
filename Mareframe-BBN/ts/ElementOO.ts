
module Mareframe {
    export module DST {
        export interface ElementOO {
            m_id: string;
            m_name: string;
            m_description: string;
            m_userDescription: string;
            m_updated: boolean;
            m_easelElmt: createjs.Container;
        }

        export interface ElementOOMca extends ElementOO {

        }
        export interface ElementOOBbn extends ElementOO {
            m_minitableEaselElmt: createjs.Container;
        }
        export interface ElementOOMcaAttribute extends ElementOOMca {

        }
        export interface ElementOOMcaObjective extends ElementOOMca {

        }
        export interface ElementOOMcaAlternative extends ElementOOMca {

        }
        export interface ElementOOMcaGoal extends ElementOOMca {

        }

    }

    
}
