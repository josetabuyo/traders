var PantallaEdicionProducto = function(producto){
	var _this = this;
	this.producto = producto;
	
	this.ui = $("#plantillas .pantalla_edicion_producto").clone();
	this.txt_nombre_producto = this.ui.find("#txt_nombre_producto");
	this.txt_nombre_producto.change(function(){
		producto.nombre = _this.txt_nombre_producto.val();
		Traders.modificarProducto(producto);
	});
	
	Traders.onNovedades(function(){
		_this.render();
	});
	
	vex.open({
		afterOpen: function($vexContent) {
			return $vexContent.append(_this.ui);
		}
	});
	this.render();
};

PantallaEdicionProducto.prototype.render = function(){
	this.txt_nombre_producto.val(this.producto.nombre);
};