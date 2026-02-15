#!/usr/bin/env python3
"""
Dell SB522A Soundbar LED Controller

USB Device Info:
- Vendor ID: 0x413C (Dell)
- Product ID: 0x8204 (SB522A Soundbar)
"""

import hid
import argparse

# Dell SB522A USB identifiers
VENDOR_ID = 0x413C
PRODUCT_ID = 0x8204
REPORT_ID = 5

# LED bit flags (derived from testing 0x00-0x0f)
# Left LED:  white (default), green (bit 0), green-blinking (bit 2)
# Right LED: off (default), red (bit 1)
BIT_LEFT_GREEN = 0x01
BIT_RIGHT_RED = 0x02
BIT_LEFT_BLINK = 0x04


def find_soundbar():
    """Find the Dell SB522A soundbar HID interface"""
    devices = hid.enumerate(VENDOR_ID, PRODUCT_ID)
    
    if not devices:
        return None
    
    for dev in devices:
        if dev['usage_page'] == 0x0B and dev['usage'] == 0x05:
            return dev['path']
    
    return devices[0]['path']


def set_led(path, led_state):
    """Set LED state using HID output report"""
    device = hid.device()
    device.open_path(path)
    device.set_nonblocking(True)
    
    try:
        device.write([REPORT_ID, led_state])
    finally:
        device.close()


def main():
    parser = argparse.ArgumentParser(
        description='Dell SB522A Soundbar LED Controller')
    
    parser.add_argument('left', nargs='?',
                        choices=['white', 'green', 'green-blinking'],
                        help='Left LED state')
    parser.add_argument('right', nargs='?',
                        choices=['off', 'red'],
                        help='Right LED state')
    
    args = parser.parse_args()
    
    if not args.left and not args.right:
        parser.error("At least one LED color is required")
    
    path = find_soundbar()
    if not path:
        print("Dell SB522A soundbar not found")
        return 1
    
    try:
        led_state = 0x00
        
        # Left LED
        if args.left == 'green':
            led_state |= BIT_LEFT_GREEN
        elif args.left == 'green-blinking':
            led_state |= BIT_LEFT_BLINK
        # 'white' is the default (0x00)
        
        # Right LED
        if args.right == 'red':
            led_state |= BIT_RIGHT_RED
        # 'off' is the default (0x00)
        
        set_led(path, led_state)
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())
