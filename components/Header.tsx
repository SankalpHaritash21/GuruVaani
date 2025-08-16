import { Github, Twitter, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/useTheme";

type Props = {
  title?: string;
  subtitle?: string;
  github?: string;
  twitter?: string;
};

export default function Header({
  title = "Persona Chat",
  subtitle = "Chat with your favorite mentors",
  github = "https://github.com/yourusername",
  twitter = "https://twitter.com/yourhandle",
}: Props) {
  const { theme, toggle } = useTheme();

  return (
    <header className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={github}
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          title="GitHub"
        >
          <Github className="w-5 h-5" />
        </a>
        <a
          href={twitter}
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          title="Twitter / X"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <button
          onClick={toggle}
          className="p-2 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}
