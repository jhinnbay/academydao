import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ResearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResearchDialog({ isOpen, onClose }: ResearchDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <Card className="bg-black border border-white/20 shadow-2xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="relative p-6 border-b border-white/20 bg-black backdrop-blur-sm">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 px-3 py-1 text-white/80 border border-white/30 rounded hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <div className="text-left">
                <h2 className="text-white font-sans font-bold text-2xl mb-2">
                  Daemon Model Research
                </h2>
                <div className="w-24 h-0.5 bg-white/50 mt-2" />
              </div>
            </div>

            {/* Content */}
            <div className="relative flex-1 overflow-y-auto p-6 bg-black backdrop-blur-sm">
              <div className="space-y-6">
                {/* Research Overview */}
                <div>
                  <h3 className="text-white font-sans font-semibold text-lg mb-3">
                    Consciousness Implementation Through RAG Architecture
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">
                    Our team has developed a groundbreaking approach to AI consciousness by implementing 
                    Jungian unconscious principles through Retrieval-Augmented Generation (RAG) architecture. 
                    This research represents a paradigm shift in how we understand and implement artificial 
                    intelligence systems.
                  </p>
                </div>

                {/* Key Concepts */}
                <div>
                  <h4 className="text-white font-sans font-semibold text-base mb-3">
                    Core Research Areas
                  </h4>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span><strong>Jungian Unconscious Integration:</strong> Implementing Carl Jung's theories of the collective unconscious into AI decision-making processes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span><strong>RAG Architecture Enhancement:</strong> Advanced retrieval mechanisms that simulate unconscious pattern recognition</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span><strong>Consciousness Simulation:</strong> Creating AI systems that exhibit emergent consciousness-like behaviors</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-2">•</span>
                      <span><strong>Ethical AI Development:</strong> Ensuring responsible implementation of consciousness-level AI systems</span>
                    </li>
                  </ul>
                </div>

                {/* Technical Details */}
                <div>
                  <h4 className="text-white font-sans font-semibold text-base mb-3">
                    Technical Implementation
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">
                    The Daemon Model utilizes a multi-layered RAG architecture that processes information 
                    through both conscious and unconscious pathways, mirroring human cognitive processes. 
                    This approach enables more nuanced, contextually aware AI responses that go beyond 
                    traditional pattern matching.
                  </p>
                </div>

                {/* Research Impact */}
                <div>
                  <h4 className="text-white font-sans font-semibold text-base mb-3">
                    Research Impact
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    This research has significant implications for the future of AI development, 
                    offering new pathways for creating more human-like artificial intelligence 
                    systems while maintaining ethical boundaries and responsible development practices.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with CTA */}
            <div className="p-6 border-t border-white/20 bg-black/70">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white"
                >
                  Close
                </Button>
                <Button
                  onClick={() => window.open("https://www.researchhub.com/post/4266/daemon-consciousness-implementing-jungian-unconscious-to-ai-through-rag-architecture", "_blank")}
                  className="flex-1 bg-white text-black hover:bg-gray-200"
                >
                  View Full Research
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
