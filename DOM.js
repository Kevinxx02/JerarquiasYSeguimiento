class DOM {
  static insertar({ tag, nombre, clase, texto, atributo, tipo, valor }, contenedor){
    let elemento = document.createElement(tag);
    if(tipo){
      elemento.type = tipo;
    }
    if(valor){
      elemento.value = valor;
    }
    if(texto){
      elemento.textContent = texto;
    }
    if(atributo){
      elemento.setAttribute(atributo[0], atributo[1]);
    }
    if(clase){
      elemento.className = clase;
    }
    if(nombre){
      elemento.name = nombre;
    }
    contenedor.appendChild(elemento);

    return elemento;
  }

  static vaciar(contenedor){
    while (contenedor.firstChild) {
      contenedor.removeChild(contenedor.firstChild);
    }
  }


  
  static loadDomToImage() {
    if(document.querySelectorAll("[src='https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js']").length === 0){
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js';
      document.head.appendChild(script);
    }
  }

  static toImage(contenedor){
    DOM.loadDomToImage();
    let identificadorDeTemporizador = setTimeout(() =>{
      domtoimage.toPng(contenedor)
      .then(function (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = contenedor.id+".png"; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        console.error("Error capturing element:", error);
      });
    }, 500);
  }
}



export default DOM;