var PantallaTrueque = {    
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_trueque");

		var $btn_ofertar = this.ui.find('#btn_ofertar');
        $btn_ofertar.click(function(){
            Traders.enviarOferta(_this.trueque);
        });
		
		this.$oferta_doy = this.ui.find("#oferta .oferta_doy");
		this.inventario_doy = new ListaProductos({
            selector:{}, 
			alSeleccionar: function(producto){
				Traders.quitarProductoTrueque(_this.trueque, producto, "doy");
			}
        });
        this.inventario_doy.dibujarEn(this.$oferta_doy);
		
		
		this.$oferta_recibo = this.ui.find("#oferta .oferta_recibo");
		this.inventario_recibo = new ListaProductos({
            selector:{}, 
			alSeleccionar: function(producto){
				Traders.quitarProductoTrueque(_this.trueque, producto, "recibo");
			}
        });
        this.inventario_recibo.dibujarEn(this.$oferta_recibo);
		
		this.$inventario_usuario = this.ui.find("#inventario_usuario");
		this.inventario_usuario = new ListaProductos({
            selector:{}, 
			alSeleccionar: function(producto){
				Traders.agregarProductoTrueque(_this.trueque, producto.id, "doy");
			}
        });
        this.inventario_usuario.dibujarEn(this.$inventario_usuario);

		this.$inventario_contacto = this.ui.find("#inventario_contacto");
		this.inventario_contacto = new ListaProductos({
            selector:{}, 
			alSeleccionar: function(producto){
				Traders.agregarProductoTrueque(_this.trueque, producto.id, "recibo");
			}
        });
        this.inventario_contacto.dibujarEn(this.$inventario_contacto);
		
		PantallaListaTrueques.onSelect(function(){
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
		if(this.contacto.avatar!="") this.ui.find("#avatar_contacto").attr("src", this.contacto.avatar);
		
		
		
		this.inventario_doy.setSelector({propietario: this.usuario,
											  idIn: this.oferta.doy
											 });
		this.inventario_doy.render();
		
		this.inventario_recibo.setSelector({propietario: this.contacto,
											  idIn: this.oferta.recibo
											 });
		this.inventario_recibo.render();
		
		
		this.inventario_usuario.setSelector({propietario: this.usuario,
											  idNotIn: this.oferta.doy
											 });
		this.inventario_usuario.render();
		
		this.inventario_contacto.setSelector({propietario: this.contacto,
											  idNotIn: this.oferta.recibo
											 });
		this.inventario_contacto.render();
        
        this.ui.show();
    }    
};