class Datos {
  static async enviar(event, aux = "") {
    if (typeof event === "object") {
      event.preventDefault();
    }

    let data = new FormData(document.querySelector("#formulario"));
    let opcion = (typeof event == "object") ? document.querySelector("[name='opcion']").value : event;
    data.append("aux", aux);

    try {
      const response = await fetch("rutas.php/" + opcion, {
        method: "POST",
        body: data,
      });

      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      return null; 
    }
  }
}

export default Datos;