import {Injectable} from '@angular/core';
import {ElementDefinition} from 'cytoscape';

interface NodeQualifier {
    id: string;
    preset: string;
}

@Injectable({
    providedIn: 'root',
})
export class LayoutService {

    getDefaultLayout(allElementDefinitions: ElementDefinition[], isClusteredViaPackages: boolean): any { // no typedef for cise layout yet :(
        return ciseLayout(isClusteredViaPackages ? this.createNodeClusters(allElementDefinitions) : undefined);
    }

    createNodeClusters(allElements: ElementDefinition[]): string[][] {
        const mapOfClusters: Map<string, string[]> = allElements
            .map(this.toNodesWithPackageQualifiers)
            .reduce(this.toClusters(), new Map());

        return [...mapOfClusters.values()];
    }

    private toClusters = () => (map: Map<string, string[]>, a: NodeQualifier) => map.set(a.preset, [...map.get(a.preset) || [], a.id]);

    private toNodesWithPackageQualifiers = (e: ElementDefinition): NodeQualifier => ({
        id: e.data.id,
        preset: e.data.id.substring(0, e.data.id.indexOf('.'))
    })
}

const ciseLayout = (nodeClusters: string[][]) => ({
    name: 'cise',

    // ClusterInfo can be a 2D array contaning node id's or a function that returns cluster ids.
    // For the 2D array option, the index of the array indicates the cluster ID for all elements in
    // the collection at that index. Unclustered nodes must NOT be present in this array of clusters.
    //
    // For the function, it would be given a Cytoscape node and it is expected to return a cluster id
    // corresponding to that node. Returning negative numbers, null or undefined is fine for unclustered
    // nodes.
    // e.g
    // Array:                                     OR          function(node){
    //  [ ['n1','n2','n3'],                                       ...
    //    ['n5','n6']                                         }
    //    ['n7', 'n8', 'n9', 'n10'] ]
    clusters: nodeClusters,

    // -------- Optional parameters --------
    // Whether to animate the layout
    // - true : Animate while the layout is running
    // - false : Just show the end result
    // - 'end' : Animate directly to the end result
    animate: true,

    // number of ticks per frame; higher is faster but more jerky
    refresh: 200,

    // Animation duration used for animate:'end'
    animationDuration: undefined,

    // Easing for animate:'end'
    animationEasing: undefined,

    // Whether to fit the viewport to the repositioned graph
    // true : Fits at end of layout for animate:false or animate:'end'
    fit: true,

    // Padding in rendered co-ordinates around the layout
    padding: 10,

    // separation amount between nodes in a cluster
    // note: increasing this amount will also increase the simulation time
    nodeSeparation: 20,

    // Inter-cluster edge length factor
    // (2.0 means inter-cluster edges should be twice as long as intra-cluster edges)
    idealInterClusterEdgeLengthCoefficient: 6,

    // Whether to pull on-circle nodes inside of the circle
    allowNodesInsideCircle: true,

    // Max percentage of the nodes in a circle that can move inside the circle
    maxRatioOfNodesInsideCircle: 20,

    // - Lower values give looser springs
    // - Higher values give tighter springs
    springCoeff: 0,

    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: 4500,

    // Gravity force (constant)
    gravity: 1.1,

    // Gravity range (constant)
    gravityRange: 4,

    // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
    ready: () => {
    }, // on layoutready
    stop: () => {
    }, // on layoutstop
});
