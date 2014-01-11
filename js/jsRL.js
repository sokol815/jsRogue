//setup namespace
window.jsRL = {};



/*"{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
will output 
ASP is dead, but ASP.NET is alive! ASP {2}
*/
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return (typeof args[number] != 'undefined'? args[number] : match);
    });
  };
}

if (!String.prototype.padLeft) {
	String.prototype.padLeft = function() {
		var args = arguments;
		//args[0] = length;
		//args[1] = character;
		
		var construct = this;
		for(var i = this.length; i < args[0];i++) {
			construct = args[1] + construct;
		}
		return construct;
	};
}

if(!Math.origin) {
	Math.origin = function() {
		var args = arguments;
		if(args[0] > 0) {
			return Math.floor(args[0]);
		} else {
			return Math.ceil(args[0]);
		}
	};
}
/*random function for jsRL --
0 args - passthrough of math.random
1 arg  - [0,n) (exclusive of n)
2 args - [a,b] (inclusive of both) */
jsRL.rand = function() {
	if(arguments.length===0) {
		return Math.random();
	} else if(arguments.length==1) {
		return Math.floor(Math.random() * arguments[0]);
	} else if(arguments.length >=2) {
		if(arguments[0] > arguments[1]) {
			var t = arguments[0];
			arguments[0] = arguments[1];
			arguments[1] = t;
		}
		arguments[1]++;
		return Math.floor(Math.random() * (arguments[1] - arguments[0])) + arguments[0];

	}

};

jsRL.calcDamage = function(d_string) {
	return jsRL.parseEquation(d_string);
};

jsRL.calcMaxMinDamage = function(d_string) {
	var parts = d_string.split('d');
	var add_on = 0;
	if(parts[1].indexOf('+')!=-1)
	{
		add_on = parseInt(parts[1].split('+')[1],10);
	}
	var minDmg = 0;
	var maxDmg = 0;
	for(var i = 0; i < parseInt(parts[0],10);i++)
	{
		maxDmg += parseInt(parts[1],10);
		minDmg ++;
	}
	minDmg += add_on;
	maxDmg += add_on;
	return {'min':minDmg,'max':maxDmg,'avg':(minDmg + maxDmg) >> 1};
};

jsRL.addMessage = function(msg,color) {
	if(color === undefined) {
		$('#messagesView').prepend(msg+"<br />").scrollTop(0);
	} else {
		$('#messagesView').prepend('<span style="color:'+color+'">'+msg+"</span><br />").scrollTop(0);
	}
};

/*

	about the string formatting seen below:
	{0} will be replaced with a possesive: 'The bat\'s', 'Your', 'Timn the Necromancer\'s'
	{1} will be replaced with either 'You are' or 'The bat is'


*/
jsRL.statusLookup = [
	{'type':'speed', 'name':'hasted','color':'#76B5EA','timeLeft':500,'effects':{'speed':-5},'wearOff':'{0} speed drops'},
	{'type':'speed', 'name':'hungry','color':'yellow','timeLeft':500,'effects':{'speed':5},  'wearOff':'{1} no longer hungry'},
	{'type':'speed', 'name':'stunned','color':'yellow','timeLeft':100,'effects':{'speed':50},'wearOff':'{1} no longer stunned'},
	{'type':'speed', 'name':'frozen','color':'yellow','timeLeft':200,'effects':{'speed':90}, 'wearOff':'{1} no longer frozen'},

];

jsRL.checkInBounds = function(boundArray,x,y) {
	if(x > -1 && y > -1 && x < boundArray.length && y < boundArray[0].length) {
		return true;
	}
	return false;
};

jsRL.getDistance = function(x1,y1,x2,y2) {
		return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
};

jsRL.dieDecomposer = function(input){
	var decompose = [
		'','',''
	];
	var state = 0;
	var startState = 0;
	for(var i = 0; i < input.length;i++){
		switch(input[i]){
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				decompose[state] += input[i];
			break;
			case '-': decompose[2] += '-';
			case '+': state = 2;
			break;
			case 'd': state = 1;
			break;
			default:
			break;
		}
	}
	if(state === 0) {
		decompose[2] = decompose[0];
		decompose[0] = 0;
	}
	for(i = 0; i < decompose.length;i++){
		if(decompose[i]===''){
			decompose[i] = 0;
		} else {
			decompose[i] = parseInt(decompose[i],10);
		}
	}
	return decompose;
};

