// Touch controls handling
import { setTaxiLane, getTaxiLane, startJump } from "../components/taxi.js";
import { LANES } from "../config/gameConfig.js";

let touchControls = {
  up: false,
  down: false,
  left: false,
  right: false,
  jump: false,
};

export function initTouchControls() {
  const upBtn = document.getElementById("up-btn");
  const downBtn = document.getElementById("down-btn");
  const leftBtn = document.getElementById("left-btn");
  const rightBtn = document.getElementById("right-btn");
  const jumpBtn = document.getElementById("jump-btn");

  // Helper function to handle both touch and mouse events
  const addButtonEvents = (button, control) => {
    // Touch events
    button.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        touchControls[control] = true;
        button.classList.add("pressed");

        // Handle lane changes and jump immediately on touch
        if (control === "left" && getTaxiLane() > 0) {
          setTaxiLane(getTaxiLane() - 1);
        } else if (control === "right" && getTaxiLane() < LANES.COUNT - 1) {
          setTaxiLane(getTaxiLane() + 1);
        } else if (control === "jump") {
          startJump();
        }
      },
      { passive: false }
    );

    button.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        touchControls[control] = false;
        button.classList.remove("pressed");
      },
      { passive: false }
    );

    // Mouse events (for testing on desktop)
    button.addEventListener("mousedown", (e) => {
      e.preventDefault();
      touchControls[control] = true;
      button.classList.add("pressed");

      // Handle lane changes and jump immediately on click
      if (control === "left" && getTaxiLane() > 0) {
        setTaxiLane(getTaxiLane() - 1);
      } else if (control === "right" && getTaxiLane() < LANES.COUNT - 1) {
        setTaxiLane(getTaxiLane() + 1);
      } else if (control === "jump") {
        startJump();
      }
    });

    button.addEventListener("mouseup", () => {
      touchControls[control] = false;
      button.classList.remove("pressed");
    });

    // Handle mouse leaving the button while pressed
    button.addEventListener("mouseleave", () => {
      touchControls[control] = false;
      button.classList.remove("pressed");
    });
  };

  // Add events to all buttons
  addButtonEvents(upBtn, "up");
  addButtonEvents(downBtn, "down");
  addButtonEvents(leftBtn, "left");
  addButtonEvents(rightBtn, "right");
  addButtonEvents(jumpBtn, "jump");

  // Prevent default touch behavior (scrolling, zooming)
  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.target.closest("#mobile-controls")) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

export function getTouchControls() {
  return touchControls;
}
