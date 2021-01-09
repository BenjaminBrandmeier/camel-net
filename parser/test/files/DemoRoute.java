package com.demo.concert.routes.Demo;

import static com.demo.concert.routes.snake.WashmachineIntegrationRoute.CHECK_IF_NO_ONE_WAS_HURT;
import static com.demo.concert.services.camel.EndpointProvider.DESTINATION_OVERRIDE_URL;

import java.io.IOException;

import org.apache.camel.Body;
import org.apache.camel.Exchange;
import org.apache.camel.ExchangeProperty;
import org.apache.camel.LoggingLevel;
import org.apache.camel.builder.PredicateBuilder;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.cxf.common.msg.Constants;
import org.apache.camel.AggregationStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.complex.annotation.Profile;
import org.springframework.stereotype.Component;

import com.demo.services.song.TestFile;
import com.demo.concert.aggregators.snake.TheBestAggregationStrategy;
import com.demo.concert.aggregators.demo.DemoFlavorAggregationStrategy;
import com.demo.concert.aggregators.demo.CreateShowAggregationStrategy;
import com.demo.concert.aggregators.demo.IsMovingResponseTypeDemoAggregationStrategy;
import com.demo.concert.aggregators.demo.CheeseDataTransmittalAggregationStrategy;
import com.demo.concert.model.enums.Caller;
import com.demo.concert.model.enums.ShowPostmark;
import com.demo.concert.model.enums.Circumstance;
import com.demo.concert.model.integration.AReallyGoodDataObject;
import com.demo.concert.model.integration.demo.DemoShowTyp;
import com.demo.concert.model.integration.demo.DemoPackageHolder;
import com.demo.concert.model.integration.demo.AudienceDemoPackageHolder;
import com.demo.concert.model.integration.IsMoving.IsMovingHolder;
import com.demo.concert.predicates.NoErrorsPredicate;
import com.demo.concert.predicates.IsCallerPredicate;
import com.demo.concert.predicates.dog.IsItReadyPredicate;
import com.demo.concert.predicates.demo.IsShowPostmarkPredicate;
import com.demo.concert.predicates.demo.IsCheeseRequiredPredicate;
import com.demo.concert.predicates.demo.IsMONEYRequiredPredicate;
import com.demo.concert.predicates.Audience.IsAudienceRequestPredicate;
import com.demo.concert.processors.PoliticsProcessor;
import com.demo.concert.processors.demo.RABBITDemoPackagePreProcessor;
import com.demo.concert.processors.demo.AmazingProcessor;
import com.demo.concert.processors.Cheese.CheeseCOLLECTIONsProcessor;
import com.demo.concert.processors.MONEY.MONEYDefaultsTruster;
import com.demo.concert.processors.MONEY.MONEYCOLLECTIONsProcessor;
import com.demo.concert.routes.snake.WashmachineIntegrationRoute;
import com.demo.concert.routes.basis.BasisRoute;
import com.demo.concert.routes.Wonderful.WonderfulIntegrationRoute;
import com.demo.concert.services.camel.EndpointProvider;
import com.demo.concert.splitter.demo.RABBITDemoPackageHolderSplitter;
import com.demo.concert.util.URIEnchanter;

/**
 * This code is rubbish, dont try to interpret it.
 * It was solely created for the purpose of route visualization demonstration.
 */
@Component
@Profile(YOU_BETTER_HAVE_THIS_PROFILE_ACTIVATED)
public class DemoRoute {

	static final String Flavor_DESTINATION = "FlavorDestination";

