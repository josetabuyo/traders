$(document).ready(function() {  
    //toda esta garcha es para detectar si la aplicacion esta corriendo en un celular o en una pc.
    //En el celular para arrancar la app hay que esperar al evento deviceReady, en la pc solo al documentReady
    window.isphone = false;
//    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
//        window.isphone = true;
//    }

    if(window.isphone) {
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        onDeviceReady();
    }
});


var onDeviceReady = function() {     
    vx.start({verbose:false});
    
	// url:'http://router-vortex.herokuapp.com',
	// url:'http://localhost:3000',
	
    PantallaInicio.start();
    BarraSuperior.start();
    
    Traders.onUsuarioLogueado(function(){
		
		
		PantallaUsuario.start();		
		PantallaContactos.start();		
		PantallaTrueques.start();		
		PantallaListaConexiones.start();
		PantallaProductos.start();
		// PersistidorManual.start(this.usuario.id);
		// PersistidorLocalStorage.start(this.usuario.id);
		var PersistidorLocalStorage_Propio = new PersistidorLocalStorage({
			usuario_id: this.usuario.id
		});
		
    });

    PantallaInicio.render();
	vex.defaultOptions.className = 'vex-theme-top';
	/**
	 * Enables the background mode. The app will not pause while in background.
	 */
	if(window.plugin){
		window.plugin.backgroundMode.enable();
	}
};




