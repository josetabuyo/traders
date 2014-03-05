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
        
        this.panelInventarioUsuario = this.ui.find("#panel_propio .panel_inventario");        
        this.panelInventarioDelOtro = this.ui.find("#panel_ajeno .panel_inventario");
        this.btn_usuario = this.ui.find("#btn_usuario");
        this.btn_contactos = this.ui.find("#btn_contactos");
        this.barraDatosUsuario = this.ui.find("#panel_propio #datos_usuario");
        this.barraDatosContacto = this.ui.find("#panel_ajeno #datos_contacto");
        this.btnProponerTrueque = this.ui.find("#btnProponerTrueque");
        this.btnAceptarTrueque = this.ui.find("#btnAceptarTrueque");
       	   
        this.btnProponerTrueque.click(function(){
            Traders.proponerTruequeA(_this.contacto.id);
        });        
        this.btnAceptarTrueque.click(function(){
            Traders.aceptarTruequeDe(_this.contacto.id);
        });
        this.btn_usuario.click(function(e) {
            _this.ui.hide();
            PantallaUsuario.render();
		});	
        this.btn_contactos.click(function(e) {
            _this.ui.hide();
            PantallaContactos.render();
		});	
    },
    render: function(){
        this.barraDatosUsuario.find("#nombre").text(Traders.usuario.nombre);
        this.barraDatosContacto.find("#nombre").text(this.contacto.nombre);
        this.panelInventarioUsuario.empty();
        this.panelInventarioDelOtro.empty();
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
                },
                alEliminar: function(){
                    Traders.quitarProducto(producto.id);
                }
            });
            vista.dibujarEn(_this.panelInventarioUsuario);
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
            vista.dibujarEn(_this.panelInventarioDelOtro);
        });
        
        if(this.contacto.trueque.mio.length == 0 && 
            this.contacto.trueque.suyo.length == 0){
            this.btnProponerTrueque.hide();
            this.btnAceptarTrueque.hide();
        }else{
            if(this.contacto.trueque.estado == "recibido"){
                this.btnProponerTrueque.hide();
                this.btnAceptarTrueque.show();
            }else{
                if(this.contacto.trueque.estado=="enviado") this.btnProponerTrueque.hide();
                else this.btnProponerTrueque.show();
                this.btnAceptarTrueque.hide();
            }
        }
        Traders.onNovedades(function(){
            _this.render();
        });
        this.ui.show();
    }    
};