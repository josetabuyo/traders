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
		
		
    },
    render: function(){
		var _this = this;
		
		
		
		var usuario = Traders.usuario;
		var trueque = PantallaListaTrueques.trueque_seleccionado;
		
		
		var contacto = Traders.contactos(trueque.contraparte)[0];
		
		var oferta = trueque.ofertas[trueque.ofertas.length - 1];
		
		
		
        this.ui.find("#lbl_nombre_usuario").text(usuario.nombre);
		this.ui.find("#lbl_nombre_contacto").text(contacto.nombre);
		
		
		
		var $oferta_doy = this.ui.find("#oferta .oferta_doy");
		$oferta_doy.empty();
		
        _.each(oferta.doy, function(id_producto){
			var producto = Traders.productos({
				propietario: usuario.id, 
				id: id_producto
			})[0];
			
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto
            });
			
            vista.dibujarEn($oferta_doy);
        });
		

		var $oferta_recibo = this.ui.find("#oferta .oferta_recibo");
		$oferta_recibo.empty();
		
		
        _.each(oferta.recibo, function(id_producto){
			var producto = Traders.productos({
				propietario: contacto.id, 
				id: id_producto
			})[0];
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto
            });
            vista.dibujarEn($oferta_recibo);
        });

		var $inventario_usuario = this.ui.find("#inventario_usuario");
        $inventario_usuario.empty();
		
		
		_.each(Traders.productos({
			propietario: usuario.id
		
		}), function(producto){
			
			var vista = new VistaDeUnProductoEnInventario({
                producto: producto,
                seleccionadoParaTrueque: oferta.doy.indexOf(producto.id)>-1,
                alSeleccionarParaTrueque: function(){
					
					Traders.agregarProductoTrueque(trueque, producto.id, "doy");
                },
                alDesSeleccionarParaTrueque: function(){
					Traders.quitarProductoTrueque(trueque, producto.id, "doy");
                }
            });
            vista.dibujarEn($inventario_usuario);
        });
		
		
		var $inventario_contacto = this.ui.find("#inventario_contacto");
        $inventario_contacto.empty();
		
		
		_.each(Traders.productos({
			propietario: contacto.id
		
		}), function(producto){
		
			var vista = new VistaDeUnProductoEnInventario({
                producto: producto,
                seleccionadoParaTrueque: oferta.recibo.indexOf(producto.id)>-1,
                alSeleccionarParaTrueque: function(){
                    Traders.agregarProductoTrueque(trueque, producto.id, "recibo");
                },
                alDesSeleccionarParaTrueque: function(){
					Traders.quitarProductoTrueque(trueque, producto.id, "recibo");
                }
            });
            vista.dibujarEn($inventario_contacto);
        });
        
        this.ui.show();
    }    
};