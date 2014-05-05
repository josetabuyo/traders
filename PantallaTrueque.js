var PantallaTrueque = {    
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_trueque");
        
		PantallaListaTrueques.onSelect(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
		});
		
		
		/*
        this.chk_usuario_de_acuerdo.click(function(){
            if(_contacto.trueque.estado == "recibido")
                Traders.aceptarTruequeDe(_contacto);
            else
                Traders.proponerTruequeA(_contacto);
        });
		*/
		
    },
    render: function(){
		var _this = this;
		
		
		var usuario = Traders.usuario;
		var trueque = PantallaListaTrueques.trueque_seleccionado;
		
		console.log('truequetruequetruequetrueque', trueque);
		
		var contacto = trueque.contacto;
		var oferta = trueque.ofertas[trueque.ofertas.length - 1];
		
		
        this.ui.find("#lbl_nombre_usuario").text(usuario.nombre);
		this.ui.find("#lbl_nombre_contacto").text(contacto.nombre);
		
		
		
		var $oferta_doy = this.ui.find("#oferta .oferta_doy");
		$oferta_doy.empty();
		
        _.each(oferta.doy, function(id_producto){
			
			var producto = _.findWhere(Traders.usuario.inventario, {id: id_producto});
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto
            });
			
            vista.dibujarEn($oferta_doy);
        });
		

		var $oferta_recibo = this.ui.find("#oferta .oferta_recibo");
		$oferta_recibo.empty();
        _.each(oferta.recibo, function(id_producto){
			var producto = _.findWhere(_contacto.inventario, {id: id_producto});
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto
            });
            vista.dibujarEn($oferta_recibo);
        });

		var $inventario_usuario = this.ui.find("#inventario_usuario");
        $inventario_usuario.empty();
		_.each(usuario.inventario, function(producto){
		
			var vista = new VistaDeUnProductoEnInventario({
                producto: producto,
                seleccionadoParaTrueque: oferta.doy.indexOf(producto.id)>-1,
                alSeleccionarParaTrueque: function(){
                    Traders.agregarProductoATrueque(trueque, producto.id, "doy");
                },
                alDesSeleccionarParaTrueque: function(){
					Traders.quitarProductoDeTrueque(trueque, producto.id, "doy");
                }
            });
            vista.dibujarEn($inventario_usuario);
        });
		
		
		var $inventario_contacto = this.ui.find("#inventario_contacto");
        $inventario_contacto.empty();
		_.each(contacto.inventario, function(producto){
		
			var vista = new VistaDeUnProductoEnInventario({
                producto: producto,
                seleccionadoParaTrueque: oferta.recibo.indexOf(producto.id)>-1,
                alSeleccionarParaTrueque: function(){
                    Traders.agregarProductoATrueque(trueque, producto.id, "recibo");
                },
                alDesSeleccionarParaTrueque: function(){
					Traders.quitarProductoDeTrueque(trueque, producto.id, "recibo");
                }
            });
            vista.dibujarEn($inventario_contacto);
        });
        
		
		Traders.onNovedades(function(){
            _this.render();
        });
		
        this.ui.show();
    }    
};