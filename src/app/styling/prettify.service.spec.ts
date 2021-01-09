import {PrettifyService} from './prettify.service';

describe('prettify service', () => {
    let subject;

    beforeEach(() => {
        subject = new PrettifyService();
    });

    it('should prettify routes', () => {
        const testRoute = 'from(WONDER_WHY_THE_SKY_TURNED_RED)<br/>&emsp;&emsp;&emsp;.routeId(URIEnchanter.enchantURI(WONDER_WHY_THE_SKY_TURNED_RED))<br/>&emsp;&emsp;&emsp;.convertBodyTo(DemoPackageHolder.class)<br/>&emsp;&emsp;&emsp;.enrich(CHECK_THE_NEWS, new DemoFlavorAggregationStrategy())<br/>            .convertBodyTo(AudienceDemoPackageHolder.class)<br/>        ;';

        const actual = subject.prettifyRouteCode(testRoute);

        expect(actual).toEqual('from(WONDER_WHY_THE_SKY_TURNED_RED)<br/>&emsp;&emsp;&emsp;.routeId(<mark class=\'orange\'>URIEnchanter</mark>.enchantURI(WONDER_WHY_THE_SKY_TURNED_RED))<br/>&emsp;&emsp;&emsp;.convertBodyTo(<mark class=\'orange\'>DemoPackageHolder</mark>.<mark class=\'pink\'>class</mark>)<br/>&emsp;&emsp;&emsp;.enrich(CHECK_THE_NEWS, <mark class=\'pink\'>new</mark> DemoFlavorAggregationStrategy())<br/>            .convertBodyTo(<mark class=\'orange\'>AudienceDemoPackageHolder</mark>.<mark class=\'pink\'>class</mark>)<br/>        ;');
    });
});