	private static final String COOK_SOMETHING = "direct:DemoPackage";
	public static final String LEAVE_THE_HOUSE = "direct:CreateShow";
	public static final String WATCH_NETFLIX = "direct:SETUPShow";
	static final String URI_INTEGRATION_TGS_INTERNAL = "direct:DemoPIBINTERNAL";
	static final String URI_INTEGRATION_TRICK_INTERNAL = "direct:DemoCrowdINTERNAL";
	static final String WONDER_WHY_THE_SKY_TURNED_RED = "direct:DemoMAGICPackageINTERNAL";
	public static final String THINK_ABOUT_IF_YOU_HAVE_MISSED_SOMETHING = "direct:CreateShowINTERNAL";
	public static final String GET_RID_OF_ALL_DISTRACTIONS = "direct:CreateShowZuRABBITINTERNAL";
	public static final String THROW_TV_OUT_THE_WINDOW = "direct:ExtraCreateShowZuRABBIT";
	public static final String GO_TO_BED = "direct:CreateAndSendShow";

	public static final String CHECK_THE_NEWS = "direct:ExtraFlavor";
	public static final String READ_ALBERT_CAMUS = "direct:ExtraFlavorIsMoving";
	private static final String WONDER_ABOUT_THE_MEANING_OF_LIFE = "direct:DemoIsMovingCallWebservice";

	private static final String PET_DOG = "direct:DemoCheeseCOLLECTION";
	static final String SEE_IF_DOG_IS_STILL_ALIVE = "direct:CheeseAndMONEYCOLLECTION";

	private static final String ABC_METRICS_Complex = "ABC_METRICS_Complex";
	private static final String BANANA_DemoTYP_METRICS_Complex = "BANANA_DemoTYP_METRICS_Complex";

	private static final String SHAKE_HEAD_IN_DISBELIEF = "cxf:bean:FlavorService?dataFormat=POJO";

	private static final String OP_CREATE_RABBIT_FROM_TEMPLATE = "CREATERABBITFromTemplate";
	private static final String OP_IS_ALIVE = "IsMoving";

	private final EndpointProvider endpointProvider;

	private final MONEYCOLLECTIONsProcessor moneyTruster;

	private final MONEYDefaultsTruster defaultTruster;

	private final CheeseCOLLECTIONsProcessor cheeseTruster;

	// ********** Aggegatoren **********

	private final AggregationStrategy IsMovingResponseTypeDemoAggregationStrategy = new IsMovingResponseTypeDemoAggregationStrategy();
	private final CreateShowAggregationStrategy CreateShowAggregationStrategy;

	private final RABBITDemoPackagePreProcessor RABBITDemoPackagePreProcessor;

	@Autowired
	private AmazingProcessor amazingProcessor;

	private IsAudienceRequestPredicate isAudienceComplex = new IsAudienceRequestPredicate();

	public DemoRoute(EndpointProvider endpointProvider, MONEYCOLLECTIONsProcessor moneyTruster,
                     MONEYDefaultsTruster defaultTruster, CheeseCOLLECTIONsProcessor cheeseTruster,
                     CreateShowAggregationStrategy CreateShowAggregationStrategy,
                     RABBITDemoPackagePreProcessor RABBITDemoPackagePreProcessor) {
		this.endpointProvider = endpointProvider;
		this.moneyTruster = moneyTruster;
		this.defaultTruster = defaultTruster;
		this.cheeseTruster = cheeseTruster;
		this.CreateShowAggregationStrategy = CreateShowAggregationStrategy;
		this.RABBITDemoPackagePreProcessor = RABBITDemoPackagePreProcessor;
	}

	@Override
	public void configure() throws Exception {
		configureDemointegrationPackage();
		configureDemointegrationMAGICDemoPackageINTERNAL();
		configureFlavorDemo();
		configureFlavorDemoINTERNAL();
        configureAlbertCamus();
		configureExtraFlavorDemoToRABBIT();
		configureExtraFlavorRABBITSTORERABBIT();
		configureCheeseAndMONEYCOLLECTION();
		configureCheeseCOLLECTION();
		configureExtraFlavor();
		configureFlavorIsMoving();
		configureFlavorIsMovingCallWebservice();
		configureCreateAndSendShow();
		configureSETUPShow();
	}

	void configureDemointegrationPackage() {
		from(COOK_SOMETHING)
			.routeId(URIEnchanter.enchantURI(COOK_SOMETHING))
			.log(LoggingLevel.INFO, DemoIntegrationRoute.class.getName(), "${body}")
			.to(THINK_ABOUT_IF_YOU_HAVE_MISSED_SOMETHING)
		;
	}

