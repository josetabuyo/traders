var PantallaUsuario = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_usuario");

        this.lbl_nombre_usuario = this.ui.find("#lbl_nombre_usuario");
        this.panel_inventario = this.ui.find("#panel_inventario");   
        this.btn_add_producto = this.ui.find("#btn_add_producto");
        this.txt_nombre_producto_add = this.ui.find("#txt_nombre_producto_add");
        this.btn_contactos = this.ui.find("#btn_contactos");
        this.btnSave = $("#btn_save");
        this.btnLoad = $("#btn_load");
        
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
        this.btn_contactos.click(function(e) {
            _this.ui.hide();
            PantallaContactos.render();
		});	
        this.btnSave.click(function(){  
            Traders.save();
        });        
        this.btnLoad.click(function(){            
            Traders.load();
        });
        
        this.txt_nombre_producto_add.focus();
    },
    render: function(){
        this.lbl_nombre_usuario.text(Traders.usuario.nombre);
        this.panel_inventario.empty();
        var _this = this;
        _.each(Traders.usuario.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto, 
                alEliminar: function(){
                    Traders.quitarProducto(producto.id);
                }
            });
            vista.dibujarEn(_this.panel_inventario);
        });
        Traders.onNovedades(function(){
            _this.render();
        });
        this.ui.show();      
    }
};