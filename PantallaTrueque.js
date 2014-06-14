var PantallaTrueque = {    
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_trueque");

		var $btn_ofertar = this.ui.find('#btn_ofertar');
        $btn_ofertar.click(function(){
			
            Traders.enviarOferta(PantallaListaTrueques.trueque_seleccionado);
        });
		
		
		this.$oferta_doy = this.ui.find("#oferta .oferta_doy");
		this.inventario_doy = new ListaProductos({
            selector:{}, 
			alSeleccionar: function(producto){
				if(_this.oferta && _this.oferta.estado == 'ENVIADA') return;
				Traders.quitarProductoTrueque(_this.trueque, producto, "doy");
			}
        });
        this.inventario_doy.dibujarEn(this.$oferta_doy);
		
		
		this.$oferta_recibo = this.ui.find("#oferta .oferta_recibo");
		this.inventario_recibo = new ListaProductos({
            selector:{}, 
			alSeleccionar: function(producto){
				if(_this.oferta && _this.oferta.estado == 'ENVIADA') return;
				Traders.quitarProductoTrueque(_this.trueque, producto, "recibo");
			}
        });
        this.inventario_recibo.dibujarEn(this.$oferta_recibo);
		
		this.$inventario_usuario = this.ui.find("#inventario_usuario");
		this.inventario_usuario = new ListaProductos({
            selector:{}, 
			alSeleccionar: function(producto){
				if(_this.oferta && _this.oferta.estado == 'ENVIADA') return;
				Traders.agregarProductoTrueque(_this.trueque, producto, "doy");
			}
        });
        this.inventario_usuario.dibujarEn(this.$inventario_usuario);

		this.$inventario_contacto = this.ui.find("#inventario_contacto");
		this.inventario_contacto = new ListaProductos({
            selector:{}, 
			alSeleccionar: function(producto){
				if(_this.oferta && _this.oferta.estado == 'ENVIADA') return;
				Traders.agregarProductoTrueque(_this.trueque, producto, "recibo");
			}
        });
        this.inventario_contacto.dibujarEn(this.$inventario_contacto);
		
		var $btn_aceptar = this.ui.find('#btn_aceptar');
		
        $btn_aceptar.click(function(){
            var trueque = PantallaListaTrueques.trueque_seleccionado;
			
			
			Traders.aceptarTrueque(trueque);
        });

		PantallaListaTrueques.onSelect(function(){
			_this.trueque = PantallaListaTrueques.trueque_seleccionado;
			_this.render();
		});
		
		Traders.onNovedades(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
        });		
    },
    render: function(){
		var _this = this;
		
		
		this.usuario = Traders.usuario;
		this.trueque = PantallaListaTrueques.trueque_seleccionado;
		
		
		this.contacto = this.trueque.contacto;
		this.oferta = this.trueque.ofertas[this.trueque.ofertas.length - 1];
		

        this.ui.find("#lbl_nombre_usuario").text(this.usuario.nombre);
		this.ui.find("#lbl_nombre_contacto").text(this.contacto.nombre);

		
		if(this.usuario.avatar!="") this.ui.find("#avatar_usuario").attr("src", this.usuario.avatar);
		else this.ui.find("#avatar_usuario").attr("src", "avatar_default.png");
		
		if(this.contacto.avatar!="") this.ui.find("#avatar_contacto").attr("src", this.contacto.avatar);
		else this.ui.find("#avatar_contacto").attr("src", "avatar_default.png");
		
		this.ui.find('#btn_ofertar').hide();
		this.ui.find('#btn_aceptar').hide();
		
		if(this.oferta.estado == 'SIN_ENVIAR'){
			this.ui.find('#btn_ofertar').show();
			this.ui.find('#btn_aceptar').hide();
		}
		
		if(this.oferta.estado == 'ENVIADA'){
			this.ui.find('#btn_ofertar').hide();
			this.ui.find('#btn_aceptar').hide();
		}
		
		if(this.oferta.estado == 'RECIBIDA'){
			this.ui.find('#btn_ofertar').hide();
			this.ui.find('#btn_aceptar').show();
		}
		
		
		if(this.trueque.estado == 'CERRADO'){
			// TO DO: graficar el trueque cerrado
			
			this.ui.find('#btn_ofertar').hide();
			this.ui.find('#btn_aceptar').hide();
			
			/*
			this.inventario_doy.setSelector(null);
			this.inventario_recibo.setSelector(null);
			this.inventario_usuario.setSelector(null);
			this.inventario_contacto.setSelector(null);
			*/
			
			
			
			
			this.inventario_doy.setLista(this.trueque.ofertaDetallada.doy, this.contacto);
			this.inventario_recibo.setLista(this.trueque.ofertaDetallada.recibo, this.usuario);
			
			this.inventario_usuario.setSelector(null);
			this.inventario_contacto.setSelector(null);
			
			
			_this.ui.find('.treque_cerrado').show();
			_this.ui.find('.treque_por').hide();
			
		} else {
		
			this.inventario_doy.setSelector({
				propietario: this.usuario,
				idIn: this.oferta.doy
			});
			
			this.inventario_recibo.setSelector({
				propietario: this.contacto,
				idIn: this.oferta.recibo
			});
			
			
			this.inventario_usuario.setSelector({
				propietario: this.usuario,
				idNotIn: this.oferta.doy
			});
			
			
			this.inventario_contacto.setSelector({
				propietario: this.contacto,
				idNotIn: this.oferta.recibo
			});
			
			_this.ui.find('.treque_cerrado').hide();
			_this.ui.find('.treque_por').show();
		
		}
		
		

		
		this.inventario_doy.render();
		this.inventario_recibo.render();
		this.inventario_usuario.render();
		this.inventario_contacto.render();
        
        this.ui.show();
    }    
};