
var vals = [];
var img;

var bestScore = 1000000000;
var bestPath = [];
var s = '_START\n';

var count = 0;
var maxCount = 0;

var bip = new Audio('src/sounds/bip.wav');
var done = new Audio('src/sounds/done.wav');

var isDone = false;

function setup() {
  var c = createCanvas(window.innerWidth,window.innerHeight);

  cursor(CROSS);

  img = loadImage("./src/img/world.png");

  // for ( var i = 0; i < 3; i++ ) {
  //   vals.push( new dot(random(50, width-50), random(50, height-50) ) );
  // }

  reset();
}

function draw() {
  background(25, 25, 30);

  // DRAW MAP
  var w = width * .9;
  var h = w * 7 / 11;
  var x = width / 2 - w / 2;
  var y = height / 2 - h / 2;
  image(img, x, y, w, h);

  // DRAW GRID
  //drawGrid();

  // DRAW CURRENT LOOKING PATH
  drawPath(vals, false);

  // DRAW BEST PATH
  drawPath(bestPath, true);

  // DRAW DOTS
  drawDots(vals);

  // CURSOR SELECT
  selectCursor(vals);

  if (!isDone && vals.length > 1) {
    // STEP 1
    var largestI = -1;
    for ( var i = 0; i < vals.length - 1; i++ ) {
      if ( vals[i].order < vals[i+1].order ) {
        largestI = i;
      }
    }

    if ( largestI == -1 ) {
      //console.log("finished");
    } else {

      // STEP 2
      var largestJ = -1;
      for ( var j = 0; j < vals.length; j++ ) {
        if ( vals[largestI].order < vals[j].order ) {
          largestJ = j;
        }
      }

      // STEP 3
      var t = vals[largestI];
      vals[largestI] = vals[largestJ];
      vals[largestJ] = t;

      // STEP 4
      var endArray = vals.splice(largestI+1);
      endArray.reverse();
      vals = vals.concat( endArray );

      //SCORE
      var score = calcDist(vals);
      if (score < bestScore ) {
        bestPath = vals.slice();
        bestScore = score;
        bip.play();
      }

      if ( Math.floor( s.length / ( vals.length * 2 - 1 ) ) > 60 ) {
          s = '';
      }

      for ( var i = 0; i < vals.length; i++ ) {
        s += vals[i].order;
        s += ' '
      }

      s += '\n';

      count++;

      if ( Math.floor( count * 100 / maxCount ) == 100 ) {
        done.play();
        isDone = true;
      }
    }
  }

  fill(255, 255, 255, 90);
  noStroke();
  textAlign(LEFT);
  textSize(11);
  text(s, 10, 10, 300, height - 10);

  var percent = Math.floor( count * 100 / maxCount );

  fill(255, 255, 255);
  noStroke();
  textAlign(CENTER);
  textSize(14);
  text("[  " + percent + " %  ]", width/2, height - 60);

  fill(240, 20, 70);
  textSize(12);
  var result = '';
  for ( var i = 0; i < bestPath.length; i++ ) {
    result += bestPath[i].order;
    if ( i != bestPath.length - 1 ) {
      result += ' - ';
    }
  }
  text(result, width/2, height - 30);

}

function selectCursor(array) {
  var isPointer = false;

  for ( var i = 0; i < array.length; i++ ) {
    if ( array[i].hover || array[i].moving ) {
      isPointer = true;
    }
  }

  if ( isPointer ) cursor(HAND)
  else cursor(CROSS)
}

function drawGrid() {
  fill(255,255,255,20);
  noStroke();
  for ( var x = 0; x < width; x+= 20 ) {
    for ( var y = 0; y < height; y+= 20 ) {
      ellipse(x, y, 2, 2);
    }
  }
}

function drawPath(array, current) {
  noFill();
  stroke(255, 255, 255, 70);
  strokeWeight(1);

  if ( current ) {
    stroke(240, 20, 70);
    strokeWeight(2);
  }

  beginShape();
  for ( var i = 0; i < array.length; i++ ) {
    vertex(array[i].x, array[i].y);
  }
  endShape();
}

function drawDots(array) {
  for ( var j = 0; j < array.length; j++ ) {
    array[j].update();
    array[j].draw();
  }
}

function reset() {
  count = 1;
  maxCount = factorial(vals.length);
  bestScore = calcDist(vals);
  bestPath = vals.slice();
  isDone = false;

  vals.sort(compare);

  s = '';
}

var f = [];
function factorial (n) {
  if (n == 0 || n == 1)
    return 1;
  if (f[n] > 0)
    return f[n];
  return f[n] = factorial(n-1) * n;
}

function calcDist(array) {
  var d = 0;
  for ( var i = 0; i < array.length - 1; i++ ) {
    d += dist( array[i].x, array[i].y, array[i + 1].x, array[i+1].y );
  }
  return d;
}

function compare(a,b) {
  if ( a.order < b.order )
    return -1
  if ( a.order > b.order )
    return 1
  return 0
}

function mousePressed() {

  var startDragging = false;

  for ( var i = vals.length - 1; i > 0; i-- ) {
    if ( vals[i].hover ) {
      vals[i].moving = true;
      startDragging = true;
    } else {
      vals[i].moving = false;
    }
  }

  if ( !startDragging ) {
    vals.push( new dot(mouseX, mouseY) );
  }

}

function mouseReleased() {
  for ( var i = 0; i < vals.length; i++ ) {
    if ( vals[i].moving = true ) {
      reset();
      vals[i].moving = false;
    }
  }
}

var dot = function(_x, _y) {
  this.x = _x;
  this.y = _y;
  this.size = 12;
  this.order = vals.length;
  this.hover = false;
  this.moving = false;

  reset();

  this.update = function() {

    if ( dist(mouseX, mouseY, this.x, this.y ) < this.size + 3 ) {
      this.hover = true;
    } else {
      this.hover = false;
    }

    if ( this.moving ) {
      this.x = mouseX;
      this.y = mouseY;
    }

  }

  this.draw = function() {

    fill(25, 25, 30);
    strokeWeight(1);
    stroke(255);

    if ( this.hover || this.moving ) {
      fill(255, 255, 255);
      strokeWeight(1);

      if ( this.moving ) {
        strokeWeight(6);
      }
    }

    ellipse(this.x, this.y, this.size, this.size );

    noStroke();
    fill(255, 255, 255, 100);
    textSize(10);
    text(this.order, this.x + 17, this.y + 17)

  }
}
