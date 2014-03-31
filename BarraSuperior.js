var BarraSuperior = {
    start : function(){   
        var _this = this;
		
        this.ui = $("#barra_superior");
			
		this.solapa_yo 			= this.ui.find("#solapa_yo");
		this.solapa_amigos 		= this.ui.find("#solapa_amigos");
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
		
		
		this.solapa_amigos.click(function(e) {
			PantallaAmigos.render();
		});	
		
		this.solapa_trueques.click(function(e) {
			PantallaTrueques.render();
		});	
		
		this.solapa_productos.click(function(e) {
			PantallaTrueques.render();
		});	
		
		
		this.solapa_cerrar.click(function(e) {
			alert('cerrar la sesion');
		});
		
    },
	seleccionar:function(jqSelector){
		$('div.pantalla').hide();
		/////TO DO
		
		_this.ui.find(jqSelector).removeClass('solapa_selected');
		jqSelector.addClass('solapa_selected',1000);
	},
    render: function(){
        this.ui.show();
    }
};