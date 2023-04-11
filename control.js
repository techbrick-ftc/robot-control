const url = "ws://192.168.4.1:8765";
const robot = new WebSocket(url);

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const draggablePoint = document.querySelector(".draggable-point");

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let primeAxis = null;

  function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  function handleMouseMove(event) {
    if (!dragging) return;
    const containerRect = container.getBoundingClientRect();
    const x = clamp(
      event.clientX - containerRect.left - offsetX - containerRect.width / 2,
      -containerRect.width / 2,
      containerRect.width / 2
    );
    const y = clamp(
      event.clientY - containerRect.top - offsetY - containerRect.height / 2,
      -containerRect.height / 2,
      containerRect.height / 2
    );
    if (Math.abs(x) >= Math.abs(y)) {
      primeAxis = "x";
    } else {
      primeAxis = "y";
    }

    if (primeAxis === "x") {
      let newX = event.clientX - containerRect.left - offsetX;
      draggablePoint.style.top = "50%";
      draggablePoint.style.left = `${Math.max(
        0,
        Math.min(newX, container.clientWidth - draggablePoint.clientWidth)
      )}px`;

      const speed = Math.round((x / container.clientWidth) * 200);
      const direction = speed > 0 ? "right" : "left";
      console.log(
        JSON.stringify({ "": null, A: Math.abs(speed), K: direction })
      );
      robot.send(JSON.stringify({ "": null, A: speed, K: direction }));
    } else if (primeAxis === "y") {
      let newY = event.clientY - containerRect.top - offsetY;
      draggablePoint.style.left = "50%";
      draggablePoint.style.top = `${Math.max(
        0,
        Math.min(newY, container.clientHeight - draggablePoint.clientHeight)
      )}px`;

      const speed = Math.round((y / container.clientHeight) * 200);
      const direction = speed > 0 ? "backward" : "forward";
      console.log(
        JSON.stringify({ "": null, A: Math.abs(speed), K: direction })
      );
      robot.send(JSON.stringify({ "": null, A: speed, K: direction }));
    }
  }

  function handleMouseDown(event) {
    dragging = true;
    offsetX = event.clientX - draggablePoint.getBoundingClientRect().left;
    offsetY = event.clientY - draggablePoint.getBoundingClientRect().top;
  }

  function handleMouseUp() {
    dragging = false;
    primeAxis = null;
    draggablePoint.style.left = "50%";
    draggablePoint.style.top = "50%";
  }

  draggablePoint.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  // For touch devices:
  draggablePoint.addEventListener("touchstart", (event) => {
    event.preventDefault();
    handleMouseDown(event.touches[0]);
  });

  document.addEventListener("touchmove", (event) =>
    handleMouseMove(event.touches[0])
  );
  document.addEventListener("touchend", handleMouseUp);
});
