import {parseJavaFile} from './java-parser.ts';
import {buildVisualizationDataForSingleFile} from './data-builder.ts';

const formatDataToBeValidJson = (visualizationData: string) => '[' + visualizationData.slice(0, -1) + ']';
const writeDataToFile = (visualizationData: string) => Deno.writeTextFileSync('src/assets/data.json', visualizationData);

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
    const visualizationData =
        findAllFilesToBeParsed(projectPath, [])
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

start();
