var margin = {top: 10, right: 10, bottom: 10, left: 10};
var height = window.innerHeight - margin.top - margin.bottom;

function fillSpaces(d, track) {
  var words;
  if (track) {
    words = d.data.artist.name.split(' ');
  } else {
    words = d.data.name.split(' ');
  }
  var withSpaces = "";
  if (words.length > 1) {
    for (w = 0; w < words.length - 1; w++) {
      withSpaces += words[w];
      withSpaces += "%20";
    }
  }
  withSpaces += words[words.length - 1];
  return withSpaces;
}

function removeSpaces(name) {
  var words = name.split('%20');
  var withoutSpaces = "";
  if (words.length > 1) {
    for (w = 0; w < words.length - 1; w++) {
      withoutSpaces += words[w];
      withoutSpaces += " ";
    }
  }
  withoutSpaces += words[words.length - 1];
  return withoutSpaces;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function makeArtistsPie(data) {
  //Width and height
  var artistsDiv = document.getElementById("topArtists");
  
  var width = artistsDiv.offsetWidth - margin.left - margin.right;
  var radius = Math.min(width, height) / 2;
  
  var color = d3.scale.category20b();
  
  var pie = d3.layout.pie()
              .value(function (d) { return d.listeners; } );
  
  var outerRadius = width / 2;
  var arc = d3.svg.arc()
              .innerRadius((2/3)*radius)
              .outerRadius(radius);
  
  var svg = d3.select("#topArtists")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);
  
  var arcs = svg.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("a")
      .attr("xlink:href", function (d) { return "#/artist/" + fillSpaces(d, false); } );

  arcs.append("path")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + margin.top) + ")")
    .attr("fill", function(d, i) {
        return color(i);
    })
    .attr("d", arc)
    .on("mouseenter", function(d, i) {
          svg.append("text")
          .attr("id", "tooltip")
          .attr("x", 0)
          .attr("y", 0)
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", "18px")
          .attr("font-weight", "bold")
          .attr("fill", "black")
          .attr("transform", "translate(" + width / 2 + "," + (height / 2 + margin.top) + ")")
          .text((i + 1) + ". " + d.data.name)
          })
    .on("mouseleave", function(d) {
        d3.select("#tooltip").remove();
    });
  
  svg.append("text")
          .attr("id", "label")
          .attr("x", 0)
          .attr("y", 0)
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", "18px")
          .attr("font-weight", "bold")
          .attr("fill", "black")
          .attr("transform", "translate(" + width / 2 + "," + (height / 2 - 5*margin.top) + ")")
          .text("Top Artists");
}


function mapEvents(data) {
  if (!data) {
    alert("This artist has no upcoming events to map.");
    return;
  }

  var mapCanvas = document.getElementById("map-canvas");

  // create center
  var myLatlng = new google.maps.LatLng(41.850033,-95.6500523);
  
  var mapOptions = {
  zoom: 4,
  center: myLatlng
  }
  
  var map = new google.maps.Map(mapCanvas, mapOptions);
  
  // plot events
  for (e = 0; e < data.length; e++) {
    var latLng = new google.maps.LatLng(data[e].venue.location["geo:point"]["geo:lat"], data[e].venue.location["geo:point"]["geo:long"]);
    new google.maps.Marker({
                                        position: latLng,
                                        map: map,
                                        title: data[e].title + " (" + data[e].startDate + ")"
                                        });
  }
}

function stackTracks(data) {
  var tracksDiv = document.getElementById("tracks");
  var stackHeight = 30;
  var textOffset = 20;
  var scalingFactor = 2500;

  dataset = [];
  listeners = [];
  playcount = [];
  
  for (d = 0; d < data.length; d++) {
    bar = {};
    bar.x = d;
    bar.y = data[d].listeners;
    
    listeners.push(bar);
    
    bar = {};
    bar.x = d;
    bar.y = data[d].playcount;
    
    playcount.push(bar);
  }
  
  dataset.push(listeners);
  dataset.push(playcount);
  
  var width = tracksDiv.offsetWidth - margin.left - margin.right;
  
  var stack = d3.layout.stack();
  stack(dataset);
  
  var colors = d3.scale.category10();
  
  var svg = d3.select("#tracks")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
  
  var groups = svg.selectAll("g")
  .data(dataset)
  .enter()
  .append("g")
  .style("fill", function(d, i) {
         return colors(i);
         });
  
  var rects = groups.selectAll("rect")
  .data(function(d) { return d; })
  .enter()
  .append("rect")
  .attr("y", function (d) { return d.x*stackHeight; })
  .attr("x", function(d) {
        return d.y0/scalingFactor;
        })
  .attr("width", function(d) {
        return d.y/scalingFactor - d.y0/scalingFactor;
        })
  .attr("height", stackHeight)
  .on("mouseenter", function(d, i) {
      svg.append("text")
      .attr("id", "tooltip")
      .attr("x", margin.left)
      .attr("y", i*stackHeight+textOffset)
      .attr("text-anchor", "left")
      .attr("font-family", "sans-serif")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "black")
      .text((i + 1) + ". " + data[i].name + " - " + numberWithCommas(data[i].listeners) + " listeners, " + numberWithCommas(data[i].playcount) + " plays")
      })
  .on("mouseleave", function(d) {
      d3.select("#tooltip").remove();
      });
  
  for (d = 0; d < data.length; d++) {
    svg.append("text")
    .attr("x", margin.left)
    .attr("y", d*stackHeight+textOffset)
    .attr("text-anchor", "left")
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("fill", "black")
    .text(data[d]["@attr"]["rank"] + ". " + data[d].name);
  }
}