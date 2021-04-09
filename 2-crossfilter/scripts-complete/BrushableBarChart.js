function BrushableBarChart() {

    const margin = {t: 50, r:50, b: 50, l: 50};
    const size = {w: 1000, h: 300};
    this._x = d => d[0];
    this._y = d => d[1].length;
    this._axisXTickValues = d => true;
    this._axisXTickFormat = d => d;
    this._dispatchType = '';

    this.selection = function () {
        if (arguments.length > 0) {
            this._sel = arguments[0];
            this._sel = this._sel
                .attr('width', size.w)
                .attr('height', size.h)
                .append('g')
                .classed('container', true)
                .attr('transform', `translate(${margin.l}, ${margin.t})`);
            
            size.w = size.w - margin.l - margin.r;
            size.h = size.h - margin.t - margin.b;
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

    this.dispatch = function () {
        if (arguments.length > 0) {
            this._dispatch = arguments[0];
            if (arguments[1]) {
                this._dispatchType = arguments[1];
            }
            return this;
        }
        return this._dispatch;
    }

    this.axisXTickValues = function () {
        if (arguments.length > 0) {
            this._axisXTickValues = arguments[0];
            return this;
        }
        return this._axisXTickValues;
    }

    this.axisXTickFormat = function () {
        if (arguments.length > 0) {
            this._axisXTickFormat = arguments[0];
            return this;
        }
        return this._axisXTickFormat;
    }

    this.x = function() {
        if (arguments.length > 0) {
            this._x = arguments[0];
            return this;
        }
        return this._x;
    }

    this.y = function() {
        if (arguments.length > 0) {
            this._y = arguments[0];
            return this;
        }
        return this._y;
    }
    
    this.draw = function () {
        this._scaleX = d3.scaleBand()
            .domain(this._data.map(this._x))
            .range([0, size.w])
            .padding(0.1);

        this._scaleY = d3.scaleLinear()
            .domain([0, d3.max(this._data, this._y)])
            .range([size.h, 0]);


        this._sel
            .append('g')
            .classed('bar-chart', true);

        this._sel
            .selectAll('rect')
            .data(this._data)
            .join('rect')
            .classed('bar', true)
            .attr('x', d => this._scaleX(this._x(d)))
            .attr('y', d => this._scaleY(this._y(d)))
            .attr('width', this._scaleX.bandwidth())
            .attr('fill', 'steelblue')
            .attr('height', d => size.h - this._scaleY(this._y(d)));

        let brush = d3.brushX()
            .extent([ [0,0], [size.w, size.h] ])
            .on('end', this._brushed);
        
        this._sel.call(brush);

        let axisX = d3.axisBottom(this._scaleX)
            .tickValues(
                this._scaleX.domain().filter(this._axisXTickValues)
            )
            .tickFormat(this._axisXTickFormat);

        this._sel
            .append('g')
            .classed('axis-x', true)
            .attr('transform', `translate(0, ${size.h})`)
            .call(axisX);

        let axisY = d3.axisLeft(this._scaleY);

        this._sel
            .append('g')
            .classed('axis-y', true)
            .attr('transform', `translate()`)
            .call(axisY);
    }

    this._brushed = (event) => {
        if (!event.selection) return;

        let step = this._scaleX.step();
        let lowerIndex = Math.floor(event.selection[0]/step);
        let lowerVal = this._scaleX.domain()[lowerIndex];
    
        let upperIndex = Math.floor(event.selection[1]/step);
        let upperVal;
        if (upperIndex > this._scaleX.domain().length-1) {
            upperVal = this._scaleX.domain()[this._scaleX.domain().length-1];
        } else {
            upperVal = this._scaleX.domain()[upperIndex];
        }
    this._sel
        .selectAll('rect.bar')
        .attr('fill', d => {
            let x = this._x(d);
            if (x >= lowerVal && x <= upperVal) {
                return 'steelblue';
            }
            return 'grey';
        });

        this._dispatch.call('brushed', this, this._dispatchType, [lowerVal, upperVal]);
    }    

    return this;
}