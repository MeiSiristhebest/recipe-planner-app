import Image from "next/image"

interface Instruction {
  step: number
  description: string
  image?: string
}

interface RecipeInstructionsProps {
  instructions: Instruction[]
}

export default function RecipeInstructions({ instructions }: RecipeInstructionsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">步骤</h2>

      <div className="space-y-8">
        {instructions.map((instruction) => (
          <div key={instruction.step} className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                {instruction.step}
              </div>
            </div>

            <div className="flex-grow space-y-4">
              <p>{instruction.description}</p>

              {instruction.image && (
                <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
                  <Image
                    src={instruction.image || "/placeholder.svg"}
                    alt={`步骤 ${instruction.step}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
