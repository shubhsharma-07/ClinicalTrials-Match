import { BookOpen, Users, Microscope, Shield, Clock, Heart, ChevronRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function LearnPage() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Safety Testing",
      description: "Tests if a new treatment is safe and finds the best dose",
      participants: "15-30 people",
      duration: "Several months",
      focus: "Safety and dosage",
      icon: Microscope,
    },
    {
      phase: "Phase 2",
      title: "Effectiveness Testing",
      description: "Tests if the treatment works and continues to monitor safety",
      participants: "30-300 people",
      duration: "Several months to 2 years",
      focus: "Effectiveness and side effects",
      icon: Users,
    },
    {
      phase: "Phase 3",
      title: "Comparison Testing",
      description: "Compares the new treatment to the current standard treatment",
      participants: "300-3,000 people",
      duration: "1-4 years",
      focus: "Comparison with standard care",
      icon: Shield,
    },
  ]

  const benefits = [
    {
      title: "Access to New Treatments",
      description: "Get access to cutting-edge treatments before they're widely available",
      icon: Heart,
    },
    {
      title: "Expert Medical Care",
      description: "Receive care from leading specialists and research teams",
      icon: Users,
    },
    {
      title: "Close Monitoring",
      description: "More frequent check-ups and careful monitoring of your health",
      icon: Clock,
    },
    {
      title: "Advance Medical Knowledge",
      description: "Help future patients by contributing to medical research",
      icon: BookOpen,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Understanding Clinical Trials</h1>
            <p className="text-xl text-gray-600">
              Learn about clinical trials in simple terms - what they are, how they work, and what to expect if you
              participate.
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* What Are Clinical Trials */}
        <section className="mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">What Are Clinical Trials?</CardTitle>
              <CardDescription className="text-lg max-w-3xl mx-auto">
                Clinical trials are research studies that test new ways to prevent, detect, or treat cancer. They help
                doctors learn if new treatments are safe and effective.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Think of it like this:</h3>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      Imagine scientists have developed a new medicine that might help treat cancer better than current
                      treatments. Before doctors can prescribe it to everyone, they need to make sure it's safe and
                      actually works.
                    </p>
                    <p>
                      Clinical trials are carefully designed studies where volunteers help test these new treatments.
                      Every participant is closely monitored by medical experts to ensure their safety and track how
                      well the treatment works.
                    </p>
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-3">Key Points to Remember:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Participation is always voluntary
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      You can leave a trial at any time
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Your safety is the top priority
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      You'll receive expert medical care
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Trial Phases */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trial Phases Explained</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Clinical trials happen in phases, each with a different purpose. Understanding these phases helps you know
              what to expect.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {phases.map((phase, index) => {
              const Icon = phase.icon
              return (
                <Card key={index} className="text-center border-0 shadow-lg">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <Badge className="mx-auto mb-2 bg-blue-600">{phase.phase}</Badge>
                    <CardTitle className="text-xl">{phase.title}</CardTitle>
                    <CardDescription className="text-base">{phase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Participants: </span>
                        {phase.participants}
                      </div>
                      <div>
                        <span className="font-medium">Duration: </span>
                        {phase.duration}
                      </div>
                      <div>
                        <span className="font-medium">Main Focus: </span>
                        {phase.focus}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Benefits and Considerations */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Benefits */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-green-700">Potential Benefits</CardTitle>
                <CardDescription className="text-base">
                  Why people choose to participate in clinical trials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{benefit.title}</h4>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Considerations */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-orange-700">Things to Consider</CardTitle>
                <CardDescription className="text-base">Important factors to think about before joining</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold mb-1">Unknown Side Effects</h4>
                    <p className="text-sm text-gray-600">New treatments may have side effects that aren't yet known.</p>
                  </div>
                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold mb-1">Time Commitment</h4>
                    <p className="text-sm text-gray-600">
                      Trials often require more frequent visits and tests than standard care.
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold mb-1">Treatment May Not Work</h4>
                    <p className="text-sm text-gray-600">
                      The new treatment might not be better than standard treatment.
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-200 pl-4">
                    <h4 className="font-semibold mb-1">Travel Requirements</h4>
                    <p className="text-sm text-gray-600">
                      You may need to travel to the study location for appointments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Common questions about participating in clinical trials</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="px-6">
                  <AccordionTrigger className="text-left">
                    Will I receive a placebo (sugar pill) instead of treatment?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Not usually in cancer trials. Most cancer clinical trials compare a new treatment to the current
                    best standard treatment, not to a placebo. If placebos are used, you'll be told beforehand and will
                    still receive the best available care.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="px-6">
                  <AccordionTrigger className="text-left">What if I want to leave the trial?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    You can leave a clinical trial at any time, for any reason, without penalty. Your regular medical
                    care will continue, and leaving won't affect your relationship with your healthcare team.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="px-6">
                  <AccordionTrigger className="text-left">How much does it cost to participate?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    The experimental treatment and research-related tests are usually provided at no cost. However, you
                    may still have regular medical expenses. Many trials also help cover travel costs. Always ask about
                    costs before joining.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="px-6">
                  <AccordionTrigger className="text-left">How do I know if a trial is right for me?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Talk with your oncologist about your specific situation. Consider factors like your cancer type and
                    stage, previous treatments, overall health, and personal preferences. The research team will also
                    help determine if you're eligible.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="px-6">
                  <AccordionTrigger className="text-left">
                    What questions should I ask the research team?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Ask about the treatment being tested, possible side effects, time commitment, costs, what happens if
                    you're injured, and how your privacy is protected. Don't hesitate to ask for clarification on
                    anything you don't understand.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Next Steps */}
        <section>
          <Card className="border-0 shadow-lg bg-blue-50">
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Learn More?</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Now that you understand the basics, you can search for trials or take our eligibility assessment to find
                studies that might be right for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8">
                  Find Clinical Trials
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                  Take Eligibility Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
