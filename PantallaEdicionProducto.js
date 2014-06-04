var PantallaEdicionProducto = {
	start:function(){
		var _this = this;
		this.ui = $("#pantalla_edicion_producto");
		this.txt_nombre_producto = this.ui.find("#txt_nombre_producto");
		this.txt_nombre_producto.change(function(){
			_this.producto.nombre = _this.txt_nombre_producto.val();
			Traders.modificarProducto(_this.producto);
		});
	},
	mostrar:function(producto){
		this.producto = producto;
		this.txt_nombre_producto.val(producto.nombre);
		var _this = this;
		var link = $("<id='a' href='#pantalla_edicion_producto'>");
		link.leanModal();
		link.click();
	}
}