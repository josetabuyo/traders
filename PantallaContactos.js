var PantallaContactos = {
	start:function(){
		var _this = this;
		this.ui = $("#pantalla_contactos");	
		PantallaListaContactos.onSelect(function(){
			_this.ui.scrollLeft(_this.ui.width());
		});
	},
	render:function(){
		this.ui.show();
		PantallaContacto.render();
		PantallaListaContactos.render();
	}
};