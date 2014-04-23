var PantallaTrueque = {    
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_trueque");
        
		PantallaListaContactos.onSelect(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
		});
		
        
		
        this.panel_inventario_usuario = this.ui.find("#panel_inventario_usuario");
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
		
		
		this.ui.propuestas = {
			usuario: {
				mio: this.ui.find('#propuesta_usuario .trueque_productos_usuario'),
				suyo: this.ui.find('#propuesta_usuario .trueque_productos_contacto')
			},
			contacto: {
				mio: this.ui.find('#propuesta_contacto .trueque_productos_usuario'),
				suyo: this.ui.find('#propuesta_contacto .trueque_productos_contacto')
			}
		};
		
        this.lbl_nombre_usuario = this.ui.find("#lbl_nombre_usuario");
        this.lbl_nombre_contacto = this.ui.find("#lbl_nombre_contacto");
        this.chk_usuario_de_acuerdo = this.ui.find("#chk_usuario_de_acuerdo");
        this.chk_contacto_de_acuerdo = this.ui.find("#chk_contacto_de_acuerdo");
		
		
		var _contacto = PantallaListaContactos.contacto_seleccionado;
		
        this.chk_usuario_de_acuerdo.click(function(){
            if(_contacto.trueque.estado == "recibido")
                Traders.aceptarTruequeDe(_contacto.id);
            else
                Traders.proponerTruequeA(_contacto.id);
        });
    },
    render: function(){
		
		var _usuario = Traders.usuario;
		var _contacto = PantallaListaContactos.contacto_seleccionado;
		
        this.lbl_nombre_usuario.text(_usuario.nombre);
        this.lbl_nombre_contacto.text(_contacto.nombre);
		
        this.panel_inventario_usuario.empty();
        this.panel_inventario_contacto.empty();
		
		this.ui.propuestas.usuario.mio.empty();
		this.ui.propuestas.usuario.suyo.empty();
		
		this.ui.propuestas.contacto.mio.empty();
		this.ui.propuestas.contacto.suyo.empty();
		
		
		
		 var _this = this;
		 
		
		console.log('_contacto', _contacto);
		
        _.each(_contacto.trueque.propuestas.usuario.mio, function(id_producto){
			
			var _producto = _.findWhere(Traders.usuario.inventario, {id: id_producto});
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: _producto
            });
            vista.dibujarEn(_this.ui.propuestas.usuario.mio);
        });
		
		 
        _.each(_contacto.trueque.propuestas.usuario.suyo, function(id_producto){
			var _producto = _.findWhere(_contacto.inventario, {id: id_producto});
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: _producto
            });
            vista.dibujarEn(_this.ui.propuestas.usuario.suyo);
        });
		
		_.each(_contacto.trueque.propuestas.contacto.mio, function(id_producto){
			var _producto = _.findWhere(Traders.usuario.inventario, {id: id_producto});
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: _producto
            });
            vista.dibujarEn(_this.ui.propuestas.contacto.mio);
        });
		
		 
        _.each(_contacto.trueque.propuestas.contacto.suyo, function(id_producto){
			var _producto = _.findWhere(_contacto.inventario, {id: id_producto});
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: _producto
            });
            vista.dibujarEn(_this.ui.propuestas.contacto.suyo);
        });
		
		
		
		
		_.each(_usuario.inventario, function(_producto){
		
			var vista = new VistaDeUnProductoEnInventario({
                producto: _producto,
                seleccionadoParaTrueque: _contacto.trueque.propuestas.usuario.mio.indexOf(_producto.id)>-1,
                alSeleccionarParaTrueque: function(){
                    Traders.agregarProductoAPropuesta(_contacto.id, _producto.id, "mio");
                },
                alDesSeleccionarParaTrueque: function(){
					Traders.quitarProductoDePropuesta(_contacto.id, _producto.id, "mio");
                }
            });
            vista.dibujarEn(_this.panel_inventario_usuario);
        });
        
		
		
		
		
        _.each(_contacto.inventario, function(_producto){
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: _producto, 
                seleccionadoParaTrueque: _contacto.trueque.propuestas.contacto.suyo.indexOf(_producto.id)>-1,
                alSeleccionarParaTrueque: function(){
                    Traders.agregarProductoAPropuesta(_contacto.id, _producto.id, "suyo");  
                },
                alDesSeleccionarParaTrueque: function(){
                    Traders.quitarProductoDePropuesta(_contacto.id, _producto.id, "suyo");
                }
            });
            vista.dibujarEn(_this.panel_inventario_contacto);
        });
        
        this.chk_usuario_de_acuerdo.removeClass("checkeado");
        this.chk_contacto_de_acuerdo.removeClass("checkeado");
		
		
        if(_contacto.trueque.propuestas.contacto.mio.length != 0 || _contacto.trueque.propuestas.contacto.suyo.length != 0){
            if(_contacto.trueque.estado == "recibido"){
                this.chk_contacto_de_acuerdo.addClass("checkeado");
            }
            if(_contacto.trueque.estado == "enviado"){
                this.chk_usuario_de_acuerdo.addClass("checkeado");
            }
        }
        Traders.onNovedades(function(){
            _this.render();
        });
        this.ui.show();
    }    
};