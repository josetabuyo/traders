var PantallaProductos = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_productos");     		
		
        Traders.onNovedades(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
        });
		
		this.listaProductos = new ListaProductos({
			mostrarPropietario:true
		});
		this.listaProductos.dibujarEn(this.ui);
    },
	
    render: function(){
        var _this = this;
        
		this.listaProductos.render();
 
        this.ui.show();
    }
};