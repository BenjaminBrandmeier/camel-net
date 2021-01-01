import {Component, OnInit} from '@angular/core';
import cytoscape, {CollectionReturnValue, Core, ElementDefinition} from 'cytoscape';
import cise from 'cytoscape-cise';
import {ciseLayout} from './layouts';
import {edgeStyle, nodeStyle, StylingService} from './styling.service';

const isNodeSelected = (target: any, cy: Core) => target !== cy && !target.isEdge();
const findNode = (route: string) => e => e.data().id.toUpperCase().includes(route.toUpperCase());

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(private readonly stylingService: StylingService,
    ) {
    }

    private cy: Core;

    ngOnInit(): void {
        cytoscape.use(cise);

        fetch('assets/data.json')
            .then(response => response.json())
            .then((data: ElementDefinition[]) => this.initializeCytoscape(data))
            .catch((r) => console.error(r, 'Initialization of camel-net failed. Please follow the guide on https://github.com/BenjaminBrandmeier/camel-net'));
    }

    onSearchRouteClick(route: string): boolean {
        const searchResult = this.allElements().filter(findNode(route));

        if (searchResult.length > 1) {
            alert('Found more than one:\n' + searchResult.map(e => e.data().id).join('\n'));
        } else if (searchResult.length === 0) {
            alert(`Route ${route} not found`);
        } else {
            this.stylingService.colorDependencyPath(searchResult[0], this.allElements());
        }
        return false; // return false to suppress page refresh
    }

    private initializeCytoscape(data: ElementDefinition[]): void {
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: data,
            style: [nodeStyle, edgeStyle],
            layout: ciseLayout,
        });
        this.cy.bind('click', this.onGraphElementClick(this.cy));
    }

    private onGraphElementClick(cy: Core): (event) => void {
        return (event) => {
            this.allElements().forEach(e => this.stylingService.colorElement(e, 'grey'));
            const target = event.target;
            if (isNodeSelected(target, cy)) {
                this.stylingService.colorDependencyPath(target, this.allElements());
            }
        };
    }

    private allElements = (): CollectionReturnValue => this.cy.elements();
}
