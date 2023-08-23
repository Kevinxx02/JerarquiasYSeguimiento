import Graficos from './../../general/controladores/Graficos.js';
import Datos from './../../general/controladores/Datos.js';
import Logger from './../../general/controladores/Logger.js';
import DOM from './../../general/controladores/DOM.js';

$(document).ready(function() {

  var jerarquias;
  var estados;
  var permisos = [];

  document.querySelector('#formulario').addEventListener('submit', solicitud);
  document.addEventListener("click", function(event) {
    if (event.target.matches('[title="Dejar de seguir"]')) {
      eliminar(event.target);
    } else if(event.target.classList.contains("fa-trash")){
      solicitud("comentarioEliminar", event.target.id);
    } else if(event.target.classList.contains("tabButton")){
      const tabs = document.querySelectorAll(".tabButton");
      tabs.forEach(element => {
        let nombreDiv = element.getAttribute("title").replace("Ver ", "div");
        if(element == event.target){
          element.className = "btn btn-sm btn-info tabButton";
          document.querySelector("#"+nombreDiv).setAttribute("class", "row");
        }else{
          element.className = "btn btn-sm btn-light tabButton";
          document.querySelector("#"+nombreDiv).setAttribute("class", "row d-none");
        }
      });
    }
  });

  $('#modal').on('show.bs.modal', function(event) {
    let titulo = event.relatedTarget.getAttribute('title');
    document.querySelector(".modal-title").innerText = titulo;
    switch (titulo) {
      case "Registrar":
        modalRegistro();
        break;
      case "Consultar":
        modalModificacion(event.relatedTarget.closest('tr'));
        break;
      case "Comentarios":
        modalComentarios(event.relatedTarget.closest('tr'));
        break;
      case "Observaciones":
        modalObservaciones(event.relatedTarget.closest('tr').firstChild.innerText);
        break;
    }
  });
  
  async function solicitud(event, aux = "") {
    try {
      const response = await Datos.enviar(event, aux);
      if(response.estado == "finalizado"){
        usar(event, response.data);
      }else{
        console.log(response);
      }
    } catch (error) {
      console.log(error);
      Logger.swal("Error en la solicitud", "error", "parent");
    }
  }
  
  const botones = {
    consultar: '<button class="btn btn-primary btn-sm" title="Consultar" data-toggle="modal" data-target="#modal"><i class="fa fa-eye" aria-hidden="true"></i></button>',
    comentarios: '<button class="btn btn-primary btn-sm" title="Comentarios" data-toggle="modal" data-target="#modal"><i class="fa fa-comments" aria-hidden="true"></i></button>',
    dejarSeguir: '<button class="btn btn-danger btn-sm" title="Dejar de seguir"><i class="material-icons" style="font-size:15px" title="Dejar de seguir">block</i></button>',
    observaciones: '<button class="btn btn-sm btn-info" title="Observaciones" data-toggle="modal" data-target="#modal"><i class="fa fa-eye" aria-hidden="true"></i></button>'
  };
  
  function renderDatatableBotones() {
    let respuesta = '<div style="display: flex;width: 100%;justify-content: center;">';
    if (permisos.includes("actualizar")) {
      respuesta += botones.consultar;
    }
    respuesta += botones.comentarios;
    if (permisos.includes("eliminar")) {
      respuesta += botones.dejarSeguir;
    }
    respuesta += '</div>';
    return respuesta;
  }

  
  let tablaDatos;

  function definirDatatable(){
    tablaDatos = $('#tablaDatos').DataTable({
      columns: [
        {title: "ID Seguimiento", data: "idSeguimiento", class:"d-none", input: "ID Seguimiento"},
        {title: "Número Atención", data: "numAtencion", width: "120px", input: "Número Atención"},
        {title: "Nombre Atención", data: "nomAtencion", width: "400px", input: "Nombre Atención"},
        {title: "Estado", data: "estado",class:"text-center", input: "Estado", width: "65px"},
        {title: "Fecha Inicio", data: "fechaInicio", input: "Fecha Inicio", width: "100px", class: "text-center"},
        {title: "Fecha Asignada", data: "fechaAsignada", input: "Fecha Asignada", width: "100px", class: "d-none"},
        {title: "Estimada", data: "fechaLiberacionEstimada", width: "70px", input: "Fecha Liberacion Estimada"},
        {title: "Real", data: "fechaRealLiberada", width: "70px", input: "Fecha Liberacion Real"},
        {title: "Estimada", data: "fechaFinCierreEstimado", width: "70px", input: "Fecha Produccion Estimada"},
        {title: "Real", data: "fechaFinCierre", width: "70px", input: "Fecha Produccion Real"},
        {title: "Desa", class: (permisos.includes("verHorasSeguimiento")) ? "text-center" : "d-none", width: "50px", input: "Horas Desa", render: function(data, type, row) {
            return row.horaDesaEstimada+'/'+row.horaDesaReal;
          }
        },
        {data: "horaDesaEstimada", width: "70px", class:"d-none", input: ""},
        {data: "horaDesaReal", width: "70px", class:"d-none", input: ""},
  
        {title: "QA", class: (permisos.includes("verHorasSeguimiento")) ? "text-center" : "d-none", width: "50px", input: "Horas QA", render: function(data, type, row) {
            return row.horaQAEstimada+'/'+row.horaQAReal;
          }
        },
        {data: "horaQAEstimada", width: "70px", class:"d-none", input: ""},
        {data: "horaQAReal", width: "70px", class:"d-none", input: ""},
        
        {title: "Total", class: (permisos.includes("verHorasSeguimiento")) ? "text-center" : "d-none", width: "50px", input: "Horas Total", render: function(data, type, row) {
            return row.horaTotalEstimada+'/'+row.horaTotalReal;
          }
        },
        {data: "horaTotalEstimada", width: "70px", class:"d-none", input: ""},
        {data: "horaTotalReal", width: "70px", class:"d-none", input: ""},
        {title: "Analista", data: "idAnalista", input: "Analista", class:"d-none"},
        {title: "Analista QG", data: "desarrollador", input: "Analista QG", class:"d-none"},
        {title: "Analista", data: "analista", input: "", width: "120px"},
        {title: "Analista QG", data: "nomDesarrollador", input: "", width: "120px"},
        {title: "Obs", class:"text-center", width: "50px", input: "Observ", render: function(data, type, row) {
            return botones.observaciones;
          }
        },
        {title: "Acciones", width: "120px", input: "Acciones", class: "text-center", render: function(data, type, row) {
            return renderDatatableBotones();
          }
        }
      ],
      order: [0, 'desc'],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json"
      },
      dom: 'Bfrtip',
      buttons: [{
          extend: 'excelHtml5',
          className: 'dt-button buttons-excel buttons-html5 btn btn-success width-exportar btn-sm',
          text: '<i class="fa fa-file-excel-o"></i> Excel</span>',
          exportOptions: {
            columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
          }
        }
      ],
      createdRow: function(row, data, dataIndex) {
        $(row).attr('id', data.idSeguimiento);
      },
      drawCallback: function() {
        cabeceraDatatable();
        $('.selectpicker').selectpicker('refresh'); 
      }
    });
  }


  function cabeceraDatatable(){
    let identificadorDeTemporizador = setTimeout(() =>{
      const firstHeaderRow = document.querySelector("thead tr:first-child");
      if(firstHeaderRow && firstHeaderRow.children.length>4){
        clearTimeout(identificadorDeTemporizador);
        const newRow = document.createElement("tr");
        DOM.insertar({tag: "td", atributo: ["colspan", "4"], clase: "bg-white"}, newRow);
        DOM.insertar({tag: "td", atributo: ["colspan", "2"], clase: "font-weight-bold", texto: "Fecha Liberación"}, newRow);
        DOM.insertar({tag: "td", atributo: ["colspan", "2"], clase: "font-weight-bold", texto: "Fecha Producción"}, newRow);
        if(permisos.includes("verHorasSeguimiento")){
          DOM.insertar({tag: "td", atributo: ["colspan", "3"], clase: "font-weight-bold", texto: "Horas"}, newRow);
        }
        firstHeaderRow.parentNode.insertBefore(newRow, firstHeaderRow);
      }
    }, 500);
}
  
  function usar(event, data){
    $("#modal").modal('hide');
    switch (event) {
      case 'buscar':
          tablaDatos.clear().rows.add(data).draw();
        break;
      case 'buscarObservaciones':
        document.querySelector("[name='Observaciones']").value = data[0].observaciones;
      break;
      case 'buscarEstados':
        estados = data;
        break;
      case 'buscarJerarquia':
        jerarquias = data;
        solicitud("buscarPermisos");
        break;
      case 'buscarPermisos':
        permisosValidar(data);
        solicitud("buscarEstados");
        break;
      case 'insertar':
        solicitud("planeamientoInsertar", data);
        break;
      case 'planeamientoBuscar':
        planeamientoFormulario(data);
        break;
      case 'dibujarGrafico':
        Graficos.gantt(data);
        break;
      case 'buscarAtenciones':
        const select = document.querySelector(".selectpicker");
        data.forEach(element => {
          let option = document.createElement('option');
          option.value = element.idAtencion;
          option.textContent = `${element.numAtencion} - ${element.nomAtencion}`;
          select.appendChild(option);
        });
        $('.selectpicker').selectpicker('refresh');
        break;
      case 'buscarComentarios':
        vistaComentarios(data);

        break;
    }
    if(typeof(event)=="object" || ["sincronizarHoras", "eliminar"].includes(event)){
      if(data>0){
        solicitud("planeamientoInsertar", data);
      }
      solicitud("buscar");
      Logger.swal("Se realizo correctamente", "success");
    }
  };


  
  function planeamientoWidth(posicion){
    let width = ["20%", "8%", "15%", "15%", "8%", "10%"];
    return width[posicion];
  }

  function planeamientoBody(contenedor, titulos, data){
    //Generacion del body
    data.forEach(element => {
      let div = DOM.insertar({tag: "div", clase: "row"}, contenedor);
      const cols = [];
      titulos.forEach((element, index) => {
        let col = DOM.insertar({ tag: "div", atributo: ["style", "width: " + planeamientoWidth(index)] }, div);
        cols.push(col);
      });
      DOM.insertar({tag: "label", texto: element.titulo}, cols[0]);
      DOM.insertar({tag: "input", nombre: "gap_"+element.idPlaneamiento, clase: "form-control control", tipo: "number", valor: element.gap}, cols[1]);
      DOM.insertar({tag: "input", clase: "form-control control", tipo: "date", valor: element.fechaInicio, atributo: ["disabled", true]}, cols[2]);
      DOM.insertar({tag: "input", clase: "form-control control", tipo: "date", valor: element.fechaFinal, atributo: ["disabled", true]}, cols[3]);
      DOM.insertar({tag: "input", nombre: "cantidadDias_"+element.idPlaneamiento, clase: "form-control control", tipo: "number", valor: element.cantidadDias}, cols[4]);
      DOM.insertar({tag: "input", nombre: "color_"+element.idPlaneamiento, clase: "form-control control", tipo: "color", valor: element.color}, cols[5]);
    });
  }


  function planeamientoFormulario(data){
    let contenedor = document.querySelector("#divPlaneamiento");
    contenedor = DOM.insertar({tag: "div", clase: "col-12 m-3"}, contenedor);
    let div = DOM.insertar({tag: "div", clase: "row font-weight-bold text-center"}, contenedor);

    let titulos = ["Titulo", "Gap", "Fecha Inicio", "Fecha Final", "Duracion", "Color"];

    //Generacion de cabecera
    titulos.forEach((element, index) => {
      DOM.insertar({tag: "div", atributo: ["style", "width: " + planeamientoWidth(index)], texto: element}, div);
    });


    planeamientoBody(contenedor, titulos, data);

    //Agregar ancho liberacion
    div = DOM.insertar({tag: "div", clase: "row font-weight-bold"}, contenedor);
    let primerCol = DOM.insertar({tag: "div", atributo: ["style", "width: 20%"]}, div);
    let segundoCol = DOM.insertar({tag: "div", atributo: ["style", "width: 8%"]}, div);
    DOM.insertar({tag: "label", texto: "Promocion a UAT"}, primerCol);
    DOM.insertar({tag: "input", nombre: "Ancho Liberacion", clase: "form-control control", tipo: "number", valor: data[0].planeamientoAnchoLiberacion}, segundoCol);
    
    solicitud("dibujarGrafico", data[0].idSeguimiento).then(() =>{    
      planeamientoGraficoLeyenda(data);
    });
  }


  function planeamientoGraficoLeyenda(data){
    let contenedor = DOM.insertar({tag: "div", clase: "col-12 p-3", atributo: ["style", "font-size: 0.8em;"]}, document.querySelector("#divGantt"));
      //Cada medio segundo revisa si existe un elemento de tipo svg. 
      //Si existe crea la leyenda del grafico, 
      //sino, espera medio segundo mas antes de probar de nuevo.
      let identificadorDeTemporizador = setTimeout(() =>{
        if(document.querySelector("svg")){
          let widthGrafico = document.querySelector("svg").getAttribute("width");
          let div = DOM.insertar({tag: "div", clase: "font-weight-bold text-center justify-content-center d-flex", atributo: ["style", "width: "+widthGrafico+"px"]}, contenedor);
          data.forEach(element => {
            DOM.insertar({tag: "div", clase: "p-2 ml-3", texto: element.titulo, atributo: ["style", "width: 120px; border-radius: 50%;background: "+element.color]}, div);
          });
    
          let exportarImagen = DOM.insertar({tag: "button", texto: "Exportar Imagen", tipo: "button", clase: "btn btn-sm btn-primary"}, document.querySelector("#divGrafico"));
          exportarImagen.onclick = () => {
            DOM.toImage(document.querySelector("#divGantt"));
          }
          clearTimeout(identificadorDeTemporizador);
        }
      }, 500);
  }



  function modalRegistro() {
    document.querySelector('[role="document"]').className = "modal-dialog";
    let contenedor = document.querySelector(".modal-body");
    DOM.vaciar(contenedor);
    DOM.insertar({tag: "input", clase: "d-none", valor: "insertar", nombre: "opcion", tipo: "text"}, contenedor);
    DOM.insertar({tag: "label", texto: "Selecciona la atencion para iniciar el seguimiento"}, contenedor);
    DOM.insertar({tag: "select", clase: "form-control control selectpicker", atributo: ["data-live-search", "true"], nombre: "idAtencion"}, contenedor);
    
    solicitud("buscarAtenciones");
   }



  function modalModificacion(row) {
    
    document.querySelector('[role="document"]').className = "modal-dialog modal-lg";
    let contenedor = document.querySelector(".modal-body");
    DOM.vaciar(contenedor);

    //Tabs
    DOM.insertar({tag: "button", clase: "btn btn-sm btn-info tabButton", atributo: ["title", "Ver Seguimiento"], texto: "Seguimiento", tipo: "button"}, contenedor);
    DOM.insertar({tag: "button", clase: "btn btn-sm btn-light tabButton", atributo: ["title", "Ver Planeamiento"], texto: "Planeamiento", tipo: "button"}, contenedor);
    DOM.insertar({tag: "button", clase: "btn btn-sm btn-light tabButton", atributo: ["title", "Ver Grafico"], texto: "Gantt", tipo: "button"}, contenedor);
    
    if(permisos.includes("actualizarHorasSeguimiento")){
      let button = DOM.insertar({tag: "button", clase: "btn btn-sm btn-light", tipo: "button", atributo: ["style", "position: absolute; right: 0px;"]}, contenedor);

      DOM.insertar({tag: "i", clase: "fa fa-refresh", valor:"modificar", name:"opcion"}, button);
      button.onclick = () => {
        solicitud("sincronizarHoras");
      }; 
    }

    //Divs
    let divSeguimiento = DOM.insertar({tag: "div", clase: "row tabDiv", atributo: ["id", "divSeguimiento"]}, contenedor);
    let divPlaneamiento = DOM.insertar({tag: "div", clase: "row d-none tabDiv", atributo: ["id", "divPlaneamiento"]}, contenedor);
    let divGrafico = DOM.insertar({tag: "div", clase: "row d-none tabDiv", atributo: ["id", "divGrafico"]}, contenedor);
    divGrafico.setAttribute("style", "background: white;overflow-x: auto !important;");
    let divGantt = DOM.insertar({tag: "div", clase: "row", atributo: ["id", "divGantt"]}, divGrafico);


    let idSeguimiento = row.firstChild.innerText;
    solicitud("planeamientoBuscar", idSeguimiento); //Llenar el tab de planeamiento. 
    
    DOM.insertar({tag: "input", clase: "d-none", valor:"modificar", name:"opcion"}, contenedor);
    modalModificacionDatos(row, divSeguimiento);
    


    document.querySelector("[name='ID Seguimiento']").parentNode.className = "d-none";
    
    $('.selectpicker').selectpicker('refresh'); 
  }

  function modalModificacionDatos(row, contenedor) {
    const excludedLabels = ["Acciones", "Alerta", "Observ", ""];
    if(permisos.includes("verHorasSeguimiento") == false){
      excludedLabels.push("Horas Desa");
      excludedLabels.push("Horas QA");
      excludedLabels.push("Horas Total");
    }
    const childs = tablaDatos.settings().init().columns;
    const inputOpcion = DOM.insertar({ tag: "input", clase: "d-none", tipo: "text", nombre: "opcion", valor: "modificar" }, contenedor);
  
    childs.forEach((element, index) => {
      const texto = element.input;
  
      if (!excludedLabels.includes(texto)) {
        let tag = 'input';
        let clase = "form-control control";
        let tipo = "";
        let arreglo = texto.split(" ");
        let valor = row.querySelector(`:nth-child(${index + 1})`).innerText;
  
        switch (arreglo[0]) {
          case "Fecha":
            tipo = "date";
            break;
          case "Observaciones":
            tag = "textarea";
            break;
          case "Estado":
          case "Analista":
            tag = "select";
            break;
        }
        if(arreglo[0] == "Horas"){
          valor = valor.split("/");
        }
        const col = document.createElement("div");
        col.className = getColClassName(arreglo[0]);
        DOM.insertar({ tag: "label", texto: texto }, col);
        let inputElement;
        if(arreglo[0]=="Horas"){
          let divHoras = DOM.insertar({ tag: "div", clase: "d-flex" }, col);
          inputElement = DOM.insertar({ tag: tag, clase: clase, tipo: tipo, nombre: texto+" Estimadas", valor: valor[0], atributo:["title", "Estimadas"] }, divHoras);
          inputElement = DOM.insertar({ tag: tag, clase: clase, tipo: tipo, nombre: texto+" Reales", valor: valor[1], atributo:["title", "Reales"] }, divHoras);
        }else{
          inputElement = DOM.insertar({ tag: tag, clase: clase, tipo: tipo, nombre: texto, valor: valor }, col);
        }
  
        if (texto === "Estado") {
          addOptionsToSelect(inputElement, valor);
        }
  
        if (["Analista QG", "Analista"].includes(texto)) {
          inputElement = selectorJerarquia(inputElement, valor);
        }

  
        if (index < 3 || ["Sistema"].includes(texto)) {
          inputElement.setAttribute('readonly', '');
        }
        contenedor.appendChild(col);
      }
    });
  }

  function getColClassName(text) {
    switch (text) {
      case "Horas":
        return "col-2 mb-3";
      case "Fecha":
        return "col-3 mb-3";
      default:
        return "col-4 mb-3";
    }
  }
  
  function addOptionsToSelect(selectElement, selectedValue) {
    estados.forEach(element => {
      const option = DOM.insertar({ tag: "option", clase: selectElement.className, texto: element.nombre, valor: element.id }, selectElement);
      if (element.nombre === selectedValue) {
        option.setAttribute('selected', '');
      }
    });
  }

  function modalComentarios(row) {
    document.querySelector('[role="document"]').className = "modal-dialog";
    let ID_Seguimiento = row.id;
    let numeroAtencion = row.firstChild.nextSibling.innerText;
    document.querySelector(".modal-title").innerText += `: ${numeroAtencion}`;
    solicitud("buscarComentarios", ID_Seguimiento)
      .then(() =>{
        DOM.insertar({tag: "input", atributo:["name", "ID Seguimiento"], valor: ID_Seguimiento, clase: "d-none"}, document.querySelector(".modal-body"));
        $('.selectpicker').selectpicker('refresh'); 
      });
  }


  function selectorJerarquia(select, seleccionado){
    select.className = "selectpicker";
    select.setAttribute("data-live-search", "true");
  
    let numGrupo = 1; 
    let optgroup = [];

    jerarquias.forEach(element => {
      if (optgroup[element.idGrupo] == undefined) {
        optgroup[element.idGrupo] = DOM.insertar({tag: "optgroup", atributo:["label", `Grupo #${numGrupo++}`]}, select);
      }
      const nivel = obtenerNivelJerarquia(element.NivelJerarquia); 
      let atributo = (element.idJerarquia == seleccionado) ?  ["selected", "selected"] : ["normal", "true"];
      DOM.insertar({tag: "option", valor: element.idJerarquia, texto: `${element.first} - ${nivel}`, atributo: atributo}, optgroup[element.idGrupo]);
    });
  }


  function obtenerNivelJerarquia(NivelJerarquia){
    const nivelOptions = [
      "",
      "Lider",
      "Encargado",
      "Trabajador",
      "Trabajador 2",
      "Trabajador 3",
      "Trabajador 4",
      "Trabajador 5"
    ];
    return nivelOptions[NivelJerarquia];
  }

  function vistaComentarios(data){
    let contenedor = document.querySelector(".modal-body");
    DOM.vaciar(contenedor);
    DOM.insertar({tag: "input", tipo:"text", nombre: "opcion", valor: "comentarioInsertar", clase: "d-none"}, contenedor);

    vistaComentariosListado(data, contenedor);

    if(permisos.includes("insertarComentarios")){
      vistaComentariosInsercion(contenedor);
    }
  }

  function vistaComentariosListado(data, contenedor){
    data.forEach(element => {
      let container = DOM.insertar({tag: "div", clase: "container mb-2"}, contenedor);
      let containerDiv = DOM.insertar({tag: "div", clase: "row"}, container);
      let containerDivDiv1 = DOM.insertar({tag: "div", clase: "col-6", texto: element.fechaCreacion}, containerDiv);
      let containerDivDiv2 = DOM.insertar({tag: "div", clase: "col-md-6 text-right"}, containerDiv);

      if(permisos.includes("eliminarComentarios")){
        let containerDivDiv2I = DOM.insertar({tag: "i", atributo: ["id", element.idComentario], clase: "fa fa-trash"}, containerDivDiv2);
      }

      let containerDiv2 = DOM.insertar({tag: "div", clase: "row"}, container);
      let containerDiv2Div1 = DOM.insertar({tag: "div", clase: "col-1"}, containerDiv2);
      let containerDiv2Div1IMG = DOM.insertar({tag: "img", clase: "comentarios_foto", atributo: ["src", "../../../"+element.foto]}, containerDiv2Div1);
      let containerDiv2Div1Div = DOM.insertar({tag: "div", clase: "col-md-11",texto: element.creador +": "+element.texto }, containerDiv2);
      DOM.insertar({tag: "hr"}, contenedor);
    });
  }

  function vistaComentariosInsercion(contenedor){
      let container2 = DOM.insertar({tag: "div", clase: "row mt-3"}, contenedor);
      let container2Div1 = DOM.insertar({tag: "div", clase: "col-12"}, container2);
      let container2DivLabel = DOM.insertar({tag: "label", texto: "Ingrese nuevo comentario"}, container2Div1);
      let container2DivSelect = DOM.insertar({tag: "select", nombre:"destino", texto: "Ingrese nuevo comentario", clase: "form-control selectpicker", atributo:["data-live-search", "true"]}, container2Div1);
      let container2DivSelectOption1 = DOM.insertar({tag: "option", valor:"0", texto: "Selecciona quien puede leer el comentario"}, container2DivSelect);
      let container2DivSelectOption2 = DOM.insertar({tag: "option", valor:"0", texto: "TODOS"}, container2DivSelect);
      let container2Div2 = DOM.insertar({tag: "div", clase: "col-12"}, container2);
      let container2Div2TextArea = DOM.insertar({tag: "textarea", clase: "form-control", nombre:"texto", atributo: ["placeholder", "Ingrese nuevo comentario"]}, container2Div2);
      jerarquias.forEach(element => {
        DOM.insertar({tag: "option", valor:element.idUsuario, texto: element.first + " " + element.last}, container2DivSelect);
      });   
  }


  function modalObservaciones(idSeguimiento) {
    const modalDialog = document.querySelector('[role="document"]');
    modalDialog.className = "modal-dialog";
  
    let row = event.target.closest("tr");
    const observaciones = tablaDatos.row(row).data().observaciones;
    const modalBody = document.querySelector(".modal-body");
    DOM.vaciar(modalBody);
    DOM.insertar({tag: "input", nombre: "ID_Seguimiento", clase: "d-none", valor: idSeguimiento}, modalBody);
    DOM.insertar({tag: "input", nombre: "opcion", clase: "d-none", valor: "modificar"}, modalBody);
    DOM.insertar({tag: "textarea", nombre: "Observaciones", clase: "form-control", valor: observaciones}, modalBody);
  }


  function eliminar(target) {
    Swal.fire({
      title: 'Desear dejar de seguir esta atencion?',
      showDenyButton: true,
      confirmButtonText: 'Si.',
      confirmButtonColor: '#c82333',
      denyButtonText: `No.`,
      denyButtonColor: '#0069d9',
    }).then((result) => {
      if (result.isConfirmed) {
        let id = target.closest('tr').firstChild.innerText;
        solicitud("eliminar", id);
      }
    })
  }

  function permisosValidar(data){
    permisos = data;

    if (jerarquias.length==0) Logger.swal('USUARIO NO REGISTRADO EN GRUPOS DE ANALISTAS!', 'error', 'parent');
    if (!permisos.includes("ver")) Logger.swal('NO TIENES PERMISOS PARA VER ESTE MODULO', 'error', 'parent');
    if (!permisos.includes("insertar")) document.querySelector(".btn.btn-primary").remove();
    definirDatatable();
    solicitud("buscar");
  }


  solicitud("buscarJerarquia");
});
