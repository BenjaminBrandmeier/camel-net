import {Import, JavaFile} from './types.ts';

export function parseJavaFile(filePath: string): JavaFile {
    const fileContent = Deno.readTextFileSync(filePath);
    return {
        fullFileName: filePath.match(/(.*\/)?(.*\.java)/)![2],
        fileName: filePath.match(/(.*\/)?(.*)\.java/)![2],
        path: filePath,
        package: getPackage(fileContent),
        imports: getImports(fileContent),
        members: getMembers(fileContent),
        methods: getMethods(fileContent),
        producerTemplates: getProducerTemplates(fileContent)
    };
}

function getPackage(fileContent: string): string {
    return fileContent.match(/package (.*);/)![1];
}

function getImports(fileContent: string): Import[] {
    const importMatches = fileContent.matchAll(/import (.*\.(.*));/g);
    return [...importMatches].map((foundImport) => ({
        class: foundImport[2],
        fqn: foundImport[1]
    }));
}

function getMembers(fileContent: string): string[] {
    return []; // TODO
}

function getMethods(fileContent: string): string[] {
    return []; // TODO
}

function getProducerTemplates(fileContent: string): string[] {
    const producerTemplatesMatches = fileContent.matchAll(/@Produce.*?(\w+\.\w+)/g);
    return [...producerTemplatesMatches].map(m => m[1]);
}
