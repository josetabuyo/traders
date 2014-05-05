var PantallaListaTrueques = {
    start: function(){
		
        var _this = this;
		
        this.ui =  $("#pantalla_lista_trueques");
        
        
		this.lista_trueques = this.ui.find("#lista_trueques");
		/*
		this.btn_add_trueque = this.ui.find("#btn_add_trueque");
		this.btn_add_trueque.click(function(e){
			Traders.nuevoTrueque();
			_this.render();
		});
		*/
		
		this.hide();
		
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
		
			var vTrueque = $.extend(true, {}, vItemTrueque, {
				trueque: trueque,
				ui: $("#plantillas .trueque_en_lista").clone()
			});
			
			// TO DO: mejorar vista de trueque
			vTrueque.ui.find("#nombre").text(trueque.contacto.nombre);
			
			var $btn_eliminar = $trueque_en_lista.find("#btn_eliminar");
			$btn_eliminar.click(function(e){
				Traders.quitarTrueque(trueque.id);
				
				_this.render();
			});
			
			
            $trueque_en_lista.click(function(){
				_this.trueque_seleccionado = trueque;
                $trueque_en_lista.addClass("trueque_seleccionado");
				
				_this.onSelect();
            });
			
			
			
            _this.lista_trueques.append($trueque_en_lista);
			
			
            if(_this.trueque_seleccionado.id==trueque.id){
                $trueque_en_lista.addClass("trueque_seleccionado");
            }
			
			
		});
        
        
        Traders.onNovedades(function(){
            _this.render();
        });  
        
		
        this.show();
    }
};


var vItemTrueque = {
	trueque: null,
	ui: null,
	select: function(){
		this.ui.siblings().removeClass("trueque_seleccionado");
		this.ui.addClass("trueque_seleccionado");
		PantallaListaTrueques.trueque_seleccionado = this.trueque;
	}
};