var VistaDeUnProductoEnInventario = function(opt){
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
		// TO DO: debería saltar y no hacer nada si no hay un mercader seleccionado para trocar
        if(_this.seleccionadoParaTrueque){
            _this.ui.removeClass("producto_seleccionado_para_trueque");
            _this.seleccionadoParaTrueque = false;
            _this.alDesSeleccionarParaTrueque();
        }else{
            _this.ui.addClass("producto_seleccionado_para_trueque");
            _this.seleccionadoParaTrueque = true;
            _this.alSeleccionarParaTrueque();
        }
		
    });
    if(_this.seleccionadoParaTrueque){
        _this.ui.addClass("producto_seleccionado_para_trueque");
    }
};

VistaDeUnProductoEnInventario.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};