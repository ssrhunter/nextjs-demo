'use client';

import { useState, useEffect } from "react";

export default function Page(){
    // TODO: Change out the anamation for something more interesting.
    // https://www.kirupa.com/animations/animated_3d_starfield_effect.htm

    // Interactive parameters
    const [speed, setSpeed] = useState(200);
    const [numStars, setNumStars] = useState(150);
    const stars: Array<Star> = [];

    let frames_per_second = 60;
    let interval = Math.floor(1000 / frames_per_second);
    let startTime = performance.now();
    let previousTime = startTime;

    let currentTime = 0;
    let deltaTime = 0;


    // derived state set in the useEffect on render.
    var centerX: number;
    var centerY: number; 
    

function handleChangeSpeed(event: React.ChangeEvent<HTMLInputElement>){
            setSpeed(parseInt(event.target.value));
        }

        function handleChangeNumStars(event: React.ChangeEvent<HTMLInputElement>){
            setNumStars(parseInt(event.target.value));
        }

    

    useEffect(function(){
         const canvas = document.getElementById('canvas') as HTMLCanvasElement;
         // slightly hacky but whatever, we are on a time constraint.
         centerX = canvas.width * 0.5;
         centerY = canvas.height * 0.5;
            setup(canvas.width, canvas.height, centerX, centerY, numStars, stars);
            drawStarfield();


        }, [speed, numStars]);

    function drawStarfield(timestamp?: DOMHighResTimeStamp) { 
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if(!canvas) return;

        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        
        currentTime = timestamp ? timestamp : 0;
        deltaTime = currentTime - previousTime;

        if(deltaTime > interval) {
            previousTime = currentTime - (deltaTime % interval);
        
        
        ctx.clearRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = "#111";
        ctx.fillRect(0,0, canvas.width, canvas.height);

        ctx.translate(centerX, centerY);

        for(let i=0; i < stars.length; i++){
            let star = stars[i];
            star.drawStar(ctx);
        }

        ctx.translate(-centerX, -centerY);
        }

        requestAnimationFrame(drawStarfield);
    }
        // 
        return (<div>
            <canvas id="canvas" width="1024" height="768" style={{width: "100%"}}></canvas>            
        </div>);
  
}



class Star{   
    
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    canvasWidth: number;
    canvasHeight: number;    
    radiusMax: number;
    speed: number;
    counter: number;

    // contains x, y coordinates and radius + a ref to 
    // the canvas context.
    constructor(
        width: number,
        height: number,
        centerX: number, 
        centerY: number,
    ){
        //this.context = contextRef;
        this.canvasWidth = width;
        this.canvasHeight = height;

        this.centerX = centerX;
        this.centerY = centerY;
        this.x = getRandomInt(-centerX, centerX);
        this.y = getRandomInt(-centerY, centerY);
        this.counter = getRandomInt(1, this.canvasWidth);
        
        
        this.radiusMax = 1 + Math.random() * 10;
        this.speed = getRandomInt(1, 5);

        
    }

    drawStar(context: CanvasRenderingContext2D){
        this.counter -= this.speed;

        if(this.counter < 1) {
            this.counter = this.canvasWidth;
            this.x = getRandomInt(-this.centerX, this.centerX);
            this.y = getRandomInt(-this.centerY, this.centerY);

            this.radiusMax = getRandomInt(1, 10);
            this.speed = getRandomInt(1, 5);

        }

        let xRatio = this.x / this.counter;
        let yRatio = this.y / this.counter;

        let starX = this.remap(xRatio, 0, 1, 0, this.canvasWidth);
        let starY = this.remap(yRatio, 0, 1, 0, this.canvasHeight);

        let radius = this.remap(this.counter, 0, this.canvasWidth, this.radiusMax, 0);

        context.beginPath();

        context.fillStyle = "#FFF";
        context.fillRect(starX-radius, starY-radius,radius*2, radius*2);
        //context.arc(starX, starY, radius, 0, Math.PI * 2, false);
        context.closePath();

        
        context.fill();
    }

    remap(value: number, istart: number, istop: number, ostart: number, ostop: number){
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));

    }
}

function setup(width:number, height: number, centerX: number, centerY: number, numberOfStars: number, stars: Array<Star>){
    for(let i = 0; i < numberOfStars; i++){
        let star = new Star(width, height, centerX, centerY);
        stars.push(star);
    }
}

function getRandomInt(min :number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
}