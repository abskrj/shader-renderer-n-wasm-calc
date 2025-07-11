import { useRef, useState } from 'react';
import { Button } from '../ui/button';
import evaluate_expression from 'wasm-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const Calculator = () => {
    const [display, setDisplay] = useState('0');
    const inputRef = useRef<HTMLInputElement>(null);

    const appendToDisplay = (value: string) => {
        // Prevent adding multiple zeros at the start or multiple dots
        if (value === '.' && display.includes('.')) return;
        setDisplay((prev) => (prev === '0' && value !== '.') ? value : prev + value);
    };

    const inputNumber = (num: string) => {
        appendToDisplay(num);
    };

    const inputOperation = (op: string) => {
        appendToDisplay(op);
    };

    const calculate = () => {
        try {
            // Replace multiple operators with the last one, e.g. 5++2 -> 5+2
            const sanitizedExpr = display.replace(/([+/*-]){2,}/g, '$1');
            const result = evaluate_expression(sanitizedExpr);
            setDisplay(String(result));
        } catch (e) {
            setDisplay('Error');
        }
        inputRef.current?.focus();
    };

    const clear = () => {
        setDisplay('0');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Directly update the display with the input's value.
        // If input is cleared, reset to '0' to avoid empty display.
        setDisplay(e.target.value || '0');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculate();
        }
        if (e.key === 'Escape' || e.key === 'Delete') {
            e.preventDefault();
            clear();
        }
    };

    const buttons = [
        ['C', '/'],
        ['7', '8', '9', '*'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];

    return (
        <Card className="max-w-sm mx-auto">
            <CardHeader>
                <CardTitle>Calculator</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <input
                        type="text"
                        className="w-full bg-gray-800 text-white text-right text-2xl p-4 rounded-lg font-mono border-0 focus:outline-none focus:ring-0"
                        value={display}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        ref={inputRef}
                    />
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {buttons.flat().map((button, index) => (
                        <Button
                            key={index}
                            onClick={() => {
                                if (button === 'C') {
                                    clear();
                                } else if (button === '=') {
                                    calculate();
                                } else if (['+', '-', '*', '/'].includes(button)) {
                                    inputOperation(button);
                                } else {
                                    inputNumber(button);
                                }
                            }}
                            variant={['+', '-', '*', '/', '='].includes(button) ? 'default' : 'outline'}
                            className={`
              h-12 text-lg font-semibold
              ${['0'].includes(button) ? 'col-span-2' : ''}
              ${['C'].includes(button) ? 'col-span-3' : ''}
              ${['+', '-', '*', '/', '='].includes(button) ? 'bg-blue-500 hover:bg-blue-600' : ''}
              ${button === 'C' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            `}
                        >
                            {button}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default Calculator; 