/**
 * Created by nmondon on 20/01/14.
 */


(function () {

    var width = 1100
        , height = 1100;

    var svg = d3.select('.container').append('svg')
            .attr('class', 'd3-svg')
            .attr('width', width)
            .attr('height', height)
        , gAxis = svg.append('svg:g')
        , gCurve = svg.append('svg:g')
        , gLabel = svg.append('svg:g');

    var setup = function setup(data) {
        data.forEach(function (el) {
            var dateDiegese = new Date(el.life)
                , formatFilm = d3.time.format('%X')
                , dateFilm = formatFilm.parse(el.movie);
            el.dateDiegese = dateDiegese.getTime();
            el.dateFilm = dateFilm.getTime();
        });
        draw(data);
    };

    var draw = function draw(data) {

        var margeX = 200
            , margeYTop = 200
            , margeYBottom = 200;

        // scales functions
        var diegeseScale = d3.scale.linear()
                .domain(d3.extent(data, function (d) {
                    return d.dateDiegese;
                }))
                .rangeRound([height - margeYBottom, margeYTop])
            , filmScale = d3.scale.linear()
                .domain(d3.extent(data, function (d) {
                    return d.dateFilm;
                }))
                .rangeRound([margeX, width - margeX]);

        // data set for regression curve
        var tabRegression = data.map(function (d) {
            return [filmScale(d.dateFilm), diegeseScale(d.dateDiegese)];
        });

        // we want a 3-polynomial regression
        var myRegression = regression('polynomial', tabRegression, 3);

        // axis
        var axisDiegese = gAxis.selectAll('.axisDiegese').data([1]);
        axisDiegese.enter().append('svg:line')
            .attr('class', 'axis axisDiegese')
            .attr('x1', margeX)
            .attr('x2', margeX)
            .attr('y1', height - margeYBottom)
            .attr('y2', margeYTop);

        var axisMovie = gAxis.selectAll('.axisMovie').data([1]);
        axisMovie.enter().append('svg:line')
            .attr('class', 'axis axisMovie')
            .attr('x1', margeX)
            .attr('x2', width - margeX)
            .attr('y1', height - margeYBottom)
            .attr('y2', height - margeYBottom);

        // regression curve calc
        var curveRegPath = d3.svg.line()
            .y(function (d) {
                return d[1];
            })
            .x(function (d) {
                return d[0];
            })
            .interpolate("basis");

        // regression curve draw
        var curveReg = gCurve.selectAll('.curveReg').data([myRegression.points]);
        curveReg.enter().append('svg:path')
            .attr('class', 'curveReg')
            .attr('d', curveRegPath)
            .attr('stroke-dasharray', '5,5');

        // curve calc
        var curvePath = d3.svg.line()
            .y(function (d) {
                return diegeseScale(d.dateDiegese);
            })
            .x(function (d) {
                return filmScale(d.dateFilm);
            })
            .interpolate("cardinal");

        // curve draw
        var curve = gCurve.selectAll('.curve').data([data]);
        curve.enter().append('svg:path')
            .attr('class', 'curve')
            .attr('d', curvePath);

        var dots = gCurve.selectAll('.dots').data(data);
        dots.enter().append('svg:circle')
            .attr('class', 'dots')
            .attr('cx', function (d) {
                return filmScale(d.dateFilm);
            })
            .attr('cy', function (d) {
                return diegeseScale(d.dateDiegese);
            })
            .attr('r', 4);

        var labelsFilm = gLabel.selectAll('.labelsMovie').data(data);
        labelsFilm.enter().append('svg:text')
            .attr('class', 'labelsMovie label')
            .attr('x', function (d) {
                return filmScale(d.dateFilm);
            })
            .attr('y', height - margeYBottom + 20)
            .text(function (d) {
                return d.label + ' - ' + d.movie;
            })
            .attr('transform', function (d) {
                return "rotate(-45," + [filmScale(d.dateFilm), height - margeYBottom + 20] + ")"
            })
            .style('opacity', function (d, i) {
                var x = filmScale(d.dateFilm);
                if (i > 0 && Math.abs(filmScale(data[i - 1].dateFilm) - x) < 10) {
                    return 0;
                }
                return 1;
            });

        var labelsDiegese = gLabel.selectAll('.labelsDiegese').data(data)
            , dateFormat = d3.time.format('%Y');
        labelsDiegese.enter().append('svg:text')
            .attr('class', 'labelsDiegese label')
            .attr('x', margeX - 20)
            .attr('y', function (d) {
                return diegeseScale(d.dateDiegese);
            })
            .style('opacity', function (d, i) {
                var y = diegeseScale(d.dateDiegese);
                if (i > 0 && Math.abs(diegeseScale(data[i - 1].dateDiegese) - y) < 10) {
                    return 0;
                }
                return 1;
            })
            .text(function (d) {
                return (d.approx ? '~' : '') + dateFormat(new Date(d.life))
            });

    };

    // get datas
    d3.json('timelapse.json', setup);

})();