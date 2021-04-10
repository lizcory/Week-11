const APIKey = "U9BT4kOMXuyqljgt685e4-o7qYLLhq42v_yqHIkNIPI";
const Secret = "GOU3YSElysQIfaVknhGjHi67XIcPZV3x7LyNu6ac-Nw";

let currentPage = 1;
let search = 'Boston';
let url = `https://api.unsplash.com/search/photos?query=${search}&per_page=50&page=${currentPage}&client_id=${APIKey}`;

d3.json(url)
.then(function(response) {
    console.log(response.results);

    d3.select('div.images')
        .selectAll('img')
        .data(response.results)
        .join('img')
        .attr('src', d => d.links.download);
})