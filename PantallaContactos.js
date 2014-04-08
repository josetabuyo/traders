var PantallaContactos = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_contactos");     
        
        this.contacto_seleccionado = {
			nombre:"",
			id:"",
			inventario:[],
			trueque: {
				mio:[],
				suyo:[]
			}
		};
        
		
		
        this.panel_lista_contactos = this.ui.find("#panel_lista_contactos");
        this.panel_contacto = this.ui.find("#panel_contacto");
        this.lbl_nombre_contacto = this.ui.find("#lbl_nombre_contacto");
		
		
		//this.txt_id_contacto_add = this.ui.find("#txt_id_contacto_add");
		
		this.btn_add_contacto = this.ui.find("#btn_add_contacto");
		this.btn_add_contacto.click(function(e){
			
			alertify.prompt("Ingrese el id del usuario", function (e, str) {
				if (e) {
					Traders.agregarMercader(str);
					
				} else {
					// user clicked "cancel"
				}
			}, "");
			
			_this.render();
		});
		
		
		
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
        this.btn_trocar = this.ui.find("#btn_trocar");
		
        this.btn_trocar.click(function(e) {
            _this.ui.hide();
            PantallaTrueques.contacto = _this.contacto_seleccionado;
            PantallaTrueques.render();
		});	
    },
    render: function(){
        var _this = this;
        
        this.panel_lista_contactos.empty();
		
        _.each(Traders.mercaderes(), function(contacto){
            var vista_contacto = $("#plantillas .mercader_en_lista").clone();
            vista_contacto.find("#nombre").text(contacto.nombre);
			
			
			
			var btn_eliminar = vista_contacto.find("#btn_eliminar");
			btn_eliminar.click(function(e){
				Traders.quitarMercader(contacto.id);
				
				_this.render();
			});
			
			
			
            vista_contacto.click(function(){
                _this.contacto_seleccionado = contacto;
                _this.render();
            });
            _this.panel_lista_contactos.append(vista_contacto);
            if(_this.contacto_seleccionado.id==contacto.id){
                vista_contacto.addClass("mercader_seleccionado");
            }
        });        
        
        this.lbl_nombre_contacto.text(this.contacto_seleccionado.nombre);
        this.panel_inventario_contacto.empty();
        _.each(this.contacto_seleccionado.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto
            });
            vista.dibujarEn(_this.panel_inventario_contacto);
        });
        
        if(this.contacto_seleccionado.id == "") this.panel_contacto.hide();
        else this.panel_contacto.show();
        
        Traders.onNovedades(function(){
            _this.render();
        });  
        
        this.ui.show();
    }
};