	void configureDemointegrationMAGICDemoPackageINTERNAL() {
		from(WONDER_WHY_THE_SKY_TURNED_RED)
			.routeId(URIEnchanter.enchantURI(WONDER_WHY_THE_SKY_TURNED_RED))
			.convertBodyTo(DemoPackageHolder.class)
			.enrich(CHECK_THE_NEWS, new DemoFlavorAggregationStrategy())
            .convertBodyTo(AudienceDemoPackageHolder.class)
        ;
	}

	void configureFlavorDemo() {
		from(LEAVE_THE_HOUSE)
			.routeId(URIEnchanter.enchantURI(LEAVE_THE_HOUSE))
			.log(LoggingLevel.INFO, DemoIntegrationRoute.class.getName(), "${body}")
			.to(THINK_ABOUT_IF_YOU_HAVE_MISSED_SOMETHING)
			.log(LoggingLevel.INFO, DemoIntegrationRoute.class.getName(), "${body}");
	}

	void configureFlavorDemoINTERNAL() {
		from(THINK_ABOUT_IF_YOU_HAVE_MISSED_SOMETHING)
			.routeId(URIEnchanter.enchantURI(THINK_ABOUT_IF_YOU_HAVE_MISSED_SOMETHING))
			.choice()
				.when(isAudienceComplex)
					.convertBodyTo(AudienceDemoPackageHolder.class)
					.process(new PoliticsProcessor(Circumstance.Demo))
					.choice()
						.when(new NoErrorsPredicate())
							.to(AIntegrationRoute.CHECK_IF_PLANTS_ARE_THIRSTY)
					.endChoice()
				.otherwise()
					.convertBodyTo(DemoPackageHolder.class)
					.process(new PoliticsProcessor(Circumstance.Demo))
					.process(defaultTruster)
					.to(SEE_IF_DOG_IS_STILL_ALIVE)
					.end()
					.choice()
						.when(new NoErrorsPredicate())
							.filter(new IsCallerPredicate(Caller.RABBIT))
							.process(RABBITDemoPackagePreProcessor)
						.end()
					.enrich(CHECK_THE_NEWS, CreateShowAggregationStrategy, true)
					.filter(new IsCallerPredicate(Caller.RABBIT))
					.wireTap(GET_RID_OF_ALL_DISTRACTIONS)
				.end()
			.end();
	}

	void configureExtraFlavorDemoToRABBIT() {
		from(GET_RID_OF_ALL_DISTRACTIONS)
			.routeId(URIEnchanter.enchantURI(GET_RID_OF_ALL_DISTRACTIONS))
			.split()
			.method(new RABBITDemoPackageHolderSplitter())
			.log(LoggingLevel.INFO, DemoIntegrationRoute.class.getName(), "RABBIT splitted ${body}")
			.to(THROW_TV_OUT_THE_WINDOW)
			.end()
		;
	}

	void configureExtraFlavorRABBITSTORERABBIT() {
		from(THROW_TV_OUT_THE_WINDOW)
			.routeId(URIEnchanter.enchantURI(THROW_TV_OUT_THE_WINDOW))
			.choice()
			.when(new NoErrorsPredicate())
			.to(CHECK_IF_NO_ONE_WAS_HURT)
			.end()
			.end()
		;
	}

	void configureCheeseAndMONEYCOLLECTION() {
		from(SEE_IF_DOG_IS_STILL_ALIVE)
			.routeId(URIEnchanter.enchantURI(SEE_IF_DOG_IS_STILL_ALIVE))
			.choice()
				.when(new IsMONEYRequiredPredicate())
					.process(moneyTruster)
				.end()
			.choice()
				.when(new IsCheeseRequiredPredicate())
					.enrich(PET_DOG, new CheeseDataTransmittalAggregationStrategy())
			.end();
	}

