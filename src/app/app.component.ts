import {Component, OnInit} from '@angular/core';
import cytoscape, {CollectionReturnValue, Core, ElementDefinition} from 'cytoscape';
import cise from 'cytoscape-cise';
import {LayoutService} from './layout/layout.service';
import {edgeStyle, nodeStyle, StylingService} from './styling/styling.service';

const isNodeSelected = (target: any, cy: Core) => target !== cy && !target.isEdge();
const findNode = (route: string) => e => e.data().id.toUpperCase().includes(route.toUpperCase());
const getAllFileNames = (elements: ElementDefinition[]) => [...new Set(elements.map((e) => e.data.file))].sort().concat('All files');
const isElementPartOfAppliedFilter = (element: ElementDefinition, filter: string) => filter === 'All files' ? true : element.data.file === filter;
const isActualNode = e => !e.data.hasOwnProperty('source') && !e.data.hasOwnProperty('target');
const getAllFilteredElementDefinitions = (data, filter: string) => data.filter(e => isElementPartOfAppliedFilter(e, filter));
const getAllFilteredNodes = (data, filter) => getAllFilteredElementDefinitions(data, filter).filter(isActualNode);

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    allFilenamesContainingRoutes = [];
    isClusteredViaPackages = false;

    private cy: Core;
    private filter = '';
    private data: ElementDefinition[];

    constructor(private readonly stylingService: StylingService,
                private readonly layoutService: LayoutService,
    ) {
    }

    ngOnInit(): void {
        cytoscape.use(cise);

        fetch('assets/data.json')
            .then(response => response.json())
            .then((data: ElementDefinition[]) => {
                this.data = data;
                this.allFilenamesContainingRoutes = getAllFileNames(data);
                this.filter = this.allFilenamesContainingRoutes[0];
            })
            .then(() => this.initializeCytoscape())
            .catch((r) => console.error(r, '\n\nInitialization of camel-net failed. \nPlease follow the guide on \n\nhttps://github.com/BenjaminBrandmeier/camel-net'));
    }

    private initializeCytoscape(): void {
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: getAllFilteredElementDefinitions(this.data, this.filter),
            style: [nodeStyle, edgeStyle],
            layout: this.layoutService.getDefaultLayout(getAllFilteredNodes(this.data, this.filter), this.isClusteredViaPackages),
        });
        this.cy.bind('click', this.onGraphElementClick(this.cy));
        this.cy.bind('tap', this.onGraphElementClick(this.cy));
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

    onFilterChange(value: string): void {
        this.filter = value;
        this.initializeCytoscape();
    }

    changePackageCluster(): void {
        this.isClusteredViaPackages = !this.isClusteredViaPackages;
        this.initializeCytoscape();
    }

    private allElements = (): CollectionReturnValue => this.cy.elements();
}
