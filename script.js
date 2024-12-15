const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    ctx = canvas.getContext("2d");

// Global variables with default values
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000";

// Function to set the canvas background
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
};

// Adjust canvas size on page load
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

// Convert touch/mouse points to canvas coordinates
const getCanvasCoordinates = (event) => {
    const rect = canvas.getBoundingClientRect(); // Get canvas position relative to the viewport
    let clientX, clientY;

    // Handle both mouse and touch events
    if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    // Map client coordinates to canvas coordinates
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
};

// Start drawing
const startDraw = (x, y) => {
    isDrawing = true;
    prevMouseX = x;
    prevMouseY = y;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

// Perform drawing
const drawing = (x, y) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(x, y);
    } else if (selectedTool === "circle") {
        drawCircle(x, y);
    } else {
        drawTriangle(x, y);
    }
};

// Stop drawing
const stopDraw = () => {
    isDrawing = false;
};

// Function to draw a rectangle
const drawRect = (x, y) => {
    if (!fillColor.checked) {
        return ctx.strokeRect(x, y, prevMouseX - x, prevMouseY - y);
    }
    ctx.fillRect(x, y, prevMouseX - x, prevMouseY - y);
};

// Function to draw a circle
const drawCircle = (x, y) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - x), 2) + Math.pow((prevMouseY - y), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

// Function to draw a triangle
const drawTriangle = (x, y) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(x, y);
    ctx.lineTo(prevMouseX * 2 - x, y);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

// Event listeners for mouse and touch events
canvas.addEventListener("mousedown", (e) => {
    const { x, y } = getCanvasCoordinates(e);
    startDraw(x, y);
});
canvas.addEventListener("mousemove", (e) => {
    const { x, y } = getCanvasCoordinates(e);
    drawing(x, y);
});
canvas.addEventListener("mouseup", stopDraw);

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent scrolling while drawing
    const { x, y } = getCanvasCoordinates(e);
    startDraw(x, y);
});
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Prevent scrolling while drawing
    const { x, y } = getCanvasCoordinates(e);
    drawing(x, y);
});
canvas.addEventListener("touchend", stopDraw);

// Tool selection
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

// Brush size adjustment
sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

// Color selection
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

// Color picker
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

// Clear canvas
clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
});

// Save image
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});
