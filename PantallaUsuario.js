var PantallaUsuario = {
    start: function(){
        var _this = this;
        this.ui =  $("#pantalla_usuario");
        
        this.lbl_nombre_usuario = this.ui.find("#lbl_nombre_usuario");
        this.panel_inventario = this.ui.find("#panel_inventario");
        
		this.img_avatar_usuario = this.ui.find("#avatar_usuario");
        this.video_para_sacar_foto= this.ui.find("#video_para_sacar_foto")[0];
		
        this.btn_add_producto = this.ui.find("#btn_add_producto");
        this.txt_nombre_producto_add = this.ui.find("#txt_nombre_producto_add");
        this.btnSave = this.ui.find("#btn_save");
        this.btnLoad = this.ui.find("#btn_load");
        
        this.btn_add_producto.click(function(){
            Traders.agregarProducto({
                nombre:_this.txt_nombre_producto_add.val()
            });
            _this.txt_nombre_producto_add.val("");
        }); 
		this.txt_nombre_producto_add.keypress(function(e) {
			if(e.which == 13) {
				_this.btn_add_producto.click();
			}
		});    
        
		this.btn_compartir_id = this.ui.find("#btn_compartir_id");
		this.btn_compartir_id.click(function(){
			vex.dialog.prompt({
				message: 'Compartí tu id',
				value: Traders.usuario.id,
				callback: function(value) {
					if(value){
						clipboardCopy(Traders.usuario.id);
					}
				}
			});
		});
		var video_stream;
        this.img_avatar_usuario.click(function(){		            
            var width = 100;
            var height = 100;
            var streaming = false;
            
            var errBack = function(error) {
                    console.log("Video capture error: ", error.code); 
                };
            
            navigator.getMedia = ( navigator.getUserMedia || 
                                    navigator.webkitGetUserMedia ||
                                    navigator.mozGetUserMedia ||
                                    navigator.msGetUserMedia);

            navigator.getMedia(
                { 
                    video: true, 
                    audio: false 
                },
                function(stream) {
                    video_stream = stream;
                    if (navigator.mozGetUserMedia) { 
                        _this.video_para_sacar_foto.mozSrcObject = stream;
                    } else {
                        var vendorURL = window.URL || window.webkitURL;
                        _this.video_para_sacar_foto.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
                    }
                    _this.video_para_sacar_foto.play();
                    $(_this.video_para_sacar_foto).show();
                    _this.img_avatar_usuario.hide();
                },
                function(err) {
                    console.log("An error occured! " + err);
                }
            );
        });
        
        $(this.video_para_sacar_foto).click(function(){
            var canvas = $('<canvas>')[0];
            var ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 100;
            var alto_rec_video = _this.video_para_sacar_foto.videoHeight;
            var x_rec = (_this.video_para_sacar_foto.videoWidth - alto_rec_video)/2;
            canvas.getContext('2d').drawImage(_this.video_para_sacar_foto, x_rec, 0, alto_rec_video, alto_rec_video, 0, 0, 100, 100);
            var imagen_serializada = canvas.toDataURL('image/jpeg');
            _this.img_avatar_usuario.attr("src", imagen_serializada);
			Traders.cambiarAvatar(imagen_serializada);
            $(_this.video_para_sacar_foto).hide();
            _this.img_avatar_usuario.show();
            _this.video_para_sacar_foto.pause();
            video_stream.stop();
        });
        
        this.inventario_usuario = new ListaProductos({
            selector:{propietario:Traders.usuario}, 
            alSeleccionar: function(producto){
                var pantalla_edicion = new PantallaEdicionProducto(producto);
            },
            alEliminar: function(producto){
                Traders.quitarProducto(producto);
            }
        });
        this.inventario_usuario.dibujarEn(this.panel_inventario);
        
		Traders.onNovedades(function(){
			if(_this.ui.is(':visible')){
				_this.render();
			}
        });		
		
        this.txt_nombre_producto_add.focus();
    },
    render: function(){
        this.lbl_nombre_usuario.text(Traders.usuario.nombre);
		if(Traders.usuario.avatar!="") this.img_avatar_usuario.attr("src", Traders.usuario.avatar);
		
/*
        this.panel_inventario.empty();
        this.panel_me_deben.empty();
        this.panel_debo.empty();
        var _this = this;
		
		///// panel_inventario
		_.each(Traders.usuario.inventario, function(producto){
			var vista = new VistaDeUnProductoEnInventario({
				producto: producto, 
				alEliminar: function(){
					Traders.quitarProducto(producto);
				},
				alClickear: function(){
					PantallaEdicionProducto.mostrar(producto);
				}
			});
			vista.dibujarEn(_this.panel_inventario);
		});
		
		///// panel_me_deben
		if(Traders.usuario.me_deben.length > 0){
			_this.panel_me_deben.closest('.seccion_container').closest('li').show();
			
			_.each(Traders.usuario.me_deben, function(producto){
				var vista = new VistaDeUnProductoEnInventario({
					producto: producto
				});
				vista.dibujarEn(_this.panel_me_deben);
			});
		}else{
			_this.panel_me_deben.closest('.seccion_container').closest('li').hide();
		}
			
		///// panel_debo
		if(Traders.usuario.debo.length > 0){
			_this.panel_debo.closest('.seccion_container').closest('li').show();
			_.each(Traders.usuario.debo, function(producto){
				var vista = new VistaDeUnProductoEnInventario({
					producto: producto,
					alEliminar: function(){
						Traders.quitarProducto(producto);
					}
				});
				vista.dibujarEn(_this.panel_debo);
			});
		}else{
			_this.panel_debo.closest('.seccion_container').closest('li').hide();
		}
		
*/
		else this.img_avatar_usuario.attr("src", "avatar_default.png");

		
        var _this = this;
		
        this.inventario_usuario.render();
       
        this.ui.show();      
    }
};