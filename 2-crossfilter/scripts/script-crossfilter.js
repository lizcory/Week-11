
let dispatch = d3.dispatch('brushed');
let cf, dateDimension, timeDimension;


d3.csv('data/flights-3m.csv', function(d) {
    function parseDate(d) {
        return new Date(2001,
            d.substring(0, 2) - 1,
            d.substring(2, 4),
            d.substring(4, 6),
            d.substring(6, 8));
    }
    d.date = parseDate(d.date);
    return d;
})
.then(function(data) {
    console.log(data.length, data[0]);

    cf = crossfilter(data);
    dateDimension = cf.dimension(d => +dayOfYear(d.date));
    timeDimension = cf.dimension(d => d.date.getHours());

    let dateGroupData = dateDimension.group(d => d)
        .reduceCount()  // count num rows for each date in the year
        .top(Infinity)
        .sort((a,b) => a.key - b.key);
    
    console.log(dateGroupData);

    let dateChart = new BrushableBarChart();
    dateChart.selection(d3.select("svg#dates-overview"))
        .data(dateGroupData)
        .x(d => d.key)
        .y(d => d.value)
        .axisXTickValues((d,i) => i%4 === 0)
        .axisXTickFormat(formatDateXTicks)
        .dispatch(dispatch, "date");

    dateChart.draw();

    let timeGroupData = timeDimension.group(d => d)
        .reduceCount()
        .top(Infinity)
        .sort((a, b) => a.key - b.key);
    
    let timeChart = new BrushableBarChart();
    timeChart.selection(d3.select("svg#time-overview"))
        .data(timeGroupData)
        .x(d => d.key)
        .y(d => d.value)
        .dispatch(dispatch, "time");
    timeChart.draw();

    populateTable(data);

    dispatch.on("brushed", function(type, limits) {
        switch(type) {
            case "date":
                dateDimension.filterRange(limits);
                break;

            case "time":
                timeDimension.filterRange(limits);
                break;
        }

        let filteredData = dateDimension.bottom(Infinity);
        populateTable(filteredData);
    });

});


function populateTable(data) {
    let flightsTable = new FlightsTable();
    flightsTable.selection(d3.select('div#flights-list'))
        .data(data.sort((a, b) => a.date > b.date).splice(0, 80))
        .populate();
}

let dayOfYear = function (date) {
    let start = new Date(2001, 0, 0);
    let diff = (date - start);
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);

    return day;
}

let formatDateXTicks = function(dayOfYear) {
    let date = new Date(2001, 0);
    date = new Date(date.setDate(dayOfYear));

    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months[date.getMonth()] + ' ' + date.getDate();
}