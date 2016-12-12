const assert = require('chai').assert;

const ProgressionMerger = require('./../src/progressionMerger');
const ProgressionMergerSettings = require('./../src/progressionMergerSettings');
const TextModel = require('./../src/textModel');

function Word( x, y, w, h ) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
}

describe( 'ProgressionMerger', () => {
	const interLineDistance = 55;

	const logger = {
		logs: [],
		name: 'ProgressionMerger',
		log: function( ...messages ) {
			this.logs.push( messages );
		},
		print: function() {
	    	console.log( `==== ${this.name} =====` );
	    	this.logs.forEach( log => {
	    		console.log( ...log );
	    	})
	    	console.log( '=========' );
		}
	};

    before(() => {
    	const settings = new ProgressionMergerSettings();
    	settings.minLongSetLength = 3;
    	settings.fitThreshold = 0.3;
    	settings.maxLinearGradient = 0.15;
    	settings.removeSingleFixationLines = false;
    	settings.correctForEmptyLines = true;
    	settings.emptyLineDetectorFactor = 1.7;
    	settings.save();
    });

    after(() => {
    	logger.print();
    });

	it( 'should make 2 lines our of 3 progressions', () =>  {
		//const data = JSON.parse('{"fixations":[{"duration":267,"ts":2965839,"x":1283,"y":116},{"duration":134,"ts":2966172,"x":579,"y":293},{"duration":1266,"ts":2966339,"x":405,"y":300},{"duration":1200,"ts":2967639,"x":470,"y":293},{"duration":433,"ts":2969039,"x":542,"y":266},{"duration":867,"ts":2969505,"x":612,"y":249},{"duration":733,"ts":2970405,"x":675,"y":284},{"duration":300,"ts":2971172,"x":737,"y":292},{"duration":866,"ts":2971505,"x":824,"y":276},{"duration":1133,"ts":2972405,"x":934,"y":256},{"duration":167,"ts":2973571,"x":600,"y":258},{"duration":1367,"ts":2973771,"x":381,"y":347},{"duration":1200,"ts":2974071,"x":0,"y":-1},{"duration":2233,"ts":2975304,"x":475,"y":362},{"duration":766,"ts":2977571,"x":577,"y":349},{"duration":166,"ts":2978371,"x":637,"y":360},{"duration":300,"ts":2978571,"x":708,"y":359},{"duration":933,"ts":2978904,"x":828,"y":342},{"duration":399,"ts":2979871,"x":946,"y":344},{"duration":133,"ts":2980337,"x":476,"y":362},{"duration":633,"ts":2980504,"x":352,"y":422},{"duration":1134,"ts":2981170,"x":445,"y":438},{"duration":933,"ts":2982337,"x":559,"y":432},{"duration":567,"ts":2983303,"x":640,"y":431},{"duration":1234,"ts":2983903,"x":769,"y":434},{"duration":466,"ts":2985170,"x":839,"y":431},{"duration":400,"ts":2985670,"x":943,"y":422},{"duration":467,"ts":2986203,"x":967,"y":421},{"duration":133,"ts":2986703,"x":422,"y":471},{"duration":1633,"ts":2986870,"x":367,"y":525},{"duration":800,"ts":2988536,"x":460,"y":538},{"duration":500,"ts":2989369,"x":543,"y":527},{"duration":633,"ts":2989903,"x":606,"y":525},{"duration":867,"ts":2990569,"x":668,"y":517},{"duration":200,"ts":2991469,"x":737,"y":521},{"duration":1767,"ts":2991702,"x":884,"y":521},{"duration":867,"ts":2993502,"x":974,"y":529},{"duration":500,"ts":2994402,"x":0,"y":-1},{"duration":367,"ts":2995035,"x":610,"y":635}],"setup":{"lineSize":2,"textID":0},"words":[{"duration":0,"focusCount":0,"height":40,"text":"Asteroidit","timestamp":0,"width":130.7833251953125,"x":357.1000061035156,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"eli","timestamp":0,"width":31.849990844726562,"x":495.1166687011719,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"pikkuplaneetat","timestamp":0,"width":199.9166717529297,"x":534.2000122070312,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"ovat","timestamp":0,"width":58.383331298828125,"x":741.3499755859375,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"pääosin","timestamp":0,"width":103.76667785644531,"x":806.9666748046875,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"kivisiä,","timestamp":0,"width":90.91667175292969,"x":917.9666748046875,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"metallisia","timestamp":0,"width":128.5333251953125,"x":324.23333740234375,"y":318.75},{"duration":0,"focusCount":0,"height":40,"text":"ja","timestamp":0,"width":23.966659545898438,"x":460,"y":318.75},{"duration":0,"focusCount":0,"height":40,"text":"jäisiä","timestamp":0,"width":68.26666259765625,"x":491.20001220703125,"y":318.75},{"duration":1864.5320812542923,"focusCount":2,"height":40,"text":"kappaleita,","timestamp":2288660.6878462234,"width":147.58334350585938,"x":566.7000122070312,"y":318.75},{"duration":333.9528578296304,"focusCount":1,"height":40,"text":"jotka","timestamp":2286260.4292077613,"width":67.23333740234375,"x":721.5166625976562,"y":318.75},{"duration":2066.219657058362,"focusCount":1,"height":40,"text":"kiertävät","timestamp":2286594.4324902743,"width":118.13333129882812,"x":795.9833374023438,"y":318.75},{"duration":0,"focusCount":0,"height":40,"text":"Aurinkoa","timestamp":0,"width":120.41665649414062,"x":921.3499755859375,"y":318.75},{"duration":1297.8478923821822,"focusCount":1,"height":40,"text":"omilla","timestamp":2288860.6002946943,"width":82.63333129882812,"x":347.01666259765625,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"radoillaan.","timestamp":0,"width":141.75,"x":436.8833312988281,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"Suurin","timestamp":0,"width":85.88333129882812,"x":585.86669921875,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"osa","timestamp":0,"width":45.76666259765625,"x":678.9833374023438,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"asteroideista","timestamp":0,"width":171.1999969482422,"x":731.9833374023438,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"sijaitsee","timestamp":0,"width":108.56666564941406,"x":910.4166870117188,"y":408.23333740234375},{"duration":666.0248303632252,"focusCount":1,"height":40,"text":"Marsin","timestamp":2295592.6426371485,"width":92.55000305175781,"x":304.6499938964844,"y":497.7166748046875},{"duration":1167.7727372925729,"focusCount":1,"height":40,"text":"ja","timestamp":2296258.742881418,"width":23.966659545898438,"x":404.433349609375,"y":497.7166748046875},{"duration":1131.9756747763604,"focusCount":2,"height":40,"text":"Jupiterin","timestamp":2297426.644580953,"width":116.03334045410156,"x":435.6333312988281,"y":497.7166748046875},{"duration":1264.6889778785408,"focusCount":2,"height":40,"text":"välissä","timestamp":2304992.119469907,"width":87.53334045410156,"x":558.9000244140625,"y":497.7166748046875},{"duration":3699.288164122496,"focusCount":3,"height":40,"text":"olevalla","timestamp":2305656.8827907247,"width":103.01666259765625,"x":653.6666870117188,"y":497.7166748046875},{"duration":4201.018221606966,"focusCount":3,"height":40,"text":"asteroidivyöhykkeellä.","timestamp":2306790.919183959,"width":297.4166564941406,"x":763.9166870117188,"y":497.7166748046875}]}');

	    const progressions = [
		    [
		    	{x: 150, y: 100, duration: 300},
		    	{x: 200, y: 120, duration: 350},
		    	{x: 250, y: 110, duration: 400},
		    ],
		    [
		    	{x: 170, y: 120, duration: 300},
		    	{x: 230, y: 110, duration: 300},
		    	{x: 300, y: 120, duration: 300},
		    	{x: 350, y: 110, duration: 300},
		    ],
		    [
		    	{x: 140, y: 175, duration: 300},
		    	{x: 230, y: 180, duration: 300},
		    	{x: 300, y: 170, duration: 300},
		    	{x: 350, y: 175, duration: 300},
		    ],
	    ];

	    const merger = new ProgressionMerger( interLineDistance );

	    const readingLines = merger.merge( progressions, 2 );

	    assert.equal( readingLines.length, 2 );
	    assert.equal( readingLines[0].joined, 2 );
	    assert.sameDeepMembers( readingLines[0], progressions[0].concat( progressions[1] ) );
    	assert.sameDeepMembers( readingLines[1], progressions[2] );
	});

	it( 'should make 3 lines out of few challenging progressions', () =>  {
		//const data = JSON.parse('{"fixations":[{"duration":267,"ts":2965839,"x":1283,"y":116},{"duration":134,"ts":2966172,"x":579,"y":293},{"duration":1266,"ts":2966339,"x":405,"y":300},{"duration":1200,"ts":2967639,"x":470,"y":293},{"duration":433,"ts":2969039,"x":542,"y":266},{"duration":867,"ts":2969505,"x":612,"y":249},{"duration":733,"ts":2970405,"x":675,"y":284},{"duration":300,"ts":2971172,"x":737,"y":292},{"duration":866,"ts":2971505,"x":824,"y":276},{"duration":1133,"ts":2972405,"x":934,"y":256},{"duration":167,"ts":2973571,"x":600,"y":258},{"duration":1367,"ts":2973771,"x":381,"y":347},{"duration":1200,"ts":2974071,"x":0,"y":-1},{"duration":2233,"ts":2975304,"x":475,"y":362},{"duration":766,"ts":2977571,"x":577,"y":349},{"duration":166,"ts":2978371,"x":637,"y":360},{"duration":300,"ts":2978571,"x":708,"y":359},{"duration":933,"ts":2978904,"x":828,"y":342},{"duration":399,"ts":2979871,"x":946,"y":344},{"duration":133,"ts":2980337,"x":476,"y":362},{"duration":633,"ts":2980504,"x":352,"y":422},{"duration":1134,"ts":2981170,"x":445,"y":438},{"duration":933,"ts":2982337,"x":559,"y":432},{"duration":567,"ts":2983303,"x":640,"y":431},{"duration":1234,"ts":2983903,"x":769,"y":434},{"duration":466,"ts":2985170,"x":839,"y":431},{"duration":400,"ts":2985670,"x":943,"y":422},{"duration":467,"ts":2986203,"x":967,"y":421},{"duration":133,"ts":2986703,"x":422,"y":471},{"duration":1633,"ts":2986870,"x":367,"y":525},{"duration":800,"ts":2988536,"x":460,"y":538},{"duration":500,"ts":2989369,"x":543,"y":527},{"duration":633,"ts":2989903,"x":606,"y":525},{"duration":867,"ts":2990569,"x":668,"y":517},{"duration":200,"ts":2991469,"x":737,"y":521},{"duration":1767,"ts":2991702,"x":884,"y":521},{"duration":867,"ts":2993502,"x":974,"y":529},{"duration":500,"ts":2994402,"x":0,"y":-1},{"duration":367,"ts":2995035,"x":610,"y":635}],"setup":{"lineSize":2,"textID":0},"words":[{"duration":0,"focusCount":0,"height":40,"text":"Asteroidit","timestamp":0,"width":130.7833251953125,"x":357.1000061035156,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"eli","timestamp":0,"width":31.849990844726562,"x":495.1166687011719,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"pikkuplaneetat","timestamp":0,"width":199.9166717529297,"x":534.2000122070312,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"ovat","timestamp":0,"width":58.383331298828125,"x":741.3499755859375,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"pääosin","timestamp":0,"width":103.76667785644531,"x":806.9666748046875,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"kivisiä,","timestamp":0,"width":90.91667175292969,"x":917.9666748046875,"y":229.26666259765625},{"duration":0,"focusCount":0,"height":40,"text":"metallisia","timestamp":0,"width":128.5333251953125,"x":324.23333740234375,"y":318.75},{"duration":0,"focusCount":0,"height":40,"text":"ja","timestamp":0,"width":23.966659545898438,"x":460,"y":318.75},{"duration":0,"focusCount":0,"height":40,"text":"jäisiä","timestamp":0,"width":68.26666259765625,"x":491.20001220703125,"y":318.75},{"duration":1864.5320812542923,"focusCount":2,"height":40,"text":"kappaleita,","timestamp":2288660.6878462234,"width":147.58334350585938,"x":566.7000122070312,"y":318.75},{"duration":333.9528578296304,"focusCount":1,"height":40,"text":"jotka","timestamp":2286260.4292077613,"width":67.23333740234375,"x":721.5166625976562,"y":318.75},{"duration":2066.219657058362,"focusCount":1,"height":40,"text":"kiertävät","timestamp":2286594.4324902743,"width":118.13333129882812,"x":795.9833374023438,"y":318.75},{"duration":0,"focusCount":0,"height":40,"text":"Aurinkoa","timestamp":0,"width":120.41665649414062,"x":921.3499755859375,"y":318.75},{"duration":1297.8478923821822,"focusCount":1,"height":40,"text":"omilla","timestamp":2288860.6002946943,"width":82.63333129882812,"x":347.01666259765625,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"radoillaan.","timestamp":0,"width":141.75,"x":436.8833312988281,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"Suurin","timestamp":0,"width":85.88333129882812,"x":585.86669921875,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"osa","timestamp":0,"width":45.76666259765625,"x":678.9833374023438,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"asteroideista","timestamp":0,"width":171.1999969482422,"x":731.9833374023438,"y":408.23333740234375},{"duration":0,"focusCount":0,"height":40,"text":"sijaitsee","timestamp":0,"width":108.56666564941406,"x":910.4166870117188,"y":408.23333740234375},{"duration":666.0248303632252,"focusCount":1,"height":40,"text":"Marsin","timestamp":2295592.6426371485,"width":92.55000305175781,"x":304.6499938964844,"y":497.7166748046875},{"duration":1167.7727372925729,"focusCount":1,"height":40,"text":"ja","timestamp":2296258.742881418,"width":23.966659545898438,"x":404.433349609375,"y":497.7166748046875},{"duration":1131.9756747763604,"focusCount":2,"height":40,"text":"Jupiterin","timestamp":2297426.644580953,"width":116.03334045410156,"x":435.6333312988281,"y":497.7166748046875},{"duration":1264.6889778785408,"focusCount":2,"height":40,"text":"välissä","timestamp":2304992.119469907,"width":87.53334045410156,"x":558.9000244140625,"y":497.7166748046875},{"duration":3699.288164122496,"focusCount":3,"height":40,"text":"olevalla","timestamp":2305656.8827907247,"width":103.01666259765625,"x":653.6666870117188,"y":497.7166748046875},{"duration":4201.018221606966,"focusCount":3,"height":40,"text":"asteroidivyöhykkeellä.","timestamp":2306790.919183959,"width":297.4166564941406,"x":763.9166870117188,"y":497.7166748046875}]}');

	    const progressions = [
		    [
		    	{x: 150, y: 90, duration: 300},
		    	{x: 200, y: 100, duration: 350},
		    	{x: 250, y: 120, duration: 400},
		    	{x: 300, y: 120, duration: 400},
		    	{x: 400, y: 130, duration: 400},
		    ],
		    [
		    	{x: 350, y: 130, duration: 400},
		    ],
		    [
		    	{x: 170, y: 140, duration: 300},
		    	{x: 230, y: 130, duration: 300},
		    	{x: 300, y: 120, duration: 300},
		    	{x: 350, y: 110, duration: 300},
		    ],
		    [
		    	{x: 300, y: 130, duration: 400},
		    ],
		    [
		    	{x: 140, y: 175, duration: 300},
		    	{x: 230, y: 180, duration: 300},
		    	{x: 300, y: 170, duration: 300},
		    	{x: 350, y: 175, duration: 300},
		    ],
		    [
		    	{x: 200, y: 150, duration: 300},
		    	{x: 250, y: 145, duration: 300},
		    ],
		    [
		    	{x: 150, y: 230, duration: 300},
		    	{x: 200, y: 230, duration: 300},
		    ],
		    [
		    	{x: 150, y: 250, duration: 300},
		    ],
		    [
		    	{x: 250, y: 250, duration: 300},
		    	{x: 300, y: 250, duration: 300},
		    ],
		    [
		    	{x: 500, y: 310, duration: 300},
		    ],
		    [
		    	{x: 150, y: 80, duration: 300},
		    	{x: 200, y: 75, duration: 300},
		    ],
		    [
		    	{x: 150, y: 210, duration: 300},
		    	{x: 180, y: 235, duration: 300},
		    	{x: 210, y: 255, duration: 300},
		    ],
	    ];

	    const merger = new ProgressionMerger( interLineDistance, logger );

	    const readingLines = merger.merge( progressions, 3 );

	    //logger.log( readingLines );

	    assert.equal( readingLines.length, 3 );
	    assert.equal( readingLines[0].length, 11 );
	    assert.equal( readingLines[1].length, 6 );
	    assert.equal( readingLines[2].length, 8 );

	    assert.isDefined( progressions[9].removed );
	    assert.isDefined( progressions[10].removed );
	});

	it( 'should assign line ID = 0, 2, 3 due to missing line', () =>  {
	    const progressions = [
		    [
		    	{x: 150, y: 100, duration: 300},
		    	{x: 200, y: 120, duration: 350},
		    	{x: 250, y: 110, duration: 400},
		    ],
		    [
		    	{x: 170, y: 220, duration: 300},
		    	{x: 230, y: 210, duration: 300},
		    	{x: 300, y: 220, duration: 300},
		    	{x: 350, y: 210, duration: 300},
		    ],
		    [
		    	{x: 140, y: 275, duration: 300},
		    	{x: 230, y: 280, duration: 300},
		    	{x: 300, y: 270, duration: 300},
		    	{x: 350, y: 275, duration: 300},
		    ],
	    ];

		const words = [
			new Word(100, 100, 90, 20),
			new Word(200, 100, 90, 20),
			new Word(300, 100, 90, 20),
			new Word(100, 210, 90, 20),
			new Word(200, 210, 90, 20),
			new Word(300, 210, 110, 20),
			new Word(100, 265, 90, 20),
			new Word(200, 265, 90, 20),
			new Word(300, 265, 90, 20),
		];

		const text = new TextModel( words );

	    const merger = new ProgressionMerger( text.interlineDistance );

	    const readingLines = merger.merge( progressions, text.lines.length );
	    assert.equal( readingLines.length, text.lines.length );

	    //logger.log( readingLines );
	    assert.equal( readingLines[0][0].line, 0 );
	    assert.equal( readingLines[1][0].line, 2 );
	    assert.equal( readingLines[2][0].line, 3 );
	});
});

