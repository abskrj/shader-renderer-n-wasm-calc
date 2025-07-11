declare module '/wasm-calculator/wasm_calculator.js' {
    export function evaluate_expression(expr: string): number;
    export default function init(): Promise<void>;
} 