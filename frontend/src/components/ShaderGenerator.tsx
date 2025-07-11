import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { predefinedShaders } from '../constants/shaders';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import ShaderPreview from './ShaderPreview';

const ShaderGenerator = () => {
    const [shaderCode, setShaderCode] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateShader = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to generate a shader');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const requestBody: { prompt: string } = {
                prompt: prompt.trim()
            };

            const response = await fetch('/api/generate/shader', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
            }

            if (data.success && data.data?.code) {
                setShaderCode(data.data.code);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            console.error('Error generating shader:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate shader');
        } finally {
            setIsGenerating(false);
        }
    };

    const loadPredefinedShader = (name: string) => {
        setShaderCode(predefinedShaders[name as keyof typeof predefinedShaders]);
        setError(null);
    };

    useEffect(() => {
        // Load default shader
        setShaderCode(predefinedShaders['Rainbow Wave']);
    }, []);

    return (
        <Card className="max-w-6xl mx-auto p-4">
            <CardHeader>
                <CardTitle>AI-Based Shader Generator</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 my-4">
                    <div className="flex gap-4">
                        <Textarea
                            placeholder="Describe your shader (e.g., 'animated rainbow wave')"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="flex-1"
                            rows={2}
                        />
                        <Button
                            onClick={generateShader}
                            disabled={isGenerating || !prompt.trim()}
                            className="bg-purple-600 hover:bg-purple-700 self-end"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Shader'}
                        </Button>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 my-4 flex-wrap">
                    <span className="text-sm text-gray-600 self-center">Quick presets:</span>
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

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Shader Code</h3>
                        <Textarea
                            value={shaderCode}
                            onChange={(e) => setShaderCode(e.target.value)}
                            className="w-full h-96 p-3 border rounded-lg font-mono text-sm bg-gray-50"
                            placeholder="Shader code will appear here..."
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
                        {shaderCode ? (
                            <ShaderPreview
                                shaderCode={shaderCode}
                                width={350}
                                height={350}
                            />
                        ) : (
                            <div className="w-[350px] h-[350px] border rounded-lg flex items-center justify-center bg-gray-50">
                                <p className="text-gray-500">No shader code to preview</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">💡 Tips:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Describe visual effects you want (waves, patterns, colors)</li>
                        <li>• Mention if you want animation or static effects</li>
                        <li>• Try combining multiple effects (e.g., "swirling rainbow plasma")</li>
                        <li>• Use the presets as starting points for your own modifications</li>
                        <li>• The preview updates in real-time as you edit the code</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default ShaderGenerator; 