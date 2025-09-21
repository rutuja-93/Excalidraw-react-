import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import { FaRegSquare, FaRegCircle, FaEraser, FaRedo } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import Sidebar from "../components/Sidebar";

const Home = () => {
  const savedShapes = JSON.parse(localStorage.getItem("shapes")) || [];
  const [shapes, setShapes] = useState(savedShapes);
  const [strokeColor, setStrokeColor] = useState("white");
  const [bgColor, setBgColor] = useState("white");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [shapeType, setShapeType] = useState("rect");
  const [tool, setTool] = useState("draw"); // draw or eraser
  const [activeTool, setActiveTool] = useState("rect"); // For highlighting

  const canvasRef = useRef(null);
  let idRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      let canvasEl = canvasRef.current;
      let x = 0;
      let y = 0;
      let isDrawing = false;

      const handleMouseDown = (e) => {
        if (tool === "eraser") return;
        isDrawing = true;
        x = e.clientX;
        y = e.clientY;
        idRef.current = Date.now();

        let shape = {
          points: [x, y],
          x,
          y,
          width: 0,
          height: 0,
          radius: 0,
          type: shapeType,
          fill: bgColor,
          stroke: strokeColor,
          strokeWidth,
          rotation: 0,
          id: idRef.current,
        };

        setShapes((prev) => {
          const updated = [...prev, shape];
          localStorage.setItem("shapes", JSON.stringify(updated));
          return updated;
        });
      };

      const handleMouseMove = (e) => {
        if (!isDrawing) return;
        setShapes((prev) => {
          const newArray = prev.map((shape) => {
            if (shape.id === idRef.current) {
              if (shape.type === "rect") {
                shape.width = e.clientX - x;
                shape.height = e.clientY - y;
              } else if (shape.type === "circle") {
                const d = (e.clientX - x) ** 2 + (e.clientY - y) ** 2;
                shape.radius = Math.sqrt(d);
              } else if (shape.type === "line") {
                shape.points = [...shape.points, e.clientX, e.clientY];
              }
            }
            return shape;
          });
          localStorage.setItem("shapes", JSON.stringify(newArray));
          return newArray;
        });
      };

      const handleMouseUp = () => {
        isDrawing = false;
      };

      canvasEl.addEventListener("mousedown", handleMouseDown);
      canvasEl.addEventListener("mousemove", handleMouseMove);
      canvasEl.addEventListener("mouseup", handleMouseUp);

      return () => {
        canvasEl.removeEventListener("mousedown", handleMouseDown);
        canvasEl.removeEventListener("mousemove", handleMouseMove);
        canvasEl.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [shapeType, strokeColor, bgColor, strokeWidth, tool]);

  const handleDragEnd = (e, id) => {
    setShapes((prev) =>
      prev.map((shape) => {
        if (shape.id === id) {
          shape.x = e.evt.clientX;
          shape.y = e.evt.clientY;
        }
        return shape;
      })
    );
  };

  const handleErase = (id) => {
    if (tool === "eraser") {
      const updated = shapes.filter((s) => s.id !== id);
      setShapes(updated);
      localStorage.setItem("shapes", JSON.stringify(updated));
    }
  };

  const clearAll = () => {
    setShapes([]);
    localStorage.removeItem("shapes");
    setActiveTool("clear");
  };

  const rotateAll = () => {
    const rotated = shapes.map((s) => ({ ...s, rotation: (s.rotation || 0) + 15 }));
    setShapes(rotated);
    localStorage.setItem("shapes", JSON.stringify(rotated));
    setActiveTool("rotate");
  };

  useEffect(() => {
    setShapes(JSON.parse(localStorage.getItem("shapes")) || []);
  }, []);

  const buttonStyle = (toolName) =>
    `px-3 py-3 rounded-lg cursor-pointer shadow-md transition-transform transform hover:scale-110 ${
      activeTool === toolName ? "bg-yellow-500 border-2 border-white" : "bg-[#6b5b95]"
    }`;

  return (
    <>
      <Sidebar
        setStrokeColor={setStrokeColor}
        setBgColor={setBgColor}
        setStrokeWidth={setStrokeWidth}
      />

      {/* Toolbar */}
      <div className="fixed z-40 top-4 flex justify-center items-center w-full">
        <div className="text-white flex gap-2 p-1 bg-[#232329] rounded-lg shadow-lg">
          <button
            onClick={() => { setShapeType("rect"); setTool("draw"); setActiveTool("rect"); }}
            className={buttonStyle("rect")}
          >
            <FaRegSquare size={18} />
          </button>
          <button
            onClick={() => { setShapeType("circle"); setTool("draw"); setActiveTool("circle"); }}
            className={buttonStyle("circle")}
          >
            <FaRegCircle size={18} />
          </button>
          <button
            onClick={() => { setShapeType("line"); setTool("draw"); setActiveTool("line"); }}
            className={buttonStyle("line")}
          >
            <LuPencil size={18} />
          </button>
          <button
            onClick={() => { setTool("eraser"); setActiveTool("eraser"); }}
            className={buttonStyle("eraser")}
          >
            <FaEraser size={18} />
          </button>
          <button onClick={clearAll} className={buttonStyle("clear")}>
            X
          </button>
          <button onClick={rotateAll} className={buttonStyle("rotate")}>
            ↻
          </button>
        </div>
      </div>

      <Stage
        className="bg-[#121212] min-h-screen"
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef}
      >
        <Layer>
          {shapes.map((shape) => {
            if (shape.type === "rect") {
              return (
                <Rect
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  rotation={shape.rotation || 0}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, shape.id)}
                  onClick={() => handleErase(shape.id)}
                />
              );
            } else if (shape.type === "circle") {
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  rotation={shape.rotation || 0}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, shape.id)}
                  onClick={() => handleErase(shape.id)}
                />
              );
            } else if (shape.type === "line") {
              return (
                <Line
                  key={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  lineJoin="round"
                  lineCap="round"
                  tension={0.5}
                  onClick={() => handleErase(shape.id)}
                />
              );
            }
          })}
        </Layer>
      </Stage>
    </>
  );
};

export default Home;
