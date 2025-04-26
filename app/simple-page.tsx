"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function SimplePage() {
  const [description, setDescription] = useState("")
  const [teamSize, setTeamSize] = useState("3")
  const [generated, setGenerated] = useState(false)

  const handleGenerate = () => {
    if (!description) return
    setGenerated(true)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Plan de Pruebas Interactivo</CardTitle>
          <CardDescription>Versión simplificada para previsualización</CardDescription>
        </CardHeader>
      </Card>

      {!generated ? (
        <Card>
          <CardHeader>
            <CardTitle>Descripción del Sistema</CardTitle>
            <CardDescription>Proporciona una descripción detallada de la aplicación o sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Sistema</Label>
              <Textarea
                id="description"
                placeholder="Describe tu aplicación o sistema en detalle..."
                className="min-h-[150px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-size">Tamaño del Equipo</Label>
              <Input
                id="team-size"
                type="number"
                min="1"
                max="10"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleGenerate} disabled={!description}>
              <FileText className="mr-2 h-4 w-4" />
              Generar Plan de Pruebas
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Plan Generado</CardTitle>
            <CardDescription>Plan generado para: {description.substring(0, 100)}...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Objetivos</h2>
              <ul className="list-disc pl-5">
                <li>Verificar que todas las funcionalidades descritas funcionan correctamente</li>
                <li>Identificar posibles defectos o errores en el sistema</li>
                <li>Validar que el sistema cumple con los estándares de calidad</li>
              </ul>

              <h2 className="text-xl font-bold">Alcance</h2>
              <p>El plan de pruebas incluirá las principales funcionalidades del sistema descrito.</p>

              <h2 className="text-xl font-bold">Equipo</h2>
              <p>Se requerirán {teamSize} probadores para ejecutar este plan.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setGenerated(false)}>
              Volver
            </Button>
            <Button>Enviar por Email</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

