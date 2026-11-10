import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  X, 
  BookOpen, 
  CheckCircle, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface AudioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepGuide {
  title: string;
  elementName: string;
  badge: string;
  summary: string;
  speechText: string;
}

const GUIDE_STEPS: StepGuide[] = [
  {
    title: "1. Overview of the Kentucky CourtNet App",
    elementName: "Application Core",
    badge: "Introduction",
    summary: "Welcome to the Kentucky CourtNet Judicial Records and Docket Search app. This portal queries the official Kentucky Court of Justice CourtNet database across all 120 Kentucky counties.",
    speechText: "Welcome to the Kentucky CourtNet Judicial Records and Docket Search application. This system allows you to search official civil, criminal, and traffic court records across all one-hundred-and-twenty Kentucky counties, interfacing with the official CourtNet portal at k-c-o-j dot k-y courts dot net."
  },
  {
    title: "2. The 'Last Name' Input Box",
    elementName: "Last Name Field",
    badge: "Field 1 of 3",
    summary: "Mandatory surname text box. Type the legal last name of the defendant, plaintiff, or litigant (minimum 2 letters).",
    speechText: "First element: The Last Name input box. Enter the legal surname of the party or defendant you are researching. It requires at least two alphabetical letters. Special characters like hyphens and apostrophes are supported."
  },
  {
    title: "3. The 'First Name' Input Box",
    elementName: "First Name Field",
    badge: "Field 2 of 3",
    summary: "Mandatory first name text box. Type the legal given name of the party (minimum 1 letter).",
    speechText: "Second element: The First Name input box. Enter the legal given first name of the person. You can enter the full first name, or at minimum one letter."
  },
  {
    title: "4. The 'Date of Birth' Input & Calendar",
    elementName: "Date of Birth Field & Calendar Picker",
    badge: "Field 3 of 3",
    summary: "Mandatory birthdate field formatted as MM/DD/YYYY. You can type the date directly with automatic formatting or click the black calendar button to choose the month, year, and day.",
    speechText: "Third element: The Date of Birth input box and interactive Calendar Picker. Type the birth date in Month Month, Day Day, Year Year Year Year format, or click the black calendar button to open the calendar picker where you can select the birth month, birth year, and exact day."
  },
  {
    title: "5. Requirement Check & The Black 'Submit Search' Button",
    elementName: "Submit Search Button",
    badge: "Conditional Action",
    summary: "The black submit button remains disabled until all 3 text boxes pass validation. Once valid, it illuminates with a glowing light blue border. Clicking it queries the CourtNet backend.",
    speechText: "Fourth element: The Submit Search button. Notice that this black button remains disabled until all three text boxes are correctly filled out. Once Last Name, First Name, and Date of Birth are validated, the button enables with a glowing light blue border. Pressing it submits your inquiry directly to CourtNet."
  },
  {
    title: "6. Quick Fill Buttons (Testing Presets)",
    elementName: "Quick Fill Presets",
    badge: "Convenience",
    summary: "Use the preset buttons like 'Smith, M.' and 'Miller, S.' to instantly populate test records and see the workflow in action.",
    speechText: "Fifth element: Quick Fill buttons. Next to the form header, you will find quick fill presets such as Smith and Miller. Clicking one immediately pre-populates all three boxes with valid sample information for fast testing."
  },
  {
    title: "7. The Scrollable Results List & Filter Tabs",
    elementName: "Results Container & Category Filters",
    badge: "Case Records",
    summary: "Scroll through matching cases with case number, jurisdiction, status, charges, and presiding judge. Filter by Criminal, Traffic, Civil, Active, or Disposed.",
    speechText: "Sixth element: The Scrollable Results List. Returned dockets appear in a smooth scrollable list. You can filter cases by Criminal, Traffic, Civil, Active, or Disposed cases, sort by newest or oldest filing date, and click any card to inspect the full docket sheet and court hearings."
  },
  {
    title: "8. Search History Sidebar",
    elementName: "History Drawer",
    badge: "Local Storage",
    summary: "Click the 'Search History' button in the top navigation or in the form to open the sidebar. All your prior inquiries are stored locally in your browser for one-click re-runs.",
    speechText: "Seventh element: The Search History sidebar. Click the Search History button in the top navigation bar to open your drawer of past inquiries. All your queries are safely stored in your browser's local storage, allowing you to instantly re-run previous searches with a single click."
  }
];

