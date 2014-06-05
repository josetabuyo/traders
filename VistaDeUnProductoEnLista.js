var VistaDeUnProductoEnLista = function(opt){
	this.alClickear = this.alternarSeleccionParaTrueque;
    $.extend(true, this, opt);
    this.start();
};

VistaDeUnProductoEnLista.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".producto_en_lista").clone();  
    this.lblNombre = this.ui.find("#nombre");

    if(this.alEliminar){
        this.btnEliminar = this.ui.find("#btn_eliminar");
        this.btnEliminar.click(function(){
            _this.alEliminar();
        });
        this.btnEliminar.show();
    }
    this.ui.click(function(){
		_this.alClickear();
    });
};

VistaDeUnProductoEnLista.prototype.render = function(){
	this.lblNombre.text(this.producto.nombre);
};

VistaDeUnProductoEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};