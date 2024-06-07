import * as Comlink from '../support/comlink.mjs';
import { default as Gameflow } from '../entry.js';

console.warn(Gameflow.path());

const PIXELS_PER_METER = 100;

let canvas, ctx, width, height, canvascolor;
let pause, step, control, frame = 20, __frame = 20;
let debug;
const pixelsPerMeter = 100;
const cameraOffsetMetres = { x: 0, y: 0 };
let DrawOffset = { x:0, y:0 };

const api = new Worker(Gameflow.path() + './gameflow-dev-lib/physical/api.js', { type:'module' });
const worker = Comlink.wrap(api);



let _1 = { };


const checkWorkerInterface = async function () {
  await worker.printInterface();
}
Object.defineProperties(_1, {
  i: {
    get: checkWorkerInterface
  }
})
export { worker, _1 };

const resetTestbed = (_control = true, w = window.innerWidth, h = window.innerHeight, fill = 0) => {
  debug = document.createElement('p');
  debug.style.cssText = 'background:greenyellow;right: 50%; top: 0px; color:black;position:absolute;';
  let div = document.createElement('div');
  div.style.cssText = `opacity:0.6;left: 0px; top: 0px;z-index:999; position:absolute;`;
  // div.style.width = window.innerWidth + 'px';
  // div.style.height = window.innerHeight + 'px';
  canvas = document.getElementById("demo-canvas");
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.style.cssText = "left: 0px; top: 0px;opacity:0.6;";
  }
  ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e3edcd';

  // ctx.scale(pixelsPerMeter, pixelsPerMeter);
  // canvas.style.transform = 'scale(5,5)';
  ctx.save();
  const { x, y } = cameraOffsetMetres;
  ctx.translate(x, y);
  // ctx.lineWidth /= pixelsPerMeter;
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  control = _control;
  div.appendChild(canvas);
  resize(w, h, div);
  div.appendChild(debug);
  if (control) setcontrol();
  document.body.appendChild(div);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

const setFrame = (f) => {
  __frame = f;
}

const setcontrol = (w, h) => {
  const div = document.createElement('div');
  div.style.cssText = 'opacity:1; font-size:16px; width:100%;position:absolute;top:0px;';
  const step = document.createElement('button');
  step.innerText = 'S';
  const play = document.createElement('button');
  play.innerText = 'P';
  div.appendChild(step);
  div.appendChild(play);
  step.addEventListener('click', controlStep);
  play.addEventListener('click', controlPlay);
  let parent = debug.parentElement;
  div.appendChild(debug);
  parent.appendChild(div);
}

const controlStep = () => {
  api.postMessage({
    type: 'control',
    data: { step: 1 }
  })
}

const controlPlay = () => {
  pause = !pause;
  api.postMessage({
    type: 'control',
    data: { pause }
  })
}

const resize = (w, h, parentElement = canvas.parentElement) => {
  canvas.width = w;
  canvas.height = h;
  parentElement.style.width = canvas.style.width = width = w + 'px';
  parentElement.style.height = canvas.style.height = height = h + 'px';
}

const setCtxColor = (rgbStr) => {
  ctx.fillStyle = `rgba(${rgbStr},0.5)`;
  ctx.strokeStyle = `rgb(${rgbStr})`;
}


const drawPolygon = (vertices, fill) => {
  ctx.fillStyle = '#e30000';
  ctx.strokeStyle = '#e30000';
  ctx.beginPath();
  let first = true;
  for (const vertex of vertices) {
    if (first) {
      ctx.moveTo((vertex.x + DrawOffset.x) * PIXELS_PER_METER, (vertex.y + DrawOffset.y) * PIXELS_PER_METER);
      first = false;
    } else {
      ctx.lineTo((vertex.x + DrawOffset.x) * PIXELS_PER_METER, (vertex.y + DrawOffset.y) * PIXELS_PER_METER);
    }
  }
  ctx.closePath();
  // if (fill) {
  //   ctx.fill();
  // }
  ctx.stroke();
};

