import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import Calculator from './components/Calculator'
import ShaderGenerator from './components/ShaderGenerator'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Tabs defaultValue="calculator" className="w-full max-w-6xl">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="shader">AI Based Shader Generator</TabsTrigger>
            </TabsList>
            <TabsContent value="calculator" className="space-y-4">
              <Calculator />
            </TabsContent>
            <TabsContent value="shader" className="space-y-4">
              <ShaderGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default App
