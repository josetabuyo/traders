var VistaDeUnProductoEnInventario = function(opt){
	this.alClickear = this.alternarSeleccionParaTrueque;
    $.extend(true, this, opt);
    this.start();
};

VistaDeUnProductoEnInventario.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".producto_en_inventario").clone();  
    this.lblNombre = this.ui.find("#nombre");
    this.lblNombre.text(this.producto.nombre);
    
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
    if(_this.seleccionadoParaTrueque){
        _this.ui.addClass("producto_seleccionado_para_trueque");
    }
};

VistaDeUnProductoEnInventario.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};

VistaDeUnProductoEnInventario.prototype.alternarSeleccionParaTrueque = function(){
	if(this.seleccionadoParaTrueque){
		this.ui.removeClass("producto_seleccionado_para_trueque");
		this.seleccionadoParaTrueque = false;
		this.alDesSeleccionarParaTrueque();
	}else{
		this.ui.addClass("producto_seleccionado_para_trueque");
		this.seleccionadoParaTrueque = true;
		this.alSeleccionarParaTrueque();
	}
};