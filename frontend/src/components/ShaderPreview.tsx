import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '../ui/button';

interface ShaderPreviewProps {
    shaderCode: string;
    width?: number;
    height?: number;
}

interface ShaderParseResult {
    cleanedCode: string;
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// Shader parser function
const parseShaderCode = (code: string): ShaderParseResult => {
    const result: ShaderParseResult = {
        cleanedCode: '',
        isValid: true,
        errors: [],
        warnings: []
    };

    // Step 1: Remove BOM and invisible characters
    const originalLength = code.length;
    const firstChars = code.slice(0, 10).split('').map(c => c.charCodeAt(0));

    let tempCode = code.trim();
    if (tempCode.startsWith('```') && tempCode.endsWith('```')) {
        tempCode = tempCode.replace(/^```(?:glsl)?\s*\n?([\s\S]*?)\n?```\s*$/, '$1');
    }

    let cleaned = tempCode
        .replace(/^\uFEFF/, '') // Remove BOM
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
        .replace(/\u00A0/g, ' ') // Replace non-breaking spaces with regular spaces
        .replace(/[\u2000-\u200F]/g, '') // Remove additional Unicode spaces
        .replace(/[\u2028-\u2029]/g, '\n') // Replace line/paragraph separators
        .replace(/^[\s\uFEFF\xA0]+/, '') // Remove all leading whitespace and BOM
        .replace(/[\r\n]+/g, '\n') // Normalize line endings
        .trim(); // Remove leading/trailing whitespace

    if (originalLength !== cleaned.length) {
        result.warnings.push(`Removed ${originalLength - cleaned.length} invisible characters`);
    }

    // Debug: Check first few characters
    if (firstChars.some(code => code > 127 || code < 32)) {
        result.warnings.push(`Detected non-ASCII characters at start: [${firstChars.join(', ')}]`);
    }

    // Step 2: Validate #version directive
    const lines = cleaned.split('\n');
    let versionLineIndex = -1;
    let hasNonCommentBeforeVersion = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) continue;

        // Skip comments
        if (line.startsWith('//') || line.startsWith('/*')) continue;

        // Check for #version
        if (line.startsWith('#version')) {
            if (hasNonCommentBeforeVersion) {
                result.errors.push('Version directive must be the first non-comment line');
                result.isValid = false;
            }
            versionLineIndex = i;
            break;
        }

        // Found non-comment, non-version line
        hasNonCommentBeforeVersion = true;
    }

    // Step 3: Validate version directive format
    if (versionLineIndex >= 0) {
        const versionLine = lines[versionLineIndex].trim();
        const versionMatch = versionLine.match(/^#version\s+(\d+)(?:\s+(es|core))?/);

        if (!versionMatch) {
            result.errors.push('Invalid version directive format');
            result.isValid = false;
        } else {
            const version = parseInt(versionMatch[1]);
            const profile = versionMatch[2];

            if (version < 300 && profile === 'es') {
                result.errors.push('GLSL ES version must be 300 or higher for modern features');
                result.isValid = false;
            }

            if (version < 300) {
                result.warnings.push('Using legacy GLSL version, some features may not be available');
            }
        }
    } else {
        result.warnings.push('No version directive found, WebGL will use default version');
    }

    // Step 4: Check for required elements
    const codeText = cleaned.toLowerCase();

    if (!codeText.includes('void main()')) {
        result.errors.push('Missing main() function');
        result.isValid = false;
    }

    // Step 5: Check for common WebGL requirements
    if (codeText.includes('out vec4') && !codeText.includes('#version 3')) {
        result.errors.push('Output variables (out) require GLSL ES 3.00 or higher');
        result.isValid = false;
    }

    // Step 6: Check for common shader output patterns
    if (codeText.includes('fragcolor') || codeText.includes('gl_fragcolor')) {
        if (!codeText.includes('#version 3') && codeText.includes('fragcolor')) {
            result.warnings.push('Using fragColor with older GLSL version - consider using gl_FragColor instead');
        }
    }

    // Step 7: Check for vertex shader inputs that need to be provided
    if (codeText.includes('in vec2 v_texcoord') || codeText.includes('varying vec2 v_texcoord')) {
        result.warnings.push('Shader expects v_texCoord input from vertex shader');
    }

    // Step 8: Check for common uniform patterns
    const hasResolution = codeText.includes('iresolution') || codeText.includes('u_resolution');
    const hasTime = codeText.includes('itime') || codeText.includes('u_time');

    if (!hasResolution && !hasTime) {
        result.warnings.push('No common uniforms detected (iResolution, iTime, u_resolution, u_time)');
    }

    // Step 9: Clean up extra whitespace while preserving structure
    cleaned = lines
        .map(line => line.trimEnd()) // Remove trailing whitespace
        .join('\n')
        .replace(/\n{3,}/g, '\n\n'); // Limit consecutive empty lines

    result.cleanedCode = cleaned;

    return result;
};

