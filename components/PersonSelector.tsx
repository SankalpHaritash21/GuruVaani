import { personas, PersonaKey } from "../util/constant";

type Props = {
  persona: PersonaKey;
  setPersona: (p: PersonaKey) => void;
};

export default function PersonaSelector({ persona, setPersona }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {Object.entries(personas).map(([key, p]) => {
        const active = persona === (key as PersonaKey);
        return (
          <button
            key={key}
            className={`p-3 rounded-lg transition-all duration-200 ${
              active
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            }`}
            onClick={() => setPersona(key as PersonaKey)}
          >
            <span className="font-medium">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
