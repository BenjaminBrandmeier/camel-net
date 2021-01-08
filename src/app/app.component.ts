import {Component, HostListener, OnInit} from '@angular/core';
import cytoscape, {CollectionReturnValue, Core, ElementDefinition} from 'cytoscape';
import cise from 'cytoscape-cise';
import {LayoutService} from './layout/layout.service';
import {edgeStyle, nodeStyle, StylingService} from './styling/styling.service';

const ALL_FILES = 'All files (clustered)';
const isNodeSelected = (target: any, cy: Core) => target !== cy && !target.isEdge();
const findNodeLazy = (route: string) => e => e.data().id.toUpperCase().includes(route.toUpperCase());
const findDataNodeStrict = (route: string) => e => e.data.id.toUpperCase() === route.toUpperCase();
const findDataNodeLazy = (route: string) => e => e.data.id.toUpperCase().includes(route.toUpperCase());
const getAllFileNames = (elements: ElementDefinition[]) => [...new Set(elements.map((e) => e.data.file))].sort().concat(ALL_FILES);
const isElementPartOfAppliedFilter = (element: ElementDefinition, filter: string) => filter === ALL_FILES ? true : element.data.file === filter;
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
    fileFilter = undefined;
    searchText = '';

    private cy: Core;
    private data: ElementDefinition[];
    private originalData;
    private focusedNode = null;

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
                this.originalData = data;
                this.allFilenamesContainingRoutes = getAllFileNames(data);
                this.fileFilter = this.fileFilter ?? this.allFilenamesContainingRoutes[0];
            })
            .then(() => this.initializeCytoscape())
            .catch((r) => console.error(r, '\n\nInitialization of camel-net failed. \nPlease follow the guide on \n\nhttps://github.com/BenjaminBrandmeier/camel-net'));
    }

    private initializeCytoscape(useFancyLayout = true): void {
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: getAllFilteredElementDefinitions(this.data, this.fileFilter),
            style: [nodeStyle, edgeStyle],
            layout: useFancyLayout ? this.getFancyLayout() : 'grid',
        });
        this.cy.bind('click', this.onGraphElementClick(this.cy));
        this.cy.bind('tap', this.onGraphElementClick(this.cy));
    }

    private getFancyLayout = () => this.layoutService.getDefaultLayout(getAllFilteredNodes(this.data, this.fileFilter), this.isPackageClusteringActive());
    private isPackageClusteringActive = (): boolean => this.fileFilter === ALL_FILES && this.searchText === '';

    private onGraphElementClick(cy: Core): (event) => void {
        return (event) => {
            this.allElements().forEach(e => this.stylingService.colorElement(e, 'grey'));
            this.focusedNode = null;
            const target = event.target;
            if (isNodeSelected(target, cy)) {
                this.focusedNode = target;
                this.stylingService.colorDependencyPath(target, this.allElements());
            }
        };
    }

    onSearchRouteClick(): boolean {
        let searchResult = this.originalData.filter(findDataNodeStrict(this.searchText));
        searchResult = searchResult.length === 0 ? this.originalData.filter(findDataNodeLazy(this.searchText)) : searchResult;
        const uniqueResults = [...new Set(searchResult.map(s => s.data.id))];

        if (uniqueResults.length > 1) {
            alert('Found more than one:\n' + uniqueResults.join('\n'));
        } else if (uniqueResults.length === 0) {
            alert(`Route ${this.searchText} not found`);
        } else {
            this.preRender();
            this.renderFoundDependencyGraphOnly();
        }
        return false; // return false to suppress page refresh
    }

    private preRender(): void {
        this.fileFilter = ALL_FILES;
        this.data = this.originalData;
        this.initializeCytoscape(false);
    }

    private renderFoundDependencyGraphOnly(): void {
        const foundNode: any = this.allElements().filter(findNodeLazy(this.searchText));
        const entirePathOfFoundNode = [...foundNode.predecessors(), ...foundNode.successors(), foundNode].map(d => d.data());
        this.data = this.originalData.filter(e => entirePathOfFoundNode.includes(e.data));
        this.initializeCytoscape();
        this.stylingService.colorDependencyPath(this.allElements().filter(findNodeLazy(this.searchText)), this.allElements());
    }

    onFilterChange(value: string): void {
        this.searchText = '';
        this.fileFilter = value;
        this.ngOnInit();
    }

    private allElements = (): CollectionReturnValue => this.cy.elements();

    @HostListener('window:keydown', ['$event'])
    onKeydown($event: KeyboardEvent): void {
        switch ($event?.key) {
            case 'Delete':
                this.focusedNode?.remove();
                break;
            case 'Enter':
                this.onSearchRouteClick();
                break;
        }
    }
}
