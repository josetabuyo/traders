var PantallaTraders = {
    start : function(){   
        var _this = this;
        this.ui = $("#trocador");
        this.pantallaLogin = $("#pantalla_login");
        this.divNombreUsuario = this.pantallaLogin.find("#nombre_usuario");
        this.divPassword = this.pantallaLogin.find("#password");
        this.divBotonIngresar = this.pantallaLogin.find("#boton_ingresar");
        this.divBotonIngresar.click(function(){
            var nombre_usuario = _this.divNombreUsuario.val();
            var password = _this.divPassword.val();
            
            Traders.login(nombre_usuario, password);
            
            _this.pantallaLogin.hide();
            _this.alIngresarAlMercado();
        });
        Traders.onNovedades(function(){
            _this.dibujarInventarios();
        });
		
		this.divNombreUsuario.keypress(function(e) {
			if(e.which == 13) {
				_this.divPassword.focus();
			}
		});
		
		this.divPassword.keypress(function(e) {
			if(e.which == 13) {
				_this.divBotonIngresar.click();
			}
		});
		
		this.divNombreUsuario.focus();
		
		
    },
    
    alIngresarAlMercado:function(){
        var _this = this;

        this.mercaderSeleccionado = {
			nombre:"",
			id:"",
			inventario:[],
			trueque: {
				mio:[],
				suyo:[]
			}
		};
        
        this.panelInventarioUsuario = this.ui.find("#panel_propio .panel_inventario");        
        this.panelInventarioDelOtro = this.ui.find("#panel_ajeno .panel_inventario");
        
        this.pantalla_mercado =  $("#pantalla_mercado");
        this.barraDatosUsuario = this.pantalla_mercado.find("#panel_propio #datos_usuario");
        this.barraDatosUsuario.find("#nombre").text(Traders.usuario.nombre);
        
        this.selectorDeMercaderes = $("#selector_mercaderes").select2({
            width: 'resolve',
            height: 'resolve',
            placeholder: 'buscas a alguien?',
            containerCssClass: "selector_mercaderes",
            dropdownCssClass:"dropdown_selector_mercaderes",
            escapeMarkup: function (m) { return m;},
            formatResult:function(mercader){
                return _this.generarVistaMercader(mercader);
            },
            formatSelection:function(mercader){
                return _this.generarVistaMercader(mercader);
            },
            query:function(query){
                query.callback({results: Traders.mercaderes({query: query.term})});
            }
        });
        
        this.selectorDeMercaderes.on("select2-selecting", function (e) {
            _this.mercaderSeleccionado = Traders.mercaderes({id:e.val});
            _this.dibujarInventarios();
        });

        this.btnAgregarProducto = this.pantalla_mercado.find("#btn_add_producto");
        this.txt_nombre_producto_add = this.pantalla_mercado.find("#txt_nombre_producto_add");
        this.btnAgregarProducto.click(function(){
            Traders.agregarProducto({nombre:_this.txt_nombre_producto_add.val()});
            _this.txt_nombre_producto_add.val("");
        });
       
	   
        this.btnProponerTrueque = this.pantalla_mercado.find("#btnProponerTrueque");
        this.btnProponerTrueque.click(function(){
            Traders.proponerTruequeA(_this.mercaderSeleccionado.id);
        });
        
        this.btnAceptarTrueque = this.pantalla_mercado.find("#btnAceptarTrueque");
        this.btnAceptarTrueque.click(function(){
            Traders.aceptarTruequeDe(_this.mercaderSeleccionado.id);
        });
        
//        this.btnRefrescarMercaderes = this.pantalla_mercado.find("#btn_refrescar");
//        this.btnRefrescarMercaderes.click(function(){
//            vx.enviarMensajeSeguro({
//                tipoDeMensaje: "trocador.avisoDeIngreso",
//                de: Traders.usuario.id,
//                datos:{
//                    nombre: Traders.usuario.nombre,
//                    inventario: Traders.usuario.inventario
//                }
//            }, _this.claveRSA);     
//        });
        
        this.btnSave = $("#btn_save");
        this.btnSave.click(function(){  
            Traders.save();
        });
        
        this.btnLoad = $("#btn_load");
        this.btnLoad.click(function(){            
            Traders.load();
        });
        
        this.dibujarInventarios();
        this.pantalla_mercado.show();
		
		this.txt_nombre_producto_add.focus();
		
		this.txt_nombre_producto_add.keypress(function(e) {
			if(e.which == 13) {
				_this.btnAgregarProducto.click();
			}
		});
		
    },
    
    generarVistaMercader: function (mercader) {
        var ui = $("#plantillas .mercader_en_lista").clone();
        ui.find("#nombre").text(mercader.nombre);
        return ui;
    },

    dibujarInventarios: function(){
        this.panelInventarioUsuario.empty();
        this.panelInventarioDelOtro.empty()
        var _this = this;
        _.each(Traders.usuario.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto, 
                seleccionadoParaTrueque: _this.mercaderSeleccionado.trueque.mio.indexOf(producto.id)>-1,
                alSeleccionarParaTrueque: function(){
                    Traders.agregarProductoAPropuesta(_this.mercaderSeleccionado.id, producto.id, "mio");
                },
                alDesSeleccionarParaTrueque: function(){
					Traders.quitarProductoDePropuesta(_this.mercaderSeleccionado.id, producto.id, "mio");
                },
                alEliminar: function(){
                    Traders.quitarProducto(producto.id);
                }
            });
            vista.dibujarEn(_this.panelInventarioUsuario);
        });
        
        _.each(this.mercaderSeleccionado.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto, 
                seleccionadoParaTrueque: _this.mercaderSeleccionado.trueque.suyo.indexOf(producto.id)>-1,
                alSeleccionarParaTrueque: function(){
                    Traders.agregarProductoAPropuesta(_this.mercaderSeleccionado.id, producto.id, "suyo");  
                },
                alDesSeleccionarParaTrueque: function(){
                    Traders.quitarProductoDePropuesta(_this.mercaderSeleccionado.id, producto.id, "suyo");
                }
            });
            vista.dibujarEn(_this.panelInventarioDelOtro);
        });
        
        if(this.mercaderSeleccionado.trueque.mio.length == 0 && 
            this.mercaderSeleccionado.trueque.suyo.length == 0){
            this.btnProponerTrueque.hide();
            this.btnAceptarTrueque.hide();
        }else{
            if(this.mercaderSeleccionado.trueque.estado == "recibido"){
                this.btnProponerTrueque.hide();
                this.btnAceptarTrueque.show();
            }else{
                if(this.mercaderSeleccionado.trueque.estado=="enviado") this.btnProponerTrueque.hide();
                else this.btnProponerTrueque.show();
                this.btnAceptarTrueque.hide();
            }
        }
    }    
};