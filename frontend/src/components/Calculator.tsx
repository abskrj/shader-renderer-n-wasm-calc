import { useState } from 'react';
import { Button } from '../ui/button';

const Calculator = () => {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const inputNumber = (num: string) => {
        if (waitingForOperand) {
            setDisplay(num);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? num : display + num);
        }
    };

    const inputOperation = (nextOperation: string) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(inputValue);
        } else if (operation) {
            const currentValue = previousValue || 0;
            const newValue = performOperation(currentValue, inputValue, operation);

            setDisplay(String(newValue));
            setPreviousValue(newValue);
        }

        setWaitingForOperand(true);
        setOperation(nextOperation);
    };

    const performOperation = (firstValue: number, secondValue: number, operation: string) => {
        switch (operation) {
            case '+':
                return firstValue + secondValue;
            case '-':
                return firstValue - secondValue;
            case '*':
                return firstValue * secondValue;
            case '/':
                return firstValue / secondValue;
            default:
                return secondValue;
        }
    };

    const calculate = () => {
        const inputValue = parseFloat(display);

        if (previousValue !== null && operation) {
            const newValue = performOperation(previousValue, inputValue, operation);
            setDisplay(String(newValue));
            setPreviousValue(null);
            setOperation(null);
            setWaitingForOperand(true);
        }
    };

    const clear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
    };

    const buttons = [
        ['C', '±', '%', '/'],
        ['7', '8', '9', '*'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];

    return (
        <div className="max-w-sm mx-auto bg-gray-100 rounded-lg p-4 shadow-lg">
            <div className="mb-4">
                <div className="bg-gray-800 text-white text-right text-2xl p-4 rounded-lg font-mono">
                    {display}
                </div>
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
                            } else if (button === '±') {
                                setDisplay(String(parseFloat(display) * -1));
                            } else if (button === '%') {
                                setDisplay(String(parseFloat(display) / 100));
                            } else {
                                inputNumber(button);
                            }
                        }}
                        variant={['+', '-', '*', '/', '='].includes(button) ? 'default' : 'outline'}
                        className={`
              h-12 text-lg font-semibold
              ${button === '0' ? 'col-span-2' : ''}
              ${['+', '-', '*', '/', '='].includes(button) ? 'bg-blue-500 hover:bg-blue-600' : ''}
              ${button === 'C' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            `}
                    >
                        {button}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default Calculator; 