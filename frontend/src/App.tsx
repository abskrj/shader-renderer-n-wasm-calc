import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import Calculator from './components/Calculator'
import ShaderGenerator from './components/ShaderGenerator'
import { useState } from 'react';

function App() {
  const [tab, setTab] = useState(new URLSearchParams(window.location.search).get('tab') || 'calculator');

  const handleTabChange = (value: string) => {
    setTab(value);
    window.history.pushState({}, '', `?tab=${value}`);
  }

  return (
    <div className="dark min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full max-w-6xl">
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
