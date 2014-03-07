var Traders = {
    _mercaderes:[],
    _maxIdDeProductoGenerado: 0,
    _onNovedades:function(){},
    _onUsuarioLogueado:function(){},
    onNovedades:function(callback){
        this._onNovedades = callback;
    },
    onUsuarioLogueado:function(callback){
        this._onUsuarioLogueado = callback;
    },  
    mercaderes:function(p){
        if(!p) return this._mercaderes;
        if(p.id) return _.findWhere(this._mercaderes, {id:p.id});
        if(p.query){
            if(p.query == "") 
                return this._mercaderes;
            else 
                return _.filter(this._mercaderes, function(mercader){
                    return mercader.nombre.indexOf(p.query)>=0 || mercader.id == p.query;
                });  
        }
    },
    login: function(usuario, password){
        var _this = this;
		
        this.claveRSA = cryptico.generateRSAKey(usuario + password, 1024);    
        this.usuario = {
            id: cryptico.publicKeyString(this.claveRSA),
            nombre: usuario,
            inventario: []
        };  
        this._onUsuarioLogueado();
        
		
		////parche para atajar las respuestas
		vx.pedirMensajes({
            filtro: {
                para: this.usuario.id
            },
            callback: function(mensaje){
				
            }
        });
		
		
		
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.avisoDeIngreso"
            },
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) 
                    return;
                _this._agregarMercader(mensaje.de, mensaje.datos.nombre, mensaje.datos.inventario);
                vx.enviarMensajeSeguro({
                    tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                    de: _this.usuario.id,
                    para: mensaje.de,                 
                    datos: {
                        nombre: _this.usuario.nombre,  
                        inventario:_this.usuario.inventario
                    }
                }, _this.claveRSA);
                _this._onNovedades();
            }
        }, this.claveRSA);  

        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.inventario"
            },
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) return;
                var mercader = _this.mercaderes({id:mensaje.de});
                mercader.inventario = mensaje.datos.inventario;
                _this._onNovedades();
            }
        }, this.claveRSA); 
        
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                para: this.usuario.id
            },
            callback: function(mensaje){
                _this._agregarMercader(mensaje.de, mensaje.datos.nombre, mensaje.datos.inventario);
                _this._onNovedades();
            }
        }, this.claveRSA);
        
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.avisoDeNuevoProducto"
            },
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) return;
                var mercader = _this.mercaderes({id:mensaje.de});
                _this._agregarProductoAlInventarioDe(mensaje.datos.producto, mercader);
                _this._onNovedades();
            }
        }, this.claveRSA);  
        
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.avisoDeBajaDeProducto"
            },
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.id) return;
                var mercader = _this.mercaderes({id:mensaje.de});
                _this._quitarProductoDelInventarioDe(mensaje.datos.id_producto, mercader);
                _this._onNovedades();
            }
        }, this.claveRSA);  
        
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.propuestaDeTrueque",
                para: this.usuario.id
            },
            callback: function(mensaje){
                var mercader = _this.mercaderes({id:mensaje.de});
                mercader.trueque.mio = mensaje.datos.pido;
                mercader.trueque.suyo = mensaje.datos.doy;            
                mercader.trueque.estado = "recibido";                
                _this._onNovedades();
            }
        }, this.claveRSA);  
        
        vx.pedirMensajesSeguros({
            filtro: {
                tipoDeMensaje:"trocador.aceptacionDeTrueque",
                para: this.usuario.id
            },
            callback: function(mensaje){
                var mercader = _this.mercaderes({id:mensaje.de});
                mercader.trueque.mio = mensaje.datos.pido;
                mercader.trueque.suyo = mensaje.datos.doy;      
                _this._concretarTruequeCon(mercader);
                _this._onNovedades();
            }
        }, this.claveRSA);
        
        
		
		
		
		/*
		vx.pedirMensajes({
            filtro: {
                tipoDeMensaje:"vortex.persistencia.datos",
                para: this.usuario.id
            },
            callback: function(mensaje){
				setDataUsuario(mensaje.datos);
			}
        });
		*/
		
        
		
		
		
		
        setTimeout(function(){
            vx.enviarMensajeSeguro({
                tipoDeMensaje: "trocador.avisoDeIngreso",
                de: _this.usuario.id,
                datos:{
                    nombre: _this.usuario.nombre,
                    inventario:_this.usuario.inventario
                }
            }, _this.claveRSA);
        },2000);
    },
    agregarProductoAPropuesta: function(id_mercader, id_producto, mio_o_suyo){
		var mercader = this.mercaderes({
			id: id_mercader
		});
        
		if(mio_o_suyo == "suyo"){
			mercader.trueque.suyo.push(id_producto);
		}else{
			mercader.trueque.mio.push(id_producto);
		}
		
        mercader.trueque.estado = "borrador";
        this._onNovedades();
    },
    quitarProductoDePropuesta: function(id_mercader, id_producto, mio_o_suyo){
        var mercader = this.mercaderes({id:id_mercader});
        if(mio_o_suyo == "suyo") mercader.trueque.suyo.splice(mercader.trueque.suyo.indexOf(id_producto), 1);
        else mercader.trueque.mio.splice(mercader.trueque.mio.indexOf(id_producto), 1);
        mercader.trueque.estado = "borrador";
        this._onNovedades();
    },
    proponerTruequeA: function(id_mercader){
        var mercader = this.mercaderes({id:id_mercader});
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.propuestaDeTrueque",
            para: id_mercader,
            de: this.usuario.id,
            datos:{
                pido: mercader.trueque.suyo,
                doy: mercader.trueque.mio
            }
        }, this.claveRSA);
        mercader.trueque.estado = "enviado";
        this._onNovedades();
    },
    aceptarTruequeDe: function(id_mercader){
        var mercader = this.mercaderes({id:id_mercader});
        if(mercader.trueque.estado != "recibido") return;
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.aceptacionDeTrueque",
            para: id_mercader,
            de: this.usuario.id,
            datos:{
                pido: mercader.trueque.suyo,
                doy: mercader.trueque.mio
            }
        }, this.claveRSA);
        this._concretarTruequeCon(mercader);
        this._onNovedades();
    },
    agregarProducto: function(p){
        var producto = _.clone(p);
        producto.id = this._maxIdDeProductoGenerado;
        this._maxIdDeProductoGenerado+=1;
        this._agregarProductoAlInventarioDe(producto, this.usuario);
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.avisoDeNuevoProducto",
            de: this.usuario.id,
            datos: {
                producto: producto
            }
        }, this.claveRSA);
        this._onNovedades();
    },
    quitarProducto: function(id_producto){
        this._quitarProductoDelInventarioDe(id_producto, this.usuario)
        vx.enviarMensajeSeguro({
            tipoDeMensaje:"trocador.avisoDeBajaDeProducto",
            de: this.usuario.id,
            datos:{
                id_producto: id_producto
            }
        }, this.claveRSA);
        this._onNovedades();
    },
    save: function(){
		
        
		vx.pedirMensajes({
            filtro: {
                tipoDeMensaje:"vortex.almacen.persistencia.estado",
                para: this.usuario.id,
				idrespuesta: 987546
            },
            callback: function(mensaje){
				alert(mensaje.estado);
            }
        });
		
		vx.enviarMensaje({
            //tipoDeMensaje:"vortex.persistencia.guardarDatos",
            tipoDeMensaje:"vortex.almacen.persistencia",
			de: this.usuario.id,
            idrespuesta: 987546,
            datos: {
                usuario: this.usuario, 
                maxIdDeProductoGenerado: this._maxIdDeProductoGenerado
            }
        });
		
    },
    load: function(){
        
		var _this = this;
		
		var setDataUsuario = function(datos){
		
			_this.usuario = datos.usuario;
			_this.maxIdDeProductoGenerado = datos.maxIdDeProductoGenerado;
			vx.enviarMensajeSeguro({
				tipoDeMensaje: "trocador.inventario",
				de: _this.usuario.id,
				datos:{
					inventario:_this.usuario.inventario
				}
			}, _this.claveRSA);
			_this._onNovedades();
		};
		
		
		vx.pedirMensajes({
            filtro: {
                tipoDeMensaje:"vortex.almacen.consulta.resultado",
                para: this.usuario.id,
				idrespuesta: 3216548
            },
            callback: function(mensaje){
				
				setDataUsuario(mensaje.resultado[mensaje.resultado.length-1].datos);
			}
        });
		
		vx.enviarMensaje({
            //tipoDeMensaje:"vortex.persistencia.obtenerDatos",
            tipoDeMensaje:"vortex.almacen.consulta",
            de: this.usuario.id,
			idrespuesta: 3216548
        });
		
		
    },
    _agregarProductoAlInventarioDe: function(producto, mercader){
        if(_.findWhere(mercader.inventario, {id: producto.id})!== undefined) return;
        mercader.inventario.push(producto);
    },
    _quitarProductoDelInventarioDe: function(id_producto, mercader){
        mercader.inventario = $.grep(mercader.inventario, function(prod){
            return prod.id != id_producto;
        });
    },    
    _concretarTruequeCon: function(mercader){
        var _this = this;
        _.each(mercader.trueque.mio, function(id_producto){
            _this.quitarProducto(id_producto);
        });
        _.each(mercader.trueque.suyo, function(id_producto){
            _this.agregarProducto(_.findWhere(mercader.inventario, {id: id_producto}));            
            _this._quitarProductoDelInventarioDe(id_producto, mercader);
        });
        mercader.trueque.mio.length = 0;
        mercader.trueque.suyo.length = 0;   
        mercader.trueque.estado = "cero";
    },
    _agregarMercader: function(id, nombre, inventario){
        var mercader = this.mercaderes({id:id});
        if( mercader !== undefined) {
            mercader.inventario = inventario;
            return;
        }
        this._mercaderes.push({
            id:id,
            nombre: nombre,
            inventario:inventario||[],
            trueque: {
                suyo: [],
                mio: [],
                estado: "cero"
            }
        });
    },
};