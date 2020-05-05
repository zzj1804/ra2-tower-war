let isSpinning2 = true;
const red = '#FF0000';
const green = '#00FF00';
const black = '#000000';
const silver = '#DFDFDF';
// colors
const midnight = '#313';
const eggplant = '#525';
const magenta = '#936';
const amber = '#D65';
const gold = '#FA6';
const white = '#FFF';

const TAU = Zdog.TAU;
const TAU4 = TAU / 4;
const TAU8 = TAU / 8;

let illo2 = new Zdog.Illustration({
  element: '#battlefield2',
  dragRotate: true,
  // stop spinning when drag starts
  onDragStart: function () {
    isSpinning2 = false;
  },
  onDragEnd: function () {
    isSpinning2 = true;
  },
});

let teslaCoil = new Zdog.Shape({
  addTo: illo2,
  translate: { y: 320 },
  // rotate: { x: TAU / 60 },
})

let base = new Zdog.Shape({
  addTo: teslaCoil,
})

new Zdog.Cylinder({
  addTo: base,
  diameter: 150,
  translate: { y: -55 },
  rotate: { x: TAU4 },
  length: 100,
  color: '#ADADAF',
  fill: true,
  stroke: 20,
});

// fans
let fanNum = 4;
let fanRadius = 80;
for (let i = 0; i < fanNum; i++) {
  let anchor = new Zdog.Anchor({
    addTo: base,
    rotate: { y: TAU * i / fanNum },
  });
  let fan = new Zdog.Shape({
    addTo: anchor,
  });

  let fan1 = new Zdog.Shape({
    addTo: anchor,
    path: [
      { x: fanRadius + 0, y: 0, z: 30 },
      { x: fanRadius + 86, y: 0, z: 30 },
      { x: fanRadius + 20, y: -100, z: 30 },
      { x: fanRadius + 0, y: -100, z: 30 },
    ],
    color: red,
    stroke: 10,
    fill: true,
  });

  let fan2 = new Zdog.Shape({
    addTo: anchor,
    path: [
      { x: fanRadius + 0, y: 0, z: -30 },
      { x: fanRadius + 86, y: 0, z: -30 },
      { x: fanRadius + 20, y: -100, z: -30 },
      { x: fanRadius + 0, y: -100, z: -30 },
    ],
    color: red,
    stroke: 10,
    fill: true,
  });

  let fan3 = new Zdog.Shape({
    addTo: anchor,
    path: [
      { x: fanRadius + 0, y: -5, z: -15 },
      { x: fanRadius + 76, y: -5, z: -15 },
      { x: fanRadius + 15, y: -90, z: -15 },
      { x: fanRadius + 0, y: -90, z: -15 },
    ],
    color: gold,
    stroke: 20,
    fill: true,
  });

  let fan4 = new Zdog.Shape({
    addTo: anchor,
    path: [
      { x: fanRadius + 0, y: -5, z: 15 },
      { x: fanRadius + 76, y: -5, z: 15 },
      { x: fanRadius + 15, y: -90, z: 15 },
      { x: fanRadius + 0, y: -90, z: 15 },
    ],
    color: gold,
    stroke: 20,
    fill: true,
  });

  let fan5 = new Zdog.Shape({
    addTo: anchor,
    path: [
      { x: fanRadius + 0, y: -5, z: 0 },
      { x: fanRadius + 76, y: -5, z: 0 },
      { x: fanRadius + 15, y: -90, z: 0 },
      { x: fanRadius + 0, y: -90, z: 0 },
    ],
    color: gold,
    stroke: 20,
    fill: true,
  });

  let anchor2 = new Zdog.Anchor({
    addTo: base,
    rotate: { y: TAU * i / fanNum + TAU8 },
  });

  let pipe1 = new Zdog.Shape({
    addTo: anchor2,
    path: [
      { x: fanRadius + 50, y: -40 },
      {
        arc: [
          { x: fanRadius + 45, y: -75 },
          { x: fanRadius, y: -90 },
        ]
      },
    ],
    color: '#BBBBBB',
    stroke: 35,
    closed: false,
  });

  let pipe2 = new Zdog.Cylinder({
    addTo: anchor2,
    diameter: 50,
    translate: { x: fanRadius + 50, y: -15 },
    rotate: { x: TAU4 },
    length: 30,
    color: '#AAAAAA',
    fill: true,
    stroke: 10,
  });

  let pipe3 = new Zdog.Shape({
    addTo: anchor,
    path: [
      { x: fanRadius + 10, y: -110 },
      { x: fanRadius + 10, y: -160 },
      {
        arc: [
          { x: fanRadius + 5, y: -205 },
          { x: fanRadius - 20, y: -210 },
        ]
      },
    ],
    color: '#CCCCCC',
    stroke: 35,
    closed: false,
  });
}


new Zdog.Ellipse({
  addTo: base,
  diameter: 80,
  translate: { y: -210 },
  rotate: { x: TAU4 },
  stroke: 35,
  color: '#CCCCCC',
  fill: true,
});

new Zdog.Shape({
  addTo: base,
  translate: { y: -150 },
  stroke: 100,
  color: silver,
});

let coil = new Zdog.Anchor({
  addTo: teslaCoil,
  // rotate: { x: TAU4 / 16 },
  translate: { y: -200 },
});

new Zdog.Shape({
  addTo: coil,
  translate: { y: 0 },
  path: [
    { y: -40 },
    { y: -400 },
  ],
  stroke: 35,
  color: silver,
});

new Zdog.Shape({
  addTo: coil,
  translate: { y: -475 },
  stroke: 140,
  color: '#EEE',
});

new Zdog.Ellipse({
  addTo: coil,
  diameter: 50,
  translate: { y: -70 },
  rotate: { x: TAU4 },
  stroke: 20,
  color: '#EEE',
  fill: false,
});

new Zdog.Ellipse({
  addTo: coil,
  diameter: 200,
  translate: { y: -150 },
  rotate: { x: TAU4 },
  stroke: 20,
  color: '#EEF',
  fill: false,
});

new Zdog.Ellipse({
  addTo: coil,
  diameter: 150,
  translate: { y: -250 },
  rotate: { x: TAU4 },
  stroke: 20,
  color: '#EFE',
  fill: false,
});

new Zdog.Ellipse({
  addTo: coil,
  diameter: 100,
  translate: { y: -350 },
  rotate: { x: TAU4 },
  stroke: 20,
  color: '#FEE',
  fill: false,
});

function animate() {
  illo2.rotate.y += isSpinning2 ? 0.03 : 0;
  illo2.updateRenderGraph();
  requestAnimationFrame(animate);
}
animate();