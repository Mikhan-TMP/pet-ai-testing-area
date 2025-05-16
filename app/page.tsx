import Image from "next/image";
import PetForm from './components/PetForm';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <PetForm />
    </main>
  );
}
