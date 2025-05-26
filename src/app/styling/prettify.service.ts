import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PrettifyService {
    constructor() {
    }

    prettifyRouteCode(code: string): string {
        if (!code) return '';
        
        const patterns: Array<[RegExp, string]> = [
            [/(class|new|this)/g, 'pink'],
            [/([A-Z]\w+)\./g, 'orange'],
            [/new (.*?)\(/g, 'orange'],
            [/(".*?")/g, 'cyan']
        ];

        return patterns.reduce((acc, [pattern, color]) => 
            this.highlight(acc, pattern, color), code);
    }

    private highlight(code: string, pattern: RegExp, color: string): string {
        const allUniqueMatches = [...new Set([...code.matchAll(pattern)!].map(r => r[1]))];
        allUniqueMatches.forEach(regexMatch => {
            const stringToBeReplaced = '(?<!\\w)(?<!mark )' + escapeRegex(regexMatch);
            code = code.replace(new RegExp(stringToBeReplaced, 'g'), '<mark class=\'' + color + '\'>' + regexMatch + '</mark>');
        });
        return code;
    }
}

// from https://stackoverflow.com/a/6969486/810595
const escapeRegex = (pattern: string) => pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
