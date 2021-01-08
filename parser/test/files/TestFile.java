package com.demo.services.song;

import org.apache.camel.ProducerTemplate;
import fake.SomeAwesomeLogger;
import java.util.ArrayList;
import it.does.not.exist.Bielefeld;

@Service
@Profile(SOME_PROFILE)
public class TestFile {

    private static final Logger LOGGER = SomeAwesomeLogger.getLogger(TestFile.class);

    @Value("${song.sending.url}")
    private String something;

    @Value("${song.you.dont.need.url:notNeeded}")
    private String all;

    private final boolean isThisCodeTheUltimateCode = true;

    @Produce(uri = DemoRoute.SEE_IF_DOG_IS_STILL_ALIVE)
    private ProducerTemplate producer;

    private void thisIsTheMethod() {
        Boolean isDogAlive = producer.requestBody(holder, Boolean.class);
        if (isDogAlive) {
            celebrate();
        }
    }

    private String celebrate() {
        String alright = "Gonna be alright";
        String all = "Everything's";

        return all + " " + alright;
    }
}
