var PantallaContacto = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_contacto");     
        
		PantallaListaContactos.onSelect(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
		});
		
		
        Traders.onNovedades(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
        });
		
		
        this.panel_contacto = this.ui.find("#panel_contacto");
        this.lbl_nombre_contacto = this.ui.find("#lbl_nombre_contacto");
		this.img_avatar_contacto = this.ui.find("#avatar_contacto");
		
        this.panel_inventario_contacto = this.ui.find("#panel_inventario_contacto");
        this.btn_trocar = this.ui.find("#btn_trocar");
		
        this.btn_trocar.click(function(e) {
            _this.ui.hide();
			
			// TO DO: agregar los productos seleccionados al trueque
			
			var trueque = Traders.nuevoTrueque({
				contacto: PantallaListaContactos.contacto_seleccionado
			});
			
			PantallaListaTrueques.trueque_seleccionado = trueque;
			PantallaListaTrueques.add(trueque);
			
			
			BarraSuperior.solapa_trueques.click();
			
		});	
    },
	
    render: function(){
        var _this = this;
        
		
		//PantallaListaContactos.render();
		var _contacto = PantallaListaContactos.contacto_seleccionado;
        
        this.lbl_nombre_contacto.text(_contacto.nombre);
		if(_contacto.avatar!="") this.img_avatar_contacto.attr("src", _contacto.avatar);
        this.panel_inventario_contacto.empty();
        _.each(_contacto.inventario, function(producto){
			
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto,
				alClickear: function(){}
            });
            vista.dibujarEn(_this.panel_inventario_contacto);
			
        });
        
        if(_contacto.id == "") this.panel_contacto.hide();
        else this.panel_contacto.show();
        
        
        this.ui.show();
    }
};