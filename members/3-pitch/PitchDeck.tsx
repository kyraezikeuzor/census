import React, { useState } from 'react';
import { LandingSlide, ProblemSlide, SolutionSlide } from './Slides';

interface PitchDeckProps {
    onStartDemo?: () => void;
}

const slides = [
    { component: LandingSlide, name: 'Welcome' },
    { component: ProblemSlide, name: 'Problem' },
    { component: SolutionSlide, name: 'Solution' },
];

export const PitchDeck: React.FC<PitchDeckProps> = ({ onStartDemo }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const CurrentSlideComponent = slides[currentSlide].component;

    const goToNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const goToPrevious = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    return (
        <div className="relative w-full h-screen">
            {currentSlide === slides.length - 1 ? (
                <CurrentSlideComponent onStartDemo={onStartDemo} />
            ) : (
                <CurrentSlideComponent />
            )}
            
            {/* Left Arrow */}
            {currentSlide > 0 && (
                <button
                    onClick={goToPrevious}
                    className="fixed top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
                    style={{ left: '16px' }}
                    aria-label="Previous slide"
                >
                    <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
            )}

            {/* Right Arrow */}
            {currentSlide < slides.length - 1 && (
                <button
                    onClick={goToNext}
                    className="fixed top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
                    style={{ right: '16px' }}
                    aria-label="Next slide"
                >
                    <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            )}

            {/* Slide Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                            index === currentSlide
                                ? 'w-8 bg-white'
                                : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>


        </div>
    );
};
