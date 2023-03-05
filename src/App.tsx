import React, { useEffect, useRef } from "react";

function randomRange(a: number, b: number) {
  return a + Math.floor(Math.random() * (b - a));
}

const mass = 1;
const size = 8;
const minGap = 2;
const particleCount = 300;
const shadowQuality = 0;
const attractionCoefficient = 0.2;
const friction = 0.2;

const colors = [
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#5522ff",
  "#88d9ff",
  "#ffff00",
];

let attraction = [
  [0.6, -0.2, 0.1, -0.5, 0, -0.5],
  [-0.2, 1, -0.9, 0.2, 0.5, 0.6],
  [0.5, -0.85, -0.7, 0, -0.55,0.5],
  [-0.2,0.3,-0.17,0.86,-0.9,0],
  [0.2,0,-0.2,-0.9,0.9,-0.8],
  [-0.2,0.4,-0.1,-0.3,0.3,0.4]
];

function generateRandomAttractionMatrix() {
  let attraction: number[][] = [[], [], [], [], [], []];

  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < colors.length; j++) {
      attraction[i][j] =
        Math.random() * (Math.random() < 0.3 ? 1 : -1) * (1 / 10);
    }
  }
  return attraction;
}

attraction = generateRandomAttractionMatrix()

export default function App() {
  const canvas = useRef() as React.MutableRefObject<HTMLCanvasElement>;

  let particles: Particle[] = [];

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    mass: number;
    size: number;
    type: number;

    constructor(x: number, y: number, type: number) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.mass = mass;
      this.size = size - (Math.random() * size) / 10;
      this.type = type;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      // ctx.clip();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
      ctx.fillStyle = colors[this.type];
      ctx.fill();

      for (let i = 0; i < shadowQuality; i++) {
        ctx.lineWidth = this.size * 2 - this.size * 2 * (i / shadowQuality);
        ctx.strokeStyle = `#00000003`;
        ctx.stroke();
      }
      ctx.restore();
    }

    distanceTo(p: Particle) {
      return Math.sqrt(Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2));
    }

    update() {
      this.vx *= 1 - friction / 10;
      this.vy *= 1 - friction / 10;

      this.x += this.vx;
      this.y += this.vy;

      const warpGap = 10;
      if (this.x < 0) {
        this.x = canvas.current.width - warpGap;
      }
      if (this.x > canvas.current.width) {
        this.x = 0 + warpGap;
      }
      if (this.y < 0) {
        this.y = canvas.current.height - warpGap;
      }
      if (this.y > canvas.current.height) {
        this.y = 0 + warpGap;
      }

      let Fx = 0;
      let Fy = 0;

      for (let p of particles) {
        if (p != this) {
          const dist = this.distanceTo(p);
          if (dist > 1) {
            const magnitudeAttraction =
              (attractionCoefficient * attraction[this.type][p.type]) / dist;

            Fx += magnitudeAttraction * ((p.x - this.x) / dist);
            Fy += magnitudeAttraction * ((p.y - this.y) / dist);
          }
        }
      }

      this.vx += Fx / this.mass;
      this.vy += Fy / this.mass;
    }
  }

  function draw() {
    const ctx = canvas.current.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

    for (let p of particles) {
      p.update();
      p.draw(ctx);
    }

    window.requestAnimationFrame(draw);
  }

  useEffect(() => {
    canvas.current.width = canvas.current.offsetWidth;
    canvas.current.height = canvas.current.offsetHeight;

    for (let i = 0; i < particleCount; i++) {
      particles.push(
        new Particle(
          randomRange(0, window.innerWidth),
          randomRange(0, window.innerHeight),
          Math.floor(i % colors.length)
        )
      );
    }

    draw();
  }, []);

  return (
    <canvas
      className="webgl"
      ref={canvas}
      style={{ width: "100%", height: "99vh" }}
    />
  );
}