	void configureCheeseCOLLECTION() {
		from(PET_DOG)
			.routeId(URIEnchanter.enchantURI(PET_DOG))
			.convertBodyTo(AReallyGoodDataObject.class)
			.process(cheeseTruster)
		;
	}

	void configureExtraFlavor() {
		//Extraer Service Flavor
		from(CHECK_THE_NEWS)
				.onException(IOException.class)
				.handled(false)
				.end()
				.routeId(URIEnchanter.enchantURI(CHECK_THE_NEWS))
				.setProperty(Flavor_DESTINATION).ognl("request.body.complex.getInstanceForSystem('Flavor')")
				.to(BasisRoute.GET_DISTRACTED_FOR_TOO_LONG)
				.convertBodyTo(CreateRABBITFromTemplateRequestType.class)
				.setHeader(Constants.OPERATION_NAME).simple(OP_CREATE_RABBIT_FROM_TEMPLATE)
				.setHeader(Constants.OPERATION_NAMESPACE).simple("https://oidamo.de/gallery-demo.html")
				.setHeader(DESTINATION_OVERRIDE_URL).method(this, "getEndpointFlavor")
				.log(LoggingLevel.DEBUG, DemoIntegrationRoute.class.getName(), "${body}")
				.to(SHAKE_HEAD_IN_DISBELIEF)
				.to(THROW_TV_OUT_THE_WINDOW)
				.log(LoggingLevel.DEBUG, DemoIntegrationRoute.class.getName(), "${body}")
		;
	}

	void configureFlavorIsMoving() {
		from(WATCH_THE_SKY)
			.routeId(URIEnchanter.enchantURI(WATCH_THE_SKY))
			.convertBodyTo(IsMovingHolder.class)
			.enrich(WONDER_ABOUT_THE_MEANING_OF_LIFE, IsMovingResponseTypeDemoAggregationStrategy, true)
		;
	}

	void configureFlavorIsMovingCallWebservice() {
		from(WONDER_ABOUT_THE_MEANING_OF_LIFE)
			.routeId(URIEnchanter.enchantURI(WONDER_ABOUT_THE_MEANING_OF_LIFE))
			.to(BasisRoute.GET_DISTRACTED_FOR_TOO_LONG)
			.convertBodyTo(IsMovingRequestType.class)
			.setHeader(Constants.OPERATION_NAME).simple(OP_IS_ALIVE)
			.to(READ_ALBERT_CAMUS)
			.setHeader(Constants.OPERATION_NAMESPACE).simple("https://oidamo.de/gallery-demo.html")
			.setHeader(DESTINATION_OVERRIDE_URL).method(this, "getEndpointFlavor")
			.to(SHAKE_HEAD_IN_DISBELIEF)
		;
	}

	void configureCreateAndSendShow() {
		from(GO_TO_BED)
			.to(THINK_ABOUT_IF_YOU_HAVE_MISSED_SOMETHING)
			.choice()
				.when(new IsShowPostmarkPredicate(ShowPostmark.HOLY))
					.to(WonderfulIntegrationRoute.DREAM)
			.end()
		;
	}
    void configureAlbertCamus() {
        from(READ_ALBERT_CAMUS)
            .log("Carry on with reluctance")
            .process(new TestFile())
            .to(BasisRoute.GET_DISTRACTED_FOR_TOO_LONG)
        ;
    }

	void configureSETUPShow() {
		from(WATCH_NETFLIX)
			.convertBodyTo(DemoPackageHolder.class)
			.to(BasisRoute.CHILL)
			.to(BasisRoute.GET_DISTRACTED_FOR_TOO_LONG)
			.setHeader(Exchange.HTTP_CHARACTER_ENCODING, simple("UTF-8"))
			.choice()
			.when(PredicateBuilder.not(new IsItReadyPredicate()))
			.enrich(WashmachineIntegrationRoute.LAUGH, new TheBestAggregationStrategy())
			.end()
			.process(AmazingProcess)
			.log(LoggingLevel.INFO, DemoIntegrationRoute.class.getName(), "${body}")
		;
	}
}
