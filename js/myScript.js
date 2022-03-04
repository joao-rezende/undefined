var LineChart = function (options) {

  var data = options.data;
  var canvas = document.getElementById("fundo-grafico").appendChild(document.createElement('canvas'));
  var context = canvas.getContext('2d');

  var rendering = false,
    paddingX = 80,
    paddingY = 80,
    width = (options.width || window.innerWidth) * 2,
    height = (options.height || window.innerHeight) * 2,
    progress = 0;

  canvas.width = width;
  canvas.height = height;

  var maxValue,
    minValue;

  format();
  render();

  function format(force) {

    maxValue = 0;
    minValue = Number.MAX_VALUE;

    data.forEach(function (point, i) {
      maxValue = Math.max(maxValue, point.value);
      minValue = Math.min(minValue, point.value);
    });

    data.forEach(function (point, i) {
      point.targetX = paddingX + (i / (data.length - 1)) * (width - (paddingX * 2));
      point.targetY = paddingY + ((point.value - minValue) / (maxValue - minValue) * (height - (paddingY * 2)));
      point.targetY = height - point.targetY;

      if (force || (!point.x && !point.y)) {
        point.x = point.targetX + 30;
        point.y = point.targetY;
        point.speed = 0.04 + (1 - (i / data.length)) * 0.05;
      }
    });

  }

  function render() {
    if (!rendering) {
      requestAnimationFrame(render);
      return;
    }

    context.font = '22px sans-serif';
    context.clearRect(0, 0, width, height);

    if (options.yAxisLabel) {
      context.save();
      context.globalAlpha = progress;
      context.translate(paddingX - 15, height - paddingY - 10);
      context.rotate(-Math.PI / 2);
      context.fillStyle = '#fff';
      context.fillText(options.yAxisLabel, 0, 0);
      context.restore();
    }

    var progressDots = Math.floor(progress * data.length);
    var progressFragment = (progress * data.length) - Math.floor(progress * data.length);

    data.forEach(function (point, i) {
      if (i <= progressDots) {
        point.x += (point.targetX - point.x) * point.speed;
        point.y += (point.targetY - point.y) * point.speed;

        context.save();

        if (window.innerWidth > 767) {
          var wordWidth = context.measureText(point.label).width;
          context.globalAlpha = i === progressDots ? progressFragment : 1;
          context.fillStyle = point.future ? '#aaa' : '#fff';
          context.fillText(point.label, point.x - (wordWidth / 2), height - 20);
        }

        if (i < progressDots && !point.future) {
          context.beginPath();
          context.arc(point.x, point.y, 8, 0, Math.PI * 2);
          context.fillStyle = '#FED136';
          context.fill();
        }

        context.restore();
      }

    });

    context.save();
    context.beginPath();
    context.strokeStyle = '#FED136';
    context.lineWidth = 4;

    var futureStarted = false;

    data.forEach(function (point, i) {

      if (i <= progressDots) {

        var px = i === 0 ? data[0].x : data[i - 1].x,
          py = i === 0 ? data[0].y : data[i - 1].y;

        var x = point.x,
          y = point.y;

        if (i === progressDots) {
          x = px + ((x - px) * progressFragment);
          y = py + ((y - py) * progressFragment);
        }

        if (point.future && !futureStarted) {
          futureStarted = true;
          context.lineWidth = 4;

          context.stroke();
          context.beginPath();
          context.moveTo(px, py);
          context.strokeStyle = '#aaa';

          if (typeof context.setLineDash === 'function') {
            context.setLineDash([4, 8]);
          }
        }

        if (i === 0) {
          context.moveTo(x, y);
        }
        else {
          context.lineTo(x, y);
        }

      }

    });

    context.stroke();
    context.restore();

    progress += (1 - progress) * 0.02;

    requestAnimationFrame(render);

  }

  this.start = function () {
    rendering = true;
  }

  this.stop = function () {
    rendering = false;
    progress = 0;
    format(true);
  }

  this.restart = function () {
    this.stop();
    this.start();
  }

  this.append = function (points) {
    progress -= points.length / data.length;
    data = data.concat(points);

    format();
  }

  this.populate = function (points) {
    progress = 0;
    data = points;

    format();
  }

};

let chart = new LineChart({ data: [] });

chart.populate([
  { label: 'R$ 0,00', value: 0 },
  { label: 'R$ 10.000,00', value: 100 },
  { label: 'R$ 20.000,00', value: 200 },
  { label: 'R$ 84.000,00', value: 840 },
  { label: 'R$ 62.000,00', value: 620 },
  { label: 'R$ 50.000,00', value: 500 },
  { label: 'R$ 60.000,00', value: 600 },
  { label: 'R$ 110.000,00', value: 1100 },
  { label: 'R$ 80.000,00', value: 800 },
  { label: 'R$ 90.000,00', value: 900, future: true },
  { label: 'R$ 120.000,00', value: 1200, future: true },
  { label: 'INFINITO', value: 1400, future: true }
]);

chart.start();

$(".separator").addClass("complete");

$(".conteudo-inicial").addClass("complete");

$(".animate-in[data-duration]").each((index, el) => {
  $(el).css("transition-duration", $(el).data("duration"));
});

$(".animate-in[data-delay]").each((index, el) => {
  $(el).css("transition-delay", $(el).data("delay"));
});

$(document).ready(function () {
  verifFocusAnimate();
});

function verifFocusAnimate() {
  $(".animate-in").each((index, el) => {
    const objective = $(el).offset().top + ($(el)[0].offsetHeight / 3);
    const current = window.innerHeight + $(window).scrollTop();

    if (current >= objective) {
      $(el).addClass("complete");
      if ($(el).hasClass("timeline-image")) {
        const indexLi = $(el).parents("li").index();
        if (indexLi > 0) {
          $("ul.timeline li").eq(indexLi - 1).addClass("complete");
        }
      }
    }
  });
}

$(window).on("scroll", verifFocusAnimate);

$(window).on("resize", function () {
  $("#fundo-grafico canvas").remove();
  chart = new LineChart({ data: [] });

  chart.populate([
    { label: 'R$ 0,00', value: 0 },
    { label: 'R$ 10.000,00', value: 100 },
    { label: 'R$ 20.000,00', value: 200 },
    { label: 'R$ 84.000,00', value: 840 },
    { label: 'R$ 62.000,00', value: 620 },
    { label: 'R$ 50.000,00', value: 500 },
    { label: 'R$ 60.000,00', value: 600 },
    { label: 'R$ 110.000,00', value: 1100 },
    { label: 'R$ 80.000,00', value: 800 },
    { label: 'R$ 90.000,00', value: 900, future: true },
    { label: 'R$ 120.000,00', value: 1200, future: true },
    { label: 'INFINITO', value: 1400, future: true }
  ]);

  chart.start();
});

$("#alterar-visualizacao-fundo-video").on("click", function() {
  $("#frase-inicio").addClass("alterar");
  setTimeout(function() {
    $("#video-inicio").addClass("alterar");
  }, 800);
});