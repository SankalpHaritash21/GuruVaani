import { personas, PersonaKey } from "../util/constant";

export default function ProfileCard({ persona }: { persona: PersonaKey }) {
  const p = personas[persona];
  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <img
        src={p.image}
        alt={p.name}
        className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50"
      />
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-semibold">Chatting with {p.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Persona selected
        </p>
      </div>
    </div>
  );
}
