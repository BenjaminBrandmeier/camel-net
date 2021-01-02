import {Injectable} from '@angular/core';
import {CollectionReturnValue, SingularElementReturnValue} from 'cytoscape';

@Injectable({
    providedIn: 'root',
})
export class StylingService {
    constructor() {
    }

    colorElement(element: SingularElementReturnValue, color: string): void {
        element.style('background-color', color);
        element.style('line-color', color);
        element.style('target-arrow-color', color);
        element.style('color', color);
    }

    colorDependencyPath(target: SingularElementReturnValue, allElements: CollectionReturnValue): void {
        allElements.forEach(e => this.colorElement(e, 'white'));
        this.colorElement(target, 'black');

        target.predecessors().forEach(e => this.colorElement(e, 'green'));
        target.successors().forEach(e => this.colorElement(e, 'red'));
    }
}

export const edgeStyle = {
    selector: 'edge',
    style: {
        'width': 3,
        'line-color': 'grey',
        'target-arrow-color': 'grey',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
    }
};

export const nodeStyle = {
    selector: 'node',
    style: {
        'background-color': 'grey',
        'color': 'grey',
        'label': 'data(id)',
        'font-size': 16,
    }
};
