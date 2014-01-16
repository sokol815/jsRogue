window.mouse = {};
$(document).ready(function(){
	$(document).mousemove(function(e){
		window.mouse.x = e.pageX;
		window.mouse.y = e.pageY;
	});
	$('#mapView').mouseout(function(e){
		$('#hoverInfo').html('&nbsp;');
		game.pointedAt = null;
	});
	$('#mapView').on('mouseover','.mapCell',function(e){
		window.pointed = $(this);
		var items = $(this).attr('id').split('_');
		items[0] = items[0].substr(4);
		game.pointedAt = [items[0],items[1]];
		game.screen.explainHover(items[0],items[1],game.world.map);
	});
	

	$('.views span').click(function(e) {
		var item = $(this);
		if(item.hasClass('active')) {
			//do nothing
		} else {
			$('.views span').removeClass('active');
		}
		item.addClass('active');
		$('#personalMenus div:not(:first)').addClass('inactiveWindow');
		$('#'+item.attr('type')).removeClass('inactiveWindow');
	});
});