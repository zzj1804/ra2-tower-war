//const silver = '#C0C0C0';
let isSpinning = true;
let illo = new Zdog.Illustration({
  element: '#battlefield',
  dragRotate: true,
  // stop spinning when drag starts
  onDragStart: function() {
    isSpinning = false;
  },
  onDragEnd: function() {
    isSpinning = true;
  },
  rotate: { x: -Zdog.TAU / 12}
});
class PrismTower {
  constructor(){
    const silver = '#DFDFDF';
    const blue = '#0000FF';
    const black = '#000000';
    const TAU = Zdog.TAU;
    const TAU4 = TAU / 4;
  
    let prismTower = new Zdog.Shape({
        addTo: illo,
        translate: {y: 220}
    })
    
    let base = new Zdog.Shape({
      addTo: prismTower,
    });
    
    // half-pace circle1
    new Zdog.Ellipse({
      addTo: base,
      diameter: 200,
      rotate: { x: TAU4 },
      translate: { y: 5 },
      stroke: 10,
      color: '#AEAEAE',
      fill: true,
    });
    // half-pace circle2
    new Zdog.Ellipse({
      addTo: base,
      diameter: 160,
      translate: { y: -9, z: 0 },
      rotate: { x: TAU4 },
      stroke: 20,
      color: silver,
      fill: true,
    });
    // half-pace circle3
    new Zdog.Ellipse({
      addTo: base,
      diameter: 153,
      translate: { y: -22 },
      rotate: { x: TAU4 },
      stroke: 20,
      color: silver,
      fill: true,
    });
    // half-pace circle4
    new Zdog.Ellipse({
      addTo: base,
      diameter: 146,
      translate: { y: -35 },
      rotate: { x: TAU4 },
      stroke: 20,
      color: silver,
      fill: true,
    });
    // half-pace circle5
    new Zdog.Ellipse({
      addTo: base,
      diameter: 140,
      translate: { y: -47 },
      rotate: { x: TAU4 },
      stroke: 20,
      color: silver,
      fill: true,
    });
    
    // fans
    let fanNum = 4;
    let fanRadius = 85;
    for ( let i=0; i < fanNum; i++ ) {
      let anchor = new Zdog.Anchor({
        addTo: base,
        rotate: { y: TAU * i / fanNum },
        translate: { y: -30 },
      });
      let fan = new Zdog.Shape({
        addTo: anchor,
      });
      
      new Zdog.Rect({
        addTo: fan,
        width: 40,
        height: 50,
        stroke: 20,
        rotate: { x: TAU/20 },
        translate: { z: fanRadius },
        color: blue,
        fill: true,
      });
      
      new Zdog.Rect({
        addTo: fan,
        width: 40,
        height: 10,
        stroke: 20,
        translate: { y:-27, z: -15 + fanRadius },
        rotate: { x: TAU4 },
        color: blue,
        fill: true,
      });
      
      new Zdog.Rect({
        addTo: fan,
        width: 25,
        height: 30,
        stroke: 5,
        translate: { z: 10 + fanRadius },
        rotate: { x: TAU/20 },
        color: black,
        fill: true,
      });
    }
    // center pillar
    let pillarLength = 200;
    let bottomHeight = 57;
    new Zdog.Cylinder({
      addTo: base,
      diameter: 30,
      length: pillarLength,
      stroke: false,
      translate: { y: -pillarLength / 2 - bottomHeight },
      rotate: { x: TAU4 },
      color: black,
    });
    // side pillars
    let sidePillarNum = 6;
    let sidePillarRadius = 40;
    let sidePillarBaseHeight = 10;
    for ( let i=0; i < sidePillarNum; i++ ) {
      let anchor = new Zdog.Anchor({
        addTo: base,
        rotate: { y: TAU * i / sidePillarNum },
        translate: { y: -bottomHeight },
      });
      let sidePillarBase = new Zdog.Cylinder({
        addTo: anchor,
        diameter: 30,
        length: sidePillarBaseHeight,
        stroke: 3,
        translate: { y: -sidePillarBaseHeight / 2, z:sidePillarRadius },
        rotate: { x: TAU4 },
        color: black,
      });
    
      let color;
      if (0 === i % 2) {
        color = '#FF00FF';
      } else {
        color = '#8A2BE2';
      }
      let sidePillar = new Zdog.Cylinder({
        addTo: anchor,
        diameter: 15,
        length: pillarLength - sidePillarBaseHeight,
        stroke: false,
        translate: { y: -(pillarLength - sidePillarBaseHeight) / 2 - sidePillarBaseHeight, z:sidePillarRadius },
        rotate: { x: TAU4 },
        color: color,
      });
    }
    // base-top
    new Zdog.Ellipse({
      addTo: base,
      diameter: 110,
      translate: { y: -267 },
      rotate: { x: TAU4 },
      stroke: 20,
      color: silver,
      fill: true,
    });
    new Zdog.Ellipse({
      addTo: base,
      diameter: 100,
      translate: { y: -282 },
      rotate: { x: TAU4 },
      stroke: 10,
      color: blue,
      fill: true,
    });
    new Zdog.Cylinder({
      addTo: base,
      diameter: 90,
      translate: { y: -302 },
      rotate: { x: TAU4 },
      length: 30,
      color: black,
      fill: true,
      stroke: 3,
    });
    // bulbs
    let bulbNum = 6;
    let bulbRadius = 65;
    for ( let i=0; i < bulbNum; i++ ) {
      let anchor = new Zdog.Anchor({
        addTo: base,
        rotate: { y: TAU * i / bulbNum },
        translate: { y: -267 },
      });
      let sidePillarBase = new Zdog.Shape({
        addTo: anchor,
        stroke: 15,
        translate: { z:bulbRadius },
        color: '#FFD700',
      });
    }
    
    // top
    let topAnchor = new Zdog.Anchor({
      addTo: prismTower,
      // rotate: { z: TAU / 30 },
      translate: { y: -300 },
    });
    let towerTop = new Zdog.Shape({
      addTo: topAnchor,
    });
    // half-pace circle1
    new Zdog.Ellipse({
      addTo: towerTop,
      diameter: 110,
      translate: { y: -26 },
      rotate: { x: TAU4 },
      stroke: 20,
      color: silver,
      fill: true,
    });
    // half-pace circle2
    new Zdog.Ellipse({
      addTo: towerTop,
      diameter: 110,
      translate: { y: -38 },
      rotate: { x: TAU4 },
      stroke: 20,
      color: silver,
      fill: true,
    });
    // half-pace circle3
    new Zdog.Ellipse({
      addTo: towerTop,
      diameter: 100,
      translate: { y: -48 },
      rotate: { x: TAU4 },
      stroke: 20,
      color: silver,
      fill: true,
    });
    // half-pace circle4
    new Zdog.Ellipse({
      addTo: towerTop,
      diameter: 95,
      translate: { y: -58 },
      rotate: { x: TAU4 },
      stroke: 10,
      color: blue,
      fill: true,
    });
    
    new Zdog.Cylinder({
      addTo: towerTop,
      diameter: 70,
      stroke: 10,
      translate: { y: -125 },
      rotate: { x: TAU4 },
      length: 120,
      color: black,
      fill: true,
    });
    // prism
    let prismNum = 6;
    let prismRadius = 42;
    for ( let i=0; i < prismNum; i++ ) {
      let anchor = new Zdog.Anchor({
        addTo: towerTop,
        rotate: { y: TAU * i / prismNum },
        translate: { y: -100 },
      });

      let prismBack = new Zdog.Shape({
        addTo: anchor,
        stroke: 10,
        translate: { z:prismRadius },
        color: '#AAAAAA',
        fill: true,
        path: [
          { x: -20 }, 
          { x:  20 }, 
          { x:  20, y: -90 },
          { x: -20, y: -90 },
        ],
      });

      let prismBottom = new Zdog.Shape({
        addTo: anchor,
        stroke: 10,
        translate: { z:prismRadius },
        color: '#AAAAAA',
        fill: true,
        path: [
          { x: 20 }, 
          { x: -20 },
          { x: -20, z: 15 }, 
          { x:  20, z: 15 }, 
        ],
      });

      let prismLeft = new Zdog.Shape({
        addTo: anchor,
        stroke: 10,
        translate: { z:prismRadius },
        color: '#AAAAAA',
        fill: true,
        path: [
          { x: -20, z: 15 },
          { x: -20, z: 0 }, 
          { bezier: [
            { x:  -20, y: -100, z: 0 }, 
            { x:  -20, y: -110, z: 5 }, 
            { x:  -20, y: -120, z: 45 }, 
          ]},
        ],
      });

      let prismRight = prismLeft.copy({
        addTo: anchor,
        color: "#BBCCCC",
        translate: { x: 40, z:prismRadius },
      });

      let prismFront = new Zdog.Shape({
        addTo: anchor,
        stroke: 10,
        translate: { z:prismRadius },
        color: silver,
        fill: true,
        path: [
          { x: -20, z: 20 }, 
          { x:  20, z: 20 }, 
          { x:  20, y: -120, z: 45 }, 
          { x:  -20, y: -120, z: 45 }, 
        ],
      });

      let prismTop = new Zdog.Shape({
        addTo: anchor,
        stroke: 5,
        translate: { z:prismRadius },
        color: '#AAAACC',
        fill: true,
        path: [
          { x:  14, y: -88, z:5 }, 
          { x:  -14, y: -88, z:5 }, 
          { x:  -14, y: -94, z:43 }, 
          { x:  14, y: -94, z:43 }, 
        ],
      });

      let mirror = new Zdog.Rect({
        addTo: anchor,
        width: 28,
        height: 100,
        stroke: 15,
        color: '#FFF',
        rotate: { x: -TAU / 30 },
        translate: { y: -60, z: prismRadius + 43 },
        fill: true,
      });

      let pipe = new Zdog.Rect({
        addTo: anchor,
        width: 8,
        height: 30,
        stroke: 5,
        color: '#4F0000',
        // rotate: { x: -TAU / 30 },
        translate: { y: 20, z: prismRadius },
        fill: true,
      });
    
      // new Zdog.Box({
      //   addTo: anchor,
      //   width: 30,
      //   height: 90,
      //   depth: 30,
      //   stroke: 15,
      //   color: '#999999',
      //   leftFace: silver,
      //   rightFace: "#BBBBBB",
      //   topFace: '#AAAAAA',
      //   // bottomFace: '#636',
      //   rotate: { x: -TAU / 18 },
      //   translate: { y: -60, z: prismRadius + 10 },
      // });
    }
    // TODO 镜子角度调节得更平缓
    
    function animate() {
      illo.rotate.y += isSpinning ? 0.03 : 0;
      illo.updateRenderGraph();
      requestAnimationFrame( animate );
    }
    animate();
  }

  
}

let p = new PrismTower();