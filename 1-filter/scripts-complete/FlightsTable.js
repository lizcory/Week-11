function FlightsTable () {

    this.selection = function () {
        if (arguments.length > 0) {
            this._sel = arguments[0];
            return this;
        }
        return this._sel;
    }

    this.data = function () {
        if (arguments.length > 0) {
            this._data = arguments[0];
            return this;
        }
        return this._data;
    }

    this.populate = function () {
        this._sel.selectAll('div.flight')
            .data(this._data)
            .join('div')
            .classed('flight', true)
            .html(d => {
                return `
                <div class="date">${this._formatDate(d.date)}</div>
                <div class="time">${d.date.getHours()}:${d.date.getMinutes() < 10 ? '0'+d.date.getMinutes() : d.date.getMinutes()}</div>
                <div class="origin">${d.origin}</div>
                <div class="destination">${d.destination}</div>
                <div class="distance right-align">${d.distance}</div>
                <div class="delay right-align">${d.delay}</div>
                `
            })

    }

    this._formatDate = function (dateObj) {
        let month = dateObj.getMonth();
        let date = dateObj.getDate();
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
        return months[+month] + ' ' + date;
    }

    return this;
}