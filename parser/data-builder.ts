import {File, Route} from './types.ts';
import {ROUTE_DEFINITION_PLACEHOLDER_FOR_NONEXISTING_CODE} from '../src/shared/constants.ts';

const getAllRouteDefinitions = (code: string) => code.match(/from\s?\((.|\n|\r)*?;/g);
const shortenQualifier = (s: string) => s.split('').filter(c => [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ.'].includes(c)).join('');
const removeAllQuotes = (routeDefiniton: string) => routeDefiniton.replaceAll('"', '');
const escapeAllQuotes = (routeDefiniton: string) => routeDefiniton.replaceAll('"', '\\"');
const replaceTabs = (routeDefiniton: string) => routeDefiniton.replaceAll('\u0009', '&emsp;');
const replaceAllNewLines = (routeDefinition: string) => routeDefinition.replaceAll(/(\r\n|\n|\r)/g, '<br/>');
const isQualifiedAlready = (to: string) => to.includes('.');
const log = (text: string) => Deno.writeAllSync(Deno.stdout, new TextEncoder().encode(text));

export function buildVisualizationDataForSingleFile(file: File): string | undefined {
    log('Parsing ' + file.path);
    const fileContent = Deno.readTextFileSync(file.path);
    const mapOfStaticImports = buildStaticImportsMap(fileContent);
    const routeDefinitions = getAllRouteDefinitions(fileContent);
    if (routeDefinitions) {
        log('\x1b[32m ✔ found route definitions.\x1b[0m\n');
        const mapOfRoutes = buildRouteMap(routeDefinitions, mapOfStaticImports, file.fileName);
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

function buildRouteMap(allRouteDefinitions: string[], mapOfStaticImports: Map<string, string>, qualifier: string): Map<Route, string[]> {
    const mapOfRoutes = new Map();
    allRouteDefinitions.forEach(routeDefinition => {
        const routeName = removeAllQuotes(shortenQualifier(qualifier + '.').concat(routeDefinition.match(/from\s*?\((.*?)\)/)![1]));
        const uniqueDestinations = getAllUniqueDestinationsOfSingleRoute(routeDefinition, mapOfStaticImports, qualifier);
        const routeDefinitionAsSingleLine = replaceTabs(escapeAllQuotes(replaceAllNewLines(routeDefinition)));

        removeOldRouteEntry(mapOfRoutes, routeName);
        addNewRouteEntry(mapOfRoutes, routeName, routeDefinitionAsSingleLine, uniqueDestinations);
        addEntryForDestinationRoute(uniqueDestinations, mapOfRoutes);
    });
    return mapOfRoutes;
}

function getAllUniqueDestinationsOfSingleRoute(routeDefinition: string, mapOfStaticImports: Map<string, string>, qualifier: string): string[] {
    const routeDestinations = routeDefinition.matchAll(/(?<!\/\/\s*)(?:\.to\(([\s\S]*?)\)|\.enrich\((.*?)[,|)]|\.wireTap\((.*?)\))/g);
    const destinations = [...routeDestinations]
        .flatMap(matches => matches
            .slice(1) // remove entire string match
            .filter(t => t)
            .flatMap(t => t
                .split(',') // multiple destinations inside .to() possible
                .map(toRoute => toRoute.trim())
                .map(s => removeAllQuotes(fullQualifyTo(s, mapOfStaticImports, qualifier)))))
        .map(t => removeAllQuotes(t));

    return [...new Set(destinations)]; // think about removing duplicates once more
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
        .forEach(to => mapOfRoutes.set({name: to, routeDefinition: ROUTE_DEFINITION_PLACEHOLDER_FOR_NONEXISTING_CODE}, null));
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
