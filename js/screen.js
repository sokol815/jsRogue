jsRL.screen = function(mapSizeX, mapSizeY, viewSizeX, viewSizeY, innerParent, hoverInfo) {
	this.innerParent = 		innerParent;
	this.hoverInfo = 		hoverInfo;
	this.mapSize = 			{'width':mapSizeX,'height':mapSizeY};
	this.screenMapping = 	[];
	this.topLeft = 			{'x':0,'y':0};
	this.viewSize = 		{'width':viewSizeX,'height':viewSizeY};
	this.fontSize = 		{width:8,height:14};
};

jsRL.screen.prototype.initScreen = function() {
	this.screenMapping = Array(this.viewSize.width);
	this.innerParent.html('');
	for(var y = 0; y < this.viewSize.height;y++) {
		for(var x = 0; x < this.viewSize.width;x++) {
			if(y === 0) {
				this.screenMapping[x] = Array(this.viewSize.height);
			}
			this.innerParent.append('<span class="mapCell" id="cell'+x+'_'+y+'">&nbsp;</span>');
			this.screenMapping[x][y] = {'dom':$('#cell'+x+'_'+y),'color':'','bkdColor':'','tile':'&nbsp;','id':'cell'+x+"_"+y};
		}
		this.innerParent.append("<br />");
	}
};

jsRL.screen.prototype.resizeScreen = function(centerOn, map) {
	this.viewSize.width  =	Math.floor(this.innerParent.innerWidth() / this.fontSize.width);
	console.log(this.innerParent.innerWidth(),this.fontSize.width,this.innerParent / this.fontSize.width);
	if(this.viewSize.width > this.innerParent / 2 / this.fontSize.width) {
		this.viewSize.width = Math.floor(this.innerParent / 2 / this.fontSize.width);
	}
	this.viewSize.height = 28;
	if(this.viewSize.width > map.length){
		this.viewSize.width = map.length;
	}
	console.log(this.viewSize.width);
	if(this.viewSize.height > map[0].length){
		this.viewSize.height = map[0].length;
	}
	this.initScreen();
	if(centerOn !== undefined) {
		this.centerView(centerOn.loc.x,centerOn.loc.y,map);
	}
	this.drawScreen(map);
};

jsRL.screen.prototype.centerView = function(x,y,map) {
        this.topLeft.x = x - (this.viewSize.width >> 1);
        if(this.topLeft.x < 0) {
                this.topLeft.x = 0;
        } else if(this.topLeft.x + this.viewSize.width > map.length) {
                this.topLeft.x = map.length - this.viewSize.width;
        }
        this.topLeft.y = y - (this.viewSize.height >> 1);
        if(this.topLeft.y < 0) {
                this.topLeft.y = 0;
        } else if(this.topLeft.y + this.viewSize.height > map[0].length) {
                this.topLeft.y = map[0].length - this.viewSize.height;
        }
};


jsRL.screen.prototype.drawScreen = function(map) {
	var _this = this;
	var curMapCell;
	var curProperty = '';

	for(var x = 0; x < this.viewSize.width;x++) {
		for(var y = 0; y < this.viewSize.height;y++) {
			curMapCell = map[x+this.topLeft.x][y+this.topLeft.y];
			curProperty = this.getBkdColor(curMapCell);
			if(curProperty != this.screenMapping[x][y].bkdColor) {
				this.screenMapping[x][y].dom.css({'background-color':curProperty});
				this.screenMapping[x][y].bkdColor = curProperty;
			}
			curProperty = this.getFgdColor(curMapCell);
			if(curProperty != this.screenMapping[x][y].fgdColor) {
				this.screenMapping[x][y].dom.css({'color':curProperty});
				this.screenMapping[x][y].fgdColor = curProperty;
			}
			curProperty = this.renderCell(curMapCell);
			if(curProperty != this.screenMapping[x][y].tile) {
				this.screenMapping[x][y].dom.html(curProperty);
				this.screenMapping[x][y].tile = curProperty;
			}
			/*curProperty = 'cell'+(x+this.topLeft.x)+'_'+(y+this.topLeft.y);
			if(curProperty != this.screenMapping[x][y].id) {
				this.screenMapping[x][y].dom.attr('id',curProperty);
			}*/
		}
	}
};

jsRL.screen.prototype.getBkdColor = function(mapCell) {
	//background colors
	if(mapCell.bkdColor !== '' && mapCell.seen) {
		return mapCell.bkdColor;
	} else {
		return '';
	}
};

jsRL.screen.prototype.getFgdColor = function(mapCell) {
	//foreground color
	if(mapCell.inSight ) {
		if(mapCell.occupier!=-1) {
			return game.entities[mapCell.occupier].color;
		} else if(mapCell.itemsHere.length > 0){
			//TODO: draw color of 1st item here.
		} else {
			return (mapCell.color===''?'#ababab':mapCell.color);
		}
	} else {
		return '';
	}
};

jsRL.screen.prototype.renderCell = function(cell) {
	if(!cell.seen) {
		return '&nbsp;';
	} else if(cell.inSight) {
		if(cell.occupier != -1) {
			return game.entities[cell.occupier].character;
		} else if(cell.itemsHere.length > 0) {
			//TODO: render 1st item on cell
		}
	}
	return cell.tile;
};

jsRL.screen.prototype.explainHover = function(x, y, map) {
	this.hoverInfo.html('&nbsp;');
	x = parseInt(x) + this.topLeft.x;
	y = parseInt(y) + this.topLeft.y;
	if(x < 0 || y < 0 || x >= this.mapSize.width || y >= this.mapSize.height) {
		this.hoverInfo.html('&nbsp;');
	} else {
		this.hoverInfo.html(this.explainTile(map[x][y],x,y));
	}
};

jsRL.screen.prototype.explainTile = function(cell, x, y) {
	var response = '('+x+','+y+') ';
	if(cell.occupier !== -1 && cell.inSight) {
		return response + " " + game.entities[cell.occupier].toString();
	}
	if(cell.tile !== '' && cell.seen) {
		switch(cell.tile) {
			case '█':
			case '#': response += 'wall';			break;
			case '.': response += 'floor';			break;
			case '+': response += 'closed door';	break;
			case '/': response += 'open door';		break;
			case '>': response += 'stairs down';	break;
			case '<': response += 'stairs up';		break;
			case '^': response += 'mountains';		break;
		}
	}
	return response + " ("+cell.moveCost+") ["+cell.djikstra.dist.toFixed(1)+"]";
};