import {assertEquals} from 'https://deno.land/std@0.83.0/testing/asserts.ts';
import {parseJavaFile} from '../java-parser.ts';

const javaFile = parseJavaFile('parser/test/files/TestFile.java');

Deno.test('should parse full filename', () => {
    assertEquals(javaFile.fullFileName, 'TestFile.java');
});

Deno.test('should parse filename', () => {
    assertEquals(javaFile.fileName, 'TestFile');
});

Deno.test('should parse path', () => {
    assertEquals(javaFile.path, 'parser/test/files/TestFile.java');
});

Deno.test('should parse package', () => {
    assertEquals(javaFile.package, 'com.demo.services.song');
});

Deno.test('should parse imports', () => {
    assertEquals(javaFile.imports, [
        { fqn: 'org.apache.camel.ProducerTemplate', class: 'ProducerTemplate' },
        { fqn: 'fake.SomeAwesomeLogger', class: 'SomeAwesomeLogger' },
        { fqn: 'java.util.ArrayList', class: 'ArrayList' },
        { fqn: 'it.does.not.exist.Bielefeld', class: 'Bielefeld' },
    ]);
});

Deno.test('should parse producer templates', () => {
    assertEquals(javaFile.producerTemplates, ['DemoRoute.SEE_IF_DOG_IS_STILL_ALIVE']);
});
