#!/usr/bin/env node
/**
 * Dell SB522A Soundbar LED Controller
 *
 * USB Device Info:
 * - Vendor ID: 0x413C (Dell)
 * - Product ID: 0x8204 (SB522A Soundbar)
 */

const HID = require("node-hid");

// Dell SB522A USB identifiers
const VENDOR_ID = 0x413c;
const PRODUCT_ID = 0x8204;
const REPORT_ID = 5;

// LED bit flags (derived from testing 0x00-0x0f)
// Left LED:  white (default), green (bit 0), green-blinking (bit 2)
// Right LED: off (default), red (bit 1)
const BIT_LEFT_GREEN = 0x01;
const BIT_RIGHT_RED = 0x02;
const BIT_LEFT_BLINK = 0x04;

/**
 * Find the Dell SB522A soundbar HID interface
 * @returns {string|null} Device path or null if not found
 */
function findSoundbar() {
  const devices = HID.devices(VENDOR_ID, PRODUCT_ID);

  if (devices.length === 0) {
    return null;
  }

  // Look for the specific usage page and usage
  for (const dev of devices) {
    if (dev.usagePage === 0x0b && dev.usage === 0x05) {
      return dev.path;
    }
  }

  return devices[0].path;
}

/**
 * Set LED state using HID output report
 * @param {string} path - Device path
 * @param {number} ledState - LED state byte
 */
function setLed(path, ledState) {
  const device = new HID.HID(path);
  try {
    device.write([REPORT_ID, ledState]);
  } finally {
    device.close();
  }
}

/**
 * Print usage information
 */
function printUsage() {
  console.log("Dell SB522A Soundbar LED Controller");
  console.log("");
  console.log("Usage: sb522a_led_macos.js <left> [right]");
  console.log("");
  console.log("Arguments:");
  console.log("  left   Left LED state: white, green, green-blinking");
  console.log("  right  Right LED state: off, red");
}

/**
 * Main function
 * @returns {number} Exit code
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return 0;
  }

  const left = args[0];
  const right = args[1];

  if (!left && !right) {
    console.error("Error: At least one LED color is required");
    printUsage();
    return 1;
  }

  // Validate left argument
  const validLeft = ["white", "green", "green-blinking"];
  if (left && !validLeft.includes(left)) {
    console.error(
      `Error: Invalid left LED state '${left}'. Choose from: ${validLeft.join(", ")}`,
    );
    return 1;
  }

  // Validate right argument
  const validRight = ["off", "red"];
  if (right && !validRight.includes(right)) {
    console.error(
      `Error: Invalid right LED state '${right}'. Choose from: ${validRight.join(", ")}`,
    );
    return 1;
  }

  const path = findSoundbar();
  if (!path) {
    console.log("Dell SB522A soundbar not found");
    return 1;
  }

  try {
    let ledState = 0x00;

    // Left LED
    if (left === "green") {
      ledState |= BIT_LEFT_GREEN;
    } else if (left === "green-blinking") {
      ledState |= BIT_LEFT_BLINK;
    }
    // 'white' is the default (0x00)

    // Right LED
    if (right === "red") {
      ledState |= BIT_RIGHT_RED;
    }
    // 'off' is the default (0x00)

    setLed(path, ledState);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    return 1;
  }

  return 0;
}

process.exit(main());
