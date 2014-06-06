var ListaProductos = function(opt){
    this.alSeleccionar = function(){};
    this.selector = {};
    $.extend(true, this, opt);
    
	var _this = this;
	this.ui = $("#plantillas").find(".lista_productos").clone();  
	this.listado_de_productos = this.ui.find("#listado_de_productos");
	Traders.onNovedades(function(){
		if(_this.ui.is(':visible')){
			_this.render();
		}
	});
};

ListaProductos.prototype.setSelector = function(selector){
	this.selector = selector;
	this.render();
};
	
ListaProductos.prototype.render = function(){
	var _this = this;
	this.listado_de_productos.empty();
    
    if(!this.selector.propietario){
        _.each(Traders.usuario.inventario, function(producto){
			if(_this.selector.idNotIn){
				if(_this.selector.idNotIn.indexOf(producto.id)>=0) return;
			}
			if(_this.selector.idIn){
				if(_this.selector.idIn.indexOf(producto.id)==-1) return;
			}
            _this.agregarProducto(producto);               
        });
        _.each(Traders.contactos(), function(contacto){
            _.each(contacto.inventario, function(producto){
				if(_this.selector.idNotIn){
					if(_this.selector.idNotIn.indexOf(producto.id)>=0) return;
				}
				if(_this.selector.idIn){
					if(_this.selector.idIn.indexOf(producto.id)==-1) return;
				}
                _this.agregarProducto(producto);       
            });
        });
    } else {
        if(this.selector.propietario.id == Traders.usuario.id){
            _.each(Traders.usuario.inventario, function(producto){
				if(_this.selector.idNotIn){
					if(_this.selector.idNotIn.indexOf(producto.id)>=0) return;
				}
				if(_this.selector.idIn){
					if(_this.selector.idIn.indexOf(producto.id)==-1) return;
				}
                _this.agregarProducto(producto);               
            });        
        } else {
            _.each(Traders.contactos(), function(contacto){
                if(_this.selector.propietario.id == contacto.id){
                    _.each(contacto.inventario, function(producto){
						if(_this.selector.idNotIn){
							if(_this.selector.idNotIn.indexOf(producto.id)>=0) return;
						}
						if(_this.selector.idIn){
							if(_this.selector.idIn.indexOf(producto.id)==-1) return;
						}
                        _this.agregarProducto(producto);       
                    });
                }
            });
        }
    }
	this.ui.show();
};

ListaProductos.prototype.agregarProducto = function(un_producto){
    var _this = this;
    var vista = new VistaDeUnProductoEnLista({
        producto: un_producto,
        alClickear: function(producto_clickeado){
            _this.alSeleccionar(producto_clickeado);
        },
        alEliminar: _this.alEliminar
    });
    vista.dibujarEn(_this.listado_de_productos);
    vista.render();
};

ListaProductos.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};

