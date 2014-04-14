var BarraSuperior = {
    start : function(){   
        var _this = this;
		
        this.ui = $("#barra_superior");
			
		this.solapa_yo 			= this.ui.find("#solapa_yo");
		this.solapa_contactos 	= this.ui.find("#solapa_contactos");
		this.solapa_trueques 	= this.ui.find("#solapa_trueques");
		this.solapa_productos 	= this.ui.find("#solapa_productos");
		this.solapa_cerrar 		= this.ui.find("#solapa_cerrar");
		
		
		
		
		
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
			PantallaListaContactos.render();
			PantallaTrueque.render();
		});	
		
		this.solapa_productos.click(function(e) {
			PantallaTrueque.render();
		});	
		
		
		this.solapa_cerrar.click(function(e) {
			alert('cerrar la sesion');
		});
		
    },
	render: function(){
        this.ui.show();
    }
};