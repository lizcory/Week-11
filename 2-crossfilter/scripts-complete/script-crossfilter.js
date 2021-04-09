
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
    dateDimension = cf.dimension(d => dayOfYear(d.date));
    timeDimension = cf.dimension(d => d.date.getHours());

    let groupedData = dateDimension.group(d => d);

    let brushChart = new BrushableBarChart();
    brushChart.selection(d3.select('svg#dates-overview'))
        .data(groupedData)
        .axisXTickValues((d, i) => i%4==0)
        .axisXTickFormat(formatDateXTicks)
        .dispatch(dispatch, 'date');
    brushChart.draw();

    let timeGroups = timeGroups.group(d => d);

    let distanceBrushChart = new BrushableBarChart();
    distanceBrushChart.selection(d3.select('svg#time-overview'))
        .data(timeGroups)
        .dispatch(dispatch, 'time');
    distanceBrushChart.draw();

    populateTable(data);

    dispatch.on('brushed', function(type, limits) {
        switch (type) {
            case 'date':
                dateDimension.filterRange(limits);
                break;

            case 'time':
                timeDimension.filterRange(limits);
                break;

            default:
                break;
        }

        let filteredData = dateDimension.bottom(100);
        populateTable(filteredData);
    })

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