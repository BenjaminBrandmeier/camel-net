export const ciseLayout = {
    name: 'cise',
    refresh: 200,
    animate: true,
    animationDuration: 6000,
    animationEasing: undefined,
    nodeSeparation: 12.5,
    idealInterClusterEdgeLengthCoefficient: 6,
    allowNodesInsideCircle: false,
    maxRatioOfNodesInsideCircle: 0.1,
    springCoeff: 0.95,
    nodeRepulsion: 11500,
    gravity: 0.1,
    gravityRange: 4,
};

const colaLayout = { // curently unused
    name: 'cola',
    animate: true, // whether to show the layout as it's running
    refresh: 1, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 4000, // max length in ms to run the layout
    ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    fit: false, // on every layout reposition of nodes, fit the viewport
    padding: 0, // padding around the simulation
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

    // positioning options
    randomize: false, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: true, // if true, avoids disconnected components from overlapping
    convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
    nodeSpacing: node => 10, // extra spacing around nodes
    flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
    gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

    // different methods of specifying edge length
    // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
    edgeLength: undefined, // sets edge length directly in simulation
    edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
    edgeJaccardLength: undefined, // jaccard edge length in simulation

    // iterations of cola algorithm; uses default values on undefined
    unconstrIter: undefined, // unconstrained initial layout iterations
    userConstIter: undefined, // initial layout iterations with user-specified constraints
    allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
};

const spreadLayout = { // curently unused
    name: 'spread',
    animate: false, // Whether to show the layout as it's running
    ready: undefined, // Callback on layoutready
    stop: undefined, // Callback on layoutstop
    fit: false, // Reset viewport to fit default simulationBounds
    minDist: 1, // Minimum distance between nodes
    padding: 1, // Padding
    expandingFactor: -1.0, // If the network does not satisfy the minDist
    // criterium then it expands the network of this amount
    // If it is set to -1.0 the amount of expansion is automatically
    // calculated based on the minDist, the aspect ratio and the
    // number of nodes
    prelayout: {name: 'cose'}, // Layout options for the first phase
    maxExpandIterations: 300, // Maximum number of expanding iterations
    boundingBox: undefined, // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    randomize: false // Uses random initial node positions on true
};
