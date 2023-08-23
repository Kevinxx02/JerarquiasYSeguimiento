
class Logger{
  static file(mensaje){
    Datos.enviar("loggerFile", mensaje);
  }
  
  static db(mensaje){
    Datos.enviar("loggerDb", mensaje);
  }
  
  static swal(mensaje, clase, reload = "self") {
    Swal.fire({
      text: mensaje,
      icon: clase
    }).then((result) => {
      if(reload == "parent"){
        parent.location.reload();
      }
    });
  }
}


export default Logger;
