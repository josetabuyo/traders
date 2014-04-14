var PantallaTrueque = {    
    start: function(){
        var _this = this;
        this.contacto = {
			nombre:"",
			id:"",
			inventario:[],
			trueque: {
				mio:[],
				suyo:[]
			}
		};
        
        this.ui =  $("#pantalla_trueque");
        
        
        this.panel_inventario_usuario = this.ui.find("#panel_inventario_usuario");        
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
        this.lbl_nombre_usuario = this.ui.find("#lbl_nombre_usuario");
        this.lbl_nombre_contacto = this.ui.find("#lbl_nombre_contacto");
        this.chk_usuario_de_acuerdo = this.ui.find("#chk_usuario_de_acuerdo");
        this.chk_contacto_de_acuerdo = this.ui.find("#chk_contacto_de_acuerdo");
		
        this.chk_usuario_de_acuerdo.click(function(){
            if(_this.contacto.trueque.estado == "recibido")
                Traders.aceptarTruequeDe(_this.contacto.id);
            else
                Traders.proponerTruequeA(_this.contacto.id);
        });        
    },
    render: function(){
        this.lbl_nombre_usuario.text(Traders.usuario.nombre);
        this.lbl_nombre_contacto.text(this.contacto.nombre);
        this.panel_inventario_usuario.empty();
        this.panel_inventario_contacto.empty();
        var _this = this;
        _.each(Traders.usuario.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto, 
                seleccionadoParaTrueque: _this.contacto.trueque.mio.indexOf(producto.id)>-1,
                alSeleccionarParaTrueque: function(){
                    Traders.agregarProductoAPropuesta(_this.contacto.id, producto.id, "mio");
                },
                alDesSeleccionarParaTrueque: function(){
					Traders.quitarProductoDePropuesta(_this.contacto.id, producto.id, "mio");
                }
            });
            vista.dibujarEn(_this.panel_inventario_usuario);
        });
        
        _.each(this.contacto.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto, 
                seleccionadoParaTrueque: _this.contacto.trueque.suyo.indexOf(producto.id)>-1,
                alSeleccionarParaTrueque: function(){
                    Traders.agregarProductoAPropuesta(_this.contacto.id, producto.id, "suyo");  
                },
                alDesSeleccionarParaTrueque: function(){
                    Traders.quitarProductoDePropuesta(_this.contacto.id, producto.id, "suyo");
                }
            });
            vista.dibujarEn(_this.panel_inventario_contacto);
        });
        
        this.chk_usuario_de_acuerdo.removeClass("checkeado");
        this.chk_contacto_de_acuerdo.removeClass("checkeado");
        if(this.contacto.trueque.mio.length != 0 || this.contacto.trueque.suyo.length != 0){
            if(this.contacto.trueque.estado == "recibido"){
                this.chk_contacto_de_acuerdo.addClass("checkeado");
            }
            if(this.contacto.trueque.estado == "enviado"){
                this.chk_usuario_de_acuerdo.addClass("checkeado");
            }
        }
        Traders.onNovedades(function(){
            _this.render();
        });
        this.ui.show();
    }    
};