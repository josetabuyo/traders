var vxCollection = vxCol = vxc = function(nombre, id_usuario){
	var _this = this;
	this.id_usuario = id_usuario;
	this.nombre = nombre;
	this._objetos = [];
	var datos_guardados = localStorage.getItem(this.id_usuario + "_" + this.nombre);
	if(datos_guardados)	{
		this._objetos = JSON.parse(datos_guardados);
	}
	
	vx.when({
		de:this.id_usuario, 
		para:this.id_usuario,
		coleccion: this.nombre,
		tipo_de_mensaje: "vortex.persistencia.addToCollection"
	}, function(mensaje){
		_this.add(mensaje.datoSeguro);
	});
	
	vx.when({
		de:this.id_usuario, 
		para:this.id_usuario,
		coleccion: this.nombre,
		tipo_de_mensaje: "vortex.persistencia.removeFromCollection"
	}, function(mensaje){
		_this.remove(mensaje.datoSeguro);
	});
	
	vx.when({
		de:this.id_usuario, 
		para:this.id_usuario,
		coleccion: this.nombre,
		tipo_de_mensaje: "vortex.persistencia.findInCollection"
	}, function(mensaje){
		var criterios = mensaje.datoSeguro;
		vx.send({
			tipo_de_mensaje: "vortex.persistencia.respuestaAFindInCollection"
			de:_this.id_usuario, 
			para:_this.id_usuario,
			idRequest:mensaje.idRequest,
			datoSeguro: _this.find(criterios)
		})
	});
};

vxCollection.prototype._next_item_id = function(){
	var maxValue = -1;		
	_.each(this._items, function(item) {
		if (item.id > maxValue) {
			maxValue = item.id;
		}
	});
	maxValue++;
	return maxValue;
};

vxCollection.prototype.add = function(objeto){
	objeto.id = this._next_item_id();
	this._objetos.push(objeto);
	this.save();
	vx.send({
		tipoDeMensaje: "vortex.persistencia.objetoAgregadoAColeccion",
		coleccion: this.nombre,
		de:this.id_usuario, 
		datoSeguro: objeto
	});									 
	return objeto;
};

vxCollection.prototype.remove = function(id){
	this._objetos = $.grep(this._objetos, function(item){
		return item.id != id;
	});
	this.save();
	vx.send({
		tipoDeMensaje: "vortex.persistencia.objetoQuitadoDeColeccion",
		coleccion: this.nombre,
		de:this.id_usuario, 
		datoSeguro: id
	});	
};

vxCollection.prototype.find = function(query){
	if(!query) return this._objetos;     
	return _.findWhere(this._objetos, query);
};

vxCollection.prototype.save = function(){
	localStorage.setItem(this.id_usuario + "_" + this.nombre, JSON.stringify(this._objetos));
};
	