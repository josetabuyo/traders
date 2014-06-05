var PantallaListaProductos = function(selector){
	this.selector = selector;
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
	_.each(Traders.usuario.inventario, function(producto){
		var vista = new VistaDeUnProductoEnLista({producto: producto});
		vista.dibujarEn(_this.listado_de_productos);
		vista.render();
	});
	
	_.each(Traders.contactos(), function(contacto){
		_.each(contacto.inventario, function(producto){
			var vista = new VistaDeUnProductoEnLista({producto: producto});
			vista.dibujarEn(_this.listado_de_productos);
			vista.render();
		});
	});
	this.ui.show();
};

PantallaListaProductos.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};

