import { Bath, BedDouble, BellOff, Camera, Lock, MessagesSquare, Repeat, Ruler, Search, Smartphone, Sparkles, Star, Users, Zap } from 'lucide-react';

const icons = {
  bath: Bath, bed: BedDouble, bellOff: BellOff, camera: Camera, chat: MessagesSquare, area: Ruler, instant: Zap,
  lock: Lock, people: Users, phone: Smartphone, repeat: Repeat, search: Search, sparkles: Sparkles, star: Star,
};

/** A Lucide icon set in running text: as tall as the text, sitting on its baseline. */
export default function Glyph({ name }: { name: keyof typeof icons }) {
  const Icon = icons[name];
  return <Icon size="1em" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-0.125em', marginRight: '0.3em' }} />;
}
