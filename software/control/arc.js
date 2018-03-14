const trim = (precision) => {
  return (val) => {
    return Number.parseFloat(val).toFixed(precision);
  }
}

const arc = {
  toGcode: function() {
    return gcodeArc(this, trim(5));
  }
}

const magnitude = (p1, p2) => {
  const x = p2.x - p1.x;
  const y = p2.y - p1.y;
  return Math.sqrt(x * x + y * y);
}

const extend = (point1, point2, distance) => {
  const xDist = point2.x - point1.x;
  const yDist = point2.y - point1.y;
  const mag = magnitude(point1, point2);
  const unit = {x: xDist / mag, y: yDist / mag};

  const newVec = {
    p1: point1,
    p2: {
      x: unit.x * (distance + mag) + point1.x,
      y: unit.y * (distance + mag) + point1.y
    }
  }
  return newVec;
}

const scale = (point1, point2, scale) => {
  const xMag = point2.x - point1.x;
  const yMag = point2.y - point1.y;
  
  const newVec = {
    p1: point1,
    p2: {
      x: point1.x + xMag * scale,
      y: point1.y + yMag * scale
    }
  }
  return newVec;
}

const randomVary = (val, amt, dist) => {
  if (typeof dist === 'function') {
    //do a function
  } else {
    return val + Math.random() * amt - amt / 2;
  }
}

const randomAngle = () => {
  return Math.random() * Math.PI * 1.5 + Math.PI / 4;
}

const tangentAngle = (center, radius, destination) => {
  const angle1 = Math.atan((destination.y - center.y) / 
                           (destination.x - center.x));
  const angle2 = Math.acos(radius / magnitude(center, destination));
  return angle1 + angle2;
}

const pointOnCircle = (center, radius, angle) => {
  const px = center.x + radius * Math.cos(angle);
  const py = center.y + radius * Math.sin(angle);
  return {x: px, y: py};
}

const determineDirection = (arc, radius) => {
  return radius < 0 ? arc.dir : arc.dir * -1;
}

const gcodeArc = (arc, trim) => {
  let gArc = '';
  if (arc.dir === 1) gArc += 'G2';
  if (arc.dir === -1) gArc += 'G3';

  if (typeof trim === 'function') {
    gArc += 'X' + trim(arc.end.x);
    gArc += 'Y' + trim(arc.end.y);
    gArc += 'I' + trim(arc.center.x - arc.start.x);
    gArc += 'J' + trim(arc.center.y - arc.start.y);    
  } else {
    gArc += 'X' + arc.end.x;
    gArc += 'Y' + arc.end.y;
    gArc += 'I' + (arc.center.x - arc.start.x);
    gArc += 'J' + (arc.center.y - arc.start.y);
  } 
  return gArc;
}

const tangentArc = (arc, radius, angleCalc) => {
  const tArc = Object.create(arc);
  tArc.start = arc.end;
  tArc.center = extend(arc.center, arc.end, radius).p2;
  tArc.end = pointOnCircle(tArc.center, radius, angleCalc());
  tArc.dir = determineDirection(arc, radius);
  return tArc;  
}

exports.tangentArcRand = (arc, radius) => {
  return tangentArc(arc, radius, randomAngle);
}

exports.tangentArcTowards = (arc, radius) => {
  return tangentArc(arc, radius, tangentAngle);
}

exports.firstArc = () => {
  const fArc = Object.create(arc);
  fArc.start = {x: 0, y: 0};
  fArc.end = {x: 2, y: 0};
  fArc.center = {x: 1, y: 0};
  fArc.dir = 1;
  return fArc;
}

exports.arcHeader = () => {
  return 'G17\nG20\n';
}

// let arc1 = arc;
// let arc2;
//  console.log('F700\nG17\nG20');
//  console.log(gcodeArc(arc1));
// //console.log(arc1);
// for (let i = 0; i < 38; i++) {
//   arc2 = tangentArc(arc1, Math.random() * 5 - 2);
//   //console.log(arc2);
//    console.log(gcodeArc(arc2, trim5));
//   arc1 = arc2;
// }
