// Set up DOM environment before importing React Testing Library
import { Window } from "happy-dom";
const window = new Window();
const document = window.document;
// Ensure body exists
if (!document.body) {
  const body = document.createElement("body");
  document.documentElement.appendChild(body);
}
global.window = window as any;
global.document = document as any;
