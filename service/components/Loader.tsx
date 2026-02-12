// components/Loader.tsx
import { LoaderCircle } from 'lucide-react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      {/* Вращающаяся иконка */}
      <LoaderCircle className="w-12 h-12 text-yellow-500 animate-spin" />
    </div>
  );
}
