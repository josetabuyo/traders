var PantallaContacto = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_contacto");     
        
		
		/*
        this.contacto_seleccionado = {
			nombre:"",
			id:"",
			inventario:[],
			trueque: {
				mio:[],
				suyo:[]
			}
		};
        */
		console.log('PantallaContacto, SATAR');
		
		
		
		PantallaListaContactos.onSelect(function(){
			_this.render();
		});
		
		
		
        this.panel_contacto = this.ui.find("#panel_contacto");
        this.lbl_nombre_contacto = this.ui.find("#lbl_nombre_contacto");
		
		
		//this.txt_id_contacto_add = this.ui.find("#txt_id_contacto_add");
		
		this.btn_add_contacto = this.ui.find("#btn_add_contacto");
		this.btn_add_contacto.click(function(e){
			
			alertify.prompt("Ingrese el id del usuario", function (e, str) {
				if(e){
					Traders.agregarContacto(str);
				} else {
					// user clicked "cancel"
				}
			}, "");
		});
		
		
		
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
        this.btn_trocar = this.ui.find("#btn_trocar");
		
        this.btn_trocar.click(function(e) {
            _this.ui.hide();
            PantallaTrueques.contacto = PantallaListaContactos.contacto_seleccionado;
			
            PantallaTrueques.render();
		});	
    },
	
    render: function(){
        var _this = this;
        
		
		PantallaListaContactos.render();
		
        
        this.lbl_nombre_contacto.text(PantallaListaContactos.contacto_seleccionado.nombre);
        this.panel_inventario_contacto.empty();
        _.each(PantallaListaContactos.contacto_seleccionado.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto
            });
            vista.dibujarEn(_this.panel_inventario_contacto);
        });
        
        if(PantallaListaContactos.contacto_seleccionado.id == "") this.panel_contacto.hide();
        else this.panel_contacto.show();
        
        Traders.onNovedades(function(){
            _this.render();
        });  
        
        this.ui.show();
    }
};