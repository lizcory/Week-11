
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
