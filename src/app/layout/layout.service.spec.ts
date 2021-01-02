import {LayoutService} from './layout.service';

describe('layout service', () => {
    let subject;

    beforeEach(() => {
        subject = new LayoutService();
    });

    it('should map DataElements into node clusters', () => {
        const a = [
            {data: {id: 'HSB.URI_SING_LOUD', file: 'DemoRoute.java'}},
            {data: {id: 'BR.URI_PRACTICE_PATIENCE', file: 'DemoRoute.java'}},
            {data: {id: 'HSB.URI_WHISPER_SOFTLY', file: 'DemoRoute.java'}},
        ];

        const actual = subject.createNodeClusters(a);

        expect(actual).toEqual([['HSB.URI_SING_LOUD', 'HSB.URI_WHISPER_SOFTLY'], ['BR.URI_PRACTICE_PATIENCE']]);
    });
});
