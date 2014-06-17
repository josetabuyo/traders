var PantallaContactos = {
	start:function(){
		this.ui = $("#pantalla_contactos");	
	},
	render:function(){
		this.ui.show();
		PantallaContacto.render();
		PantallaListaContactos.render();
	}
};