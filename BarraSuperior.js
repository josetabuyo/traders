var BarraSuperior = {
    start : function(){   
        var _this = this;
		
        this.ui = $("#barra_superior");
			
		this.solapa_yo 			= this.ui.find("#solapa_yo");
		this.solapa_contactos 	= this.ui.find("#solapa_contactos");
		this.solapa_trueques 	= this.ui.find("#solapa_trueques");
		this.solapa_productos 	= this.ui.find("#solapa_productos");
		this.solapa_vortex 		= this.ui.find("#solapa_vortex");
		
		
		
		this.ui.find(".solapa").on('click', function(){
			$('div.pantalla').hide();
			_this.ui.find('.solapa').removeClass('solapa_selected');
			$(this).addClass('solapa_selected',1000);
		});
		
		this.solapa_yo.click(function(e) {
			PantallaUsuario.render();
		});		
		
		this.solapa_contactos.click(function(e) {
			PantallaListaContactos.render();
			PantallaContacto.render();
		});	
		
		this.solapa_trueques.click(function(e) {
			PantallaListaTrueques.render();
			//PantallaTrueque.render();
		});	
		
		this.solapa_productos.click(function(e) {
			PantallaProductos.render();
		});	

		this.solapa_vortex.click(function(e) {
			PantallaListaConexiones.render();
		});	
		
    },
	render: function(){
        this.ui.show();
    }
};