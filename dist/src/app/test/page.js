"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TestPage;
const react_1 = __importDefault(require("react"));
const TestComponent_1 = __importDefault(require("@/components/TestComponent"));
function TestPage() {
    return (<div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <TestComponent_1.default />
    </div>);
}
