export type Song = {
  id: string;
  title: string;
  artist: string;
  key: string;
  capo?: number;
  bpm: number;
  tags: string[];
  summary: string;
  sections: { name: string; chart: string }[];
};

export const songs: Song[] = [
  {
    id: "house-of-the-rising-sun",
    title: "House of the Rising Sun",
    artist: "Traditional",
    key: "Am",
    bpm: 78,
    tags: ["folk", "beginner", "public domain"],
    summary: "Public-domain folk standard with a clean six-chord progression.",
    sections: [
      { name: "Verse", chart: "[Am]There is a [C]house in [D]New Or[ F]leans\n[Am]They call the [C]Rising [E]Sun\n[Am]It has been the [C]ruin of [D]many a poor [F]player\n[Am]And me, oh [E]I am [Am]one".replace("[ F]", "[F]") },
      { name: "Turnaround", chart: "[Am] [C] [D] [F]\n[Am] [E] [Am] [E]" },
    ],
  },
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    artist: "John Newton",
    key: "G",
    bpm: 86,
    tags: ["hymn", "public domain", "3/4"],
    summary: "Sparse 3/4 arrangement for campfire guitar or bass roots.",
    sections: [
      { name: "Verse", chart: "[G]Amazing [G7]grace, how [C]sweet the [G]sound\nThat saved a soul like [D]me\nI [G]once was [G7]lost, but [C]now am [G]found\nWas blind, but [D]now I [G]see" },
    ],
  },
  {
    id: "midnight-room-demo",
    title: "Midnight Room",
    artist: "Original demo",
    key: "E",
    capo: 0,
    bpm: 104,
    tags: ["original", "rock", "bar chords"],
    summary: "Original seed song designed to demo transpose, simplify, and diagrams.",
    sections: [
      { name: "Verse", chart: "[E]Low light humming through the [B]wall\n[C#m7]Boots by the door and a [Aadd9]four-count fall\n[E]Nobody talks when the [B]amp gets loud\n[C#m7]We move like smoke through an [Aadd9]empty crowd" },
      { name: "Chorus", chart: "[A]Hold the line, [B]let it bloom\n[E]Every note finds the [C#m7]midnight room\n[A]No more noise, [B]no more proof\n[E]Just the string and the [B]truth" },
    ],
  },
  {
    id: "twelve-bar-a",
    title: "Twelve Bar in A",
    artist: "Practice form",
    key: "A",
    bpm: 96,
    tags: ["blues", "practice", "bass"],
    summary: "Clean I-IV-V practice chart for guitar comping and bass walking.",
    sections: [
      { name: "Form", chart: "[A7]One [A7]two [A7]three [A7]four\n[D7]One [D7]two [A7]three [A7]four\n[E7]One [D7]two [A7]three [E7]turn" },
    ],
  },
];

export function searchSongs(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return songs;
  return songs.filter((song) =>
    [song.title, song.artist, song.key, ...song.tags].some((value) => value.toLowerCase().includes(q)),
  );
}

export function getSong(id: string) {
  return songs.find((song) => song.id === id) ?? songs[0];
}
