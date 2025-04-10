"use strict";

let gl;

window.onload = function init() {
    const canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("WebGL 2.0 isn't available");
        return;
    }

    // Define positions and colors for static level objects
    const levelData = [
        // Floor
        { pos: [-0.9, -0.8, 0.9, -0.8, 0.9, -0.7, -0.9, -0.7], color: [0.5, 0.5, 0.5, 1] },
        // Platform
        { pos: [-0.2, -0.4, 0.2, -0.4, 0.2, -0.35, -0.2, -0.35], color: [0.2, 0.7, 0.2, 1] },
        // Spikes (triangle shape)
        { pos: [-0.8, -0.7, -0.75, -0.7, -0.775, -0.65], color: [0.8, 0.1, 0.1, 1] },
        // Button
        { pos: [0.6, -0.8, 0.65, -0.8, 0.65, -0.75, 0.6, -0.75], color: [1, 0.6, 0, 1] },
        // Door
        { pos: [-0.05, -0.8, 0.05, -0.8, 0.05, -0.6, -0.05, -0.6], color: [0.2, 0.5, 1, 1] }
    ];

    // Flatten position and color data
    const vertices = [];
    const colors = [];
    levelData.forEach(item => {
        const [r, g, b, a] = item.color;
        for (let i = 0; i < item.pos.length / 2; i++) {
            vertices.push(item.pos[i * 2], item.pos[i * 2 + 1], 0);
            colors.push(r, g, b, a);
        }
    });

    // Create buffers
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Load shaders and get attribute/uniform locations
    const program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aColor = gl.getAttribLocation(program, "aColor");

    // Enable vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    gl.clearColor(0.13, 0.13, 0.13, 1.0);
    render(levelData.length);
};

function render(shapeCount) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < shapeCount; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
    }

    // Update the hint
    document.getElementById("hintBox").textContent = "Hint: The button might open the door...";
}
