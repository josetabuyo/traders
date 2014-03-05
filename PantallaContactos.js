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
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
        this.btn_usuario = this.ui.find("#btn_usuario");
        this.btn_trocar = this.ui.find("#btn_trocar");
        this.btn_usuario.click(function(e) {
            _this.ui.hide();
            PantallaUsuario.render();
		});	
        this.btn_trocar.click(function(e) {
            _this.ui.hide();
            PantallaTrueque.contacto = _this.contacto_seleccionado;
            PantallaTrueque.render();
		});	
    },
    render: function(){
        var _this = this;
        
        this.panel_lista_contactos.empty();
        _.each(Traders.mercaderes(), function(contacto){
            var vista_contacto = $("#plantillas .mercader_en_lista").clone();
            vista_contacto.find("#nombre").text(contacto.nombre);
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