const drawCircle = (center, radius, axis, fill) => {
  ctx.beginPath();
  ctx.arc(center.x * PIXELS_PER_METER + DrawOffset.x, center.y * PIXELS_PER_METER + DrawOffset.y, radius * PIXELS_PER_METER, 0, 2 * Math.PI, false);
  if (fill) {
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  ctx.stroke();

  // if (fill) {
  //   //render axis marker
  //   const vertex = copyVec2(center);
  //   const scale = scaledVec2(axis, radius);
  //   vertex.op_add(scale);
  //   ctx.beginPath();
  //   ctx.moveTo(center.get_x(), center.get_y());
  //   ctx.lineTo(vertex.get_x(), vertex.get_y());
  //   ctx.stroke();
  //   destroy(vertex);
  //   destroy(scale);
  // }
};

const drawSegment = (vert1, vert2) => {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(vert1.x, vert1.y);
  ctx.lineTo(vert2.x, vert2.y);
  ctx.stroke();
};

const drawPoint = (vertex, sizeMetres) => {
  const sizePixels = sizeMetres / pixelsPerMeter;
  ctx.fillRect(
    vertex.get_x() - sizePixels / 2,
    vertex.get_y() - sizePixels / 2,
    sizePixels,
    sizePixels
  );
};

const drawTransform = (transform) => {
  const pos = transform.get_p();
  const rot = transform.get_q();

  ctx.save();
  ctx.translate(pos.get_x(), pos.get_y());
  ctx.scale(0.5, 0.5);
  ctx.rotate(rot.GetAngle());
  ctx.lineWidth *= 2;
  ctx.restore();
}

let now0 = performance.now();
const showPerformance = () => {
  let now = performance.now();
  debug.innerText = `${performance.memory.usedJSHeapSize / 1024 / 1024}M \n ${now - now0}ms`;
  now0 = now;
}


const _render = () => {
  showPerformance();
  requestAnimationFrame(_render);
  api.postMessage({ update: true });
  // if(--frame) return;
  // frame = __frame;
  main();
}

const main = () => {
  if (!stack.length) return;
  ctx.fillStyle = '#e3edcd';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  stack.forEach((d) => {
    if (d.shape == 'circle') {
      drawCircle(d.center, d.radius, undefined, true);
    }
    else if (d.shape == 'seg') {
      drawSegment(d.vert1, d.vert2);
    }
    else if (d.shape == 'poly') {
      drawPolygon(d.verts, true);
    }
  })

}
let stack = [];
let allBodies = { };
let contact = { };
onmessage = (msg) => {
  if (msg.data.shape) {
    stack = msg.data.shape;
  }
  allBodies =  msg.data.allBodies || allBodies;
  contact = msg.data.contact  || contact;
}

const render = function () {
  resetTestbed(...arguments);
  api.addEventListener('message', onmessage);
  requestAnimationFrame(_render);
}





async function terrain(s = 0.4) {
  let promiseb = await Gameflow.require('support/promiseb');
  let img = await promiseb.loadImage(path + './gameflow-dev-lib/temp/t1.png');

  console.log(img);

  let drawWidth = img.width * s;
  let drawHeight = img.height * s;

  let safe = 20;
  let safePadding = Math.floor(safe / 5);

  resize(drawWidth + safe, drawHeight + safe);
  ctx.drawImage(img, 0, 0, img.width, img.height, safePadding, safePadding, drawWidth, drawHeight);

  let marchingSquares = await Gameflow.require('support/marchingSquares');
  let trans = await Gameflow.require('support/translation', marchingSquares, '?');
  let squares = trans.getMarchingSquares(ctx, canvas.width, canvas.height);
  let simplify = await Gameflow.require('support/simplify');

  let ccc = [];
  console.log(squares);
  squares.forEach((v) => {
    let nv = v.contours[0].map((_) => {
      return { x: _[0], y: _[1] }
    })
    // ccc.push(nv);
    ccc.push(simplify(nv, 2, true))
  })

  // ctx.fillStyle = 'green';
  // ctx.lineWidth = 8;

  console.log(ccc);
  // console.log(contours);
  contours = ccc[0];
  console.log(contours);
  contoursCopy = Array.from(contours);

  requestAnimationFrame(terrainhandle);
}

let contours = [];
let contoursCopy = [];
let speed = 5;
let terrainhandle = function () {
  if (!contours.length && contoursCopy.length) {
    console.log(contoursCopy);
    worker.context._createPolyBody(contoursCopy);
    contoursCopy = [];
    requestAnimationFrame(terrainhandle);
    return;
  }
  if (!contours.length) return requestAnimationFrame(terrainhandle);
  const a = contours.splice(0, speed);
  a.forEach((p) => {
    const { x, y } = p;
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  })
  requestAnimationFrame(terrainhandle);
}

setFrame(1);

export { render, resize, setFrame, terrain, allBodies, contact, DrawOffset };
