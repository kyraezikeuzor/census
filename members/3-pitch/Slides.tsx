import solutionImg from './assets/solution-img.png';
import logo from './assets/templogo.png';

export const LandingSlide: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
            <div className="text-center bg-white/5 backdrop-blur-sm border-dotted border-[3px] border-white/15 rounded-2xl shadow-2xl p-12 max-w-2xl mx-auto" style={{ borderSpacing: '4px' }}>
                {/* Placeholder: Logo or project branding image */}
                <div className="mb-2  mx-auto flex items-center justify-center gap-2">
                    <img src={logo} alt="Logo" className="w-24 h-24 " />
                    <h1 className="text-7xl font-semibold text-white">Census</h1>
                </div>
                
                <p className="text-xl text-neutral-400">
                    Turning real-time voice trends into <br/>relevant ads in commercial spaces.
                </p>
            </div>
        </div>
    );
};

export const ProblemSlide: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white px-8">
            <div className="max-w-3xl mx-auto px-16 py-12 w-full bg-white/5 backdrop-blur-sm border-dotted border-[3px] border-white/15 rounded-2xl shadow-2xl" style={{ borderSpacing: '4px' }}>
                <h1 className="text-5xl font-semibold mb-8 tracking-tight text-center">Problem</h1>
                
                {/* Placeholder: Image showing empty mall screens or static ads */}
                <div className="mb-6 w-full h-48 bg-gray-900 rounded flex items-center justify-center">
                    <img src="https://t4.ftcdn.net/jpg/14/81/29/73/360_F_1481297345_A5eLmXq2YgpwXkLMxVJd0UJelYJL00XP.jpg" alt="Problem Slide" className="w-full h-full object-cover" />
                </div>

                <ul className="space-y-2 text-neutral-400 text-lg mb-6">
                    <li>• Digital screens sit unused or show irrelevant ads</li>
                    <li>• Can't react to real-time events</li>
                    <li>• Ads don't match what's happening</li>
                    <li>• Lost revenue from missed opportunities</li>
                </ul>

                <p className="text-2xl text-center text-red-400">Dead Air = Lost Revenue</p>
            </div>
        </div>
    );
};

export const SolutionSlide: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen  text-white px-8">
            <div className="max-w-3xl mx-auto px-16 py-12 w-full bg-white/5 backdrop-blur-sm border-dotted border-[3px] border-white/15 rounded-2xl shadow-2xl" style={{ borderSpacing: '4px' }}>
                <h1 className="text-5xl font-semibold mb-2 tracking-tight text-center">Solution</h1>

                {/* Placeholder: AI Pipeline Diagram */}
                

                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex-1 text-center">
                        <h3 className="text-xl font-semibold mb-1">Listen</h3>
                        <p className="text-neutral-400 text-sm">Voice sensors capture trending shopper requests.</p>
                    </div>
                    <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                    <div className="flex-1 text-center">
                        <h3 className="text-xl font-semibold mb-1">Think</h3>
                        <p className="text-neutral-400 text-sm">AI analyzes demand and identifies top interests.</p>
                    </div>
                    <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                    <div className="flex-1 text-center">
                        <h3 className="text-xl font-semibold mb-1">Act</h3>
                        <p className="text-neutral-400 text-sm">Screens update instantly with relevant ads.</p>
                    </div>
                </div>
                <p className="text-center text-neutral-500 text-sm mb-6">
                    speech to text → intent classification → ad generation → screen update
                </p>

                <ul className="space-y-2 text-neutral-300">
                    <li>• Sub-second response time</li>
                    <li>• Emergency announcements override ads</li>
                    <li>• Privacy protected - no audio recorded</li>
                </ul>
            </div>
        </div>
    );
};

interface DemoSlideProps {
    onStartDemo?: () => void;
}

export const DemoSlide: React.FC<DemoSlideProps> = ({ onStartDemo }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white px-8">
            <div className="text-center max-w-3xl mx-auto px-16 py-12 w-full bg-white/5 backdrop-blur-sm border-dotted border-[3px] border-white/15 rounded-2xl shadow-2xl" style={{ borderSpacing: '4px' }}>
                <h1 className="text-5xl font-semibold mb-8 tracking-tight text-center">Live Demo</h1>

                {/* Placeholder: Preview image of the demo */}
                <div className="mb-8 w-full h-48 bg-gray-900 rounded flex items-center justify-center">
                    <img src="members/3-pitch/assets/dash.png" alt="Demo Slide" className="w-full h-full object-cover rounded" />
                </div>

                <ul className="space-y-2 text-neutral-400 text-lg mb-8">
                    <li>• Real-time 3D visualizations</li>
                    <li>• Live AI analysis dashboard</li>
                    <li>• Emergency override demo</li>
                </ul>

                {onStartDemo && (
                    <button
                        onClick={onStartDemo}
                        className="px-6 py-3 uppercase bg-blue-600 hover:bg-blue-500 text-xl font-bold rounded-lg transition"
                    >
                        Start Live Demo
                    </button>
                )}
            </div>
        </div>
    );
};