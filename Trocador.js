Trocador = {
    start : function(){   
        var _this = this;
        this.ui = $("#trocador");
        
        //prueba
//        vx.start({verbose:true});
//        vx.conectarPorHTTP({
//            //url:'http://router-vortex.herokuapp.com',
//            url:'http://localhost:3000',
//            intervalo_polling: 50
//        });  
//        
//        vx.pedirMensajes({
//            filtro: new FiltroXEjemplo({tipoDeMensaje: "prueba"}),
//            callback: function(mensaje){
//                console.log("me llego esto", mensaje);
//            }
//        });
        //fin prueba
        
        
        
        
        this.pantallaLogin = $("#pantalla_login");
        this.divNombreUsuario = this.pantallaLogin.find("#nombre_usuario");
        this.divPassword = this.pantallaLogin.find("#password");
        this.divBotonIngresar = this.pantallaLogin.find("#boton_ingresar");
        this.divBotonIngresar.click(function(){
            var nombre_usuario = _this.divNombreUsuario.val();
            var password = _this.divPassword.val();
            
            _this.claveRSA = cryptico.generateRSAKey(nombre_usuario + password, 1024);
            
            _this.usuario = {
                id: cryptico.publicKeyString(_this.claveRSA),
                nombre: nombre_usuario,
                inventario: []
            };
            
            _this.pantallaLogin.hide();
            _this.alIngresarAlMercado();
        });
    },
    
    alIngresarAlMercado:function(){
        var _this = this;
        this.setupVortex();
        
        this.mercaderes = [];
        this.maxIdDeProductoGenerado = 0;
        
        this.mercaderSeleccionado = {nombre:"", id:"", inventario:[], trueque: {mio:[], suyo:[]}};
        
        this.panelInventarioUsuario = this.ui.find("#panel_propio .panel_inventario");        
        this.panelInventarioDelOtro = this.ui.find("#panel_ajeno .panel_inventario");
        
        this.pantalla_mercado =  $("#pantalla_mercado");
        this.barraDatosUsuario = this.pantalla_mercado.find("#panel_propio .datos_usuario");
        this.barraDatosUsuario.text(this.usuario.nombre);
        
        PersistidorManual.start(_this.usuario.id);
        
        SelectorDeMercaderes.start({
            mercaderes: this.mercaderes,
            alSeleccionarMercader: function(mercader){           
                _this.mercaderSeleccionado = mercader;
                _this.dibujarInventarios();
            }
        });

        this.btnAgregarProducto = this.pantalla_mercado.find("#btn_add_producto");
        this.txt_nombre_producto_add = this.pantalla_mercado.find("#txt_nombre_producto_add");
        this.btnAgregarProducto.click(function(){
            _this.agregarProductoAMiInventario({nombre:_this.txt_nombre_producto_add.val()});
            _this.txt_nombre_producto_add.val("");
        });
    
        
        this.btnProponerTrueque = this.pantalla_mercado.find("#btnProponerTrueque");
        this.btnProponerTrueque.click(function(){
            vx.enviarMensajeSeguro({
                tipoDeMensaje:"trocador.propuestaDeTrueque",
                para: _this.mercaderSeleccionado.id,
                de: _this.usuario.id,
                datos:{
                    pido: _this.mercaderSeleccionado.trueque.suyo,
                    doy: _this.mercaderSeleccionado.trueque.mio
                }
            });
            _this.mercaderSeleccionado.trueque.enviado = true;
            _this.dibujarInventarios();
        });
        
        this.btnAceptarTrueque = this.pantalla_mercado.find("#btnAceptarTrueque");
        this.btnAceptarTrueque.click(function(){
            vx.enviarMensajeSeguro({
                tipoDeMensaje:"trocador.aceptacionDeTrueque",
                para: _this.mercaderSeleccionado.id,
                de: _this.usuario.id,
                datos:{
                    pido: _this.mercaderSeleccionado.trueque.suyo,
                    doy: _this.mercaderSeleccionado.trueque.mio
                }
            });
            _this.concretarTruequeCon(_this.mercaderSeleccionado);
            _this.dibujarInventarios();
        });
        
        this.btnRefrescarMercaderes = this.pantalla_mercado.find("#btn_refrescar");
        this.btnRefrescarMercaderes.click(function(){
            vx.enviarMensajeSeguro({
                tipoDeMensaje: "trocador.avisoDeIngreso",
                de: _this.usuario.id,
                datos:{
                    nombre: _this.usuario.nombre,
                    inventario:_this.usuario.inventario
                }
            });     
        });
        
        this.btnSave = $("#btn_save");
        this.btnSave.click(function(){            
            vx.enviarMensajeSeguro({
                tipoDeMensaje:"vortex.persistencia.guardarDatos",
                de: _this.usuario.id,                
                para: _this.usuario.id,                
                datos: {
                    usuario: _this.usuario, 
                    maxIdDeProductoGenerado: _this.maxIdDeProductoGenerado
                }
            });
        });
        
        this.btnLoad = $("#btn_load");
        this.btnLoad.click(function(){            
            vx.enviarMensaje({
                tipoDeMensaje:"vortex.persistencia.obtenerDatos",
                de: _this.usuario.id
            });
        });
        
        this.dibujarInventarios();
        this.pantalla_mercado.show();
        
        vx.enviarMensajeSeguro({
            tipoDeMensaje: "trocador.avisoDeIngreso",
            de: this.usuario.id,
            datos:{
                nombre: this.usuario.nombre,
                inventario:this.usuario.inventario
            }
        });
    },
    setupVortex: function(){
        var _this = this;
        vx.start({verbose:true, claveRSA: this.claveRSA});

//        vx.conectarPorHTTP({
//            //url:'http://router-vortex.herokuapp.com',
//            url:'http://localhost:3000',
//            intervalo_polling: 50
//        });    
        vx.conectarPorWebSockets({
            url:'https://router-vortex.herokuapp.com' 
            //url:'http://localhost:3000'
        });   
        
        
        vx.pedirMensajesSeguros({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeIngreso"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) 
                    return;
                _this.agregarMercader(mensaje.de, mensaje.datos.nombre, mensaje.datos.inventario);
                vx.enviarMensajeSeguro({
                    tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                    de: _this.usuario.id,
                    para: mensaje.de,                 
                    datos: {
                        nombre: _this.usuario.nombre,  
                        inventario:_this.usuario.inventario
                    }
                });
            }
        });  

        vx.pedirMensajesSeguros({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.inventario"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) return;
                var mercader = _.findWhere(_this.mercaderes, {id:mensaje.de});
                mercader.inventario = mensaje.datos.inventario;
                _this.dibujarInventarios();
            }
        }); 
        
        vx.pedirMensajesSeguros({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                para: this.usuario.id
            }),
            callback: function(mensaje){
                _this.agregarMercader(mensaje.de, mensaje.datos.nombre, mensaje.datos.inventario);
            }
        });
        
        vx.pedirMensajesSeguros({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeNuevoProducto"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) return;
                var mercader = _.findWhere(_this.mercaderes, {id: mensaje.de});
                _this.agregarProductoAlInventarioDe(mensaje.datos.producto, mercader);
            }
        });  
        
        vx.pedirMensajesSeguros({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeBajaDeProducto"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) return;
                var mercader = _.findWhere(_this.mercaderes, {id: mensaje.de});
                _this.quitarProductoDelInventarioDe(mensaje.datos.producto, mercader);
            }
        });  
        
        vx.pedirMensajesSeguros({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.propuestaDeTrueque",
                para: this.usuario.id
            }),
            callback: function(mensaje){
                var mercader = _.findWhere(_this.mercaderes, {id: mensaje.de});
                mercader.trueque.mio = mensaje.datos.pido;
                mercader.trueque.suyo = mensaje.datos.doy;            
                mercader.trueque.propuestoPor = "el";                
                _this.dibujarInventarios();
            }
        });  
        
        vx.pedirMensajesSeguros({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.aceptacionDeTrueque",
                para: this.usuario.id
            }),
            callback: function(mensaje){
                var mercader = _.findWhere(_this.mercaderes, {id: mensaje.de});
                mercader.trueque.mio = mensaje.datos.pido;
                mercader.trueque.suyo = mensaje.datos.doy;      
                _this.concretarTruequeCon(mercader);
                _this.dibujarInventarios();
            }
        });   
        
        vx.pedirMensajesSeguros({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"vortex.persistencia.datos",
                para: this.usuario.id
            }),
            callback: function(mensaje){
                //var datos = JSON.parse(cryptico.decrypt(mensaje.datos, _this.claveRSA).plaintext);
                _this.usuario = mensaje.datos.usuario;
                _this.maxIdDeProductoGenerado = mensaje.datos.maxIdDeProductoGenerado;
                vx.enviarMensajeSeguro({
                    tipoDeMensaje: "trocador.inventario",
                    de: _this.usuario.id,
                    datos:{
                        inventario:_this.usuario.inventario
                    }
                });
                _this.dibujarInventarios();
            }
        });  
    },
    agregarMercader: function(id, nombre, inventario){
        var mercader = _.findWhere(this.mercaderes, {id:id});
        if( mercader !== undefined) {
            mercader.inventario = inventario;
            this.dibujarInventarios();
            return;
        }
        this.mercaderes.push({
            id:id,
            nombre: nombre,
            inventario:inventario||[],
            trueque: {
                suyo: [],
                mio: [],
                propuestoPor: "ninguno",
                enviado:false
            }
        });
        SelectorDeMercaderes.actualizar();
    },
    agregarProductoAlInventarioDe: function(producto, mercader){
        if(_.findWhere(mercader.inventario, {id: producto.id})!== undefined) return;
        mercader.inventario.push(producto);
        this.dibujarInventarios();
    },
    agregarProductoAMiInventario: function(producto){
        producto.id = this.maxIdDeProductoGenerado; //_.max(this.usuario.inventario, function(p){return p.id;}) + 1;
        this.maxIdDeProductoGenerado+=1;
        this.agregarProductoAlInventarioDe(producto, this.usuario);
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.avisoDeNuevoProducto",
            de: this.usuario.id,
            datos: {
                producto: producto
            }
        });
    },
    quitarProductoDelInventarioDe: function(producto, mercader){
        mercader.inventario = $.grep(mercader.inventario, function(prod){
            return producto.id != prod.id;
        });
        this.dibujarInventarios();
    },
    quitarProductoDeMiInventario: function(producto){
        this.quitarProductoDelInventarioDe(producto, this.usuario)
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.avisoDeBajaDeProducto",
            de: this.usuario.id,
            datos:{
                producto: producto
            }
        });
    },
    concretarTruequeCon: function(mercader){
        var _this = this;
        _.each(mercader.trueque.mio, function(pt){
            _this.quitarProductoDeMiInventario(pt);
        });
        _.each(mercader.trueque.suyo, function(pt){
            _this.quitarProductoDelInventarioDe(pt, mercader);
            _this.agregarProductoAMiInventario(pt);            
        });
        mercader.trueque.mio.length = 0;
        mercader.trueque.suyo.length = 0;   
        mercader.trueque.propuestoPor = "ninguno";
    },
    dibujarInventarios: function(){
        this.panelInventarioUsuario.empty();
        this.panelInventarioDelOtro.empty()
        var _this = this;
        _.each(this.usuario.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto, 
                seleccionadoParaTrueque: (_.findWhere(_this.mercaderSeleccionado.trueque.mio, {id: producto.id})!== undefined),
                alSeleccionarParaTrueque: function(){
                    _this.mercaderSeleccionado.trueque.mio.push(producto);
                    _this.mercaderSeleccionado.trueque.propuestoPor = "mi";
                    _this.mercaderSeleccionado.trueque.enviado = false;
                    _this.dibujarInventarios();  
                },
                alDesSeleccionarParaTrueque: function(){
                    _.each(_this.mercaderSeleccionado.trueque.mio, function(p, i){
                        if(producto.id == p.id) _this.mercaderSeleccionado.trueque.mio.splice(i, 1);
                    });
                    _this.mercaderSeleccionado.trueque.propuestoPor = "mi";
                    _this.mercaderSeleccionado.trueque.enviado = false;
                    _this.dibujarInventarios();  
                },
                alEliminar: function(){
                    _this.quitarProductoDeMiInventario(producto);
                }
            });
            vista.dibujarEn(_this.panelInventarioUsuario);
        });
        
        _.each(this.mercaderSeleccionado.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto, 
                seleccionadoParaTrueque: (_.findWhere(_this.mercaderSeleccionado.trueque.suyo, {id: producto.id})!== undefined),
                alSeleccionarParaTrueque: function(){
                    _this.mercaderSeleccionado.trueque.suyo.push(producto);
                    _this.mercaderSeleccionado.trueque.propuestoPor = "mi";
                    _this.mercaderSeleccionado.trueque.enviado = false;
                    _this.dibujarInventarios();    
                },
                alDesSeleccionarParaTrueque: function(){
                    _.each(_this.mercaderSeleccionado.trueque.suyo, function(p, i){
                        if(producto.id == p.id) _this.mercaderSeleccionado.trueque.suyo.splice(i, 1);
                    });
                    _this.mercaderSeleccionado.trueque.propuestoPor = "mi";
                    _this.mercaderSeleccionado.trueque.enviado = false;
                    _this.dibujarInventarios();  
                }
            });
            vista.dibujarEn(_this.panelInventarioDelOtro);
        });
        
        if(this.mercaderSeleccionado.trueque.mio.length == 0 && 
            this.mercaderSeleccionado.trueque.suyo.length == 0){
            this.btnProponerTrueque.hide();
            this.btnAceptarTrueque.hide();
        }else{
            if(this.mercaderSeleccionado.trueque.propuestoPor == "el"){
                this.btnProponerTrueque.hide();
                this.btnAceptarTrueque.show();
            }else{
                if(this.mercaderSeleccionado.trueque.enviado) this.btnProponerTrueque.hide();
                else this.btnProponerTrueque.show();
                this.btnAceptarTrueque.hide();
            }
        }
    }    
};