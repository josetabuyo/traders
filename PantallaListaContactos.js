var PantallaListaContactos = {
    start: function(){
		
        var _this = this;
		
        this.ui =  $("#pantalla_lista_contactos");     
        
        this.contacto_seleccionado = {};
        
		
        this.lista_contactos = this.ui.find("#lista_contactos");
		
		this.btn_add_contacto = this.ui.find("#btn_add_contacto");
		this.btn_add_contacto.click(function(e){
			vex.dialog.prompt({
				message: 'Ingrese el id del usuario',
				placeholder: 'Id del usuario',
				callback: function(value) {
					if(value){
						Traders.agregarContacto(value);
					}
				}
			});			
			_this.render();
		});
		
		
		Traders.onNovedades(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
        });
		
		
		this.hide();
		
    },
	
	add: function(contacto){
		var _this = this;
		
		var $contacto_en_lista = $("#plantillas .contacto_en_lista").clone();
		
		$contacto_en_lista.find("#nombre").text(contacto.nombre);
		var $avatar = $contacto_en_lista.find("#avatar").text(contacto.nombre);
		
        if(contacto.avatar) $avatar.attr("src", contacto.avatar);
        else $avatar.attr("src", "avatar_default.png");
        
		var btn_eliminar = $contacto_en_lista.find("#btn_eliminar");
        
		btn_eliminar.click(function(e){
			Traders.quitarContacto(contacto.id);
			
			$contacto_en_lista.remove();
		});
		
		
		$contacto_en_lista.click(function(){
			
			_this.contacto_seleccionado = contacto;
			_this.lista_contactos.find('.contacto_en_lista').removeClass("contacto_seleccionado");
			
			$(this).addClass("contacto_seleccionado");
			
			
			_this.onSelect();
		});
		
		if(this.contacto_seleccionado.id){
			if(contacto.id == this.contacto_seleccionado.id){
				$contacto_en_lista.addClass("contacto_seleccionado");
			}
		};
		
		this.lista_contactos.append($contacto_en_lista);
		
	},
	
	_onSelect:[],
	
    onSelect: function(){
		var _this = this;
		
		if(arguments.length==1){
			
			if(typeof(arguments[0]) == "function"){
				this._onSelect.push(arguments[0]);
			} else if(typeof(arguments[0]) == "object"){
				
				this.contacto_seleccionado = arguments[0];
			}
			
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
		
		if(!this.contacto_seleccionado){
			this.contacto_seleccionado = Traders.contactos()[0];
		}
		
        this.lista_contactos.empty();
		
        _.each(Traders.contactos(), function(contacto){
			_this.add(contacto);
		});

        this.show();
    }
};