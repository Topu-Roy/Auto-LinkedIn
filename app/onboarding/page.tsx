"use client"

import { useState } from "react"
import { api } from "@/convex/_generated/api"
import { useMutation } from "convex/react"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CADENCE, LIMITS, ONBOARDING_STEPS } from "@/lib/config"
import { StepCadence } from "@/components/onboarding/step-cadence"
import { StepTopics } from "@/components/onboarding/step-topics"
import { StepVoice } from "@/components/onboarding/step-voice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const steps = ONBOARDING_STEPS

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createTopics = useMutation(api.mutations.topics.createMany)
  const createVoice = useMutation(api.mutations.voice.createOrUpdate)
  const setCadence = useMutation(api.mutations.userProfiles.getCadence)
  const completeOnboarding = useMutation(api.mutations.userProfiles.completeOnboarding)

  const [selectedTopics, setSelectedTopics] = useState<
    { name: string; weight: "Low" | "Medium" | "High"; newsDataCategory?: string }[]
  >([])
  const [voiceData, setVoiceData] = useState<{ toneDescription: string; examplePosts: string[] }>({
    toneDescription: "",
    examplePosts: [],
  })
  const [cadenceData, setCadenceData] = useState<{
    cadence: string
    timeWindows: { start: string; end: string }[]
  }>({ cadence: "", timeWindows: [] })

  const handleNext = async () => {
    if (currentStep === 1 && selectedTopics.length < LIMITS.MIN_TOPICS) {
      toast.error("Please select at least 3 topics")
      return
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      return
    }

    setIsSubmitting(true)
    try {
      const cadenceParts = cadenceData.cadence.split("|")
      const cadence = cadenceParts[1] ?? CADENCE.DAILY

      await createTopics({
        topics: selectedTopics.map(t => ({
          name: t.name,
          weight: t.weight,
          newsDataCategory: t.newsDataCategory,
        })),
      })

      await createVoice({
        toneDescription: voiceData.toneDescription,
        examplePosts: voiceData.examplePosts,
      })

      await setCadence({
        cadence,
        timeWindows: cadenceData.timeWindows,
      })

      await completeOnboarding()
      router.push("/dashboard")
    } catch (error) {
      toast.error("Failed to complete onboarding")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Set up your account</h1>
          <p className="mt-1 text-muted-foreground">Three quick steps to get started</p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          {steps.map(step => (
            <div key={step.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  step.id < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {step.id < steps.length && (
                <div className="hidden flex-1 sm:block">
                  <div className="h-px bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>

        <Progress value={progress} className="mb-6" />

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <StepTopics selectedTopics={selectedTopics} onChange={setSelectedTopics} />}
            {currentStep === 2 && <StepVoice voiceData={voiceData} onChange={setVoiceData} />}
            {currentStep === 3 && <StepCadence cadenceData={cadenceData} onChange={setCadenceData} />}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : currentStep === 3 ? "Finish" : "Continue"}
                {!isSubmitting && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
