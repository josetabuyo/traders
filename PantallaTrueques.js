var PantallaTrueques = {
	start:function(){
		var _this = this;
		this.ui = $("#pantalla_trueques");	
		PantallaListaTrueques.start();
		PantallaTrueque.start();
		PantallaListaTrueques.onSelect(function(){
			_this.ui.animate({scrollLeft: _this.ui.width()}, 300);
		});
	},
	render:function(){
		this.ui.show();
		PantallaListaTrueques.render();
		PantallaTrueque.render();
		this.ui.animate({scrollLeft: 0}, 300);
	}
};