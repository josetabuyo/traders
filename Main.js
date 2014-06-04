$(document).ready(function() {  
    //toda esta garcha es para detectar si la aplicacion esta corriendo en un celular o en una pc.
    //En el celular para arrancar la app hay que esperar al evento deviceReady, en la pc solo al documentReady
    window.isphone = false;
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        window.isphone = true;
    }

    if(window.isphone) {
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        onDeviceReady();
    }
});


var onDeviceReady = function() {     
    vx.start({verbose:true});
    
	//'https://router-vortex.herokuapp.com' 
	// url:'http://router-vortex.herokuapp.com',
	// url:'http://localhost:3000',
	
    PantallaInicio.start();
    BarraSuperior.start();
    
    Traders.onUsuarioLogueado(function(){
		PantallaUsuario.start();
		
		PantallaListaContactos.start();
		PantallaContacto.start();
		
		PantallaListaTrueques.start();
		PantallaTrueque.start();
		
		PantallaListaConexiones.start();

		PantallaEdicionProducto.start();
        PersistidorManual.start(Traders.usuario.id);
		
    });

    PantallaInicio.render();

};




