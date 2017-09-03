//+build !windows,!darwin

#include <X11/Xlib.h>
#include <X11/Xatom.h>
#include <X11/Xutil.h>

#include "window.h"

Rect GetWindowDimensions(Display *display, Window window) {
	Window root;
	int x, y;
	unsigned int width, height;
	unsigned int border_width, depth;

	XGetGeometry(display, window, &root, &x, &y, &width, &height, &border_width, &depth);

	Rect rect;
	rect.x = x;
	rect.y = y;
	rect.width = width;
	rect.height = height;
	return rect;
}

void EnumWindows(Display *display, Window window) {
	XTextProperty text;
	XGetWMName(display, window, &text);

	char *title = text.value;

	if (title == NULL) {
		XFetchName(display, window, &title);
	}
	
	Frame frame;
	frame.handle = window;
	frame.title = title;
	frame.rect = GetWindowDimensions(display, window);
	WindowCallback(frame);

	Window root, parent;
	Window *children;
	int n;
	XQueryTree(display, window, &root, &parent, &children, &n);
	
	if (children != NULL) {
		for (int i = 0; i < n; i++) {
			EnumWindows(display, children[i]);
		}

		XFree(children);
	}
}

void QueryWindows(void) {
	Display *display = XOpenDisplay(NULL);
	Window root = XDefaultRootWindow(display);
	EnumWindows(display, root);
}

void SetWindowPosition(int handle, Rect rect) {

}