var PantallaListaContactos = {
    start: function(){
		
        var _this = this;
		
        this.ui =  $("#pantalla_lista_contactos");     
        
        this.contacto_seleccionado = {
			nombre:"",
			id:"",
			inventario:[],
			trueque: {
				mio:[],
				suyo:[]
			}
		};
        
        this.lista_contactos = this.ui.find("#lista_contactos");
		
		this.btn_add_contacto = this.ui.find("#btn_add_contacto");
		this.btn_add_contacto.click(function(e){
			
			alertify.prompt("Ingrese el id del usuario", function (e, str) {
				if (e) {
					Traders.agregarContacto(str);
				} else {
					// user clicked "cancel"
				}
			}, "");
			
			_this.render();
		});
		
		
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
        
        this.lista_contactos.empty();
		
        _.each(Traders.contactos(), function(contacto){
            var vista_contacto = $("#plantillas .contacto_en_lista").clone();
            vista_contacto.find("#nombre").text(contacto.nombre);
			
			
			
			var btn_eliminar = vista_contacto.find("#btn_eliminar");
			btn_eliminar.click(function(e){
				Traders.quitarContacto(contacto.id);
				
				_this.render();
			});
			
			
            vista_contacto.click(function(){
				_this.contacto_seleccionado = contacto;
				
				_this.onSelect();
            });
			
            _this.lista_contactos.append(vista_contacto);
            if(_this.contacto_seleccionado.id==contacto.id){
                vista_contacto.addClass("contacto_seleccionado");
            }
        
		});
        
        
        Traders.onNovedades(function(){
            _this.render();
        });  
        
		
        this.show();
    }
};