"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestComponent;
const react_1 = __importDefault(require("react"));
function TestComponent() {
    return (<div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Test Component</h2>
      <p>This is a test component to verify that the application is working correctly.</p>
    </div>);
}
