import {File, Route} from './types.ts';
import {parseJavaFile} from './java-parser.ts';

const getAllRouteDefinitions = (code: string) => code.match(/from\s?\((.|\n|\r)*?;/g);
const shortenQualifier = (s: string) => s.split('').filter(c => [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ.'].includes(c)).join('');
const removeAllQuotes = (routeDefiniton: string) => routeDefiniton.replaceAll('"', '');
const escapeAllQuotes = (routeDefiniton: string) => routeDefiniton.replaceAll('"', '\\"');
const replaceTabs = (routeDefiniton: string) => routeDefiniton.replaceAll('\u0009', '&emsp;');
const replaceAllNewLines = (routeDefinition: string) => routeDefinition.replaceAll(/(\r\n|\n|\r)/g, '<br/>');
const isQualifiedAlready = (to: string) => to.includes('.');
const formatDataToBeValidJson = (visualizationData: string) => '[' + visualizationData.slice(0, -1) + ']';
const writeDataToFile = (visualizationData: string) => Deno.writeTextFileSync('src/assets/data.json', visualizationData);
const log = (text: string) => Deno.writeAllSync(Deno.stdout, new TextEncoder().encode(text));

function start(): void {
    const camelProjectPath = Deno.args[0];
    if (camelProjectPath) {
        generateVisualizationDataForAllProvidedFiles(camelProjectPath);
    } else {
        console.error('\x1b[31m\nScan failed!\x1b[0m');
        console.log('\nNo directory to camel project provided. Usage:\nnpm run parse -- path/to/directory\n');
    }
}

function generateVisualizationDataForAllProvidedFiles(projectPath: string): void {
    const visualizationData = findAllFilesToBeParsed(projectPath, [])
        .map(parseJavaFile)
        .map(buildVisualizationDataForSingleFile)
        .filter(v => v)
        .join('\n');

    writeDataToFile(formatDataToBeValidJson(visualizationData));
    console.log('Finished.');
}

function findAllFilesToBeParsed(currentPath: string, allFilesToBeParsed: string[]): string[] {
    const allFilesInsideCurrentPath = Deno.readDirSync(currentPath);
    [...allFilesInsideCurrentPath].forEach(d => {
        if (d.isDirectory) {
            findAllFilesToBeParsed(currentPath + '/' + d.name, allFilesToBeParsed);
        } else if (d.isFile && d.name.includes('.java') && !d.name.endsWith('Test.java')) {
            allFilesToBeParsed.push(currentPath + '/' + d.name);
        }
    });
    return allFilesToBeParsed;
}

function buildVisualizationDataForSingleFile(file: File): string | undefined {
    log('Parsing ' + file.path);
    const fileContent = Deno.readTextFileSync(file.path);
    const mapOfStaticImports = buildStaticImportsMap(fileContent);
    const routeDefinitions = getAllRouteDefinitions(fileContent);
    if (routeDefinitions) {
        log('\x1b[32m ✔ found route definitions.\x1b[0m\n');
        const mapOfRoutes = buildRouteMap(routeDefinitions, mapOfStaticImports, new Map(), file.fileName);
        return buildCytoscapeElements(mapOfRoutes, file.fileName);
    } else {
        console.error('\x1b[31m ✘ no route definitions.\x1b[0m');
        return undefined;
    }
}

function buildStaticImportsMap(code: string): Map<string, string> {
    const mapOfStaticImports = new Map();
    const matchesFoundIterator = code.matchAll(/import static .*\.(.*)\.(.*);/g);
    [...matchesFoundIterator].forEach(m => mapOfStaticImports.set(m[2], m[1]));
    return mapOfStaticImports;
}

function buildRouteMap(allRouteDefinitions: string[], mapOfStaticImports: Map<string, string>, mapOfRoutes: Map<Route, any>, qualifier: string): Map<Route, string[]> {
    allRouteDefinitions.forEach(routeDefinition => {
        const routeName = removeAllQuotes(shortenQualifier(qualifier + '.').concat(routeDefinition.match(/from\s*?\((.*?)\)/)![1]));
        const routeDestinations = routeDefinition.matchAll(/(?<!\/\/\s*)(\.to\((.*)\)|\.enrich\((.*?)[,|)]|\.wireTap\((.*?)\))/g);
        const routeDefinitionAsSingleLine = replaceTabs(escapeAllQuotes(replaceAllNewLines(routeDefinition)));

        const destinations = [...routeDestinations].flatMap(to => to.filter(t => t).slice(2).map(t => removeAllQuotes(fullQualifyTo(t, mapOfStaticImports, qualifier)))).map(t => removeAllQuotes(t));
        const uniqueDestinations = [...new Set(destinations)]; // think about removing duplicates once more

        removeOldRouteEntry(mapOfRoutes, routeName);
        addNewRouteEntry(mapOfRoutes, routeName, routeDefinitionAsSingleLine, uniqueDestinations);
        addEntryForDestinationRoute(uniqueDestinations, mapOfRoutes);
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

function removeOldRouteEntry(mapOfRoutes: Map<Route, any>, routeName: string): void {
    [...mapOfRoutes.keys()]
        .filter(r => r.name === routeName)
        .forEach(r => mapOfRoutes.delete(r));
}

function addNewRouteEntry(mapOfRoutes: Map<Route, any>, routeName: string, routeDefinitionAsSingleLine: string, uniqueDestinations: any[]): void {
    mapOfRoutes.set({name: routeName, routeDefinition: routeDefinitionAsSingleLine}, uniqueDestinations);
}

function addEntryForDestinationRoute(uniqueDestinations: any[], mapOfRoutes: Map<Route, any>): void {
    uniqueDestinations
        .filter(to => ![...mapOfRoutes.keys()].some(r => r.name === to))
        .forEach(to => mapOfRoutes.set({name: to, routeDefinition: 'Route definition missing or visible when performing search.'}, null));
}

function buildCytoscapeElements(mapOfRoutes: Map<Route, string[]>, file: string): string {
    let visualizationData = '\n' + [...mapOfRoutes.keys()].map(r => '{"data": { "id": "' + r.name + '", "file": "' + file + '", "routeDefinition": "' + r.routeDefinition + '" }},').join('\n');
    mapOfRoutes.forEach((tos, from) => {
        tos?.forEach(to => {
            visualizationData += '\n{"data": { "id": "' + Math.random() + '", "source": "' + from.name + '", "target": "' + to + '", "file": "' + file + '" }},';
        });
    });
    return visualizationData;
}

start();
