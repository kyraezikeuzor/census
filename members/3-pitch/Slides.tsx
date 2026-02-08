import solutionImg from './assets/solution-img.png';
import logo from './assets/templogo.png';
import landingImg from './assets/landing-img.png';
import problemImg from './assets/problem-img.png';

export const LandingSlide: React.FC = () => {
    return (
        <div className="h-screen w-screen bg-[#1e1e1e] text-white">
            <div className="h-full w-full max-w-8xl mx-auto px-12 py-10 flex flex-col">
                {/* Top nav */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-10 h-10" />
                        <span className="text-3xl font-semibold tracking-tight">Census</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
                        <span className="hover:text-white transition">Home</span>
                        <span className="hover:text-white transition">Features</span>
                        <span className="hover:text-white transition">About us</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 text-sm rounded-md border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition">
                            Log in
                        </button>
                        <button className="px-4 py-2 text-sm rounded-md bg-purple-600 hover:bg-purple-500 font-semibold transition">
                            Try now
                        </button>
                    </div>
                </div>

                {/* Hero */}
                <div className="absolute top-1/4 left-12 flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center mt-10">
                    <div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition">
                            Try it out <span className="text-lg">→</span>
                        </button>
                        <h1 className="mt-6 text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
                            The real-time demand layer
                            for physical spaces
                        </h1>
                        <p className="mt-5 text-lg text-white/70 leading-relaxed max-w-xl">
                            Census turns ambient requests into live, location-aware ads that
                            update the moment demand shifts.
                        </p>
                        <div className="mt-8 flex items-center gap-4">
                            <button className="px-5 py-3 rounded-md border border-white/15 text-white/90 hover:text-white hover:border-white/30 transition">
                                Try demo
                            </button>
                            <button className="px-5 py-3 rounded-md bg-purple-600 hover:bg-purple-500 font-semibold transition">
                                Start now
                            </button>
                        </div>
                    </div>
                    <div className="absolute right-0 w-[45%] top-1/2 -translate-y-1/2 hidden lg:block">
                        <div className="absolute -inset-6 bg-gradient-to-tr from-purple-500/20 via-blue-500/10 to-transparent rounded-3xl blur-2xl" />
                        <img
                            src={landingImg}
                            alt="Census dashboard"
                            className="relative w-full "
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProblemSlide: React.FC = () => {
    return (
        <div className="relative h-screen w-screen bg-[#1e1e1e] text-white overflow-hidden">
            {/* Background image */}
            <img
                src={problemImg}
                alt="Problem Slide"
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay + vignette */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/25" />
            <div className="absolute inset-0 bg-black/12" />

            {/* Copy */}
            <div className="absolute top-0 right-30 z-10 h-full w-full flex items-center">
                <div className="max-w-4xl ml-auto mr-16">
                    <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
                        Physical spaces are blind to what people want.
                    </h1>
                    <p className="mt-5 text-xl md:text-2xl text-white/75 leading-relaxed">
                        In shopping malls, stadiums, and airports, shoppers constantly signal what they want,
                        but no system captures collective demand as it happens.
                    </p>
                </div>
            </div>
        </div>
    );
};

interface DemoSlideProps {
    onStartDemo?: () => void;
}

export const SolutionSlide: React.FC<DemoSlideProps> = ({ onStartDemo }) => {
    return (
        <div className="h-screen w-screen bg-[#1e1e1e] text-white">
            <div className="h-full w-full max-w-6xl mx-auto px-8 py-16 flex flex-col justify-center items-center gap-8">
                <div className="text-center mt-24">
                    <div className="text-cyan-300 text-xs tracking-[0.3em] uppercase mb-3">The Solution</div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                        We offer personalized support that everyone deserves.
                    </h1>
                </div>

                {onStartDemo && (
                    <button
                        onClick={onStartDemo}
                        className="px-6 py-3 uppercase w-[300px] bg-blue-600 hover:bg-blue-500 text-xl font-bold rounded-lg transition"
                    >
                        Start Live Demo
                    </button>
                )}

                {/*<div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            tag: 'TAKE ACTION',
                            title: 'Immediate Demand Response',
                            body: 'Screens update instantly with the top-ranked request in that zone.',
                            accent: 'text-emerald-300',
                        },
                        {
                            tag: 'COMMUNICATE',
                            title: 'Empathetic AI Speaker',
                            body: 'Live intent + entity extraction powers context-aware messaging.',
                            accent: 'text-fuchsia-300',
                        },
                        {
                            tag: 'MODERATE',
                            title: 'Human-in-the-loop',
                            body: 'Operators can override or approve campaigns at any time.',
                            accent: 'text-sky-300',
                        },
                    ].map((card) => (
                        <div key={card.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <div className={`text-[11px] tracking-widest uppercase ${card.accent}`}>{card.tag}</div>
                            <h3 className="mt-4 text-2xl font-semibold">{card.title}</h3>
                            <p className="mt-3 text-white/70 leading-relaxed">{card.body}</p>
                        </div>
                    ))}
                </div>*/}

                <div className="mt-4">
                    <img
                        src={solutionImg}
                        alt="Solution Visual"
                        className="w-fit h-[80%]"
                    />
                </div>

            </div>
        </div>
    );
};



