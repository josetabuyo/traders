var vxObject = Vxo = vxo =  function(identificador, idOwner, idUsuario){    
    var _this = this;
    this._identificador = identificador;
    this._objeto = {};
    this._id_owner = idOwner;
    this._id_usuario = idUsuario;
    
    if(this.elObjetoEsMio()){ //el objeto es mio
        var filtro_get_valor = {};    
        filtro_get_valor = ClonadorDeObjetos.extend(filtro_get_valor, identificador); 
        filtro_get_valor.tipoDeMensaje = "vortex.persistencia.get";
        filtro_get_valor.para = this._id_usuario;
        vx.when(filtro_get_valor, function(mensaje_recibido){
            var mensaje = {};
            mensaje = ClonadorDeObjetos.extend(mensaje, identificador);
            mensaje.tipoDeMensaje = "vortex.persistencia.respuestaAlGet";
            mensaje.de = this._id_usuario;
            mensaje.para = mensaje_recibido.de;
            mensaje.idRequest = mensaje_recibido.idRequest;
            mensaje.datoSeguro = _this._objeto;
            vx.send(mensaje);
        });
        
        var filtro_set_valor = {};    
        filtro_set_valor = ClonadorDeObjetos.extend(filtro_get_valor, identificador); 
        filtro_set_valor.tipoDeMensaje = "vortex.persistencia.set";
        filtro_set_valor.de = this._id_usuario;
        filtro_set_valor.para = this._id_usuario;
        vx.when(filtro_set_valor, function(mensaje){
            _this.val(mensaje.datoSeguro);
        });
    } else{
        var filtro_obj_actualizado = {};
        filtro_obj_actualizado = ClonadorDeObjetos.extend(filtro_obj_actualizado, identificador); 
        filtro_obj_actualizado.tipoDeMensaje = "vortex.persistencia.objetoActualizado";                        
        filtro_obj_actualizado.de = this._id_owner;
        vx.when(filtro_obj_actualizado, function(mensaje){
            _this._objeto = mensaje.datoSeguro;
        });
        
        var mensaje = {};
        mensaje = ClonadorDeObjetos.extend(mensaje, this._identificador);
        mensaje.tipoDeMensaje = "vortex.persistencia.get";
        mensaje.de = this._id_usuario;
        mensaje.para = this._id_owner;
        vx.send(mensaje, function(){
            _this._objeto = mensaje.datoSeguro;
        });        
    }
};
    
vxObject.prototype.val = function(){
    if(arguments.length == 0) return this.getVal();
    if(arguments.length == 1) this.setVal(arguments[0]);
};  

vxObject.prototype.getVal = function(){
    return this._objeto;
};

vxObject.prototype.setVal = function(val){    
    if(this.elObjetoEsMio()){
        this._objeto = val;
        var mensaje = {};
        mensaje = ClonadorDeObjetos.extend(mensaje, this._identificador);
        mensaje.tipoDeMensaje = "vortex.persistencia.objetoActualizado";
        mensaje.datoSeguro = this._objeto;
        mensaje.de = this._id_usuario;
        vx.send(mensaje);
    }
};

vxObject.prototype.elObjetoEsMio = function(){
    return this._id_owner == this._id_usuario;
};