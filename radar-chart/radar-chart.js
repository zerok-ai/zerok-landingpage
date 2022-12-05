var RadarChart = {
  draw: function(id, d, options){
    var cfg = {
      radius: 6,
      w: 600,
      h: 600,
      factor: 1,
      factorLegend: .85,
      levels: 4,
      maxValue: 100,
      radians: 2 * Math.PI,
      opacityArea: 0.5,
      color: d3.rgb("#659CEF")
    };
    if('undefined' !== typeof options){
      for(var i in options){
        if('undefined' !== typeof options[i]){
          cfg[i] = options[i];
        }
      }
    }

    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d.map(function(o){return o.value}))); 
    var allAxis = (d.map(function(i, j){return i.axis}));
    var total = allAxis.length;    
    var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);

    d3.select(id).select("svg").remove();
    var g = d3.select(id).append("svg").attr("width", cfg.w).attr("height", cfg.h).append("g");

    var tooltip;

    drawFrame();
    var maxAxisValues = []; 
    drawAxis();
    var dataValues = [];
    reCalculatePoints();
    
    var areagg = initPolygon();
    drawPoly();

    drawnode();

    function drawFrame(){
      for(var j=0; j<cfg.levels; j++){
        var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
        g.selectAll(".levels").data(allAxis).enter().append("svg:line")
         .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
         .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
         .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
         .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
         .attr("class", "line").style("stroke", "grey").style("stroke-width", "0.5px").attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");;
      }
    }
    
    function drawAxis(){
      var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");

      axis.append("line")
          .attr("x1", cfg.w/2)
          .attr("y1", cfg.h/2)
          .attr("x2", function(j, i){
            maxAxisValues[i] = {x:cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total)), y:0};
            return maxAxisValues[i].x;
          })
          .attr("y2", function(j, i){
            maxAxisValues[i].y = cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));
            return maxAxisValues[i].y;
          })
          .attr("class", "line").style("stroke", "grey").style("stroke-width", "1px");

      axis.append("text").attr("class", "legend")
          .text(function(d){return d}).style("fill", "white").style("font-family", "sans-serif").style("font-size", "10px").attr("transform", function(d, i){return "translate(0, -10)";})
          .attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-20*Math.sin(i*cfg.radians/total);})
          .attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))+20*Math.cos(i*cfg.radians/total);});
    }

    function reCalculatePoints(){
      g.selectAll(".nodes")
        .data(d, function(j, i){
          dataValues[i] =
          [
            cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)),
            cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total)),
          ];
        });
      dataValues[d[0].length] = dataValues[0];
    }

    function initPolygon(){
      return g.selectAll("area").data([dataValues])
                .enter()
                .append("polygon")
                .attr("class", "radar-chart-serie0")
                .style("stroke-width", "2px")
                .style("stroke", cfg.color)
                .on('mouseover', function (d){
                  z = "polygon."+d3.select(this).attr("class");
                  g.selectAll("polygon").transition(200).style("fill-opacity", 0.1); 
                  g.selectAll(z).transition(200).style("fill-opacity", 0.7);
                })
                .on('mouseout', function(){
                  g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
                })
                .style("fill", function(j, i){return cfg.color;})
                .style("fill-opacity", cfg.opacityArea);
    }

    function drawPoly(){
      areagg.attr("points",function(de) {
          var str="";
          for(var pti=0;pti<de.length;pti++){
            str=str+de[pti][0]+","+de[pti][1]+" ";
          }            
          return str;
        });
    }
    
    function drawnode(){    
      g.selectAll(".radar-chart-serie0").attr("class", "radar-chart-serie0 delete").attr('r', 0);
      g.selectAll(".nodes")
        .data(d).enter()
        .append("svg:circle").attr("class", "radar-chart-serie0")
        .attr('r', cfg.radius)
        .attr("alt", function(j){return Math.max(j.value, 0);})
        .attr("cx", function(j, i){
          return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
        })
        .attr("cy", function(j, i){
          return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
        })
        .attr("data-id", function(j){return j.axis;})
        .style("fill", cfg.color).style("fill-opacity", 0.9)
        .on('mouseover', function (d){
                    newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                    newY =  parseFloat(d3.select(this).attr('cy')) - 5;
                    tooltip.attr('x', newX).attr('y', newY).text(parseFloat(d.value).toFixed(2)).transition(200).style('opacity', 1);
                    z = "polygon."+d3.select(this).attr("class");
                    g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
                    g.selectAll(z).transition(200).style("fill-opacity", 0.7);
                  })
        .on('mouseout', function(){
                    tooltip.transition(200).style('opacity', 0);
                    g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
                  })
        .call(d3.behavior.drag().on("drag", move))      // for drag & drop
        .append("svg:title")
        .text(function(j){return parseFloat(Math.max(j.value, 0)).toFixed(2)});
      // g.selectAll(".radar-chart-serie0.delete").remove();
    }

    //Tooltip
    tooltip = g.append('text').style('opacity', 0).style('fill', 'white').style('font-family', 'sans-serif').style('font-size', 13);


    function move(dobj, i){
      this.parentNode.appendChild(this);
      var dragTarget = d3.select(this);

      var oldData = dragTarget.data()[0];
      var oldX = parseFloat(dragTarget.attr("cx")) - 300;
      var oldY = 300 - parseFloat(dragTarget.attr("cy"));
      var newY = 0, newX = 0, newValue = 0;
      var maxX = maxAxisValues[i].x - 300;
      var maxY = 300 - maxAxisValues[i].y;

      if(oldX == 0) {
        newY = oldY - d3.event.dy;
        if(Math.abs(newY) > Math.abs(maxY)) {
          newY = maxY;
        }
        newValue = (newY/oldY) * oldData.value;
      }
      else
      {
        var slope = oldY / oldX;
        newX = d3.event.dx + parseFloat(dragTarget.attr("cx")) - 300;
        if(Math.abs(newX) > Math.abs(maxX)) {
          newX = maxX;
        }
        newY = newX * slope;

        var ratio = newX / oldX; 
        newValue = ratio * oldData.value;
      }
      // newValue = Math.round(newValue)
      dragTarget
          .attr("cx", function(){return newX + 300 ;})
          .attr("cy", function(){return 300 - newY;});
      let change = oldData.value - newValue;
      console.log(d, oldData, newValue)
      d[oldData.order].value=newValue;
      recalculateValues(d, oldData, change)
      reCalculatePoints();
      drawPoly();
      // $('.radar-chart-serie0').remove();
      drawnode();
    }

    function recalculateValues(d, dataset, change) {
      switch(dataset.order) {
        case 0: 
          //Latency
          d[1].value -= change 
          d[2].value += change*0.5
          break;
        case 1: 
          //Throughput
          d[0].value -= change 
          d[2].value -= change*1.5
          break;
        case 2:
          //Cost
          d[0].value += change*1.2
          d[1].value += change*1.5
          break;
      }
    }
  }
};
var d = [
         {value: 15, order:0}, 
         {value: 25, order:1}, 
         {value: 55, order:2},  
        ];
RadarChart.draw("#chart", d);
