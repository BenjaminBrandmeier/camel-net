export interface File {
    fullFileName: string;
    fileName: string;
    path: string;
}

export interface JavaFile extends File {
    package: string;
    imports: Import[];
    members: string[];
    methods: string[];
    producerTemplates: string[];
}

export interface Import {
    class: string;
    fqn: string;
}

export interface Route {
    name: string;
    routeDefinition: string;
}
