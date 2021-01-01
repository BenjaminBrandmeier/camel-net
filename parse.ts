const readInput = (fileName: string) => Deno.readTextFileSync('files/' + fileName);
const getAllRouteDefinitions = (code: string) => code.match(/from(.|\n|\r)*?;/g)!;
const shortenQualifier = (s: string) => s.split('').filter(c => [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ.'].includes(c)).join('');
const removeAllQuotes = (routeDefiniton: string) => routeDefiniton.replace('"', '');
const isQualifiedAlready = (to: string) => to.includes('.');
const formatDataToBeValidJson = (visualizationData: string) => '[' + visualizationData.slice(0, -1) + ']';
const writeDataToFile = (visualizationData: string) => Deno.writeTextFileSync('src/assets/data.json', visualizationData);

function generateVisualizationDataForAllProvidedFiles(): void {
    const allFilesToBeParsed = Deno.readDirSync('files');
    const visualizationData = [...allFilesToBeParsed]
        .filter(f => f.name !== '.gitignore')
        .map(buildVisualizationDataForSingleFile)
        .join('\n');

    writeDataToFile(formatDataToBeValidJson(visualizationData));
    console.log('Finished.');
}

function buildVisualizationDataForSingleFile(file: Deno.DirEntry): string {
    console.log('Parsing', file.name);
    const fileAsText = readInput(file.name);
    const qualifier = file.name.substr(0, file.name.indexOf('.'));
    const mapOfStaticImports = buildStaticImportsMap(fileAsText);
    const allRouteDefinitionsAsText = getAllRouteDefinitions(fileAsText);
    const mapOfRoutes = buildRouteMap(allRouteDefinitionsAsText, mapOfStaticImports, new Map(), qualifier);
    return buildCytoscapeElements(mapOfRoutes, file.name);
}

function buildStaticImportsMap(code: string): Map<string, string> {
    const mapOfStaticImports = new Map();
    const matchesFoundIterator = code.matchAll(/import static .*\.(.*)\.(.*);/g);
    [...matchesFoundIterator].forEach(m => mapOfStaticImports.set(m[2], m[1]));
    return mapOfStaticImports;
}

function buildRouteMap(allRouteDefinitions: string[], mapOfStaticImports: Map<string, string>, mapOfRoutes: Map<string, any>, qualifier: string): Map<string, string[]> {
    allRouteDefinitions.forEach(r => {
        const routeDefiniton = shortenQualifier(qualifier + '.').concat(r.match(/from\s*?\((.*?)\)/)![1]);
        const routeDestinations = r.matchAll(/(?<!\/\/\s*)(\.to\((.*)\)|\.enrich\((.*?)[,|)]|\.wireTap\((.*?)\))/g);

        const destinations = [...routeDestinations].flatMap(to => to.filter(t => t).slice(2).map(t => removeAllQuotes(fullQualifyTo(t, mapOfStaticImports, qualifier)))).map(t => removeAllQuotes(t));
        const destinationsWithoutDuplicates = [...new Set(destinations)]; // think about removing duplicates once more

        destinationsWithoutDuplicates.filter(to => !mapOfRoutes.has(to)).forEach(to => mapOfRoutes.set(to, null));

        mapOfRoutes.set(removeAllQuotes(routeDefiniton), destinationsWithoutDuplicates);
    });
    return mapOfRoutes;
}

function fullQualifyTo(to: string, mapOfStaticImports: Map<string, string>, qualifier: string): string {
    if (isQualifiedAlready(to)) {
        return shortenQualifier(to.split('.')[0]) + '.' + to.split('.')[1];
    } else if (mapOfStaticImports.has(to)) {
        return shortenQualifier(mapOfStaticImports.get(to)!) + '.' + to;
    } else if (to.includes('cxf:bean') || to.includes('cxfrs:bean')) {
        return to.includes('?') ? to.substring(1, to.indexOf('?')) : to;
    } else {
        return shortenQualifier(qualifier + '.').concat(to);
    }
}

function buildCytoscapeElements(mapOfRoutes: Map<string, string[]>, file: string): string {
    let visualizationData = '\n' + [...mapOfRoutes.keys()].map(r => '{"data": { "id": "' + r + '", "file": "' + file + '" }},').join('\n');
    mapOfRoutes.forEach((tos, from) => {
        tos?.forEach(to => {
            visualizationData += '\n{"data": { "id": "' + Math.random() + '", "source": "' + from + '", "target": "' + to + '", "file": "' + file + '" }},';
        });
    });
    return visualizationData;
}

generateVisualizationDataForAllProvidedFiles();
