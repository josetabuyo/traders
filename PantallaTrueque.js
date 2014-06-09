var PantallaTrueque = {    
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_trueque");
        
		PantallaListaTrueques.onSelect(function(){
			_this.render();
		});
		
		Traders.onNovedades(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
        });
		
		
		
		
		var $btn_ofertar = this.ui.find('#btn_ofertar');
		
		
        $btn_ofertar.click(function(){
            var trueque = PantallaListaTrueques.trueque_seleccionado;
			
			
			Traders.enviarOferta(trueque);
        });
		
		var $btn_aceptar = this.ui.find('#btn_aceptar');
		
		
        $btn_aceptar.click(function(){
            var trueque = PantallaListaTrueques.trueque_seleccionado;
			
			
			Traders.aceptarTrueque(trueque);
        });
		
    },
    render: function(){
		var _this = this;
		
		
		var usuario = Traders.usuario;
		var trueque = PantallaListaTrueques.trueque_seleccionado;
		
		
		if(trueque.estado == 'CERRADO'){
			
			_this.ui.find('.treque_cerrado').show();
			_this.ui.find('.treque_por').hide();
			
			return;
		}
		
		
		var contacto = trueque.contacto;
		
		var oferta = trueque.ofertas[trueque.ofertas.length - 1];
		
		
		this.ui.find("#lbl_nombre_usuario").text(usuario.nombre);
		this.ui.find("#lbl_nombre_contacto").text(contacto.nombre);
		
		if(usuario.avatar!="") this.ui.find("#avatar_usuario").attr("src", usuario.avatar);
		if(contacto.avatar!="") this.ui.find("#avatar_contacto").attr("src", contacto.avatar);
		
		
		
		
		
		
		var $oferta_doy = this.ui.find("#oferta .oferta_doy");
		$oferta_doy.empty();
		
		
		_.each(oferta.doy, function(id_producto){
				
			var producto = _.findWhere(usuario.inventario, {id: id_producto});
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto
            });
			
            vista.dibujarEn($oferta_doy);
        });
		

		var $oferta_recibo = this.ui.find("#oferta .oferta_recibo");
		$oferta_recibo.empty();
		
		
		_.each(oferta.recibo, function(id_producto){
			var producto = _.findWhere(contacto.inventario, {id: id_producto});
				
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
					
					Traders.agregarProductoTrueque(trueque, producto, "doy");
                },
                alDesSeleccionarParaTrueque: function(){
					Traders.quitarProductoTrueque(trueque, producto, "doy");
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
                    Traders.agregarProductoTrueque(trueque, producto, "recibo");
                },
                alDesSeleccionarParaTrueque: function(){
					Traders.quitarProductoTrueque(trueque, producto, "recibo");
                }
            });
            vista.dibujarEn($inventario_contacto);
        });
        
        this.ui.show();
    }    
};