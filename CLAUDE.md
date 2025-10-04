# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

camel-net is an Apache Camel route visualization tool built with Angular and Deno. It parses Java files containing Camel route definitions and generates an interactive graph visualization using Cytoscape.js. The tool helps developers understand dependencies between routes across multiple packages and files.

## Architecture

The project consists of two main parts:

### 1. Parser (Deno-based)

Located in `/parser/`, this Deno TypeScript application:

- Recursively scans a Java project directory for `.java` files (excluding test files)
- Extracts Apache Camel route definitions using regex patterns
- Supports `.from()`, `.to()`, `.enrich()`, and `.wiretap()` navigation methods
- Resolves static imports to fully qualify route names
- Generates visualization data as JSON and writes to `src/assets/data.json`

Key files:

- `parser/parse.ts` - Main parsing logic and file traversal
- `parser/java-parser.ts` - Java file parsing utilities
- `parser/types.ts` - Type definitions

### 2. Frontend (Angular)

Located in `/src/`, this Angular 20 application:

- Loads parsed route data from `assets/data.json`
- Renders interactive graph visualization using Cytoscape.js with CISE layout algorithm
- Provides file-based filtering and route search functionality
- Displays route source code on right-click
- Colors predecessors (green) and successors (red) when a node is selected
- Supports clustering by file or package when viewing all files

Key architecture:

- `app.component.ts` - Main component with graph initialization, event handling, search/filter logic
- `layout/layout.service.ts` - Manages Cytoscape layout configuration and package-based clustering
- `styling/styling.service.ts` - Handles node/edge coloring and dependency path visualization
- `styling/prettify.service.ts` - Formats route code for display

## Development Commands

### Running the application

```bash
npm start                    # Start dev server on localhost:4200
```

### Building

```bash
npm run build               # Build for production (outputs to dist/camel-net)
```

### Testing

```bash
npm test                    # Run all tests (frontend + parser)
npm run test-frontend       # Run Jest tests for Angular code
npm run test-parser         # Run Deno tests for parser
```

### Linting

```bash
npm run lint                # Run Angular linter
```

### Parsing Java projects

```bash
npm run parse -- /path/to/java/project    # Parse Java files and generate data.json
```

This command must be run before starting the application with actual route data.

## Important Development Notes

### Angular Version Management

- Currently on Angular 20 with TypeScript 5.8.3
- When upgrading Angular versions:
  - Update all `@angular/*` packages together to the same version
  - Update `@angular/cli` and `@angular-devkit/build-angular` to match
  - Check Angular release notes for required TypeScript version (e.g., Angular 20 requires TypeScript >= 5.8)
  - Components are not standalone by default - use `standalone: false` in component decorator

### TypeScript Configuration

- `tsconfig.json` uses ES2020 target and lib includes `["es2020", "dom"]`
- Do not partially include ES2020 features (e.g., `es2020.string` alone) - include full `es2020` lib

### Cytoscape Integration

- Cytoscape and cytoscape-cise are listed in `allowedCommonJsDependencies` in angular.json
- Layout options: CISE (default with clustering), grid (fallback)
- Clustering is only active when viewing "All files (clustered)" with no search filter

### Data Flow

1. Java project → Parser → `src/assets/data.json`
2. Angular app fetches `data.json` on init
3. Data is filtered by selected file
4. Cytoscape renders filtered elements with appropriate layout
5. User interactions trigger re-renders and styling updates

### Known Limitations

- Only supports Java-based Camel routes (no XML support)
- Route definitions must follow specific patterns (.from, .to, .enrich, .wiretap)
- Parser uses regex-based extraction (not full AST parsing)
