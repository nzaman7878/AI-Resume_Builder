import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
        Build a winning resume <br className="hidden sm:block" />
        <span className="text-indigo-600">powered by AI</span>
      </h1>
      <p className="mt-6 text-xl text-gray-500 max-w-2xl">
        Create, edit, and export professional resumes in minutes. Let our AI help you write compelling bullet points that get you hired.
      </p>
      <div className="mt-10">
        <Link
          href="/auth/register"
          className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 shadow-lg transition-all"
        >
          Get Started for Free
        </Link>
      </div>
    </div>
  );
}