var PantallaEdicionProducto = function(producto){
	var _this = this;
	this.producto = producto;
	
	this.ui = $("#plantillas .pantalla_edicion_producto").clone();
	this.txt_nombre_producto = this.ui.find("#txt_nombre_producto");
	this.txt_nombre_producto.change(function(){
		producto.nombre = _this.txt_nombre_producto.val();
		Traders.modificarProducto(producto);
	});
	
    this.imagen_producto = this.ui.find("#imagen_producto");
    
    this.imagen_producto.click(function(){
        var fileInputImagenes = $('<input type="file" />')[0];
        fileInputImagenes.addEventListener("change", function () {
            var file = fileInputImagenes.files[0];
            url = window.URL || window.webkitURL;
            src = url.createObjectURL(file);
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var img = new Image;
            img.crossOrigin = 'Anonymous';
            img.src = src;
            img.onload = function () {
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                var bytes_imagen = canvas.toDataURL('image/jpg');
                //bytes_imagen = bytes_imagen.replace(/^data:image\/(png|jpg);base64,/, "");        
                producto.imagen = bytes_imagen;
                Traders.modificarProducto(producto);
            };
        }, false);
        $(fileInputImagenes).click();
    });
    
	Traders.onNovedades(function(){
		_this.render();
	});
	
	vex.open({
		afterOpen: function($vexContent) {
			return $vexContent.append(_this.ui);
		}
	});
	this.render();
};

PantallaEdicionProducto.prototype.render = function(){
	this.txt_nombre_producto.val(this.producto.nombre);
    if(this.producto.imagen) this.imagen_producto.attr("src", this.producto.imagen);
    else this.imagen_producto.attr("src", "Gift-icon-grande.png");
};