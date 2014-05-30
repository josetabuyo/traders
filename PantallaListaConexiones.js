var PantallaListaConexiones = {
 start: function(){
        var _this = this;
		
        this.ui =  $("#pantalla_lista_conexiones");
		this.lista_conexiones = this.ui.find("#lista_conexiones");
	 
		this.btn_add_conexion = this.ui.find("#btn_add_conexion");
		this.btn_add_conexion.click(function(e){
			alertify.prompt("Ingrese la url", function (e, str) {
				if (e) {
					var conexion = Traders.agregarConexion(str);
				}
			}, "");
			
			_this.render();
		});		
	 
		Traders.onNovedades(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
        });
	 
		this.hide();	
    },
	
	add: function(conexion){
		var _this = this;
		
		var $conexion_en_lista = $("#plantillas .conexion_en_lista").clone();
		
		$conexion_en_lista.find("#url").text(conexion.url);
		
		var $btn_eliminar = $conexion_en_lista.find("#btn_eliminar");
		$btn_eliminar.click(function(e){
			Traders.quitarConexion(conexion.id);
		});	
		
		var $rad_activar = $conexion_en_lista.find("#rad_activar");	
		if(Traders.id_conexion_activa == conexion.id) $rad_activar.click();
		$rad_activar.change(function() {
			if ($rad_activar.val()=="on") {
				Traders.activarConexion(conexion.id);
			}
		});
		
		$conexion_en_lista.click(function(){			
			_this.conexion_seleccionada = conexion;
			_this.lista_conexiones.find('.conexion_en_lista').removeClass("conexion_seleccionada");
			
			$(this).addClass("conexion_seleccionada");		
			_this.onSelect();
		});
		
		if(this.conexion_seleccionada == conexion){
			 $conexion_en_lista.click();
		}
		
		this.lista_conexiones.append($conexion_en_lista);
		
	},

	_onSelect:[],
	
    onSelect: function(){
		var _this = this;
		
		if(arguments.length==1){			
			this._onSelect.push(arguments[0]);			
		}else{
			_.each(this._onSelect, function(evento){
				evento();
			});
		}		
	},
	
	hide: function(){
		this.ui.hide();
	},
    
	show: function(){
		this.ui.show();
	},
	
    render: function(){        
		var _this = this;
		_this.lista_conexiones.empty();
		
        _.each(Traders.conexiones(), function(conexion){
			_this.add(conexion);
		});
		
        this.show();
    }
};