export const AudioGuideModal: React.FC<AudioGuideModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setIsSpeechSupported(false);
    }
  }, []);

  // Stop speech when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    }
  }, [isOpen]);

  const speakStep = (index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const step = GUIDE_STEPS[index];
    if (!step) {
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(step.speechText);
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      if (index + 1 < GUIDE_STEPS.length) {
        setCurrentStepIndex(index + 1);
        speakStep(index + 1);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleStartSpeaking = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      speakStep(currentStepIndex);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
    if (isPlaying) {
      speakStep(index);
    }
  };

  const handlePlayCurrentStep = (index: number) => {
    setCurrentStepIndex(index);
    speakStep(index);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    speakStep(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="bg-black border border-sky-500/70 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(56,189,248,0.25)] overflow-hidden"
        role="dialog"
        aria-labelledby="audio-guide-title"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-950 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-black border border-sky-800 text-sky-400">
              <Volume2 className="w-5 h-5 text-sky-400" />
            </span>
            <div>
              <span className="text-[11px] font-mono text-sky-500 tracking-wider uppercase">
                Interactive Spoken Audio & Visual Guide
              </span>
              <h2 id="audio-guide-title" className="text-lg font-bold text-sky-100">
                How to Use Kentucky CourtNet Search
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black border border-sky-900 text-sky-400 hover:text-sky-100 hover:border-sky-500 transition-colors"
            aria-label="Close audio guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Player Control Bar */}
        <div className="px-6 py-3.5 bg-neutral-950 border-b border-sky-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartSpeaking}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 ${
                isPlaying
                  ? 'bg-black border border-sky-400 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                  : 'bg-black border border-sky-800 text-sky-300 hover:border-sky-400 hover:text-sky-100'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span>Pause Spoken Guide</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-sky-400" />
                  <span>{currentStepIndex > 0 ? 'Resume Audio Guide' : 'Listen to Full Guide'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="px-3 py-2 rounded-xl bg-black border border-sky-900 text-sky-400 hover:text-sky-200 hover:border-sky-700 transition-colors inline-flex items-center gap-1.5"
              title="Start from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Over</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-sky-500">Speed:</span>
            {[0.9, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => {
                  setPlaybackRate(rate);
                  if (isPlaying) {
                    speakStep(currentStepIndex);
                  }
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                  playbackRate === rate
                    ? 'border-sky-400 bg-black text-sky-200 font-bold'
                    : 'border-sky-950 bg-black text-sky-600 hover:text-sky-300'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Current Active Step Highlight Banner */}
        <div className="px-6 py-3 bg-black/90 border-b border-sky-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="text-sky-400 font-medium">Currently Explaining:</span>
            <span className="text-sky-100 font-bold font-mono">
              Step {currentStepIndex + 1} of {GUIDE_STEPS.length}
            </span>
            <span className="text-sky-500">· {GUIDE_STEPS[currentStepIndex].elementName}</span>
          </div>
          {isPlaying && (
            <span className="text-[11px] text-sky-400 font-mono flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Speaking out loud...</span>
            </span>
          )}
        </div>

        {/* Scrollable Detailed Steps */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {GUIDE_STEPS.map((step, idx) => {
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => handleStepClick(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-neutral-950 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'bg-black border-sky-950 hover:border-sky-800 hover:bg-neutral-950/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                        isCurrent
                          ? 'border-sky-400 bg-black text-sky-200'
                          : 'border-sky-900 bg-black text-sky-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-sky-100">
                        {step.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-sky-500 mt-0.5">
                        <span className="font-semibold text-sky-400">{step.elementName}</span>
                        <span>·</span>
                        <span>{step.badge}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayCurrentStep(idx);
                    }}
                    className={`p-2 rounded-lg bg-black border text-xs transition-colors shrink-0 ${
                      isCurrent && isPlaying
                        ? 'border-sky-400 text-sky-200'
                        : 'border-sky-900 text-sky-400 hover:border-sky-500 hover:text-sky-100'
                    }`}
                    title="Speak this element"
                    aria-label={`Speak step ${idx + 1}`}
                  >
                    {isCurrent && isPlaying ? (
                      <Volume2 className="w-4 h-4 text-sky-300 animate-pulse" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Spoken Text Preview */}
                <div className="mt-3 p-3 bg-black border border-sky-950 rounded-lg text-xs space-y-1.5">
                  <p className="text-sky-300/90 leading-relaxed font-sans">
                    {step.summary}
                  </p>
                  <p className="text-[11px] text-sky-500/80 font-mono italic">
                    "{step.speechText}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-sky-950 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-sky-500 text-[11px]">
            <span>Speech Synthesis API Active</span>
            <span>·</span>
            <span>Click any step to hear and read detailed guidance</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartSpeaking}
              className="px-4 py-2 bg-black border border-sky-500 text-sky-200 hover:bg-neutral-900 hover:border-sky-300 rounded-xl font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{isPlaying ? 'Pause Audio' : 'Play Audio'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-black border border-sky-800 text-sky-400 hover:border-sky-600 hover:text-sky-200 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
