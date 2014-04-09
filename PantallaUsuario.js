var PantallaUsuario = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_usuario");

        this.lbl_nombre_usuario = this.ui.find("#lbl_nombre_usuario");
        this.panel_inventario = this.ui.find("#panel_inventario");
        this.panel_me_deben = this.ui.find("#panel_me_deben");
        this.panel_debo = this.ui.find("#panel_debo");
		
		
        this.btn_add_producto = this.ui.find("#btn_add_producto");
        this.txt_nombre_producto_add = this.ui.find("#txt_nombre_producto_add");
        this.btnSave = this.ui.find("#btn_save");
        this.btnLoad = this.ui.find("#btn_load");
        
        this.btn_add_producto.click(function(){
            Traders.agregarProducto({
                nombre:_this.txt_nombre_producto_add.val()
            });
            _this.txt_nombre_producto_add.val("");
        }); 
		this.txt_nombre_producto_add.keypress(function(e) {
			if(e.which == 13) {
				_this.btn_add_producto.click();
			}
		});    
        this.btnSave.click(function(){  
            Traders.saveDataUsuario();
        });
		
        this.btnLoad.click(function(){            
            Traders.loadDataUsuario();
        });
        
		
		
		this.btn_compartir_id = this.ui.find("#btn_compartir_id");
		
		this.btn_compartir_id.click(function(){
			
			
			alertify.prompt("Compartí tu Id", function (e, str) {
				if (e) {
					clipboardCopy(Traders.usuario.id);
				} else {
					
				}
			}, Traders.usuario.id);
		});
		
		
        this.txt_nombre_producto_add.focus();
    },
    render: function(){
        this.lbl_nombre_usuario.text(Traders.usuario.nombre);
        this.panel_inventario.empty();
        this.panel_me_deben.empty();
        this.panel_debo.empty();
        var _this = this;
		
		///// panel_inventario
		_.each(Traders.usuario.inventario, function(producto){
			var vista = new VistaDeUnProductoEnInventario({
				producto: producto, 
				alEliminar: function(){
					Traders.quitarProducto(producto.id);
				}
			});
			vista.dibujarEn(_this.panel_inventario);
		});
		
		///// panel_me_deben
		if(Traders.usuario.me_deben.length > 0){
			_this.panel_me_deben.closest('.seccion_container').closest('li').show();
			
			_.each(Traders.usuario.me_deben, function(producto){
				var vista = new VistaDeUnProductoEnInventario({
					producto: producto
				});
				vista.dibujarEn(_this.panel_me_deben);
			});
		}else{
			_this.panel_me_deben.closest('.seccion_container').closest('li').hide();
		}
			
		///// panel_debo
		if(Traders.usuario.debo.length > 0){
			_this.panel_debo.closest('.seccion_container').closest('li').show();
			_.each(Traders.usuario.debo, function(producto){
				var vista = new VistaDeUnProductoEnInventario({
					producto: producto,
					alEliminar: function(){
						Traders.quitarProducto(producto.id);
					}
				});
				vista.dibujarEn(_this.panel_debo);
			});
		}else{
			_this.panel_debo.closest('.seccion_container').closest('li').hide();
		}
		
		
		
        Traders.onNovedades(function(){
            _this.render();
        });
        this.ui.show();      
    }
};