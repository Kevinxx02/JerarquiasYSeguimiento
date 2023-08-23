class Graficos{

    static async cargarMermaid() {
      try {
        if(!document.querySelector("[src='./../../../third_party/mermaidjs/main.js']")){
          const mermaidScript = document.createElement('script');
          mermaidScript.src = './../../../third_party/mermaidjs/main.js';
          document.head.appendChild(mermaidScript);
          
          const mermaidCSS = document.createElement('link');
          mermaidCSS.setAttribute("href","./../../../third_party/mermaidjs/main.css");
          mermaidCSS.setAttribute("rel","stylesheet");
          document.head.appendChild(mermaidCSS);
        }
      } catch (error) {
        alert('Error al cargar:', error);
      }
    }

    
    

    static async dibujarMermaid(element, mermaidData) {
      Graficos.cargarMermaid();
      let identificadorDeTemporizador = setTimeout(async () =>{
        if(mermaid){
          try {
            mermaid.initialize();
            const { svg } = await mermaid.render('xxx', mermaidData);
            element.innerHTML = svg;
          } catch (error) {
            alert(error);
            console.error('Error al renderizar el gráfico:', error);
          }
          clearTimeout(identificadorDeTemporizador);
        }
      }, 500);
    }






    static async cargarD3() {
      try {
        if(!document.querySelector("[src='./../../../third_party/d3js/main.js']")){
          const D3Script = document.createElement('script');
          D3Script.src = './../../../third_party/d3js/main.js';
          document.head.appendChild(D3Script);
        }
      } catch (error) {
        console.error('Error al cargar:', error);
      }
    }

    static async gantt(arrayObjetos){
        Graficos.cargarD3();
        let identificadorDeTemporizador = setTimeout(() =>{
          if(document.querySelector("[src='./../../../third_party/d3js/main.js']")){
            function conversionFecha(fecha){
              // Dividir la cadena en partes: año, mes y día
              const dateParts = fecha.split("-");
              const year = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Los meses se cuentan desde 0 (enero) hasta 11 (diciembre)
              const day = parseInt(dateParts[2]);
              
              
              // Crear un objeto de fecha sin conversión de zona horaria
              return new Date(year, month, day);
            }
            
            let arr = [];
            for (let index = 0; index < arrayObjetos.length; index++) {
              const element = arrayObjetos[index];
              arr.push({
                        titulo: element.titulo,
                        fechaInicio: conversionFecha(element.fechaInicio),
                        fechaFinal: conversionFecha(element.fechaFinal),
                        liberacionInicio: conversionFecha(element.liberacionInicio ?? "2023-01-01"),
                        liberacionFinal: conversionFecha(element.liberacionFinal ?? "2023-01-01"),
                        color: element.color,
              });
            }
            const dateRangeStart = d3.min(arr, d => d.fechaInicio);
            const dateRangeEnd = d3.max(arr, d => d.fechaFinal);
            const cantidadDias = (dateRangeEnd - dateRangeStart) / (1000 * 60 * 60 * 24);
            const width = cantidadDias*40;
            const height = arr.length*40;
            const margin = { top: 50, right: 30, bottom: 30, left: 140 };
    
            // Crear la escala de tiempo
            const xScale = d3.scaleTime()
                .domain([d3.min(arr, d => d.fechaInicio), d3.max(arr, d => d.fechaFinal)])
                .range([margin.left, width - margin.right]);
    
            // Crear la escala vertical para las tareas
            const yScale = d3.scaleBand()
                .domain(arr.map(d => d.titulo))
                .range([margin.top, height - margin.bottom])
                .padding(0.2);
    
            // Crear el elemento SVG
            let divGantt = document.querySelector("#divGantt");
            divGantt.setAttribute("style", "width: "+(width+50)+"px; background: white;");
            const svg = d3.select(divGantt).append("svg")
            .attr("width", width)
            .attr("height", height);
    
            
            // Agregar las barras de Gantt
            svg.selectAll("rect")
                .data(arr)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.fechaInicio))
                .attr("y", d => yScale(d.titulo))
                .attr("width", d => xScale(d.fechaFinal) - xScale(d.fechaInicio))
                .attr("height", yScale.bandwidth())
                .attr("fill", d => d.color);
    
            //Fechas en la parte superior. 
            const xAxisTop = d3.axisTop(xScale)
            .ticks(d3.timeDay.every(1))  // Mostrar todas las fechas
            .tickFormat(d3.timeFormat("%d/%m"));
    
            //Titulo con fechas en la parte inferior. 
            const xAxisBottom = d3.axisBottom(xScale)
            .ticks(d3.timeDay.every(1))
            .tickFormat(d3.timeFormat("%d/%m"));
    
            const yAxis = d3.axisLeft(yScale);
    
            svg.append("g")
                .attr("transform", `translate(0, ${margin.top})`)
                .call(xAxisTop);
    
            svg.append("g")
            .attr("transform", `translate(0, ${height-30})`)
            .call(xAxisBottom);
            
            svg.append("g")
                .attr("transform", `translate(${margin.left}, 0)`)
                .call(yAxis);
    
    
            let fechaLiberacion = document.querySelector("[name='Fecha Liberacion Estimada']").value;
            if (fechaLiberacion) {
              fechaLiberacion = new Date(fechaLiberacion);
              const xPosition = xScale(fechaLiberacion);
              svg.append("rect") 
                .attr("x", xPosition)
                .attr("y", margin.top) // Iniciar desde la parte superior
                .attr("width", d => xScale(arr[0].liberacionFinal) - xScale(arr[0].liberacionInicio))
                .attr("height", height - margin.top - margin.bottom) // Altura igual al alto del gráfico menos los márgenes
                .attr("fill", "#EFC50A6E"); // No se necesita borde para una recta
            }
    
    
            
    
    
            let fechaProduccion = document.querySelector("[name='Fecha Produccion Estimada']").value;
            if(fechaProduccion){
              fechaProduccion = new Date(fechaProduccion);
              const width = (xScale(dateRangeEnd) - xScale(dateRangeStart)) * (1 / cantidadDias);
              svg.append("rect")
                .attr("x", xScale(fechaProduccion))
                .attr("y", margin.top) // Iniciar desde la parte superior
                .attr("width", width)
                .attr("height", height - margin.top - margin.bottom) // Altura igual al alto del gráfico menos los márgenes
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 2); // No se necesita borde para una recta
            }
            clearTimeout(identificadorDeTemporizador);
          }
        }, 500);

         // Configuración del gráfico
        
    }
}
export default Graficos;
