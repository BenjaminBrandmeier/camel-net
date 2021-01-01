function createVisualizationData(): void {
    const allFilesToBeParsed = Deno.readDirSync('files');
    let mapOfRoutes = new Map();
    [...allFilesToBeParsed].filter(f => f.name !== '.gitignore').forEach(f => {
        const fileAsText = readInput(f.name);
        const qualifier = f.name.substr(0, f.name.indexOf('.'));
        console.log('Parsing', f.name);
        const mapOfStaticImports = buildStaticImportsMap(fileAsText);
        const allRouteDefinitionsAsText = getAllRouteDefinitions(fileAsText);
        mapOfRoutes = buildRouteMap(allRouteDefinitionsAsText, mapOfStaticImports, mapOfRoutes, qualifier);
    });
    const visualizationData = buildElements(mapOfRoutes);

    writeDataToFile(visualizationData);
    console.log('Finished.');
}

const readInput = (fileName: string) => Deno.readTextFileSync('files/' + fileName);
const getAllRouteDefinitions = (code: string) => code.match(/from(.|\n|\r)*?;/g)!;
const shortenQualifier = (s: string) => s.split('').filter(c => [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ.'].includes(c)).join('');
const removeAllQuotes = (routeDefiniton: string) => routeDefiniton.replace('"', '');
const isQualifiedAlready = (to: string) => to.includes('.');

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

function buildStaticImportsMap(code: string): Map<string, string> {
    const mapOfStaticImports = new Map();
    const matchesFoundIterator = code.matchAll(/import static .*\.(.*)\.(.*);/g);
    [...matchesFoundIterator].forEach(m => mapOfStaticImports.set(m[2], m[1]));
    return mapOfStaticImports;
}

function buildElements(mapOfRoutes: Map<string, string[]>): string {
    let vizualizationData = '';

    [...mapOfRoutes.keys()].forEach(r => vizualizationData += '{"data": { "id": "' + r + '" }},\n');
    mapOfRoutes.forEach((tos, from) => {
        tos?.forEach(to => {
            vizualizationData += '\n{"data": { "id": "' + Math.random() + '", "source": "' + from + '", "target": "' + to + '" }},'; // might also create object and convert to json
        });
    });
    return vizualizationData.slice(0, vizualizationData.length - 1);
}

const writeDataToFile = (vizualizationData: string) => Deno.writeTextFileSync('src/assets/data.json', '[' + vizualizationData + ']');

createVisualizationData();
