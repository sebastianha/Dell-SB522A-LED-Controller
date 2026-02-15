# Dell-SB522A-LED-Controller
A small vibe-coded script to control the LEDs on a Dell SB522A soundbar

There a 3 scripts in this repository:
- sb522a_led_mac.py: The original script
- sb522a_led_mac.js: Converted to nodejs
- sb522a_led_linux.js: Minimal adjustments for Linux as the LED behaves somehow differently, see below

## Note

On MacOS the LED is constantly white when connected. On Linux it starts blinking white first but then turns off.
For the script that means that 0x00 is turing the LED white on MacOS and off on Linux. The scripts are adjusted accordingly.
I need to investigate why it behaves differently.

### Usage Linux

```
Dell SB522A Soundbar LED Controller

Usage: sb522a_led_linux.js <left> [right]

Arguments:
  left   Left LED state: off, green, green-blinking
  right  Right LED state: off, red
```

### Usage MacOS

```
Dell SB522A Soundbar LED Controller

Usage: sb522a_led_macos.js <left> [right]

Arguments:
  left   Left LED state: white, green, green-blinking
  right  Right LED state: off, red
```
