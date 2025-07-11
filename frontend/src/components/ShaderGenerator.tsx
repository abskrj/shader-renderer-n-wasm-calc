import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const ShaderGenerator = () => {
    const [shaderCode, setShaderCode] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewColor, setPreviewColor] = useState('#ff0000');

    const predefinedShaders = {
        'Rainbow Wave': `
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 color = vec3(
    sin(uv.x * 6.0 + time) * 0.5 + 0.5,
    sin(uv.y * 6.0 + time * 1.2) * 0.5 + 0.5,
    sin((uv.x + uv.y) * 6.0 + time * 0.8) * 0.5 + 0.5
  );
  gl_FragColor = vec4(color, 1.0);
}`,
        'Plasma': `
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float v = sin(uv.x * 10.0 + time);
  v += sin(uv.y * 10.0 + time);
  v += sin((uv.x + uv.y) * 10.0 + time);
  v += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 + time);
  vec3 color = vec3(v * 0.5 + 0.5, v * 0.3 + 0.7, v * 0.8 + 0.2);
  gl_FragColor = vec4(color, 1.0);
}`,
        'Mandelbrot': `
uniform vec2 resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
  vec2 z = vec2(0.0);
  vec2 c = uv * 2.0;
  
  int iterations = 0;
  for (int i = 0; i < 100; i++) {
    if (dot(z, z) > 4.0) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iterations++;
  }
  
  float color = float(iterations) / 100.0;
  gl_FragColor = vec4(color, color * 0.5, 1.0 - color, 1.0);
}`
    };

    const generateShader = async () => {
        setIsGenerating(true);
        // Simulate AI generation with a delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // For demo purposes, select a random predefined shader
        const shaderNames = Object.keys(predefinedShaders);
        const randomShader = shaderNames[Math.floor(Math.random() * shaderNames.length)];
        setShaderCode(predefinedShaders[randomShader as keyof typeof predefinedShaders]);
        setIsGenerating(false);
    };

    const loadPredefinedShader = (name: string) => {
        setShaderCode(predefinedShaders[name as keyof typeof predefinedShaders]);
    };

    useEffect(() => {
        // Load default shader
        setShaderCode(predefinedShaders['Rainbow Wave']);
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">AI-Based Shader Generator</h2>

                <div className="flex gap-4 mb-4">
                    <Input
                        placeholder="Describe your shader (e.g., 'animated rainbow wave')"
                        value={prompt}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        onClick={generateShader}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Shader'}
                    </Button>
                </div>

                <div className="flex gap-2 mb-4">
                    <span className="text-sm text-gray-600">Quick presets:</span>
                    {Object.keys(predefinedShaders).map((name) => (
                        <Button
                            key={name}
                            variant="outline"
                            size="sm"
                            onClick={() => loadPredefinedShader(name)}
                        >
                            {name}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Shader Code</h3>
                    <textarea
                        value={shaderCode}
                        onChange={(e) => setShaderCode(e.target.value)}
                        className="w-full h-96 p-3 border rounded-lg font-mono text-sm bg-gray-50"
                        placeholder="Shader code will appear here..."
                    />
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Preview</h3>
                    <div className="aspect-square border rounded-lg overflow-hidden bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative">
                        <div
                            className="absolute inset-0 animate-pulse"
                            style={{
                                background: `linear-gradient(45deg, ${previewColor}, #00ffff, #ff00ff, ${previewColor})`
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded">
                                Shader Preview
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Color Theme</label>
                        <input
                            type="color"
                            value={previewColor}
                            onChange={(e) => setPreviewColor(e.target.value)}
                            className="w-full h-12 rounded cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Tips:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Describe visual effects you want (waves, patterns, colors)</li>
                    <li>• Mention if you want animation or static effects</li>
                    <li>• Try combining multiple effects (e.g., "swirling rainbow plasma")</li>
                    <li>• Use the presets as starting points for your own modifications</li>
                </ul>
            </div>
        </div>
    );
};

export default ShaderGenerator; 