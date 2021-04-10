
let dispatch = d3.dispatch('brushed');
let filters = {dates: null, time: null};

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

    // For Date Chart
    // grouping all the flights by day in each year
    let groupedData = d3.group(data, d => dayOfYear(d.date));
    groupedData = Array.from(groupedData).sort((a,b) => a[0] - b[0]);
    console.log(groupedData);

    let dateChart = new BrushableBarChart();
    dateChart.selection(d3.select('svg#dates-overview'))
        .data(groupedData)
        .dispatch(dispatch, "dates")
        .axisXTickValues((d,i) => i%4 === 0)
        .axisXTickFormat(formatDateXTicks);
    dateChart.draw();

    // For Time Chart
    let timeGroupData = d3.group(data, d => d.date.getHours()); 
    timeGroupData = Array.from(timeGroupData).sort((a,b) => a[0] - b[0]); // convert to an array (since d3.group returns an array)

    let timeChart = new BrushableBarChart();
    timeChart.selection(d3.select('svg#time-overview'))
        .data(timeGroupData)
        // .axisXTickValues([...Array(24).keys()])
        .dispatch(dispatch, "time");
    timeChart.draw();

    populateTable(data);

    dispatch.on("brushed", function(type, limits) {
        // console.log(type, limits);
        switch(type) {
            case "dates":
                filters.date = limits;
                break;

            case "time":
                filters.time = limits;
                break;

        }

        let filteredData = data;
        if (filters.date) {

            let [lower, upper] = filters.date;

            filteredData = filteredData.filter(d => {
                let doy = dayOfYear(d.date);
                return lower <= doy && doy <= upper;
            })
        }


        if (filters.time) {

            let [lower, upper] = filters.time;

            filteredData = filteredData.filter(d => {
                let hour = d.date.getHours();
                return lower <= hour && hour <= upper;
            })
        }



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