jsRL.parseEquation = function(input){
	input = input.toString();
	var split;
	var curVal = 0;
	if(input.indexOf('+')!=-1) {
		split = input.split('+');
		curVal = this.parseEquation(split[0]);
		for(var i = 1;i < split.length;i++){
			curVal += this.parseEquation(split[i]);
		}
		return curVal;
	}
	if(input.indexOf('-')!=-1) {
		split = input.split('-');
		curVal = this.parseEquation(split[0]);
		for(var i = 1;i < split.length;i++){
			curVal -= this.parseEquation(split[i]);
		}
		return curVal;
	}
	if(input.indexOf('d')!=-1){
		split = input.split('d');
		var dice = this.parseEquation(split[0]);
		var sides = this.parseEquation(split[1]);
		var curVal = 0;
		for(var i = 0; i < dice;i++){
			curVal+=(jsRL.rand(1,sides));
		}
		return curVal;
	}
	if(input.indexOf('/')!=-1) {
		split = input.split('/');
		curVal = this.parseEquation(split[0]);
		for(var i = 1;i < split.length;i++){
			curVal /= this.parseEquation(split[i]);
		}
		return curVal
	}
	if(input.indexOf('*')!=-1) {
		split = input.split('*');
		curVal = this.parseEquation(split[0]);
		for(var i = 1;i < split.length;i++){
			curVal *= this.parseEquation(split[i]);
		}
		return curVal;
	}
	return parseFloat(input);
};

jsRL.skillLookup = function(baseAttr,level){

	switch(baseAttr){
		case 'strength':
		break;
		case 'agility':
		break;
		case 'mysticism':
		break;
		case 'intelligence':
		break;
	}

};

jsRL.xGos = [0,1,0,-1,-1,-1,1,1];
jsRL.yGos = [1,0,-1,0,-1,1,-1,1];
jsRL.dist = [1,1,1,1,1.4,1.4,1.4,1.4];
jsRL.normalColor = '#DDDDDD';
jsRL.magicColor = '#66D9EF';
jsRL.cursedColor = '#9E0A00';
jsRL.rareColor = '#FFD342';
jsRL.artifactColor = '#3BB72F';

jsRL.rooms = [
	{
		'room':[ 	
			'OKKKKKKKO',
			'K.......K',
			'K.......K',
			'K.......K',
			'K...W...K',
			'K.......K',
			'OKKKKKKKO'
		],
		'minDepth':0,
		'maxDepth':-1,
		'chance':5,
		'writings':[]
	},
	{

		'room':[ 	
			'OKKKKKKKO',
			'K.......K',
			'K.......K',
			'K.......K',
			'K.......K',
			'K.......K',
			'K.......K',
			'K.......K',
			'OKKKKKKKO'
		],
		'minDepth':0,
		'maxDepth':-1,
		'chance':5
	},
	{
		'room':[ 	
			'OKKKKKKKKKKKKKO',
			'M.............M',
			'M..OOOO+OOOO..M',
			'M..O...W..PO..M', //W --- writing(look at the room's writing info...); P --- potion
			'M..O...1...O..M',
			'M..Os......O..M', //s --- scroll
			'M..OOOOOOOOO..M',
			'M.............M',
			'M...AAAAAAA...M', //A ... finds all D's that it touches and those Ds touch and destroys them upon being touched by the player.
			'MDDDDDDDDDDDDDM', //D --- chain destroyed upon activation of any touching A
			'M....21112....M', //numbers (0-9) denote out-of-depth monsters. these monsters do not apply to the level's given monster quota
			'M..T.11311.T..M', //T - denotes a treasure... (of class at least rare)
			'OMMMMMMMMMMMMMO',
		],
		'minDepth':4,
		'maxDepth':-1,
		'chance':1,
		'writings':['You see the remains of a dusty library.']
	},
	{
		'room':[ 	
			'OKKKKKKKO',
			'K.......K',
			'K.......K',
			'K.......K',
			'K.......K',
			'K.......K',
			'OKKKKKKKO'
		],
		'minDepth':0,
		'maxDepth':-1,
		'chance':1
	}
];

function createRoom(width,height,addWalls,base){
	var nRoom = Array(width);
	console.log(nRoom);
	for(var i = 0; i < width;i++){
		nRoom[i] = Array(height);
		for(var j = 0; j < height;j++){
			console.log(i,j);
			nRoom[i][j] = (base === null?'.':base);
			if(addWalls && (i === 0 || j === 0 || j == height-1 || i == width - 1)) {
				nRoom[i][j] = '#';
				console.log('wall');
			}
		}
	}
	return nRoom;
}

function circleRoom(r,replace){
	var center = {'x':0,'y':0};
	var validRadius = Math.min(r.length/2,r[0].length/2)-1;
	//if(r.length %2 == 1)
	//	center.x = r.length/2 >> 0;
	//else
		center.x = r.length/2;
	//if(r[0].length %2 == 1) 
	//	center.y = r[0].length/2 >> 0;
	//else
		center.y = r[0].length/2;
	console.log(center,validRadius);
	for(var i = 0; i < r[0].length;i++) {
		for(var j = 0; j < r.length;j++){
			if(jsRL.getDistance(i,j,center.x,center.y) <= validRadius) {
				r[i][j] = replace;
			}
		}
	}
}

function printRoom(r){
	var total = '';
	for(var i = 0; i < r[0].length;i++) {
		total = '';
		for(var j = 0; j < r.length;j++){
			total += r[j][i];
		}
		console.log(total);
	}
}