const vertexShaderSource = `#version 300 es
    in vec2 a_position;
    out vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_position * 0.5 + 0.5;
    }`;

const ShaderPreview: React.FC<ShaderPreviewProps> = ({ shaderCode, width = 400, height = 400 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAnimating, setIsAnimating] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(Date.now());
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const uniformsRef = useRef<{
        resolution: WebGLUniformLocation | null;
        time: WebGLUniformLocation | null;
    }>({ resolution: null, time: null });
    const [parseInfo, setParseInfo] = useState<ShaderParseResult | null>(null);

    const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            setError(`Shader compilation error: ${error}`);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }, []);

    const createProgram = useCallback((gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
        const program = gl.createProgram();
        if (!program) return null;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            setError(`Program linking error: ${error}`);
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }, []);

    const render = useCallback(() => {
        const gl = glRef.current;
        const program = programRef.current;
        const uniforms = uniformsRef.current;

        if (!gl || !program) return;

        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        if (uniforms.resolution) {
            gl.uniform2f(uniforms.resolution, width, height);
        }
        if (uniforms.time) {
            gl.uniform1f(uniforms.time, (Date.now() - startTimeRef.current) / 1000.0);
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, [width, height]);

    useEffect(() => {
        const setupAndRender = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const gl = canvas.getContext('webgl2') as WebGLRenderingContext | null;
            if (!gl) {
                setError('WebGL not supported in this browser');
                return;
            }
            glRef.current = gl;

            const parseResult = parseShaderCode(shaderCode);
            setParseInfo(parseResult);

            if (!parseResult.isValid) {
                setError(`Shader parsing failed:\n${parseResult.errors.join('\n')}`);
                return;
            }

            const fragmentShaderSource = parseResult.cleanedCode;
            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

            if (!vertexShader || !fragmentShader) return;

            const program = createProgram(gl, vertexShader, fragmentShader);
            if (!program) return;
            programRef.current = program;

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

            const positionLocation = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            uniformsRef.current = {
                resolution: gl.getUniformLocation(program, 'iResolution') || gl.getUniformLocation(program, 'u_resolution'),
                time: gl.getUniformLocation(program, 'iTime') || gl.getUniformLocation(program, 'u_time'),
            };

            setError(null);
        };

        if (shaderCode) {
            setupAndRender();
        }
    }, [shaderCode, width, height, createShader, createProgram]);

    useEffect(() => {
        if (!isAnimating) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const animate = () => {
            render();
            animationRef.current = requestAnimationFrame(animate);
        };

        if (glRef.current && programRef.current) {
            animate();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAnimating, render]);

    const toggleAnimation = () => {
        setIsAnimating(!isAnimating);
    };

    const resetTime = () => {
        startTimeRef.current = Date.now();
        if (!isAnimating) {
            render();
        }
    };

    return (
        <div className="shader-preview">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="border rounded-lg"
                style={{ width: `${width}px`, height: `${height}px` }}
            />

            <div className="flex gap-2 mt-4 justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAnimation}
                >
                    {isAnimating ? 'Pause' : 'Play'}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={resetTime}
                >
                    Reset Time
                </Button>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-mono">{error}</p>
                </div>
            )}

            {parseInfo && (
                <div className="mt-4 text-sm space-y-2">
                    <div className="text-green-600">
                        <strong>✓ Shader parsed successfully</strong>
                        <div className="text-xs text-gray-600 mt-1">
                            Original length: {shaderCode.length} chars →
                            Cleaned length: {parseInfo.cleanedCode.length} chars
                        </div>
                    </div>

                    {parseInfo.warnings.length > 0 && (
                        <div className="text-yellow-600">
                            <strong>⚠ Warnings:</strong>
                            <ul className="list-disc list-inside ml-2">
                                {parseInfo.warnings.map((warning, i) => (
                                    <li key={i}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {parseInfo.errors.length > 0 && (
                        <div className="text-red-600">
                            <strong>✗ Parse Errors:</strong>
                            <ul className="list-disc list-inside ml-2">
                                {parseInfo.errors.map((error, i) => (
                                    <li key={i}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShaderPreview; 