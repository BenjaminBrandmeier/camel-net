import {File} from './types.ts';
import {parseJavaFile} from './java-parser.ts';

const getAllRouteDefinitions = (code: string) => code.match(/from\s?\((.|\n|\r)*?;/g)!;
const shortenQualifier = (s: string) => s.split('').filter(c => [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ.'].includes(c)).join('');
const removeAllQuotes = (routeDefiniton: string) => routeDefiniton.replaceAll('"', '');
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

start();
