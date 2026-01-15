import { ArrowRight, Cloud, BrainCircuit, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">

      {/* BACKGROUND PATTERN (Subtle Dot Grid) */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* TOP NAV SPACER */}
      <div className="h-24"></div>

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 text-center">

        {/* PILL BADGE */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white shadow-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
          </span>
          <span className="text-xs font-medium text-zinc-600 tracking-wide uppercase">
            AI-Driven Infrastructure
          </span>
        </div>

        {/* HEADLINE */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 mb-8">
          Infrastructure as <br />
          <span className="text-zinc-500">Natural Language.</span>
        </h1>

        {/* SUBHEAD */}
        <p className="text-zinc-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed mb-10">
          Stop writing boilerplate. Describe your cloud needs, and let our AI generate production-ready Terraform. Secure, scalable, and deployed in seconds.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-500/20 cursor-pointer"
          >
            Start Deploying <ArrowRight className="w-4 h-4" />
          </button>

          <button className="px-8 py-4 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all font-medium">
            Read Documentation
          </button>
        </div>

        {/* DASHBOARD PREVIEW (With elevated styling) */}
        <div className="relative mx-auto max-w-4xl">
          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-400 rounded-2xl blur opacity-20"></div>

          {/* <div className="relative rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 shadow-2xl">
                <img 
                    src="https://cdn.dribbble.com/userupload/8085120/file/original-973f96792e77bf2a35a0a76ace99b0e2.png"
                    className="rounded-lg shadow-sm w-full h-auto"
                    alt="dashboard preview"
                />
            </div> */}
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="max-w-6xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-3 gap-12">

          {/* Feature 1 */}
          <div className="group">
            <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-zinc-900 transition-colors duration-300">
              <Sparkles className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-3">Generative IaC</h3>
            <p className="text-zinc-500 leading-relaxed">
              Translate plain English into valid Terraform configurations. No more digging through documentation for syntax.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group">
            <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-zinc-900 transition-colors duration-300">
              <BrainCircuit className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-3">Reasoning Engine</h3>
            <p className="text-zinc-500 leading-relaxed">
              Powered by LangChain and FastAPI, our engine validates architecture against AWS best practices before coding.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group">
            <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-zinc-900 transition-colors duration-300">
              <ShieldCheck className="w-6 h-6 text-zinc-900 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-3">Secure by Design</h3>
            <p className="text-zinc-500 leading-relaxed">
              State management is handled securely. We enforce least-privilege policies on all generated infrastructure.
            </p>
          </div>

        </div>
      </section>

      {/* MINIMAL CTA SECTION */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">

          <div className="inline-flex justify-center mb-6">
            <Terminal className="w-12 h-12 text-zinc-900" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-6">
            Ready to streamline your workflow?
          </h2>

          <p className="text-zinc-500 mb-10 text-lg">
            Join engineering teams who are shipping infrastructure 10x faster using our AI assistant.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all font-medium cursor-pointer"
            >
              Get Started for Free
            </button>
            <span className="text-sm text-zinc-400">No credit card required</span>
          </div>

        </div>
      </section>

      {/* SIMPLE FOOTER */}
      <footer className="bg-white py-12 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <p>© 2024 InfraAI. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-zinc-900">Privacy</a>
            <a href="#" className="hover:text-zinc-900">Terms</a>
            <a href="#" className="hover:text-zinc-900">Twitter</a>
          </div>
        </div>
      </footer>

    </div>
  );
}