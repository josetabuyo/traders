var PantallaListaTrueques = {
    start: function(){
		
        var _this = this;
		
        this.ui =  $("#pantalla_lista_trueques");    
        
		this.lista_trueques = this.ui.find("#lista_trueques");
		
		Traders.onNovedades(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
        });
		
		this.hide();
    },
	
	add: function(trueque){
		var _this = this;
		
		var $trueque_en_lista = $("#plantillas .trueque_en_lista").clone();
		
		$trueque_en_lista.find("#nombre").text(trueque.contacto.nombre);
		
		var btn_eliminar = $trueque_en_lista.find("#btn_eliminar");
		btn_eliminar.click(function(e){
			Traders.quitarTrueque(trueque.id);
			
			$trueque_en_lista.remove();
		});
		
		$trueque_en_lista.click(function(){
			_this.trueque_seleccionado = trueque;
			_this.lista_trueques.find('.trueque_en_lista').removeClass("trueque_seleccionado");
			
			$(this).addClass("trueque_seleccionado");

			_this.onSelect();
		});
		
		if(this.trueque_seleccionado.id){
			if(trueque.id == this.trueque_seleccionado.id){
				$trueque_en_lista.addClass("contacto_seleccionado");
			}
		};
		
//		if(this.trueque_seleccionado == trueque){
//			 $trueque_en_lista.click();
//		}
		
		this.lista_trueques.append($trueque_en_lista);
		
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
        
		if(!this.trueque_seleccionado){
			this.trueque_seleccionado = Traders.trueques()[0];
		}

		this.lista_trueques.empty();
		
        _.each(Traders.trueques(), function(trueque){
			_this.add(trueque);
		});
		
        this.show();
    }
};