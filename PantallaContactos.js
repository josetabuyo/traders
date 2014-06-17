var PantallaContactos = {
	start:function(){
		var _this = this;
		this.ui = $("#pantalla_contactos");	
		PantallaListaContactos.start();
		PantallaContacto.start();
		PantallaListaContactos.onSelect(function(){
			_this.ui.animate({scrollLeft: _this.ui.width()}, 300);
		});
	},
	render:function(){
		this.ui.show();
		PantallaContacto.render();
		PantallaListaContactos.render();
		this.ui.animate({scrollLeft: 0}, 300);
	}
};