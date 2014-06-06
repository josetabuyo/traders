var VistaDeUnProductoEnLista = function(opt){
	this.alClickear = this.alternarSeleccionParaTrueque;
    $.extend(true, this, opt);
    this.start();
};

VistaDeUnProductoEnLista.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".producto_en_lista").clone();  
    this.lblNombre = this.ui.find("#nombre");
    this.thumbnail = this.ui.find("#thumbnail_producto");
    this.btnEliminar = this.ui.find("#btn_eliminar");
    this.btnEliminar.hide();
    if(this.alEliminar){        
        this.btnEliminar.click(function(){
            _this.alEliminar(_this.producto);
        });
        this.btnEliminar.show();
    }
    this.ui.click(function(){
		_this.alClickear(_this.producto);
    });
};

VistaDeUnProductoEnLista.prototype.render = function(){
	this.lblNombre.text(this.producto.nombre);
    this.thumbnail.attr("src", "data:image/png;base64,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");
};

VistaDeUnProductoEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};