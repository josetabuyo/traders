var PantallaListaProductos = function(opt){
    this.alSeleccionar = function(){};
    this.selector = {};
    $.extend(true, this, opt);
    
	var _this = this;
	this.ui = $("#plantillas").find(".pantalla_lista_productos").clone();  
	this.listado_de_productos = this.ui.find("#listado_de_productos");
	Traders.onNovedades(function(){
		if(_this.ui.is(':visible')){
			_this.render();
		}
	});
};

PantallaListaProductos.prototype.setSelector = function(selector){
	this.selector = selector;
	this.render();
};
	
PantallaListaProductos.prototype.render = function(){
	var _this = this;
	this.listado_de_productos.empty();
    
    if(!this.selector.usuario){
        _.each(Traders.usuario.inventario, function(producto){
            _this.agregarProducto(producto);               
        });
        _.each(Traders.contactos(), function(contacto){
            _.each(contacto.inventario, function(producto){
                _this.agregarProducto(producto);       
            });
        });
    } else {
        if(this.selector.usuario.id == Traders.usuario.id){
            _.each(Traders.usuario.inventario, function(producto){
                _this.agregarProducto(producto);               
            });        
        } else {
            _.each(Traders.contactos(), function(contacto){
                if(_this.selector.usuario.id == contacto.id){
                    _.each(contacto.inventario, function(producto){
                        _this.agregarProducto(producto);       
                    });
                }
            });
        }
    }
	this.ui.show();
};

PantallaListaProductos.prototype.agregarProducto = function(un_producto){
    var _this = this;
    var vista = new VistaDeUnProductoEnLista({
        producto: un_producto,
        alClickear: function(producto_clickeado){
            _this.alSeleccionar(producto_clickeado);
        },
        alEliminar: function(producto_eliminado){
            _this.alEliminar(producto_eliminado);
        }
    });
    vista.dibujarEn(_this.listado_de_productos);
    vista.render();
};

PantallaListaProductos.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};

